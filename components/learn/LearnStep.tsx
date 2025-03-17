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
}

export default function LearnStep({ letter, setCurrentStep }: LearnStepProps) {
  const playAudio = () => {
    console.log(letter.audio);
    const audio = new Audio(`${letter.audio}`);
    audio.play().catch(error => console.error("Error playing audio:", error));
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
          onClick={() => setCurrentStep(1)} 
          className="bg-kid-purple hover:bg-kid-purple/90 flex items-center gap-2 px-5 py-6 text-base"
        >
          Continue to Practice
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}