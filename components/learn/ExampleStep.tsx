import React from 'react';
import { Button } from '../../components/ui/button';
import { Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface ExampleStepProps {
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
  completed: boolean;
}

export default function ExampleStep({ letter, setCurrentStep, updateProgress, currentMastery, completed }: ExampleStepProps) {

  const handleContinue = async () => {
    if (!completed) {
      await updateProgress(currentMastery+1, true);
    }
    setCurrentStep(5);
  };  

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Let's Learn <span className="text-kid-purple">"{letter.name}"</span></h2>

      <div className="flex flex-col items-center py-8">
        
        <div className="text-center max-w-lg mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-lg mb-6 shadow-sm"
          >
            <h3 className="font-bold mb-3 text-gray-700">Example Words:</h3>
            <ul className="space-y-3">
              {letter.examples.map((example: string, index: number) => (
                <motion.li 
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                  className="text-gray-700 bg-white p-3 rounded-md shadow-sm flex items-center"
                >
                  <span className="mr-3 text-kid-purple">•</span>
                  {example}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => handleContinue()} 
          className="bg-kid-purple hover:bg-kid-purple/90 flex items-center gap-2 px-5 py-6 text-base"
        >
          Finish Learning
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}