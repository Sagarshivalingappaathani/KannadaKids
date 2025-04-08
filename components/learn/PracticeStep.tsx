import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '../../components/ui/button';
import { ArrowLeft, ArrowRight, Check, RefreshCw, Play } from 'lucide-react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import { letterStroke } from '@/lib/letterStroke';

interface PracticeStepProps {
  letter: {
    id: string;
    rank: number;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audio?: string;
  };
  setCurrentStep: (step: number) => void;
  updateProgress: (mastery: number, completed: boolean) => Promise<void>;
  currentMastery: number;   
  loading: boolean;
  completed: boolean;
}

export default function PracticeStep({ letter, setCurrentStep, updateProgress, currentMastery, loading, completed }: PracticeStepProps) {
  const [practiced, setPracticed] = useState(false);
  const [correctTrace, setCorrectTrace] = useState(true);
  const [canvasKey, setCanvasKey] = useState(0);
  const [drawingData, setDrawingData] = useState<any>(null);
  const [penSize, setPenSize] = useState(6);
  const [penColor, setPenColor] = useState('#7c3aed'); // kid-purple color
  const [guideOpacity, setGuideOpacity] = useState(0.1);
  const [letterPixels, setLetterPixels] = useState<boolean[][]>([]);
  

  // New states for demo tracing
  const [isShowingDemo, setIsShowingDemo] = useState(false);
  const [demoProgress, setDemoProgress] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const currentStepRef = useRef(0);
  
  const strokePath = letterStroke[letter.rank-1].stroke;
  const totalSteps = strokePath.length;

  const startDemoTracing = useCallback(() => {

    const TRACING_CONFIGS = {
      baseSpeed: 10,         // Base number of steps per frame
      speedCurve: 0.5,      // Controls how quickly speed increases (0-1)
      minSpeed: 0.7,        // Minimum speed factor
    };

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // here is the stroke code

    // Reset
    currentStepRef.current = 0;
    setIsShowingDemo(true);
    setDemoProgress(0);

    // Clear canvas
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw letter as guide
    const fontSize = Math.min(canvas.width, canvas.height) * 0.8;
    ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
    ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);

    // Animation function with non-linear speed
    const animateTracing = () => {
      if (!canvas || !ctx) return;

      // Calculate dynamic speed based on current progress
      const progressRatio = currentStepRef.current / totalSteps;
      const speedFactor = Math.max(
        TRACING_CONFIGS.minSpeed, 
        1 - Math.pow(progressRatio, TRACING_CONFIGS.speedCurve)
      );

    // Calculate step increment
    const stepIncrement = Math.max(
      1, 
      Math.floor(TRACING_CONFIGS.baseSpeed * speedFactor)
    );

      // Update current step
      currentStepRef.current = Math.min(
        totalSteps, 
        currentStepRef.current + stepIncrement
      );

      // Clear previous drawing
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Redraw guide letter
      ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
      ctx.fillStyle = `rgba(0, 0, 0, 0.1)`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);

      // Draw tracing path
      ctx.beginPath();
      ctx.strokeStyle = '#7c3aed';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Move to first point
      ctx.moveTo(strokePath[0][0], strokePath[0][1]);

      // Draw lines up to current step
      for (let i = 1; i < currentStepRef.current; i++) {
        ctx.lineTo(strokePath[i][0], strokePath[i][1]);
      }
      ctx.stroke();

      // Update progress percentage
      const progress = Math.floor((currentStepRef.current / totalSteps) * 100);
      setDemoProgress(progress);

      // Continue animation or stop
      if (currentStepRef.current < totalSteps) {
        animationRef.current = requestAnimationFrame(animateTracing);
      } else {
        // Reset after a short delay
        setTimeout(() => {
          setIsShowingDemo(false);
          setDemoProgress(0);
        }, 1000);
      }
    };

    // Start animation
    animationRef.current = requestAnimationFrame(animateTracing);
  }, [letter.character]);

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const canvas = document.getElementById('practiceCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Make canvas responsive
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas to white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw letter as guide (faded)
    const fontSize = Math.min(canvas.width, canvas.height) * 0.8;
    ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
    ctx.fillStyle = `rgba(0, 0, 0, ${guideOpacity})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);

    // Create a 2D array to track which pixels are part of the letter
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixelMap: boolean[][] = Array(canvas.height).fill(null).map(() => Array(canvas.width).fill(false));
    
    // Any non-white pixel (not pure 255,255,255) is considered part of the letter
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        // If pixel is not pure white, mark as letter pixel
        if (imageData.data[index] < 255 || 
            imageData.data[index + 1] < 255 || 
            imageData.data[index + 2] < 255) {
          pixelMap[y][x] = true;
        }
      }
    }
    
    setLetterPixels(pixelMap);

    // Check if a point is inside the letter boundaries with tolerance
    function isInsideLetter(x: number, y: number): boolean {
      // Add some tolerance for better user experience
      const tolerance = Math.max(6, penSize);
      
      // Check in a small square area around the point
      for (let offsetY = -tolerance; offsetY <= tolerance; offsetY++) {
        for (let offsetX = -tolerance; offsetX <= tolerance; offsetX++) {
          const checkY = Math.floor(y + offsetY);
          const checkX = Math.floor(x + offsetX);
          
          // Ensure we're within canvas bounds
          if (checkY >= 0 && checkY < canvas.height && 
              checkX >= 0 && checkX < canvas.width) {
            if (pixelMap[checkY][checkX]) {
              return true;
            }
          }
        }
      }
      setCorrectTrace(false);
      return false;
    }

    // Drawing functions
    function startDrawing(e: MouseEvent | TouchEvent) {
      isDrawing = true;
      const coords = getCoordinates(e);
      lastX = coords.x;
      lastY = coords.y;
      
      // Start a new point (for better dot drawing)
      if (ctx) {
        ctx.beginPath();
        ctx.arc(lastX, lastY, penSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = isInsideLetter(lastX, lastY) ? penColor : 'red';
        ctx.fill();
      }
    }

    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;
      e.preventDefault();
      
      const coords = getCoordinates(e);
      const x = coords.x;
      const y = coords.y;
      
      // Draw line
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = isInsideLetter(x, y) ? penColor : 'red';
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      
      lastX = x;
      lastY = y;
    }

    function getCoordinates(e: MouseEvent | TouchEvent) {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function stopDrawing() {
      if (isDrawing) {
        isDrawing = false;
        setDrawingData(canvas.toDataURL());
      }
    }

    // Event listeners with passive: false for touch events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Handle window resize
    const handleResize = () => {
      // Save current drawing
      const imageData = canvas.toDataURL();
      
      // Resize canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restore white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Reload guide letter
      const fontSize = Math.min(canvas.width, canvas.height) * 0.4;
      ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
      ctx.fillStyle = `rgba(0, 0, 0, ${guideOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);
      
      // Restore drawing
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageData;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', handleResize);
    };
  }, [letter.character, canvasKey, penSize, penColor, guideOpacity]);

  const handleComplete = async () => {
    if (!completed) {
      const newMastery = currentMastery + 1;
      await updateProgress(newMastery, false);
    }
    setPracticed(true);
    // Play success sound
    const successSound = new Audio('/audio/success.mp3');
    successSound.play().catch(error => {
      console.error("Success sound playback failed:", error);
    });
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const resetCanvas = () => {
    setCorrectTrace(true)
    setCanvasKey(prev => prev + 1);
  };

  const handleGuideToggle = () => {
    setGuideOpacity(prev => prev > 0 ? 0 : 0.1);
    setCanvasKey(prev => prev + 1);
  };

  return (

    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Practice Writing <span className="text-kid-purple">"{letter.name}"</span></h2>
      {correctTrace ? <p className="text-center text-green-500">Key Note 📝 : Trace correctly on the letter</p> 
      : <p className="text-center text-red-500">Error ⚠️😊 : Please trace on the letter</p> }

      <div className="flex flex-col items-center py-2">
        <div className="w-full max-w-md mx-auto bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-700 font-medium">
                 Pen
              </p>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setPenSize(4)} 
                  className={`w-4 h-4 rounded-full ${penSize === 4 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-300'}`}
                />
                <button 
                  onClick={() => setPenSize(6)} 
                  className={`w-5 h-5 rounded-full ${penSize === 6 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-400'}`}
                />
                <button 
                  onClick={() => setPenSize(8)} 
                  className={`w-6 h-6 rounded-full ${penSize === 8 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-500'}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totalSteps > 0 && 
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={startDemoTracing}
                  className="text-kid-blue hover:bg-kid-blue/10 h-8"
                  disabled={isShowingDemo}
                >
                  <Play className="h-4 w-4 mr-1" /> 
                  Demo
                </Button>
              } 
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGuideToggle}
                className="text-kid-blue hover:bg-kid-blue/10 h-8"
              >
                {guideOpacity > 0 ? "Hide" : "Show"} Guide
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCanvas}
                className="text-kid-purple hover:bg-kid-purple/10 h-8"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <canvas 
              ref={canvasRef}
              id="practiceCanvas" 
              width="400" 
              height="320" 
              key={canvasKey}
              className="touch-none w-full h-72 cursor-crosshair"
            ></canvas>
            {isShowingDemo && (
              <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                <motion.div 
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-kid-purple font-bold text-2xl"
                >
                  Tracing Demo: {demoProgress}%
                </motion.div>
              </div>
            )}
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <p className="text-xs text-gray-500">Use your mouse or finger to practice writing</p>
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setPenColor('#7c3aed')}
                className={`w-6 h-6 rounded-full bg-kid-purple cursor-pointer ${penColor === '#7c3aed' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
              <div 
                onClick={() => setPenColor('#0284c7')}
                className={`w-6 h-6 rounded-full bg-sky-600 cursor-pointer ${penColor === '#0284c7' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
              <div 
                onClick={() => setPenColor('#000000')}
                className={`w-6 h-6 rounded-full bg-black cursor-pointer ${penColor === '#000000' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learn
        </Button>

        {practiced ? (
          <Button 
            onClick={() => setCurrentStep(3)} 
            className="bg-gradient-to-r from-kid-purple to-kid-purple/90 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
          >
            Continue to Learn
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={loading} 
            className="bg-gradient-to-r from-kid-blue to-kid-blue/90 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
          >
            {loading ? "Saving..." : "Complete Practice"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}