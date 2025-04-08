import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { ArrowLeft, ArrowRight, Check, Volume2, Play, Square, Trophy, HelpCircle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { kannadaAlphabet } from "../../lib/alphabetData";
import confetti from 'canvas-confetti';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../../components/ui/tooltip';

interface QuizStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audio?: string;
  };
  currentMastery : any
  setCurrentStep: (step: number) => void;
  updateProgress: (mastery: number, completed: boolean) => Promise<void>;
  updateAttempts: any
  completed: boolean;
  totalAttempts : any
  correctAttempts : any
  wrongAttempts : any
  loading : any
}

export default function QuizStep({ 
  letter, 
  setCurrentStep, 
  updateProgress, 
  updateAttempts,
  currentMastery, 
  loading, 
  completed,
  totalAttempts,
  correctAttempts,
  wrongAttempts
}: QuizStepProps) {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<{ name: string; audio: string }[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    const generateOptions = () => {
      const distractors = kannadaAlphabet
        .filter(item => item.name !== letter.name)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(item => ({
          name: item.name,
          audio: item.audio || ''
        }));

      const correctOption = {
        name: letter.name,
        audio: letter.audio || ''
      };

      const newOptions = [...distractors, correctOption].sort(() => Math.random() - 0.5);
      setOptions(newOptions);

      // Find the correct answer index
      const index = newOptions.findIndex(option => option.name === letter.name);
      setCorrectAnswerIndex(index);
    };

    generateOptions();
    
    // Auto-play the letter's audio when component loads
    const autoPlayAudio = setTimeout(() => {
      if (letter.audio) {
        const audio = new Audio(letter.audio);
        audio.play().catch(error => console.error("Error auto-playing audio:", error));
      }
    }, 500);
    
    return () => clearTimeout(autoPlayAudio);
  }, [letter]);

  // Function to play the corresponding audio file
  const playAudio = (option: { name: string; audio: string }): void => {
    if (playingAudio === option.name) {
      // If already playing this audio, stop it
      setPlayingAudio(null);
      // Find and stop the audio element if it exists
      const audioElements = document.getElementsByTagName('audio');
      for (let i = 0; i < audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].currentTime = 0;
      }
    } else {
      // Stop any currently playing audio
      const audioElements = document.getElementsByTagName('audio');
      for (let i = 0; i < audioElements.length; i++) {
        audioElements[i].pause();
        audioElements[i].currentTime = 0;
      }

      // Play the new audio
      setPlayingAudio(option.name);
      const audio = new Audio(`${option.audio}`);
      audio.play().catch(error => console.error("Error playing audio:", error));

      // When audio ends, reset the playing state
      audio.onended = () => {
        setPlayingAudio(null);
      };
    }
  };

  const handleAnswerSelect = async (answer: { name: string; audio: string }) => {
    setSelectedAnswer(answer.name);
    const isAnswerCorrect = answer.name === letter.name;
    setIsCorrect(isAnswerCorrect);
    setAttemptCount(prev => prev + 1);
    
    // Update attempt counts in state and database
    const newTotalAttempts = totalAttempts + 1;
    const newCorrectAttempts = isAnswerCorrect ? correctAttempts + 1 : correctAttempts;
    const newWrongAttempts = isAnswerCorrect ? wrongAttempts : wrongAttempts + 1;
    
    // Call updateAttempts to update the database
    await updateAttempts(newTotalAttempts, newCorrectAttempts, newWrongAttempts);
    
    if (isAnswerCorrect) {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#8A4FFF', '#FF4F8A', '#4F8AFF', '#4FFF8A']
      });
  
      const successSound = new Audio('/audio/success.mp3');
      successSound.play().catch(error => {
        console.error("Success sound playback failed:", error);
      });
    } else {
      const failureSound = new Audio('/audio/error.mp3');
      failureSound.play().catch(error => {
        console.error("Failure sound playback failed:", error);
      });
      
      // Show hint after 2 incorrect attempts
      if (attemptCount >= 1) {
        setShowHint(true);
      }
    }
  };

  const handleComplete = async () => {
    if (isCorrect && !completed) {
      await updateProgress(currentMastery+1, false);
      setQuizCompleted(true);
    } else {
      setQuizCompleted(true);
    }
  };

  // Play the letter's audio again
  const playLetterAudio = () => {
    if (letter.audio) {
      const audio = new Audio(letter.audio);
      audio.play().catch(error => console.error("Error playing letter audio:", error));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold flex items-center text-gray-800">
          <span>Pronunciation Quiz</span>
          {quizCompleted && isCorrect && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="ml-3 bg-green-100 p-1.5 rounded-full"
            >
              <Check className="h-5 w-5 text-green-600" />
            </motion.div>
          )}
        </h2>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-1 text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                <Trophy size={16} className="text-kid-purple" />
                <span>+1 Mastery</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Complete this quiz to increase your mastery</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="py-2">
        <Progress 
          value={selectedAnswer ? (isCorrect ? 100 : 50) : 25} 
          className="h-2 bg-gray-200" 
          style={{ backgroundColor: isCorrect === null ? "purple" : isCorrect ? "green" : "amber" }} 
        />
      </div>

      <Card className="overflow-hidden shadow-lg border-transparent">
        <div className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="mb-6">
            <h3 className="text-xl font-medium text-gray-800 mb-2">
              Listen carefully and select the correct pronunciation
            </h3>
            <p className="text-gray-600">
              Click the play buttons to hear each option, then select the one that correctly pronounces the letter below.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Left side - large letter display */}
            <div className="md:w-1/3 flex flex-col items-center justify-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="w-48 h-48 rounded-2xl bg-white flex items-center justify-center text-8xl font-bold text-kid-purple shadow-md mb-4"
                style={{ boxShadow: '0 4px 20px rgba(138, 79, 255, 0.15)' }}
              >
                {letter.character}
              </motion.div>
            </div>

            {/* Right side - 2x2 grid of options */}
            <div className="md:w-2/3">
              <AnimatePresence>
                {showHint && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-md mb-6"
                  >
                    <div className="flex">
                      <Info size={18} className="text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-blue-700 font-medium">Hint:</p>
                        <p className="text-blue-600">
                          The correct pronunciation sounds similar to "{letter.pronunciation}". 
                          Listen carefully to each option again.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {options.map((option, index) => {
                  const isSelected = selectedAnswer === option.name;
                  const isCorrectOption = option.name === letter.name;
                  const showCorrectHighlight = quizCompleted && isCorrectOption;
                  const showIncorrectHighlight = isSelected && !isCorrectOption && selectedAnswer !== null;
                  
                  return (
                    <motion.div 
                      key={index}
                      whileHover={!quizCompleted ? { scale: 1.02 } : {}}
                      whileTap={!quizCompleted ? { scale: 0.98 } : {}}
                      className="relative"
                    >
                      <div 
                        className={`
                          flex items-center p-3 rounded-lg border-2 transition-all duration-200 h-full
                          ${showCorrectHighlight ? 'bg-green-50 border-green-500 shadow-md' : ''}
                          ${showIncorrectHighlight ? 'bg-red-50 border-red-500' : ''}
                          ${!isSelected && !showCorrectHighlight ? 'border-gray-200 hover:border-kid-purple/50 bg-white' : ''}
                          ${isSelected && isCorrectOption ? 'bg-green-50 border-green-500' : ''}
                        `}
                      >
                        {/* Audio Button */}
                        <Button
                          variant="outline"
                          size="icon"
                          className={`
                            rounded-full h-12 w-12 flex items-center justify-center mr-3
                            ${playingAudio === option.name ? 'bg-kid-purple text-white' : 'bg-kid-purple/10 text-kid-purple'}
                            hover:bg-kid-purple hover:text-white
                          `}
                          onClick={() => playAudio(option)}
                        >
                          {playingAudio === option.name ? (
                            <Square className="h-5 w-5" />
                          ) : (
                            <Play className="h-5 w-5 ml-0.5" />
                          )}
                        </Button>

                        {/* Selection Button */}
                        <Button
                          variant="ghost"
                          className={`
                            flex-1 py-4 text-lg justify-start font-medium rounded-md h-full
                            ${isSelected ? (isCorrectOption ? "text-green-700" : "text-red-700") : "text-gray-700"}
                          `}
                          onClick={() => !quizCompleted && handleAnswerSelect(option)}
                          disabled={quizCompleted}
                        >
                          Option {index + 1}
                        </Button>
                        
                        {/* Status indicator */}
                        {showCorrectHighlight && (
                          <div className="absolute -right-2 -top-2 bg-green-500 text-white rounded-full p-1">
                            <Check size={16} />
                          </div>
                        )}
                        {showIncorrectHighlight && (
                          <div className="absolute -right-2 -top-2 bg-red-500 text-white rounded-full p-1">
                            <X size={16} />
                          </div>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {selectedAnswer && !quizCompleted && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mt-6 p-4 rounded-lg ${
                  isCorrect 
                    ? "bg-green-100 text-green-800 border border-green-200" 
                    : "bg-amber-100 text-amber-800 border border-amber-200"
                }`}
              >
                <div className="flex items-start">
                  {isCorrect ? (
                    <Check className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  ) : (
                    <HelpCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  )}
                  <div>
                    <p className="font-medium">
                      {isCorrect
                        ? "Correct! Excellent job!"
                        : correctAnswerIndex !== null
                          ? `Not quite right. Try listening to Option ${correctAnswerIndex + 1} again.`
                          : "Incorrect. The correct answer is loading..."}
                    </p>
                    {isCorrect && (
                      <p className="text-sm mt-1">
                        The correct pronunciation of {letter.character} is "{letter.pronunciation}".
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {quizCompleted && (
          <div className="p-4 bg-gradient-to-r from-purple-100 to-indigo-100 border-t border-purple-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="bg-white p-2 rounded-full mr-3 shadow-sm">
                  <Trophy className="h-6 w-6 text-yellow-500" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">
                    {isCorrect ? "Quiz Completed!" : "Try Again Next Time"}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {isCorrect 
                      ? "You've earned +1 mastery points" 
                      : "Keep practicing to improve"}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => setCurrentStep(2)}
                className="bg-gradient-to-r from-kid-purple to-purple-600 hover:opacity-90 text-white shadow-md"
              >
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(0)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practice
        </Button>

        {!quizCompleted && selectedAnswer ? (
          <Button
            onClick={handleComplete}
            disabled={loading}
            className="bg-gradient-to-r from-kid-blue to-blue-500 hover:opacity-90 text-white shadow-md transition-all duration-200"
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              <>
                Submit Answer
                <Check className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        ) : !quizCompleted ? (
          <Button disabled className="bg-gray-300 text-gray-600 cursor-not-allowed">
            Select an answer
          </Button>
        ) : null}
      </div>
    </div>
  );
}