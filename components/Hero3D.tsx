
'use client';

import React, { useEffect, useRef, useState } from 'react';
import { kannadaAlphabet } from '../lib/alphabetData';

// Colors for the floating elements
const bgColors = [
  'bg-kid-purple/90',
  'bg-kid-blue/90',
  'bg-kid-green/90',
  'bg-kid-yellow/90',
  'bg-kid-orange/90',
  'bg-kid-pink/90',
];

// Shapes for the floating elements
const shapes = [
  'rounded-full',
  'rounded-2xl',
  'rounded-3xl',
  'rounded-full',
  'rounded-2xl',
];

// Animation durations
const animationDurations = [
  'animation-duration: 15s',
  'animation-duration: 25s',
  'animation-duration: 20s',
  'animation-duration: 18s',
  'animation-duration: 22s',
];

interface FloatingElement {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  shape: string;
  rotation: number;
  animationDuration: string;
  delay: number;
}

const Hero3D: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [floatingElements, setFloatingElements] = useState<FloatingElement[]>([]);
  const [currentLetterIndex, setCurrentLetterIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  // Generate floating elements
  useEffect(() => {
    if (!containerRef.current) return;

    const elements: FloatingElement[] = [];
    const numElements = 15;

    for (let i = 0; i < numElements; i++) {
      elements.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 40 + 20,
        color: bgColors[Math.floor(Math.random() * bgColors.length)],
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        rotation: Math.random() * 360,
        animationDuration: animationDurations[Math.floor(Math.random() * animationDurations.length)],
        delay: Math.random() * 5,
      });
    }

    setFloatingElements(elements);
    setIsVisible(true);
  }, []);

  // Cycle through featured letters
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentLetterIndex((prevIndex) => 
          prevIndex === kannadaAlphabet.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Interactive animation when hovering over the current letter
  const handleMouseEnter = () => {
    const letterElement = document.getElementById('featured-letter');
    if (letterElement) {
      letterElement.classList.add('animate-wiggle');
      setTimeout(() => {
        letterElement.classList.remove('animate-wiggle');
      }, 1000);
    }
  };

  return (
    <div 
      ref={containerRef} 
      className="relative w-full h-[500px] md:h-[600px] overflow-hidden bg-gradient-to-b from-white to-purple-50"
    >
      {/* Floating Background Elements */}
      {floatingElements.map((element) => (
        <div
          key={element.id}
          className={`absolute ${element.color} ${element.shape} animate-float opacity-70`}
          style={{
            width: `${element.size}px`,
            height: `${element.size}px`,
            left: `${element.x}%`,
            top: `${element.y}%`,
            transform: `rotate(${element.rotation}deg)`,
            animationDuration: `${15 + element.delay}s`,
            animationDelay: `${element.delay}s`,
          }}
        />
      ))}

      {/* 3D Featured Letter */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div 
          className={`transition-all duration-700 ease-in-out transform ${
            isVisible ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
          }`}
        >
          <div 
            id="featured-letter"
            className="relative"
            onMouseEnter={handleMouseEnter}
          >
            <div className="text-[200px] md:text-[250px] font-baloo font-bold text-white drop-shadow-[0_10px_10px_rgba(0,0,0,0.2)] transform transition-all duration-300">
              {kannadaAlphabet[currentLetterIndex].character}
            </div>
            
            {/* 3D Effect Layers */}
            <div className="absolute inset-0 text-[200px] md:text-[250px] font-baloo font-bold text-purple-600/10 transform translate-x-2 translate-y-2">
              {kannadaAlphabet[currentLetterIndex].character}
            </div>
            <div className="absolute inset-0 text-[200px] md:text-[250px] font-baloo font-bold text-blue-500/10 transform translate-x-4 translate-y-4">
              {kannadaAlphabet[currentLetterIndex].character}
            </div>
          </div>
          
          <div className="text-center mt-4 animate-fade-in-up">
            <div className="text-xl font-bold font-baloo">
                {kannadaAlphabet[currentLetterIndex].name}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {kannadaAlphabet[currentLetterIndex].pronunciation}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient Overlay at Bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
    </div>
  );
};

export default Hero3D;
