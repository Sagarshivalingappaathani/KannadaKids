import React, { useRef, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Check, X } from 'lucide-react';

interface TestStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    rank: number;
  };
  updateProgress: (mastery: number, completed: boolean) => void;
  currentMastery: number;
  setCurrentStep: (step: number) => void;
  loading: boolean;
}

export default function TestStep({
  letter,
  updateProgress,
  currentMastery,
  setCurrentStep,
  loading
}: TestStepProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [recognitionResult, setRecognitionResult] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [successfulAttempts, setSuccessfulAttempts] = useState(0);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [lastPoint, setLastPoint] = useState<{ x: number; y: number } | null>(null);

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
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const point = getEventPoint(e);
    setLastPoint(point);
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(point.x, point.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
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
  };

  const processImage = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Create a temporary canvas for resizing
    const tempCanvas = document.createElement("canvas");
    const scaleFactor = 4;
    tempCanvas.width = 28 * scaleFactor;
    tempCanvas.height = 28 * scaleFactor;
    const tempCtx = tempCanvas.getContext("2d", { willReadFrequently: true });
    if (!tempCtx) return;

    tempCtx.imageSmoothingEnabled = true;
    tempCtx.imageSmoothingQuality = 'high';
    tempCtx.fillStyle = "black";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tempCtx.drawImage(canvas, 0, 0, canvas.width, canvas.height, 0, 0, tempCanvas.width, tempCanvas.height);

    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = 28;
    finalCanvas.height = 28;
    const finalCtx = finalCanvas.getContext("2d", { willReadFrequently: true });
    if (!finalCtx) return;

    finalCtx.imageSmoothingEnabled = true;
    finalCtx.imageSmoothingQuality = 'high';
    finalCtx.fillStyle = "black";
    finalCtx.fillRect(0, 0, 28, 28);
    finalCtx.drawImage(tempCanvas, 0, 0, tempCanvas.width, tempCanvas.height, 0, 0, 28, 28);

    const processedImage = finalCanvas.toDataURL("image/jpeg", 1.0);

    try {
      const response = await fetch("http://localhost:8000/api/recognize", {
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
      console.log(data);
      console.log(letter.rank);

      if (data.prediction === letter.rank.toString()) {
        console.log("correct");
        setSuccessfulAttempts(prev => prev + 1);
      }

      // Check if user has completed enough successful attempts
      if (successfulAttempts >= 2) {
        updateProgress(currentMastery + 1, false);
        setTimeout(() => setCurrentStep(4), 1500); // Move to Complete step
      }
    } catch (error) {
      console.error("Error sending image:", error);
      setRecognitionResult(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">Test Your Writing</h2>
        <p className="text-gray-600">
          Draw the letter "{letter.character}" in the box below. Get 3 correct attempts to complete!
        </p>
      </div>

      <div className="flex flex-col items-center space-y-4">
        <div className="relative">
          <canvas
            ref={canvasRef}
            width={280}
            height={280}
            className="border-4 border-kid-purple rounded-xl bg-black touch-none"
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
              className={`absolute -top-4 -right-4 w-12 h-12 rounded-full flex items-center justify-center ${
                recognitionResult === letter.rank.toString()
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
            >
              {recognitionResult === letter.rank.toString() ? (
                <Check className="w-6 h-6 text-white" />
              ) : (
                <X className="w-6 h-6 text-white" />
              )}
            </motion.div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={clearCanvas}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg flex items-center gap-2 transition-colors"
          >
            <RefreshCcw className="w-4 h-4" />
            Clear
          </button>
          <button
            onClick={processImage}
            className="px-6 py-2 bg-kid-purple text-white rounded-lg hover:bg-kid-purple/90 transition-colors"
          >
            Check
          </button>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Successful attempts: {successfulAttempts} / 3
          </p>
          <div className="flex gap-1 mt-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full ${
                  i < successfulAttempts ? 'bg-kid-purple' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}