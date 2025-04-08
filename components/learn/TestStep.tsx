import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RefreshCcw, Check, X, ArrowLeft, ArrowRight, PenTool } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface TestStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audio?: string;
    rank: number;
  };
  setCurrentStep: (step: number) => void;
  updateProgress: (mastery: number, completed: boolean, totalAttempts?: number, correctAttempts?: number, wrongAttempts?: number) => Promise<void>;
  currentMastery: number;
  loading: boolean;
  completed: boolean;
}

export default function TestStep({
  letter,
  updateProgress,
  currentMastery,
  setCurrentStep,
  loading,
  completed
}: TestStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [showTip, setShowTip] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      if (context) {
        context.strokeStyle = 'white';
        context.lineWidth = 8;
        context.lineCap = 'round';
        context.lineJoin = 'round';
        setCtx(context);
        // Initialize canvas with black background
        context.fillStyle = 'black';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    
    // Hide tip after 5 seconds
    const timer = setTimeout(() => setShowTip(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    setIsDrawing(true);
    setShowTip(false);
    const point = getEventPoint(e);
    setLastPoint(point);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault(); // Prevent scrolling on touch devices
    if (!isDrawing || !ctx || !lastPoint) return;

    const point = getEventPoint(e);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    setLastPoint(point);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setLastPoint(null);
    if (ctx) {
      ctx.closePath();
    }
  };

  const getEventPoint = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearCanvas = () => {
    if (ctx && canvasRef.current) {
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setRecognitionResult(null);
    setMessage(null);
  };

  const processImage = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    
    const canvas = canvasRef.current;
    if (!canvas) {
      setIsProcessing(false);
      return;
    }

    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement("canvas");
    const scaleFactor = 4;
    tempCanvas.width = 28 * scaleFactor;
    tempCanvas.height = 28 * scaleFactor;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) {
      setIsProcessing(false);
      return;
    }

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = 28;
    finalCanvas.height = 28;
    const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!finalCtx) {
      setIsProcessing(false);
      return;
    }

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, 28, 28);
    finalCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, 28, 28);

    const processedImage = finalCanvas.toDataURL("image/jpeg", 1.0);

    try {
      const response = await fetch("https://kannada-cnn.onrender.com/api/recognize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ image: processedImage }),
      });

      if (!response.ok) {
        throw new Error("Failed to send image to server");
      }

      const data = await response.json();
      setRecognitionResult(data.prediction);
      setAttempts(prev => prev + 1);

      if (data.prediction === letter.rank.toString()) {
        setSuccessfulAttempts(prev => prev + 1);
        const successSound = new Audio('/audio/success.mp3');
        successSound.play().catch(error => {
          console.error("Success sound playback failed:", error);
        });
        confetti({
          particleCount: 150,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#8A4FFF', '#FF4F8A', '#4F8AFF', '#4FFF8A']
        });
        setMessage("Correct! Well done! 🎉");
      } else {
        const failureSound = new Audio('/audio/error.mp3');
        failureSound.play().catch(error => {
          console.error("Failure sound playback failed:", error);
        });
        setMessage(`Let's try again! Try drawing the letter "${letter.character}" more clearly.`);
      }

      // Check if user has completed enough successful attempts
      if (successfulAttempts >= 2 && !completed) {
        await updateProgress(currentMastery + 1, false);
        setTimeout(() => setCurrentStep(4), 1500); // Move to Complete step
      }
      
      // Delay clearing canvas to let the user see the result
      setTimeout(() => {
        clearCanvas();
        setIsProcessing(false);
      }, 1200);
    } catch (error) {
      console.error("Error sending image:", error);
      setRecognitionResult(null);
      setMessage("Oops! Something went wrong. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Draw the Letter
          <span className="text-kid-purple ml-2">{letter.character}</span>
        </h2>
        <p className="text-lg text-gray-600">
          Draw the letter in the box below. Get 3 correct attempts to continue!
        </p>
      </div>

      <AnimatePresence>
        {showTip && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md shadow-sm"
          >
            <div className="flex items-start">
              <PenTool className="text-blue-500 mr-3 flex-shrink-0 mt-1" />
              <p className="text-blue-700">
                Use your finger or mouse to draw the letter "{letter.character}" as neatly as possible. 
                Draw it similar to how you've seen it in the examples.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {message && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`text-center p-3 rounded-lg font-medium ${recognitionResult === letter.rank.toString() ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'}`}
          >
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col items-center space-y-5">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={300}
            height={300}
            className="rounded-xl bg-black touch-none cursor-crosshair shadow-lg"
            style={{ 
              borderWidth: '6px', 
              borderStyle: 'solid', 
              borderColor: isDrawing ? '#8A4FFF' : '#d1c1ff',
              transition: 'border-color 0.2s ease'
            }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />

          {recognitionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`absolute -top-5 -right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg ${
                recognitionResult === letter.rank.toString()
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {recognitionResult === letter.rank.toString() ? (
                <Check className="w-8 h-8 text-white" />
              ) : (
                <X className="w-8 h-8 text-white" />
              )}
            </motion.div>
          )}
        </div>

        <div className="flex gap-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={clearCanvas}
                  className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
                  variant="outline"
                >
                  <RefreshCcw className="w-4 h-4" />
                  Clear
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Clear the drawing area</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <Button
            onClick={processImage}
            className="px-8 py-2 bg-kid-purple text-white rounded-lg hover:bg-kid-purple/90 transition-colors shadow-md font-medium text-lg"
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Checking...
              </>
            ) : (
              'Check'
            )}
          </Button>
        </div>

        <div className="w-full max-w-md">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Progress: {successfulAttempts}/3 correct</span>
            <span className="text-sm font-medium text-kid-purple">{Math.round((successfulAttempts / 3) * 100)}%</span>
          </div>
          <Progress value={(successfulAttempts / 3) * 100} className="h-2 bg-gray-200" />
          <div className="flex justify-between mt-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-lg font-bold transition-all ${
                  i < successfulAttempts 
                    ? 'bg-kid-purple text-white scale-100' 
                    : 'bg-gray-100 text-gray-400 scale-90'
                }`}
              >
                {i < successfulAttempts ? <Check className="w-8 h-8" /> : i + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between w-full pt-4 mt-2">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Practice
          </Button>
          <Button
            onClick={() => setCurrentStep(4)}
            className="bg-gradient-to-r from-kid-purple to-kid-purple/80 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
            disabled={successfulAttempts < 3}
          >
            {successfulAttempts >= 3 ? 'Continue' : `Need ${3 - successfulAttempts} more correct`}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}