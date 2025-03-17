import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/button';
import { Check, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

interface CompleteStepProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audio?: string;
  };
  updateProgress: (mastery: number, completed: boolean) => Promise<void>;
  currentMastery: number;
  loading: boolean;
}

export default function CompleteStep({ letter, updateProgress, currentMastery, loading }: CompleteStepProps) {
  const [confetti, setConfetti] = useState(false);
  
  useEffect(() => {
    setConfetti(true);
    const timer = setTimeout(() => setConfetti(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const handleComplete = async () => {
    const newMastery = Math.min(currentMastery + 2, 5);
    await updateProgress(newMastery, true);
  };

  return (
    <div className="text-center py-8 space-y-6">
      {confetti && (
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ 
                y: -20, 
                x: Math.random() * window.innerWidth,
                opacity: 1,
                scale: Math.random() * 0.5 + 0.5
              }}
              animate={{ 
                y: window.innerHeight + 50, 
                x: Math.random() * window.innerWidth,
                opacity: 0
              }}
              transition={{ 
                duration: Math.random() * 3 + 2,
                ease: "linear" 
              }}
              className="absolute w-3 h-3 rounded-full"
              style={{ 
                backgroundColor: [
                  '#FF6B6B', '#FFD93D', '#6BCB77', '#4D96FF', '#9B5DE5'
                ][Math.floor(Math.random() * 5)] 
              }}
            />
          ))}
        </div>
      )}
      
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ 
          type: "spring", 
          stiffness: 260, 
          damping: 20 
        }}
        className="w-28 h-28 mx-auto bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mb-6 shadow-lg"
      >
        <Check className="h-14 w-14 text-white" />
      </motion.div>

      <motion.h2 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-3xl font-bold text-kid-purple"
      >
        Great Job!
      </motion.h2>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-gray-600 max-w-md mx-auto mb-4">
          You've completed the lesson for the letter "{letter.name}" ({letter.character}).
          Your progress has been saved.
        </p>
        
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6 mb-6 bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-lg max-w-md mx-auto"
        >
          <div className="font-medium text-lg text-gray-700 mb-3">You earned:</div>
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.div
                key={level}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: level <= (currentMastery + 2) ? 1.1 : 1, 
                  opacity: 1 
                }}
                transition={{ delay: 0.7 + level * 0.1 }}
              >
                <Star
                  className={`h-8 w-8 ${
                    level <= (currentMastery + 2) 
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-md' 
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="flex justify-center gap-4 mt-8"
      >
        <Link href="/learn">
          <Button 
            variant="outline"
            className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10 px-5 py-6 text-base"
          >
            Back to All Letters
          </Button>
        </Link>

        <Button 
          onClick={handleComplete} 
          disabled={loading} 
          className="bg-gradient-to-r from-kid-purple to-kid-blue hover:opacity-90 px-5 py-6 text-base shadow-md"
        >
          {loading ? "Saving..." : "Complete & Continue"}
        </Button>
      </motion.div>
    </div>
  );
}