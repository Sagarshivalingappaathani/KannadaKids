'use client';

import React, { useState, useEffect } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Button } from '@/components/ui/button';
import { Shuffle, Check, AlertCircle, Award, ArrowRight } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import type { KannadaLetter } from '@/lib/alphabetData';
import confetti from 'canvas-confetti';

const AlphabetOrderingGame: React.FC = () => {
  const [letters, setLetters] = useState<KannadaLetter[]>([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [isCorrectOrder, setIsCorrectOrder] = useState(false);
  const [draggedLetter, setDraggedLetter] = useState<KannadaLetter | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState('easy');
  const [categoryFilter, setCategoryFilter] = useState('vowel');
  const [score, setScore] = useState(0);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [gameComplete, setGameComplete] = useState(false);
  const [level, setLevel] = useState(1);
  const { toast } = useToast();

  // Get letters based on difficulty and category
  const getFilteredLetters = (): KannadaLetter[] => {
    const filtered = kannadaAlphabet.filter(letter => letter.category === categoryFilter);
    
    switch(difficulty) {
      case 'easy':
        return filtered.slice(0, 5);
      case 'medium':
        return filtered.slice(0, 8);
      case 'hard':
        return filtered;
      default:
        return filtered.slice(0, 5);
    }
  };
  
  // Initialize or reset the game
  const initializeGame = () => {
    const filteredLetters = getFilteredLetters();
    
    // Shuffle the letters
    const shuffledLetters = [...filteredLetters].sort(() => Math.random() - 0.5);
    
    setLetters(shuffledLetters);
    setGameStarted(true);
    setIsCorrectOrder(false);
    setShowSuccess(false);
    setAttemptCount(0);
    
    toast({
      title: "Game Started",
      description: `Arrange the ${categoryFilter === 'vowel' ? 'vowels' : 'consonants'} in the correct order!`,
      duration: 3000,
    });
  };
  

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, letter: KannadaLetter, index: number) => {
    setDraggedLetter(letter);
    setDraggedIndex(index);
    e.dataTransfer.setData('text/plain', letter.id);
    
    // Add a dragging ghost image
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.4';
      e.dataTransfer.effectAllowed = 'move';
      const dragSound = new Audio('/audio/drag.mp3');
      dragSound.play();
      setTimeout(() => {
        dragSound.pause();
        dragSound.currentTime = 0;
      }, 2000); 
    }
  };
  
  // Handle drag end
  const handleDragEnd = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
  };
  
  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = 'rgba(124, 58, 237, 0.1)';
      e.currentTarget.style.transform = 'scale(1.05)';
      e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
  };
  
  // Handle drag leave
  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = '';
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '';
    }
  };
  
  // Handle drop
  const handleDrop = (e: React.DragEvent, targetLetter: KannadaLetter, targetIndex: number) => {
    e.preventDefault();
    
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.backgroundColor = '';
      e.currentTarget.style.transform = 'scale(1)';
      e.currentTarget.style.boxShadow = '';
    }
    
    if (!draggedLetter || draggedIndex === null) return;
    
    // Rearrange the letters
    if (draggedIndex === targetIndex) return;
    
    const newLetters = [...letters];
    const [removed] = newLetters.splice(draggedIndex, 1);
    newLetters.splice(targetIndex, 0, removed);
    
    setLetters(newLetters);
    setDraggedLetter(null);
    
    // Show a subtle notification for the move
    toast({
      description: `Moved "${removed.name}" to new position`,
      duration: 1500,
    });
  };
  
  // Check if the order is correct
  const checkOrder = () => {
    const correctLetters = getFilteredLetters();
    const isCorrect = correctLetters.every((letter, index) => {
      return letters[index].id === letter.id;
    });
    
    setIsCorrectOrder(isCorrect);
    setAttemptCount(attemptCount + 1);
    
    if (isCorrect) {
      // Calculate points - more points for fewer attempts and higher levels
      const pointsEarned = Math.max(10 - attemptCount, 1) * level;
      setScore(score + pointsEarned);
      setShowSuccess(true);
      
      const successSound = new Audio('/audio/success.mp3');
      successSound.play().catch(error => {
        console.error("Success sound playback failed:", error);
      });
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      toast({
        title: "Correct Order!",
        description: `You earned ${pointsEarned} points! Moving to next level...`,
        variant: "default",
        duration: 3000,
      });
      
      // After 3 seconds, move to the next level
      setTimeout(() => {
        setShowSuccess(false);
        if (difficulty === 'hard' && categoryFilter === 'consonant') {
          // Game complete
          setGameComplete(true);
          toast({
            title: "Game Complete!",
            description: `Congratulations! You've mastered the Kannada alphabet with a score of ${score + pointsEarned}!`,
            duration: 5000,
          });
        } else if (difficulty === 'hard' && categoryFilter === 'vowel') {
          // Move to consonants
          setCategoryFilter('consonant');
          setDifficulty('easy');
          setLevel(level + 1);
          
          toast({
            title: "New Challenge!",
            description: `Moving to consonants! Level ${level + 1}`,
            duration: 3000,
          });
        } else if (difficulty === 'medium') {
          setDifficulty('hard');
          toast({
            description: `Difficulty increased to hard!`,
            duration: 3000,
          });
        } else {
          setDifficulty('medium');
          toast({
            description: `Difficulty increased to medium!`,
            duration: 3000,
          });
        }
      }, 3000);
    } else {
      const errorSound = new Audio('/audio/error.mp3');
      errorSound.play().catch(error => {
        console.error("Error sound playback failed:", error);
      });
      toast({
        title: "Not quite right",
        description: "Try rearranging the letters again",
        variant: "destructive",
        duration: 3000,
      });
    }
  };
  
  // Reset the game
  const resetGame = () => {
    setScore(0);
    setLevel(1);
    setDifficulty('easy');
    setCategoryFilter('vowel');
    setGameComplete(false);
    
    toast({
      title: "Game Reset",
      description: "Starting a new game!",
      duration: 3000,
    });
    
    initializeGame();
  };
  
  // Initialize game on mount and when difficulty/category changes
  useEffect(() => {
    if (gameStarted) {
      initializeGame();
    }
  }, [difficulty, categoryFilter]);
  
  return (
    <div className="flex flex-col items-center w-full max-w-3xl mx-auto">
      {!gameStarted && !gameComplete ? (
        <div className="bg-white rounded-xl shadow-md p-8 w-full">
          <h2 className="text-2xl font-bold text-center mb-6">Kannada Alphabet Order Challenge</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Difficulty Level:</label>
            <select
              className="w-full p-2 border rounded"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="easy">Easy (5 letters)</option>
              <option value="medium">Medium (8 letters)</option>
              <option value="hard">All letters</option>
            </select>
          </div>
          
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Letter Category:</label>
            <select
              className="w-full p-2 border rounded"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="vowel">Vowels</option>
              <option value="consonant">Consonants</option>
            </select>
          </div>
          
          <p className="text-gray-600 mb-6 text-center">
            Challenge yourself to arrange the Kannada letters in the correct order!
          </p>
          
          <Button 
            onClick={initializeGame}
            className="w-full"
          >
            Start Game
          </Button>
        </div>
      ) : gameComplete ? (
        <div className="bg-white rounded-xl shadow-md p-8 w-full text-center">
          <div className="flex justify-center mb-4">
            <Award className="h-16 w-16 text-yellow-400" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Game Complete!</h2>
          <p className="text-xl mb-6">Your final score: <span className="font-bold">{score}</span></p>
          
          <div className="mb-8">
            <p className="text-gray-600">
              Congratulations! You've mastered the order of the Kannada alphabet.
            </p>
          </div>
          
          <Button 
            onClick={resetGame}
            className="w-full"
          >
            Play Again
          </Button>
        </div>
      ) : (
        <div className="w-full">
          {/* Game header */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-500">Level {level}</p>
                <p className="text-sm text-gray-500">{categoryFilter === 'vowel' ? 'Vowels' : 'Consonants'} - {difficulty}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Score</p>
                <p className="text-xl font-bold">{score}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Attempts</p>
                <p className="text-sm">{attemptCount}</p>
              </div>
            </div>
          </div>
          
          {/* Game instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
              <div>
                <p className="text-sm text-blue-800">
                  Drag and drop the letters to arrange them in the correct alphabetical order.
                </p>
              </div>
            </div>
          </div>
          
          {/* Letters container */}
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4 justify-center">
              {letters.map((letter, index) => (
                <div
                  key={letter.id}
                  className={`
                    w-16 h-16 border-2 rounded-lg flex items-center justify-center 
                    ${isCorrectOrder && showSuccess 
                      ? 'border-green-500 bg-green-50' 
                      : 'border-gray-200 hover:border-purple-500'}
                    ${draggedIndex === index ? 'opacity-40' : 'opacity-100'}
                    transition-all duration-200 transform
                  `}
                  draggable={!showSuccess}
                  onDragStart={(e) => handleDragStart(e, letter, index)}
                  onDragEnd={handleDragEnd}
                  onDragOver={(e) => handleDragOver(e)}
                  onDragLeave={(e) => handleDragLeave(e)}
                  onDrop={(e) => handleDrop(e, letter, index)}
                >
                  <span className="text-3xl font-baloo select-none">{letter.character}</span>
                </div>
              ))}
            </div>
            
            {/* Success message */}
            {showSuccess && (
              <div className="mt-6 bg-green-100 border border-green-300 rounded-lg p-4 text-center animate-pulse">
                <p className="text-green-800 font-medium">Correct! Moving to next level...</p>
              </div>
            )}
            
            <div className="mt-6 flex justify-center">
              <Button
                onClick={checkOrder}
                className="flex items-center gap-2"
                disabled={showSuccess}
                variant={attemptCount > 0 ? "default" : "outline"}
              >
                <Check className="h-4 w-4" />
                Check Order
              </Button>
            </div>
          </div>
          
          {/* Letter reference */}
          <div className="bg-gray-50 p-4 rounded-xl">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Letters Information:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {letters.map((letter) => (
                <div key={letter.id} className="bg-white p-2 rounded flex items-center">
                  <span className="text-2xl font-baloo mr-3">{letter.character}</span>
                  <div>
                    <p className="font-medium">{letter.name}</p>
                    <p className="text-xs text-gray-500">{letter.pronunciation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlphabetOrderingGame;