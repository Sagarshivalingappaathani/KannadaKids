import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, Star } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

// Import the separated step components
import LearnStep from './learn/LearnStep';
import PracticeStep from './learn/PracticeStep';
import QuizStep from './learn/QuizStep';
import TestStep from './learn/TestStep';
import ExampleStep from './learn/ExampleStep';
import CompleteStep from './learn/CompleteStep';

interface LetterLessonProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audioUrl?: string;
    rank: number;
  };
}

export default function LetterLesson({ letter }: LetterLessonProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [mastery, setMastery] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const steps = [
    { title: "Learn", component: LearnStep },
    { title: "Quiz", component: QuizStep },
    { title: "Practice", component: PracticeStep },
    { title: "Test", component: TestStep },
    { title: "ExampleStep", component: ExampleStep },
    { title: "Complete", component: CompleteStep },
  ];

  useEffect(() => {
    if (user) {
      const fetchProgress = async () => {
        setLoading(true);
        if (!user) return;

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          console.error("No active session");
          setLoading(false);
          return;
        }

        try {
          const { data, error } = await supabase
            .from('learning_progress')
            .select('*')
            .eq('user_id', user.id)
            .eq('letter_id', letter.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }
          
          if (data) {
            setProgress(data);
            setMastery(data.mastery_level);
            setCompleted(data.completed);
            
            if (data.completed) {
              setCurrentStep(0);
            } else if (data.mastery_level > 0) {
              setCurrentStep(data.mastery_level);
            }
          }
        } catch (error) {
          console.error('Error fetching progress:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchProgress();
    }
  }, [user, letter.id]);

  const updateProgress = async (newMastery: number, isCompleted: boolean) => {
    if (!user) {
      toast({
        title: "Not logged in",
        description: "Create an account to save your progress!",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    console.log("updateProgress",newMastery, isCompleted);
    try {
      const now = new Date().toISOString();

      const { data: existingData, error: fetchError } = await supabase
        .from('learning_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('letter_id', letter.id)
        .maybeSingle();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existingData) {
        const { error } = await supabase
          .from('learning_progress')
          .update({
            mastery_level: newMastery,
            completed: isCompleted,
            last_practiced: now,
          })
          .eq('id', existingData.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('learning_progress')
          .insert([
            {
              user_id: user.id,
              letter_id: letter.id,
              mastery_level: newMastery,
              completed: isCompleted,
              last_practiced: now,
            },
          ]);

        if (error) throw error;
      }

      setMastery(newMastery);
      setCompleted(isCompleted);

      toast({
        title: "Progress saved",
        description: isCompleted ? "Congratulations on completing this letter!" : "Your progress has been updated.",
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error saving progress",
        description: "There was a problem saving your progress. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gradient-to-b from-indigo-50 to-purple-50 min-h-screen">
      <div className="mb-8">
        <Link href="/learn" className="inline-flex items-center text-kid-purple hover:underline mb-4 font-medium transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to all letters
        </Link>

        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }} 
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <motion.span 
              whileHover={{ scale: 1.1 }}
              className="w-16 h-16 rounded-2xl bg-gradient-to-r from-kid-purple/90 to-kid-purple flex items-center justify-center text-4xl font-bold text-white shadow-md"
            >
              {letter.character}
            </motion.span>
            <span>Learning <span className="text-kid-purple">"{letter.name}"</span></span>
          </h1>

          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((level) => (
              <motion.div
                key={level}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: level <= mastery ? 1.1 : 1, 
                  opacity: 1 
                }}
                transition={{ delay: level * 0.1 }}
              >
                <Star
                  className={`h-6 w-6 ${
                    level <= mastery 
                      ? 'text-yellow-400 fill-yellow-400 drop-shadow-sm' 
                      : 'text-gray-300'
                  }`}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>

        <div className="mt-6 flex space-x-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full ${
                index === currentStep
                  ? 'bg-kid-purple'
                  : index < currentStep
                    ? 'bg-kid-purple/40'
                    : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </div>

      <motion.div
        key={currentStep}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg p-6 mb-8"
      >
        <CurrentStepComponent
          letter={letter}
          updateProgress={updateProgress}
          currentMastery={mastery}
          setCurrentStep={setCurrentStep}
          completed={completed}
          loading={loading}
        />
      </motion.div>
    </div>
  );
}