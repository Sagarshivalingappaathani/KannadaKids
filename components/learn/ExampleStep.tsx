import React from 'react';
import { Button } from '../../components/ui/button';
import { Volume2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '../../components/ui/card';

interface ExampleStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    exampleImages?: string[];
    audio?: string;
  };
  currentMastery: number;
  setCurrentStep: (step: number) => void;
  updateProgress: (mastery: number, completed: boolean) => Promise<void>;
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
      <h2 className="text-2xl font-bold text-gray-800">Few Words Examples for letter <span className="text-kid-purple">"{letter.character}"</span></h2>

      <div className="flex flex-col items-center py-8">
        <div className="max-w-2xl mx-auto w-full">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-r from-gray-50 to-indigo-50 p-6 rounded-lg mb-6 shadow-sm"
          >
            <h3 className="font-bold mb-5 text-gray-700 text-xl text-center">Example Words:</h3>
            <div className="space-y-6">
              {letter.examples.map((example: string, index: number) => (
                <motion.div
                  key={index} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + index * 0.2 }}
                >
                  <Card className="overflow-hidden">
                    <div className="flex flex-col md:flex-row items-center">
                      {letter.exampleImages?.[index] && (
                        <div className="w-full md:w-1/3 h-48 md:h-auto overflow-hidden">
                          <img 
                            src={letter.exampleImages[index]}
                            alt={`Image for ${example}`}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                          />
                        </div>
                      )}
                      <CardContent className="flex-1 p-5">
                        <div className="text-gray-700 flex items-center text-lg">
                          <span className="mr-3 text-kid-purple font-bold text-2xl">•</span>
                          <span className="font-medium">{example}</span>
                        </div>
                        <p className="text-gray-500 mt-2 ml-6 text-sm">
                          {index === 0 ? 
                            "Try pronouncing this word using the letter you just learned!" : 
                            "Practice makes perfect - say it out loud!"}
                        </p>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
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