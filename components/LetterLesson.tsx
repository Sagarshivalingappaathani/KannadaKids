'use client';

import { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/AuthContext';
import { useToast } from '../hooks/use-toast';
import { ArrowLeft, ArrowRight, Check, Star, Volume2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Progress } from '../components/ui/progress';
import { motion } from 'framer-motion';
import { Card } from '../components/ui/card';

interface LetterLessonProps {
  letter: {
    id: string;
    character: string;
    name: string;
    pronunciation: string;
    examples: string[];
    audioUrl?: string;
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
    { title: "Practice", component: PracticeStep },
    { title: "Quiz", component: QuizStep },
    { title: "Complete", component: CompleteStep },
  ];

  useEffect(() => {
    // Fetch existing progress if user is logged in
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
            
            // If user has previously completed this letter, start at quiz step
            if (data.completed) {
              setCurrentStep(0); // start from first
            } else if (data.mastery_level > 0) {
              setCurrentStep(data.mastery_level); // start from where u left
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

    try {
      const now = new Date().toISOString();

      // Check if progress record exists
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
        // Update existing record
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
        // Insert new record
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
              className={`h-2 flex-1 rounded-full ${index === currentStep
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
          loading={loading}
        />
      </motion.div>
    </div>
  );
}

function LearnStep({ letter, setCurrentStep }: any) {

  const playAudio = () => {
    console.log(letter.character)
    const audio = new Audio(`/Audios/Kannada-audio-clips/${letter.name}.mp3`);
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

function PracticeStep({ letter, setCurrentStep, updateProgress, currentMastery, loading }: any) {
  const [practiced, setPracticed] = useState(false);
  const [canvasKey, setCanvasKey] = useState(0);
  const [drawingData, setDrawingData] = useState<any>(null);
  const [penSize, setPenSize] = useState(6);
  const [penColor, setPenColor] = useState('#7c3aed'); // kid-purple color
  const [guideOpacity, setGuideOpacity] = useState(0.1);
  
  useEffect(() => {
    const canvas = document.getElementById('practiceCanvas') as HTMLCanvasElement;
    if (!canvas) return;

    // Make canvas responsive
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;

    // Set canvas to white background
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw letter as guide (faded)
    const fontSize = Math.min(canvas.width, canvas.height) * 0.8;
    ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
    ctx.fillStyle = `rgba(0, 0, 0, ${guideOpacity})`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);

    // Drawing functions
    function startDrawing(e: MouseEvent | TouchEvent) {
      isDrawing = true;
      const coords = getCoordinates(e);
      lastX = coords.x;
      lastY = coords.y;
      
      // Start a new point (for better dot drawing)
      if (ctx) {
        ctx.beginPath();
        ctx.arc(lastX, lastY, penSize / 2, 0, Math.PI * 2);
        ctx.fillStyle = penColor;
        ctx.fill();
      }
    }

    function draw(e: MouseEvent | TouchEvent) {
      if (!isDrawing) return;
      e.preventDefault();
      
      const coords = getCoordinates(e);
      const x = coords.x;
      const y = coords.y;
      
      // Draw line
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = penColor;
        ctx.lineWidth = penSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
      }
      
      lastX = x;
      lastY = y;
    }

    function getCoordinates(e: MouseEvent | TouchEvent) {
      let clientX, clientY;
      if ('touches' in e) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      }
      
      const rect = canvas.getBoundingClientRect();
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
      };
    }

    function stopDrawing() {
      if (isDrawing) {
        isDrawing = false;
        setDrawingData(canvas.toDataURL());
      }
    }

    // Event listeners with passive: false for touch events
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);

    // Touch events
    canvas.addEventListener('touchstart', startDrawing, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stopDrawing);

    // Handle window resize
    const handleResize = () => {
      // Save current drawing
      const imageData = canvas.toDataURL();
      
      // Resize canvas
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      
      // Restore white background
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Reload guide letter
      const fontSize = Math.min(canvas.width, canvas.height) * 0.4;
      ctx.font = `bold ${fontSize}px 'Noto Sans Kannada', sans-serif`;
      ctx.fillStyle = `rgba(0, 0, 0, ${guideOpacity})`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(letter.character, canvas.width / 2, canvas.height / 2);
      
      // Restore drawing
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = imageData;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      canvas.removeEventListener('mousedown', startDrawing);
      canvas.removeEventListener('mousemove', draw);
      canvas.removeEventListener('mouseup', stopDrawing);
      canvas.removeEventListener('mouseout', stopDrawing);
      canvas.removeEventListener('touchstart', startDrawing);
      canvas.removeEventListener('touchmove', draw);
      canvas.removeEventListener('touchend', stopDrawing);
      window.removeEventListener('resize', handleResize);
    };
  }, [letter.character, canvasKey, penSize, penColor, guideOpacity]);

  const handleComplete = async () => {
    const newMastery = Math.min(currentMastery + 1, 2);
    await updateProgress(newMastery, false);
    setPracticed(true);
  };

  const resetCanvas = () => {
    setCanvasKey(prev => prev + 1);
  };

  const handleGuideToggle = () => {
    setGuideOpacity(prev => prev > 0 ? 0 : 0.1);
    setCanvasKey(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Practice Writing <span className="text-kid-purple">"{letter.name}"</span></h2>

      <div className="flex flex-col items-center py-4">
        <div className="w-full max-w-md mx-auto bg-gradient-to-r from-gray-50 to-indigo-50 rounded-lg p-6 mb-6 shadow-md">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <p className="text-gray-700 font-medium">
                Draw the letter:
              </p>
              <div className="flex items-center space-x-1">
                <button 
                  onClick={() => setPenSize(4)} 
                  className={`w-4 h-4 rounded-full ${penSize === 4 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-300'}`}
                />
                <button 
                  onClick={() => setPenSize(6)} 
                  className={`w-5 h-5 rounded-full ${penSize === 6 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-400'}`}
                />
                <button 
                  onClick={() => setPenSize(8)} 
                  className={`w-6 h-6 rounded-full ${penSize === 8 ? 'ring-2 ring-kid-purple ring-offset-1' : 'bg-gray-500'}`}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleGuideToggle}
                className="text-kid-blue hover:bg-kid-blue/10 h-8"
              >
                {guideOpacity > 0 ? "Hide" : "Show"} Guide
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={resetCanvas}
                className="text-kid-purple hover:bg-kid-purple/10 h-8"
              >
                <RefreshCw className="h-4 w-4 mr-1" /> Reset
              </Button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden transition-all hover:shadow-xl">
            <canvas 
              id="practiceCanvas" 
              width="400" 
              height="320" 
              key={canvasKey}
              className="touch-none w-full h-72 cursor-crosshair"
            ></canvas>
          </div>
          
          <div className="mt-3 flex justify-between items-center">
            <p className="text-xs text-gray-500">Use your mouse or finger to practice writing</p>
            <div className="flex items-center gap-2">
              <div 
                onClick={() => setPenColor('#7c3aed')}
                className={`w-6 h-6 rounded-full bg-kid-purple cursor-pointer ${penColor === '#7c3aed' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
              <div 
                onClick={() => setPenColor('#0284c7')}
                className={`w-6 h-6 rounded-full bg-sky-600 cursor-pointer ${penColor === '#0284c7' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
              <div 
                onClick={() => setPenColor('#000000')}
                className={`w-6 h-6 rounded-full bg-black cursor-pointer ${penColor === '#000000' ? 'ring-2 ring-offset-1 ring-gray-400' : ''}`}
              />
            </div>
          </div>
        </div>
        
        {/* Animation tips */}
        <div className="bg-kid-purple/5 border border-kid-purple/20 p-4 rounded-lg w-full max-w-md">
          <h3 className="text-kid-purple font-medium mb-2">Tips for Writing Kannada:</h3>
          <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
            <li>Start from the top and work your way down</li>
            <li>Practice the curves and loops carefully</li>
            <li>Try to maintain consistent proportions</li>
          </ul>
        </div>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(0)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Learn
        </Button>

        {practiced ? (
          <Button 
            onClick={() => setCurrentStep(2)} 
            className="bg-gradient-to-r from-kid-purple to-kid-purple/90 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
          >
            Continue to Quiz
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button 
            onClick={handleComplete} 
            disabled={loading} 
            className="bg-gradient-to-r from-kid-blue to-kid-blue/90 hover:opacity-90 text-white shadow-md flex items-center gap-2 px-6"
          >
            {loading ? "Saving..." : "Complete Practice"}
            <Check className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

function QuizStep({ letter, setCurrentStep, updateProgress, currentMastery, loading }: any) {
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  
  // Generate quiz options with the correct answer and 3 distractors
  const generateOptions = () => {
    // This would normally come from your database with real Kannada letters
    const distractors = ["ಅ", "ಆ", "ಇ", "ಈ", "ಉ", "ಊ", "ಋ", "ೠ", "ಎ", "ಏ"]
      .filter(char => char !== letter.character)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3);
    
    // Include the correct answer and shuffle
    return [letter.name, ...distractors].sort(() => Math.random() - 0.5);
  };
  
  const options = generateOptions();

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setIsCorrect(answer === letter.name);
  };

  const handleComplete = async () => {
    if (isCorrect) {
      const newMastery = Math.min(currentMastery + 1, 3);
      await updateProgress(newMastery, false);
      setQuizCompleted(true);
    } else {
      // If wrong answer, don't increase mastery but allow to continue
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
          <p className="font-medium mb-4 text-gray-700">Which letter is this?</p>
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-32 h-32 mx-auto rounded-xl bg-white flex items-center justify-center text-5xl font-bold text-kid-purple mb-6 shadow-sm border border-gray-100"
          >
            {letter.character}
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option, index) => (
              <Button 
                key={index}
                variant={selectedAnswer === option ? 
                  (option === letter.name ? "default" : "destructive") : 
                  "outline"
                }
                className={`h-auto py-3 text-lg ${
                  selectedAnswer === option && option === letter.name ? 
                    "bg-green-600 hover:bg-green-700" : 
                    selectedAnswer === option ? 
                      "bg-red-600 hover:bg-red-700" : 
                      "hover:bg-kid-purple/10 hover:text-kid-purple"
                }`}
                onClick={() => !quizCompleted && handleAnswerSelect(option)}
                disabled={quizCompleted}
              >
                {option}
                {selectedAnswer === option && option === letter.name && (
                  <Check className="ml-2 h-4 w-4" />
                )}
              </Button>
            ))}
          </div>
          
          {selectedAnswer && !quizCompleted && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`mt-4 p-3 rounded-md ${
                isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {isCorrect ? 
                "Correct! Well done!" : 
                `Incorrect. The correct answer is "${letter.name}".`
              }
            </motion.div>
          )}
        </Card>
      </div>

      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setCurrentStep(1)}
          className="border-kid-purple/30 text-kid-purple hover:bg-kid-purple/10"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Practice
        </Button>

        {selectedAnswer ? (
          quizCompleted ? (
            <Button 
              onClick={() => setCurrentStep(3)} 
              className="bg-kid-purple hover:bg-kid-purple/90 flex items-center gap-2"
            >
              Complete Lesson
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

function CompleteStep({ letter, updateProgress, currentMastery, loading }: any) {
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