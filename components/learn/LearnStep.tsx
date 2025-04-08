import React from 'react';
import { Button } from '../../components/ui/button';
import { Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface LearnStepProps {
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
  updateAttempts: any
  completed: boolean;
  totalAttempts : any
  correctAttempts : any
  wrongAttempts : any
}

export default function LearnStep({ letter, setCurrentStep, updateProgress, completed }: LearnStepProps) {
  const playAudio = () => {
    console.log(letter.audio);
    const audio = new Audio(`${letter.audio}`);
    audio.play().catch(error => console.error("Error playing audio:", error));
  };

  const handleContinue = async () => {
    if (!completed) {
      await updateProgress(1, false);
    }
    setCurrentStep(1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Let's Learn <span className="text-kid-purple">"{letter.name}"</span></h2>

      <div className="flex flex-col items-center py-8">
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-40 h-40 rounded-2xl bg-gradient-to-br from-kid-purple/10 to-kid-blue/10 flex items-center justify-center text-7xl font-bold text-kid-purple mb-6 shadow-inner cursor-pointer"
          onClick={playAudio}
        >
          {letter.character}
        </motion.div>

        <div className="text-center max-w-lg mx-auto">
          <div className="flex items-center justify-center gap-3 mb-2">
            <p className="text-xl font-medium">Pronunciation: <span className="text-kid-blue">{letter.pronunciation}</span></p>
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8 hover:bg-kid-purple/10"
              onClick={playAudio}
            >
              <Volume2 className="h-4 w-4 text-kid-purple" />
            </Button>
          </div>
          <p className="text-gray-600 mb-6">Listen and repeat the sound of this letter.</p>

        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleContinue()} 
          className="bg-kid-purple hover:bg-kid-purple/90 flex items-center gap-2 px-5 py-6 text-base"
        >
          Continue to Learn
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}