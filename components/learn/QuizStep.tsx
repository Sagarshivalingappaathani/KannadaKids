import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { ArrowLeft, ArrowRight, Check, Volume2, Play, Square } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card } from '../../components/ui/card';
import { kannadaAlphabet } from "../../lib/alphabetData";
import confetti from 'canvas-confetti';

interface QuizStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audio?: string;
  };
  setCurrentStep: (step: number) => void;
  updateProgress: (mastery: number, completed: boolean) => Promise<void>;
  currentMastery: number;
  loading: boolean;
}

export default function QuizStep({ letter, setCurrentStep, updateProgress, currentMastery, loading }: QuizStepProps) {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [correctAnswerIndex, setCorrectAnswerIndex] = useState<number | null>(null);
  const [options, setOptions] = useState<{ name: string; audio: string }[]>([]);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);

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

  const handleAnswerSelect = (answer: { name: string; audio: string }) => {
    setSelectedAnswer(answer.name);
    setIsCorrect(answer.name === letter.name);
    if (answer.name === letter.name) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: {
          y: 0.7
        }
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
    }
  };

  const handleComplete = async () => {
    if (isCorrect) {
      const newMastery = Math.min(currentMastery + 1, 3);
      await updateProgress(newMastery, false);
      setQuizCompleted(true);
    } else {
      setQuizCompleted(true);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center">
        <span>Test Your Knowledge</span>
        {quizCompleted && isCorrect && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="ml-3 bg-green-100 p-1 rounded-full"
          >
            <Check className="h-5 w-5 text-green-600" />
          </motion.div>
        )}
      </h2>

      <div className="py-6 space-y-6">
        <Card className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 border-none shadow-md">
          <p className="font-medium mb-4 text-gray-700">Identify Correct Pronounciation of letter {letter.character}?</p>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 mx-auto rounded-xl bg-white flex items-center justify-center text-5xl font-bold text-kid-purple mb-6 shadow-sm border border-gray-100"
          >
            {letter.character}
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                {/* Audio Button */}
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full h-10 w-10 flex items-center justify-center bg-kid-purple/10 hover:bg-kid-purple/20"
                  onClick={() => playAudio(option)}
                >
                  {playingAudio === option.name ? (
                    <Square className="h-5 w-5 text-kid-purple" />
                  ) : (
                    <Play className="h-5 w-5 text-kid-purple ml-0.5" /> // Added slight margin for visual centering
                  )}
                </Button>

                {/* Selection Button */}
                <Button
                  variant={selectedAnswer === option.name ?
                    (option.name === letter.name ? "default" : "destructive") :
                    "outline"
                  }
                  className={`flex-1 py-3 text-lg ${selectedAnswer === option.name
                      ? (option.name === letter.name
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700")
                      : "hover:bg-kid-purple/10 hover:text-kid-purple"
                    }`}
                  onClick={() => !quizCompleted && handleAnswerSelect(option)}
                  disabled={quizCompleted}
                >
                  Option {index + 1}
                </Button>
              </div>
            ))}
          </div>

          {selectedAnswer && !quizCompleted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-md ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
            >
              {isCorrect
                ? "Correct! Well done!"
                : correctAnswerIndex !== null
                  ? `Incorrect. The correct answer is "Option ${correctAnswerIndex + 1}".`
                  : "Incorrect. The correct answer is loading..."}
            </motion.div>
          )}

        </Card>
      </div>

      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(0)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practice
        </Button>

        {selectedAnswer ? (
          quizCompleted ? (
            <Button
              onClick={() => setCurrentStep(2)}
              className="bg-kid-purple hover:bg-kid-purple/90 flex items-center gap-2"
            >
              Continue to Learn
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={loading}
              className="bg-kid-blue hover:bg-kid-blue/90 flex items-center gap-2"
            >
              {loading ? "Saving..." : "Submit Answer"}
              <Check className="h-4 w-4" />
            </Button>
          )
        ) : (
          <Button disabled className="bg-gray-400">
            Select an answer
          </Button>
        )}
      </div>
    </div>
  );
}