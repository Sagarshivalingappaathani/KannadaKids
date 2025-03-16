'use client';

import React, { useState, useEffect, useRef } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Sparkles, Star, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type FallingLetter = {
  id: string;
  letter: string;
  transliteration: string;
  x: number;
  y: number;
  speed: number;
};

type GameState = 'idle' | 'playing' | 'gameOver';

const LetterCatch: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>('idle');
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [targetLetter, setTargetLetter] = useState<string>('');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [level, setLevel] = useState(1);
  const [gameTime, setGameTime] = useState(60); // seconds
  const [timeLeft, setTimeLeft] = useState(60);
  
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>(0);
  const lastLetterAddedRef = useRef<number>(0);
  const gameWidth = useRef<number>(0);
  const gameHeight = useRef<number>(0);
  const livesRef = useRef(lives);

  // Keep livesRef updated with the latest lives value
  useEffect(() => {
    livesRef.current = lives;
  }, [lives]);

  // Initialize dimensions as soon as component mounts
  useEffect(() => {
    const updateDimensions = () => {
      if (gameAreaRef.current) {
        gameWidth.current = gameAreaRef.current.clientWidth;
        gameHeight.current = gameAreaRef.current.clientHeight;
      }
    };
    
    // Initial update and listen for resize
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Initialize the game
  const startGame = () => {
    setGameState('playing');
    setLetters([]);
    setScore(0);
    setLives(3);
    setLevel(1);
    setTimeLeft(gameTime);
    
    // Make sure dimensions are updated
    if (gameAreaRef.current) {
      gameWidth.current = gameAreaRef.current.clientWidth;
      gameHeight.current = gameAreaRef.current.clientHeight;
    }
    
    // Choose a random target letter
    const randomIndex = Math.floor(Math.random() * kannadaAlphabet.length);
    setTargetLetter(kannadaAlphabet[randomIndex].character);
    
    toast.success(`Catch the letter: ${kannadaAlphabet[randomIndex].character} (${kannadaAlphabet[randomIndex].transliteration})`, {
      duration: 4000,
    });
    
    // Start the game loop
    lastLetterAddedRef.current = Date.now();
    cancelAnimationFrame(animationFrameRef.current);
    animationFrameRef.current = requestAnimationFrame(gameLoop);
  };

  const stopGame = () => {
    cancelAnimationFrame(animationFrameRef.current);
    setGameState('gameOver');
  };

  const resetGame = () => {
    cancelAnimationFrame(animationFrameRef.current);
    setGameState('idle');
    setLetters([]);
    setScore(0);
    setLives(3);
    setLevel(1);
  };

  // Game loop
  const gameLoop = () => {
    // Add new letters periodically
    const currentTime = Date.now();
    const letterInterval = Math.max(300, 1500 - level * 100); // Decrease interval as level increases, with a minimum
    
    if (currentTime - lastLetterAddedRef.current > letterInterval) {
      addLetter();
      lastLetterAddedRef.current = currentTime;
    }
    
    // Update letter positions
    setLetters(prevLetters => {
      return prevLetters.map(letter => {
        const newY = letter.y + letter.speed;
        
        // Remove letters that have fallen out of view
        if (newY > gameHeight.current) {
          // If we missed the target letter, lose a life
          if (letter.letter === targetLetter) {
            const newLives = livesRef.current - 1;
            setTimeout(() => {
              setLives(newLives);
              if (newLives <= 0) {
                stopGame();
              }
            }, 0);
          }
          return null;
        }
        
        return { ...letter, y: newY };
      }).filter(Boolean) as FallingLetter[];
    });
    
    // Continue the game loop
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  };

  // Add a new letter to the game
  const addLetter = () => {
    if (!gameAreaRef.current || gameWidth.current === 0) {
      // Re-measure if needed
      if (gameAreaRef.current) {
        gameWidth.current = gameAreaRef.current.clientWidth;
        gameHeight.current = gameAreaRef.current.clientHeight;
      } else {
        return; // Can't add letter without measurements
      }
    }
    
    const randomIndex = Math.floor(Math.random() * kannadaAlphabet.length);
    const letter = kannadaAlphabet[randomIndex];
    
    // Letter element size (adjust if needed)
    const letterSize = 60;
    
    // Make sure we stay within bounds
    const maxX = Math.max(0, gameWidth.current - letterSize);
    const randomX = Math.floor(Math.random() * maxX);
    
    // Speed increases with level
    const baseSpeed = 1 + Math.min(5, level * 0.3); // Cap the max speed increase
    const randomSpeed = baseSpeed + Math.random() * 0.5;
    
    const newLetter: FallingLetter = {
      id: `letter-${Date.now()}-${Math.random()}`,
      letter: letter.character,
      transliteration: letter.transliteration,
      x: randomX,
      y: -letterSize, // Start above the game area
      speed: randomSpeed,
    };
    
    setLetters(prevLetters => [...prevLetters, newLetter]);
  };

  // Handle letter click
  const handleLetterClick = (letter: FallingLetter) => {
    setLetters(prevLetters => prevLetters.filter(l => l.id !== letter.id));
    
    if (letter.letter === targetLetter) {
      // Caught the correct letter
      setScore(prevScore => {
        const newScore = prevScore + 10 * level;
        
        // Level up every 50 points
        if (newScore > 0 && newScore % 50 === 0) {
          setLevel(prevLevel => {
            const newLevel = prevLevel + 1;
            toast.success(`Level ${newLevel}! Speed increased!`, {
              duration: 2000,
            });
            return newLevel;
          });
        }
        
        return newScore;
      });
      
      // Set a new target letter
      let randomIndex;
      do {
        randomIndex = Math.floor(Math.random() * kannadaAlphabet.length);
      } while (kannadaAlphabet[randomIndex].character === targetLetter);
      
      setTargetLetter(kannadaAlphabet[randomIndex].character);
      toast.success(`New target: ${kannadaAlphabet[randomIndex].character} (${kannadaAlphabet[randomIndex].transliteration})`, {
        duration: 3000,
      });
    } else {
      // Caught the wrong letter
      setLives(prevLives => {
        const newLives = prevLives - 1;
        if (newLives <= 0) {
          stopGame();
        }
        return newLives;
      });
      
      toast.error('Wrong letter! Try again.', {
        duration: 1500,
      });
    }
  };

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (gameState === 'playing') {
      timer = setInterval(() => {
        setTimeLeft(prevTime => {
          const newTime = prevTime - 1;
          if (newTime <= 0) {
            stopGame();
            return 0;
          }
          return newTime;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [gameState]);

  // Clean up animation frame on unmount
  useEffect(() => {
    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Update game state
  useEffect(() => {
    if (gameState === 'playing') {
      // Start game loop if not already running
      if (animationFrameRef.current === 0) {
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      }
    } else {
      // Stop game loop if not playing
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = 0;
    }
  }, [gameState]);

  return (
    <div className="flex flex-col h-full">
      {/* Game header */}
      <div className="flex justify-between items-center mb-4 p-2 bg-purple-50 rounded-lg">
        <div className="flex items-center gap-2">
          <Star className="text-yellow-500" />
          <span className="text-lg font-bold">Score: {score}</span>
        </div>
        
        <div className="flex items-center">
          <span className="text-lg font-bold mr-4">Level: {level}</span>
          <div className="flex">
            {[...Array(lives)].map((_, i) => (
              <span key={i} className="text-red-500 text-2xl mx-0.5">❤️</span>
            ))}
          </div>
        </div>
      </div>
      
      {/* Time bar */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span className="text-sm font-medium">Time Left</span>
          <span className="text-sm font-medium">{timeLeft}s</span>
        </div>
        <Progress value={(timeLeft / gameTime) * 100} className="h-2" />
      </div>
      
      {gameState === 'idle' && (
        <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h3 className="text-2xl font-bold mb-2">Kannada Letter Catch</h3>
            <p className="text-gray-600">
              Catch the falling Kannada letters that match the target letter!
            </p>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button 
              onClick={startGame}
              className="px-8 py-6 text-lg rounded-full bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Game
            </Button>
          </motion.div>
        </div>
      )}
      
      {gameState === 'playing' && (
        <div 
          ref={gameAreaRef}
          className="relative flex-grow bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl overflow-hidden h-80"
        >
          {/* Target letter */}
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-md z-10">
            <div className="flex flex-col items-center">
              <span className="text-sm font-medium text-gray-600">Catch this letter:</span>
              <span className="text-3xl font-bold">{targetLetter}</span>
            </div>
          </div>
          
          {/* Falling letters */}
          <AnimatePresence>
            {letters.map(letter => (
              <motion.div
                key={letter.id}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.2 }}
                className={`absolute cursor-pointer select-none ${
                  letter.letter === targetLetter ? 'text-purple-600' : 'text-gray-700'
                }`}
                style={{
                  left: `${letter.x}px`,
                  top: `${letter.y}px`,
                  width: '60px',
                  height: '60px'
                }}
                onClick={() => handleLetterClick(letter)}
              >
                <div className={`flex items-center justify-center h-12 w-12 text-3xl font-bold rounded-full ${
                  letter.letter === targetLetter ? 'bg-purple-100' : 'bg-gray-100'
                } shadow-sm hover:shadow-md transition-shadow`}>
                  {letter.letter}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
      
      {gameState === 'gameOver' && (
        <div className="flex flex-col items-center justify-center h-80 bg-gradient-to-b from-purple-50 to-blue-50 rounded-xl p-6">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-8"
          >
            <h3 className="text-2xl font-bold mb-2">Game Over!</h3>
            <p className="text-lg mb-4">Your Score: <span className="font-bold text-purple-600">{score}</span></p>
            <p className="text-lg">Level Reached: <span className="font-bold text-blue-600">{level}</span></p>
          </motion.div>
          
          <div className="flex gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={startGame}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-md hover:shadow-lg"
              >
                Play Again
                </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={resetGame}
                variant="outline"
                className="px-6 py-2"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Reset
              </Button>
            </motion.div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LetterCatch;