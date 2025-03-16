'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { RefreshCw, ThumbsUp, Download, Star, Eraser } from 'lucide-react';
import confetti from 'canvas-confetti';

const LetterTracing: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentLetter, setCurrentLetter] = useState(kannadaAlphabet[0]);
  const [letterIndex, setLetterIndex] = useState(0);
  const [canvasContext, setCanvasContext] = useState<CanvasRenderingContext2D | null>(null);
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [brushColor, setBrushColor] = useState('#9B6FFF'); // kid-purple
  const [brushSize, setBrushSize] = useState(8);
  const [drawnPixels, setDrawnPixels] = useState<Set<string>>(new Set());
  const [templatePixels, setTemplatePixels] = useState<Set<string>>(new Set());
  const [lastPoint, setLastPoint] = useState<{x: number, y: number} | null>(null);

  // Initialize canvas
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      const containerWidth = canvas.parentElement?.clientWidth || 400;
      canvas.width = containerWidth;
      canvas.height = containerWidth;
      
      // Clear canvas when resizing
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw letter template and capture its pixels
      drawLetterTemplate(ctx);
      captureTemplatePixels(ctx);
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    setCanvasContext(ctx);
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [currentLetter]);

  const captureTemplatePixels = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const newTemplatePixels = new Set<string>();
    
    // Get image data from the canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Check each pixel to see if it's part of the template (non-transparent)
    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        // Check if pixel is part of the letter (alpha > 0)
        if (data[index + 3] > 20) {
          newTemplatePixels.add(`${x},${y}`);
        }
      }
    }
    
    setTemplatePixels(newTemplatePixels);
    
    // Clean canvas after capturing template pixels
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Redraw template with reduced opacity
    ctx.globalAlpha = 0.2;
    drawLetterTemplate(ctx);
    ctx.globalAlpha = 1.0;
  };

  const drawLetterTemplate = (ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw letter background
    ctx.font = `${Math.floor(canvas.width * 0.8)}px Baloo 2`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = 'rgba(155, 111, 255, 0.2)';
    ctx.fillText(
      currentLetter.character,
      canvas.width / 2,
      canvas.height / 2
    );
  };

  const getCoordinates = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ): { x: number; y: number } | null => {
    if (!canvasRef.current) return null;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    
    let clientX, clientY;
    
    // Check if it's a touch event
    if ('touches' in event) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }
    
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const startDrawing = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    const coordinates = getCoordinates(event);
    if (!canvasContext || !coordinates) return;
    
    setIsDrawing(true);
    canvasContext.beginPath();
    canvasContext.moveTo(coordinates.x, coordinates.y);
    canvasContext.lineWidth = brushSize;
    canvasContext.lineCap = 'round';
    canvasContext.lineJoin = 'round';
    canvasContext.strokeStyle = brushColor;
    
    setLastPoint(coordinates);
  };

  const draw = (
    event: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>
  ) => {
    if (!isDrawing || !canvasContext || !lastPoint) return;
    
    const coordinates = getCoordinates(event);
    if (!coordinates) return;
    
    // Draw line
    canvasContext.lineTo(coordinates.x, coordinates.y);
    canvasContext.stroke();
    
    // Store drawn pixels for progress tracking
    const newDrawnPixels = new Set(drawnPixels);
    
    // Interpolate between last point and current point to ensure continuous line
    const distance = Math.sqrt(Math.pow(coordinates.x - lastPoint.x, 2) + Math.pow(coordinates.y - lastPoint.y, 2));
    const steps = Math.max(Math.floor(distance), 1);
    
    for (let i = 0; i <= steps; i++) {
      const x = Math.floor(lastPoint.x + (coordinates.x - lastPoint.x) * (i / steps));
      const y = Math.floor(lastPoint.y + (coordinates.y - lastPoint.y) * (i / steps));
      
      // Add pixels in a brush-sized area around the point
      for (let dx = -Math.floor(brushSize/2); dx <= Math.floor(brushSize/2); dx++) {
        for (let dy = -Math.floor(brushSize/2); dy <= Math.floor(brushSize/2); dy++) {
          const px = x + dx;
          const py = y + dy;
          const key = `${px},${py}`;
          
          // If this is a template pixel, mark it as drawn
          if (templatePixels.has(key)) {
            newDrawnPixels.add(key);
          }
        }
      }
    }
    
    setLastPoint(coordinates);
    setDrawnPixels(newDrawnPixels);
    
    // Calculate progress
    if (templatePixels.size > 0) {
      const coveredPixels = Array.from(newDrawnPixels).filter(pixel => templatePixels.has(pixel)).length;
      const newProgress = Math.min(Math.floor((coveredPixels / templatePixels.size) * 100), 100);
      
      setProgress(newProgress);
      
      // Check if complete
      if (newProgress >= 75 && !isComplete) {
        setIsComplete(true);
        
        // Trigger confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    }
  };

  const stopDrawing = () => {
    if (!canvasContext) return;
    canvasContext.closePath();
    setIsDrawing(false);
    setLastPoint(null);
  };

  const clearCanvas = () => {
    if (!canvasContext || !canvasRef.current) return;
    
    canvasContext.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // Redraw the letter template with reduced opacity
    canvasContext.globalAlpha = 0.2;
    drawLetterTemplate(canvasContext);
    canvasContext.globalAlpha = 1.0;
    
    setDrawnPixels(new Set());
    setProgress(0);
    setIsComplete(false);
  };

  const nextLetter = () => {
    const nextIndex = (letterIndex + 1) % kannadaAlphabet.length;
    setLetterIndex(nextIndex);
    setCurrentLetter(kannadaAlphabet[nextIndex]);
    setDrawnPixels(new Set());
    setProgress(0);
    setIsComplete(false);
  };

  const saveDrawing = () => {
    if (!canvasRef.current) return;
    
    const link = document.createElement('a');
    link.download = `kannada-letter-${currentLetter.name}.png`;
    link.href = canvasRef.current.toDataURL();
    link.click();
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div>
          <h3 className="font-bold text-lg">Trace the Letter:</h3>
          <div className="text-sm text-gray-500 mb-1">
            {currentLetter.name} as in "{currentLetter.examples[0]}"
          </div>
          <div className="text-6xl font-baloo text-kid-purple">{currentLetter.character}</div>
        </div>
        
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {['#9B6FFF', '#5FB4FF', '#74E291', '#FF9B71'].map(color => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full ${
                  brushColor === color ? 'ring-2 ring-offset-2 ring-gray-400' : ''
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setBrushColor(color)}
              />
            ))}
          </div>
          
          <div className="flex gap-2 items-center">
            <span className="text-sm text-gray-500">Size:</span>
            <input
              type="range"
              min="2"
              max="20"
              value={brushSize}
              onChange={(e) => setBrushSize(parseInt(e.target.value))}
              className="w-24"
            />
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={clearCanvas} size="sm" className="flex items-center gap-1">
              <Eraser className="h-3 w-3" />
              Clear
            </Button>
            <Button variant="outline" onClick={nextLetter} size="sm" className="flex items-center gap-1">
              <RefreshCw className="h-3 w-3" />
              Next
            </Button>
          </div>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-kid-green h-2.5 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      
      {/* Canvas Container */}
      <div className="w-full max-w-lg mx-auto bg-white rounded-xl shadow-md p-4 border-2 border-gray-100">
        <canvas
          ref={canvasRef}
          className="w-full touch-none cursor-crosshair border rounded-lg"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="mt-6 flex gap-4">
        <Button 
          onClick={saveDrawing} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Save Drawing
        </Button>
        
        {isComplete && (
          <Button 
            onClick={nextLetter} 
            className="btn-primary animate-pulse flex items-center gap-2"
          >
            <Star className="h-4 w-4" />
            Great Job! Next Letter
          </Button>
        )}
      </div>
      
      {/* Completion Message */}
      {isComplete && (
        <div className="mt-8 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-2">
            <ThumbsUp className="h-4 w-4" />
            <span>Great job tracing!</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterTracing;