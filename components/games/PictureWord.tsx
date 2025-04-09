'use client';

import React, { useState, useEffect, useRef } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Clock, Volume2, Image } from 'lucide-react';
import confetti from 'canvas-confetti';

type WordImage = {
  word: string;
  image: string;
  startingLetter: string;
  transliteration: string;
  audio: string;
};

const PictureWordAssociation: React.FC = () => {
  const [score, setScore] = useState<number>(0);
  const [consecutiveCorrect, setConsecutiveCorrect] = useState<number>(0);
  const [streak, setStreak] = useState<number>(0);
  const [questionCount, setQuestionCount] = useState<number>(0);
  const [totalQuestions, setTotalQuestions] = useState<number>(10);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [currentWord, setCurrentWord] = useState<WordImage | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [wordBank, setWordBank] = useState<WordImage[]>([]);
  const [usedWords, setUsedWords] = useState<Set<string>>(new Set());
  const audioRef = useRef<HTMLAudioElement | null>(null);


  // Initialize game
  useEffect(() => {
    const formattedWordBank = kannadaAlphabet.map(letter => ({
      word: letter.word,
      image: letter.image,
      startingLetter: letter.character,
      transliteration: letter.transliteration,
      audio: letter.audio,
    }));
    console.log(formattedWordBank);
    setWordBank(formattedWordBank);
    startNewGame();
  }, [difficulty]);
  useEffect(() => {
    let timer: NodeJS.Timeout;

    if (gameActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && gameActive) {
      setGameActive(false);
      setGameComplete(true);
    }

    return () => clearInterval(timer);
  }, [gameActive, timeLeft]);

  const startNewGame = () => {
    // Reset game state
    setScore(0);
    setConsecutiveCorrect(0);
    setStreak(0);
    setQuestionCount(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setGameActive(false);
    setGameComplete(false);
    setUsedWords(new Set());

    // Set time based on difficulty
    let gameTime = 60; // easy
    if (difficulty === 'medium') gameTime = 45;
    if (difficulty === 'hard') gameTime = 30;
    setTimeLeft(gameTime);

    // Set questions based on difficulty
    let questions = 10; // easy
    if (difficulty === 'medium') questions = 15;
    if (difficulty === 'hard') questions = 20;
    setTotalQuestions(questions);

    // Set up first question
    setNextQuestion();
  };

  const setNextQuestion = () => {
    // Filter words that haven't been used yet
    const availableWords = wordBank.filter(word => !usedWords.has(word.word));

    // If we've used all words, reset the used words set
    if (availableWords.length === 0) {
      setUsedWords(new Set());
      // Only call setNextQuestion if there are words available after reset
      const resetAvailableWords = wordBank.filter(word => !usedWords.has(word.word));
      if (resetAvailableWords.length > 0) {
        setNextQuestion();
      }
      return;
    }

    // Select a random word
    const randomIndex = Math.floor(Math.random() * availableWords.length);
    const selectedWord = availableWords[randomIndex];

    // Mark this word as used
    setUsedWords(prev => new Set(prev).add(selectedWord.word));

    // Set as current word
    setCurrentWord(selectedWord);

    // Create options (including the correct answer)
    const allLetters = kannadaAlphabet.map(letter => letter.character);

    // Filter out the correct answer to avoid duplicates
    const otherLetters = allLetters.filter(letter => letter !== selectedWord.startingLetter);

    // Determine number of options based on difficulty
    let numOptions = 3; // easy
    if (difficulty === 'medium') numOptions = 4;
    if (difficulty === 'hard') numOptions = 5;

    // Select random letters for wrong options
    const wrongOptions = otherLetters
      .sort(() => Math.random() - 0.5)
      .slice(0, numOptions - 1);

    // Combine correct and wrong options, then shuffle
    const allOptions = [selectedWord.startingLetter, ...wrongOptions].sort(() => Math.random() - 0.5);

    setOptions(allOptions);
    setSelectedOption(null);
    setIsCorrect(null);
  };

  const handleStartGame = () => {
    setGameActive(true);
  };

  const handleOptionSelect = (option: string) => {
    if (!gameActive || isCorrect !== null) return;

    setSelectedOption(option);

    // Check if the answer is correct
    const correct = option === currentWord?.startingLetter;
    setIsCorrect(correct);

    if (correct) {
      // Play success sound
      const successSound = new Audio('/audio/success.mp3');
      successSound.play().catch(error => {
        console.error("Success sound playback failed:", error);
      });

      // Update score and streak
      setScore(prev => prev + 1);
      setConsecutiveCorrect(prev => prev + 1);

      if (consecutiveCorrect + 1 > streak) {
        setStreak(consecutiveCorrect + 1);
      }

      // If we've answered enough questions, end the game
      if (questionCount + 1 >= totalQuestions) {
        setGameActive(false);
        setGameComplete(true);

        // Trigger confetti
        confetti({
          particleCount: 200,
          spread: 70,
          origin: { y: 0.6 }
        });

        // Play completion sound
        const completionSound = new Audio('/audio/completion.mp3');
        completionSound.play().catch(error => {
            console.error("Completion sound playback failed:", error);
        });
      } else {
        // Otherwise, move to next question after a small delay
        setTimeout(() => {
          setQuestionCount(prev => prev + 1);
          setNextQuestion();
        }, 1000);
      }
    } else {
      // Play error sound
      const errorSound = new Audio('/audio/error.mp3');
      errorSound.play().catch(error => {
        console.error("Error sound playback failed:", error);
      });

      // Reset consecutive correct answers
      setConsecutiveCorrect(0);

      // Move to next question after a small delay
      setTimeout(() => {
        setQuestionCount(prev => prev + 1);
        setNextQuestion();
      }, 1500);
    }
  };

  // Play word audio
  const playWordAudio = () => {
    if (!currentWord) return;
    console.log(currentWord);
    const audioPath = currentWord.audio;
    console.log(audioPath);
    if (!audioPath) return;

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = audioPath;
      audioRef.current.play().catch(error => {
        console.error("Audio playback failed:", error);
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-4">
      {/* Hidden audio element for playing sounds */}
      <audio ref={audioRef} />

      {/* Game Header */}
      <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <div className="flex gap-4">
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Score</div>
            <div className="text-2xl font-bold">{score}/{totalQuestions}</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Streak</div>
            <div className="text-2xl font-bold">{consecutiveCorrect} <span className="text-sm text-gray-400">(Best: {streak})</span></div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow flex items-center">
            <Clock className="text-gray-400 mr-2 h-5 w-5" />
            <div className="text-2xl font-bold">{timeLeft}</div>
          </div>
        </div>

        <div className="space-y-3 w-full sm:w-auto">
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              className="block w-full p-2 border rounded"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
              disabled={gameActive}
            >
              <option value="easy">Easy (3 options)</option>
              <option value="medium">Medium (4 options)</option>
              <option value="hard">Hard (5 options)</option>
            </select>
          </div>

          <Button
            onClick={gameActive ? startNewGame : handleStartGame}
            className="flex items-center gap-2 w-full"
            variant={gameActive ? "outline" : "default"}
          >
            {gameActive ? (
              <>
                <RefreshCw className="h-4 w-4" />
                Reset Game
              </>
            ) : (
              'Start Game'
            )}
          </Button>
        </div>
      </div>

      {/* Game Instructions */}
      {!gameActive && !gameComplete && (
        <div className="bg-blue-50 p-4 rounded-lg mb-8 w-full max-w-2xl">
          <h3 className="font-bold text-blue-700 mb-2">How to Play:</h3>
          <p className="mb-2">
            Look at the picture and select the Kannada letter that the word starts with.
          </p>
          <p>Build your streak by getting consecutive answers correct!</p>
          <p className="mt-2">Click the sound icon <Volume2 className="inline h-4 w-4" /> to hear the word.</p>
        </div>
      )}

      {/* Game Board */}
      {gameActive && !gameComplete && currentWord && (
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-lg font-medium text-gray-700 mb-3">
              What letter does this word start with?
            </h3>

            {/* Question number indicator */}
            <div className="text-sm text-gray-500 mb-4">
              Question {questionCount + 1} of {totalQuestions}
            </div>
            {/* Word and Image */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-8">
              {/* Image */}
              <div className="w-full md:w-1/2 h-48 md:h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                {/* Placeholder for image - in a real implementation, use the actual image path */}
                {currentWord.image ? (
                  <img
                    src={currentWord.image}
                    alt={currentWord.transliteration}
                    className="max-w-full max-h-full object-contain"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Image className="h-12 w-12 mb-2" />
                    <span>Image placeholder</span>
                  </div>
                )}
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {options.map((option, index) => (
                <button
                  key={index}
                  className={`
                    h-20 rounded-lg transition-all transform hover:scale-105 
                    flex items-center justify-center text-3xl font-baloo
                    ${selectedOption === option ?
                      (isCorrect ? 'bg-green-100 border-2 border-green-500' : 'bg-red-100 border-2 border-red-500') :
                      'bg-white border-2 border-gray-200 hover:border-blue-300'}
                  `}
                  onClick={() => handleOptionSelect(option)}
                  disabled={isCorrect !== null}
                >
                  {option}
                </button>
              ))}
            </div>

            {/* Feedback */}
            {isCorrect !== null && (
              <div className={`mt-4 p-3 rounded-lg ${isCorrect ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {isCorrect ? (
                  <div className="flex items-center gap-2">
                    <div className="bg-green-100 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span>Correct! <span className="font-baloo">"{currentWord.word}"</span> starts with <span className="font-baloo">{currentWord.startingLetter}</span></span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="bg-red-100 rounded-full p-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </div>
                    <span>Oops! <span className="font-baloo">"{currentWord.word}"</span> starts with <span className="font-baloo">{currentWord.startingLetter}</span></span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Game Complete Overlay */}
      {gameComplete && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-pop w-full max-w-md">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="text-yellow-500 h-8 w-8 mr-3" />
            <h3 className="text-2xl font-bold text-green-600">
              Game Complete!
            </h3>
          </div>
          <p className="text-center mb-4">
            Your score: <span className="font-bold text-xl">{score}/{totalQuestions}</span>
            <br />
            Best streak: <span className="font-bold">{streak}</span>
            <br />
            Time remaining: <span className="font-bold">{timeLeft} seconds</span>
          </p>
          <Button onClick={startNewGame} className="w-full">
            Play Again
          </Button>
        </div>
      )}

      {/* Add custom CSS for animations */}
      <style jsx global>{`
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
        
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        .font-baloo {
          font-family: 'Baloo Tamma 2', 'Noto Sans Kannada', sans-serif;
        }
      `}</style>
    </div>
  );
};

export default PictureWordAssociation;