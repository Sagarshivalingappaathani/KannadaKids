'use client';

import React, { useState, useEffect, useRef } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Button } from '@/components/ui/button';
import { RefreshCw, Heart, VolumeX, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

type FallingLetter = {
  id: string;
  character: string;
  pronunciation: string;
  x: number;
  y: number;
  speed: number;
  size: number;
  caught: boolean;
  missed: boolean;
};

type GameStats = {
  score: number;
  lives: number;
  level: number;
};

const LetterCatch: React.FC = () => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [gameArea, setGameArea] = useState({ width: 0, height: 0 });
  const [letters, setLetters] = useState<FallingLetter[]>([]);
  const [gameStats, setGameStats] = useState<GameStats>({ score: 0, lives: 5, level: 1 });
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [targetLetter, setTargetLetter] = useState<{character: string, pronunciation: string} | null>(null);
  
  const frameRef = useRef<number>(0);
  const lastLetterTime = useRef<number>(0);
  const difficultySettings = {
    easy: { spawnInterval: 1200, speedMultiplier: 1.0, maxLetters: 8, batchSize: 2 },
    medium: { spawnInterval: 1000, speedMultiplier: 1.4, maxLetters: 10, batchSize: 3 },
    hard: { spawnInterval: 800, speedMultiplier: 1.8, maxLetters: 12, batchSize: 4 }
  };
  
  // Initialize game area dimensions
  useEffect(() => {
    if (canvasRef.current) {
      const updateDimensions = () => {
        if (canvasRef.current) {
          const { width, height } = canvasRef.current.getBoundingClientRect();
          setGameArea({ width, height });
        }
      };
      
      updateDimensions();
      window.addEventListener('resize', updateDimensions);
      
      return () => {
        window.removeEventListener('resize', updateDimensions);
      };
    }
  }, []);
  
  // Select a new target letter
  const selectNewTargetLetter = () => {
    const randomLetter = kannadaAlphabet[Math.floor(Math.random() * kannadaAlphabet.length)];
    setTargetLetter({
      character: randomLetter.character,
      pronunciation: randomLetter.pronunciation
    });
  };
  
  // Start/stop game animation loop
  useEffect(() => {
    let animationId: number;
    
    const gameLoop = (timestamp: number) => {
      if (!isPaused && gameActive && !gameOver) {
        // Spawn new letters in batch
        if (timestamp - lastLetterTime.current > difficultySettings[difficulty].spawnInterval &&
            letters.filter(l => !l.caught && !l.missed).length < difficultySettings[difficulty].maxLetters) {
          spawnLetterBatch();
          lastLetterTime.current = timestamp;
        }
        
        // Update letter positions
        updateLetterPositions();
        
        // Request next frame
        animationId = requestAnimationFrame(gameLoop);
      }
    };
    
    if (gameActive && !gameOver && !isPaused) {
      lastLetterTime.current = performance.now();
      animationId = requestAnimationFrame(gameLoop);
    }
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [gameActive, gameOver, isPaused, letters, difficulty, targetLetter]);
  
  // Monitor game over condition
  useEffect(() => {
    if (gameStats.lives <= 0 && gameActive) {
      endGame();
    }
  }, [gameStats.lives, gameActive]);
  
  const startGame = () => {
    setLetters([]);
    setGameStats({ score: 0, lives: 5, level: 1 });
    setGameActive(true);
    setGameOver(false);
    setIsPaused(false);
    lastLetterTime.current = performance.now();
    selectNewTargetLetter();
  };
  
  const endGame = () => {
    setGameActive(false);
    setGameOver(true);
    
    if (soundEnabled) {
      const gameOverSound = new Audio('/audio/game-over.mp3');
      gameOverSound.play().catch(error => {
        console.error("Game over sound playback failed:", error);
      });
    }
  };
  
  const togglePause = () => {
    setIsPaused(prev => !prev);
  };

  // Spawn multiple letters at once in a batch
  const spawnLetterBatch = () => {
    if (!gameArea.width || !targetLetter) return;
    
    const batchSize = difficultySettings[difficulty].batchSize;
    const availableSpace = gameArea.width - 100; // Leave some margin
    const newLetters: FallingLetter[] = [];
    
    // Calculate spacing between letters
    const spacing = availableSpace / batchSize;
    
    // Always include at least one target letter in the batch
    const targetLetterPosition = Math.floor(Math.random() * batchSize);
    
    for (let i = 0; i < batchSize; i++) {
      // Decide if this letter should be the target or a distractor
      const isTargetLetter = i === targetLetterPosition || (Math.random() <= 0.3 && i !== targetLetterPosition);
      
      // Get a letter - either target or random distractor
      let letterToSpawn;
      if (isTargetLetter) {
        letterToSpawn = targetLetter;
      } else {
        // Make sure the distractor is not the same as the target
        let randomIndex;
        let randomLetter;
        do {
          randomIndex = Math.floor(Math.random() * kannadaAlphabet.length);
          randomLetter = kannadaAlphabet[randomIndex];
        } while (randomLetter.character === targetLetter.character);
        
        letterToSpawn = {
          character: randomLetter.character,
          pronunciation: randomLetter.pronunciation
        };
      }
      
      // Calculate position and speed with some randomization
      const letterSize = Math.floor(Math.random() * 15) + 45; // between 45-60px
      
      // Position letters more evenly across the width
      const baseX = i * spacing + (spacing - letterSize) / 2;
      const xVariation = Math.random() * (spacing * 0.5) - (spacing * 0.25);
      const xPosition = Math.max(0, Math.min(gameArea.width - letterSize, baseX + xVariation));
      
      // Randomize the starting height so they don't all enter at exactly the same position
      const yVariation = Math.random() * -100;
      
      // Vary speeds between letters in the same batch
      const baseSpeed = 1 + (gameStats.level * 0.1); // Speed increases with level
      const speedVariation = Math.random() * 0.5 - 0.25; // +/- 25% speed variation
      const speed = (baseSpeed + speedVariation) * difficultySettings[difficulty].speedMultiplier;
      
      const newLetter: FallingLetter = {
        id: `letter-${Date.now()}-${Math.random()}`,
        character: letterToSpawn.character,
        pronunciation: letterToSpawn.pronunciation,
        x: xPosition,
        y: yVariation, // Start above the visible area
        speed: speed,
        size: letterSize,
        caught: false,
        missed: false
      };
      
      newLetters.push(newLetter);
    }
    
    setLetters(prev => [...prev, ...newLetters]);
  };
  
  const updateLetterPositions = () => {
    if (!gameArea.height) return;
    
    setLetters(prevLetters => {
      return prevLetters.map(letter => {
        if (letter.caught || letter.missed) return letter;
        
        const newY = letter.y + letter.speed;
        
        // Check if letter has fallen below the screen
        if (newY > gameArea.height) {
          // Only penalize missed target letters
          if (!letter.missed && letter.character === targetLetter?.character) {
            setGameStats(prev => ({ ...prev, lives: prev.lives - 1 }));
            
            if (soundEnabled) {
              const missSound = new Audio('/audio/miss.mp3');
              missSound.play().catch(error => {
                console.error("Miss sound playback failed:", error);
              });
            }
          }
          
          return { ...letter, missed: true };
        }
        
        return { ...letter, y: newY };
      }).filter(letter => {
        // Remove letters that are caught or have fallen way below the screen
        return !(letter.missed && letter.y > gameArea.height + 100);
      });
    });
  };
  
  const catchLetter = (letterId: string, character: string) => {
    if (!targetLetter) return;
    
    setLetters(prevLetters => {
      return prevLetters.map(letter => {
        if (letter.id === letterId && !letter.caught) {
          if (letter.character === targetLetter.character) {
            // Correct letter caught - increment score
            setGameStats(prev => {
              const newScore = prev.score + 1;
              
              // Level up every 8 points
              if (newScore % 8 === 0) {
                // Select a new target letter when leveling up
                setTimeout(() => selectNewTargetLetter(), 500);
                return { ...prev, score: newScore, level: prev.level + 1 };
              }
              
              return { ...prev, score: newScore };
            });
            
            if (soundEnabled) {
              const catchSound = new Audio('/audio/success.mp3');
              catchSound.play().catch(error => {
                console.error("Catch sound playback failed:", error);
              });
            }
          } else {
            // Wrong letter caught - lose a life
            setGameStats(prev => ({ ...prev, lives: prev.lives - 1 }));
            
            if (soundEnabled) {
              const wrongSound = new Audio('/audio/miss.mp3');
              wrongSound.play().catch(error => {
                console.error("Wrong letter sound playback failed:", error);
              });
            }
          }
          
          return { ...letter, caught: true };
        }
        return letter;
      });
    });
  };
  
  const getLevelColor = () => {
    if (gameStats.level <= 3) return 'text-green-500';
    if (gameStats.level <= 6) return 'text-yellow-500';
    return 'text-red-500';
  };
  
  // Change target letter when level changes
  useEffect(() => {
    if (gameStats.level > 1 && gameActive && !gameOver) {
      // Small confetti burst for level up
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7, x: 0.5 }
      });
    }
  }, [gameStats.level, gameActive, gameOver]);
  
  return (
    <div className="flex flex-col items-center w-full">
      {/* Game Header */}
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-2xl font-bold">{gameStats.score}</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Lives</div>
            <div className="flex">
              {[...Array(gameStats.lives)].map((_, i) => (
                <Heart key={i} className="w-5 h-5 text-red-500 mx-0.5" fill="currentColor" />
              ))}
            </div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Level</div>
            <div className={`text-2xl font-bold ${getLevelColor()}`}>{gameStats.level}</div>
          </div>
        </div>
        
        <div className="space-y-3">
          <select
            className="block w-full p-2 border rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            disabled={gameActive && !gameOver}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          
          <div className="flex gap-2">
            <Button
              variant={gameActive && !gameOver ? "destructive" : "default"}
              onClick={gameActive && !gameOver ? endGame : startGame}
              className="flex-1"
            >
              {gameActive && !gameOver ? "End Game" : "Start Game"}
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2"
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Target Letter Display */}
      {gameActive && !gameOver && targetLetter && (
        <div className="w-full bg-white p-4 rounded-lg shadow-md mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="text-gray-600 mr-3">Catch this letter:</div>
            <div className="font-baloo text-4xl bg-kid-purple/20 px-4 py-1 rounded-lg">{targetLetter.character}</div>
          </div>
          <div className="text-gray-500 text-sm">Pronunciation: "{targetLetter.pronunciation}"</div>
        </div>
      )}
      
      {/* Game Canvas */}
      <div 
        ref={canvasRef}
        className="w-full h-96 bg-gradient-to-b from-blue-50 to-purple-50 rounded-xl border-2 border-gray-200 relative overflow-hidden"
      >
        {/* Game Instructions/Start Overlay */}
        {!gameActive && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-6">
            <h2 className="text-2xl font-bold mb-4">Letter Catch Game</h2>
            <p className="text-center mb-6">
              Watch for the target Kannada letter shown above the game area. Catch only that letter as it falls!
              <br /><br />
              Correct catch: +1 point<br />
              Wrong letter: -1 life<br />
              Missed target: -1 life
            </p>
            <Button onClick={startGame} size="lg">Start Game</Button>
          </div>
        )}
        
        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 p-6 animate-fade-in">
            <h2 className="text-3xl font-bold text-red-500 mb-2">Game Over!</h2>
            <p className="text-xl mb-2">Final Score: {gameStats.score}</p>
            <p className="text-lg mb-6">Level Reached: {gameStats.level}</p>
            <Button onClick={startGame} size="lg">Play Again</Button>
          </div>
        )}
        
        {/* Pause Overlay */}
        {isPaused && gameActive && !gameOver && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50 z-10 p-6">
            <h2 className="text-3xl font-bold text-white mb-6">Paused</h2>
            <Button onClick={togglePause} size="lg">Resume Game</Button>
          </div>
        )}
        
        {/* Falling Letters */}
        {letters.map(letter => {
          const isTargetLetter = letter.character === targetLetter?.character;
          return (
            <div
              key={letter.id}
              className={`absolute font-baloo flex items-center justify-center rounded-full transition-transform 
              ${letter.caught ? 'scale-150 opacity-0' : ''}`}
              style={{
                left: `${letter.x}px`,
                top: `${letter.y}px`,
                width: `${letter.size}px`,
                height: `${letter.size}px`,
                fontSize: `${letter.size * 0.6}px`,
                backgroundColor: isTargetLetter 
                  ? 'rgba(99, 102, 241, 0.8)' // Indigo for target letters
                  : 'rgba(156, 163, 175, 0.6)', // Gray for distractors
                boxShadow: isTargetLetter ? '0 0 10px rgba(79, 70, 229, 0.6)' : '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: isTargetLetter ? '2px solid rgba(79, 70, 229, 0.8)' : 'none',
                cursor: 'pointer',
                transition: letter.caught ? 'all 0.3s ease-out' : '',
                zIndex: letter.caught ? 5 : 1
              }}
              onClick={() => !letter.caught && !isPaused && catchLetter(letter.id, letter.character)}
            >
              {letter.character}
            </div>
          );
        })}
        
        {/* Pause Button */}
        {gameActive && !gameOver && (
          <Button
            variant="outline"
            className="absolute top-2 right-2 bg-white/80 z-10"
            onClick={togglePause}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        )}
      </div>
      
      {/* Game Controls on Mobile */}
      <div className="mt-4 w-full flex justify-center md:hidden">
        <Button 
          variant="ghost" 
          className="text-sm"
          onClick={togglePause}
        >
          {isPaused ? "Resume Game" : "Pause Game"}
        </Button>
      </div>
      
      {/* Custom CSS for animations */}
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LetterCatch;