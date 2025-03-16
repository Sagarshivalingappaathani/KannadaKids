'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ArrowRight, Headphones, BookOpen, Star } from 'lucide-react';
import Link from 'next/link';
import { KannadaLetter } from '@/lib/alphabetData';

interface AlphabetCardProps {
  letter: KannadaLetter;
  index: number;
  progress?: {
    mastery_level: number;
    completed: boolean;
  };
}

const AlphabetCard: React.FC<AlphabetCardProps> = ({ letter, index, progress }) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };
  
  // Enhanced color palette with more vivid gradients
  const cardStyles = [
    { 
      gradient: 'bg-gradient-to-br from-purple-100 to-purple-200',
      letterGradient: 'bg-gradient-to-br from-purple-600 to-purple-800',
      text: 'text-purple-800',
      border: 'border-purple-300',
      shadow: 'hover:shadow-purple-300/50',
      accent: 'bg-purple-600',
      hoverGlow: 'shadow-lg shadow-purple-300/30'
    },
    { 
      gradient: 'bg-gradient-to-br from-blue-100 to-blue-200',
      letterGradient: 'bg-gradient-to-br from-blue-600 to-blue-800',
      text: 'text-blue-800',
      border: 'border-blue-300',
      shadow: 'hover:shadow-blue-300/50',
      accent: 'bg-blue-600',
      hoverGlow: 'shadow-lg shadow-blue-300/30'
    },
    { 
      gradient: 'bg-gradient-to-br from-green-100 to-green-200',
      letterGradient: 'bg-gradient-to-br from-green-600 to-green-800',
      text: 'text-green-800',
      border: 'border-green-300',
      shadow: 'hover:shadow-green-300/50',
      accent: 'bg-green-600',
      hoverGlow: 'shadow-lg shadow-green-300/30'
    },
    { 
      gradient: 'bg-gradient-to-br from-yellow-100 to-yellow-200',
      letterGradient: 'bg-gradient-to-br from-yellow-600 to-amber-700',
      text: 'text-yellow-800',
      border: 'border-yellow-300',
      shadow: 'hover:shadow-yellow-300/50',
      accent: 'bg-yellow-600',
      hoverGlow: 'shadow-lg shadow-yellow-300/30'
    },
    { 
      gradient: 'bg-gradient-to-br from-pink-100 to-pink-200',
      letterGradient: 'bg-gradient-to-br from-pink-600 to-rose-700',
      text: 'text-pink-800',
      border: 'border-pink-300',
      shadow: 'hover:shadow-pink-300/50',
      accent: 'bg-pink-600',
      hoverGlow: 'shadow-lg shadow-pink-300/30'
    },
    { 
      gradient: 'bg-gradient-to-br from-indigo-100 to-indigo-200',
      letterGradient: 'bg-gradient-to-br from-indigo-600 to-indigo-800',
      text: 'text-indigo-800',
      border: 'border-indigo-300',
      shadow: 'hover:shadow-indigo-300/50',
      accent: 'bg-indigo-600',
      hoverGlow: 'shadow-lg shadow-indigo-300/30'
    },
  ];
  
  const style = cardStyles[index % cardStyles.length];
  const transitionDelay = `${(index % 12) * 100}ms`;
  
  // Mastery indicator
  const masteryLevel = progress?.mastery_level || 0;
  const isCompleted = progress?.completed || false;
  
  return (
    <div 
      className="perspective-1000 cursor-pointer group"
      style={{ 
        transitionDelay,
        animationDelay: transitionDelay,
        perspective: '1000px' // Add explicit perspective
      }}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className={`relative w-full h-64 transition-transform duration-700 ease-out ${isFlipped ? 'rotate-y-180' : ''}`}
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Card Front */}
        <div 
          className={`absolute w-full h-full rounded-xl border-2 ${style.gradient} ${style.border} flex flex-col items-center justify-center p-6 transition-all duration-500 shadow-md ${isHovered ? style.hoverGlow : ''} hover:translate-y-[-5px] ease-out overflow-hidden`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-16 h-16 rounded-br-full opacity-20 bg-white"></div>
          <div className="absolute bottom-0 right-0 w-24 h-24 rounded-tl-full opacity-20 bg-white"></div>
          
          {/* Completed badge */}
          {isCompleted && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm animate-pulse">
              Complete
            </div>
          )}
          
          {/* Main letter display */}
          <div className={`relative text-8xl font-bold mb-4 ${style.letterGradient} bg-clip-text text-transparent drop-shadow-sm transition-transform duration-500 transform ${isHovered ? 'scale-110' : ''}`}>
            {letter.character}
          </div>
          
          <h3 className={`text-xl font-semibold ${style.text} transition-all duration-500`}>
            {letter.name}
          </h3>
          
          <p className={`text-sm opacity-80 text-center mt-1 ${style.text}`}>
            {letter.pronunciation}
          </p>
          
          {/* Flip indicator with animation */}
          <div className={`absolute bottom-3 right-3 transition-all duration-500 ${isHovered ? 'translate-x-[-3px]' : ''}`}>
            <div className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm">
              <ArrowRight className={`h-4 w-4 ${style.text} transition-transform duration-500 ${isHovered ? 'translate-x-1' : ''}`} />
            </div>
          </div>
          
          {/* Improved mastery stars */}
          {masteryLevel > 0 && (
            <div className="absolute bottom-3 left-3 flex">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="relative">
                  <Star 
                    className={`w-4 h-4 ${i < masteryLevel ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'} 
                    ${i < masteryLevel && isHovered ? 'animate-pulse' : ''}`}
                    strokeWidth={1}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Card Back */}
        <div 
          className={`absolute w-full h-full rounded-xl border-2 ${style.gradient} ${style.border} p-5 flex flex-col shadow-md ${isHovered ? style.hoverGlow : ''} hover:translate-y-[-5px] transition-all duration-500 ease-out overflow-hidden`}
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-20 bg-white"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 rounded-tr-full opacity-20 bg-white"></div>
          
          {/* Header section */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-14 h-14 rounded-lg ${style.letterGradient} text-white flex items-center justify-center shadow-md`}>
              <span className="text-2xl font-bold">{letter.character}</span>
            </div>
            <div>
              <h3 className={`text-lg font-bold ${style.text}`}>{letter.name}</h3>
              <div className="flex items-center gap-1 mt-1 bg-white/50 px-2 py-1 rounded-full">
                <Headphones className="h-3 w-3 opacity-70" />
                <p className="text-sm opacity-80">{letter.pronunciation}</p>
              </div>
            </div>
          </div>
          
          {/* Examples section with improved styling */}
          <div className="flex-grow overflow-auto bg-white/40 backdrop-blur-sm rounded-lg p-3">
            <div className="flex items-center gap-1 mb-2 border-b border-gray-200 pb-1">
              <BookOpen className={`h-4 w-4 ${style.text}`} />
              <h4 className={`text-xs font-semibold uppercase ${style.text}`}>Examples:</h4>
            </div>
            <ul className="text-sm space-y-2 pl-1">
              {letter.examples.map((example, idx) => (
                <li key={idx} className="flex items-start hover:bg-white/40 p-1 rounded transition-colors duration-300">
                  <div className={`w-2 h-2 rounded-full ${style.accent} mr-2 mt-1.5 flex-shrink-0`}></div>
                  <span className={`${style.text}`}>{example}</span>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Action button with effects */}
          <Link 
            href={`/learn/${letter.id}`} 
            onClick={(e) => e.stopPropagation()} 
            className="mt-4"
          >
            <Button 
              size="sm" 
              className={`w-full transition-all duration-500 ${
                progress?.completed 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700' 
                  : `bg-gradient-to-r from-${style.accent.split('-')[1]}-600 to-${style.accent.split('-')[1]}-700 hover:from-${style.accent.split('-')[1]}-700 hover:to-${style.accent.split('-')[1]}-800`
              } shadow-md hover:shadow-lg text-white font-medium`}
            >
              <span className="mr-2">{progress?.completed ? 'Review' : 'Learn'}</span>
              <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AlphabetCard;