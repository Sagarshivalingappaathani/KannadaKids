import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { ArrowLeft, ArrowRight, Check, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

interface PracticeStepProps {
  letter: {
    id: string;
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
}

export default function PracticeStep({ letter, setCurrentStep, updateProgress, currentMastery, loading }: PracticeStepProps) {
  const [practiced, setPracticed] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [drawingData, setDrawingData] = useState<any>(null);
  const [penSize, setPenSize] = useState(6);
  const [penColor, setPenColor] = useState('#7c3aed'); // kid-purple color
  const [guideOpacity, setGuideOpacity] = useState(0.1);
  
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
        ctx.fillStyle = penColor;
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
        ctx.strokeStyle = penColor;
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
    const newMastery = Math.min(currentMastery + 1, 2);
    await updateProgress(newMastery, false);
    setPracticed(true);
  };

  const resetCanvas = () => {
    setCanvasKey(prev => prev + 1);
  };

  const handleGuideToggle = () => {
    setGuideOpacity(prev => prev > 0 ? 0 : 0.1);
    setCanvasKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Practice Writing <span className="text-kid-purple">"{letter.name}"</span></h2>

      <div className="flex flex-col items-center py-4">
        <div className="w-full max-w-md mx-auto bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-700 font-medium">
                Draw the letter:
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
              id="practiceCanvas" 
              width="400" 
              height="320" 
              key={canvasKey}
              className="touch-none w-full h-72 cursor-crosshair"
            ></canvas>
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
        
        {/* Animation tips */}
        <div className="bg-kid-purple/5 border border-kid-purple/20 p-4 rounded-lg w-full max-w-md">
          <h3 className="text-kid-purple font-medium mb-2">Tips for Writing Kannada:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Start from the top and work your way down</li>
            <li>Practice the curves and loops carefully</li>
            <li>Try to maintain consistent proportions</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(0)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Test
        </Button>

        {practiced ? (
          <Button 
            onClick={() => setCurrentStep(3)} 
            className="bg-gradient-to-r from-kid-purple to-kid-purple/90 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
          >
            Complete Lesson
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