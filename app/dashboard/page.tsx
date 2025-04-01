
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Progress } from '@/components/ui/progress';
import { Loader2 } from 'lucide-react';

// Progress interface
interface LetterProgress {
  letter_id: string;
  completed: boolean;
  mastery_level: number;
  last_practiced: string;
}

export default function Dashboard() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [progress, setProgress] = useState<LetterProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        if (data) {
          setProgress(data);
        }
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProgress();
    }
  }, [user]);

  // Calculate overall progress
  const completedLetters = progress.filter(p => p.completed).length;
  const totalLetters = kannadaAlphabet.length;
  const progressPercentage = totalLetters > 0 ? (completedLetters / totalLetters) * 100 : 0;

  // Get letter details by ID
  const getLetterById = (id: string) => {
    return kannadaAlphabet.find(letter => letter.id === id) || null;
  };

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kid-purple" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Your Learning Dashboard</h1>
          <p className="text-gray-600 mb-8">Track your child's progress in learning Kannada alphabet.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Overall Progress</CardTitle>
                <CardDescription>Your learning journey so far</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">{completedLetters} of {totalLetters} letters completed</span>
                    <span className="text-sm font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your latest learning sessions</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-kid-purple" />
                  </div>
                ) : progress.length > 0 ? (
                  <div className="space-y-4">
                    {progress
                      .sort((a, b) => new Date(b.last_practiced).getTime() - new Date(a.last_practiced).getTime())
                      .slice(0, 3)
                      .map((item) => {
                        const letter = getLetterById(item.letter_id);
                        return letter ? (
                          <div key={item.letter_id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <span className="text-xl font-bold text-kid-purple">{letter.character}</span>
                              </div>
                              <div>
                                <p className="font-medium">{letter.name}</p>
                                <p className="text-sm text-gray-500">
                                  Mastery: {item.mastery_level}/5
                                </p>
                              </div>
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(item.last_practiced).toLocaleDateString()}
                            </div>
                          </div>
                        ) : null;
                      })}
                  </div>
                ) : (
                  <p className="text-center py-4 text-gray-500">
                    No learning activity recorded yet. Start learning to see your progress!
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Letter Mastery</CardTitle>
              <CardDescription>Track your progress with each letter</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-kid-purple" />
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Svaragalu (Vowels) Section - 15 letters */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Svaragalu (Vowels)</h3>
                    <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-5 gap-4">
                      {kannadaAlphabet.slice(0, 15).map((letter) => {
                        const letterProgress = progress.find(p => p.letter_id === letter.id);
                        const mastery = letterProgress ? letterProgress.mastery_level : 0;
                        const isCompleted = letterProgress ? letterProgress.completed : false;

                        return (
                          <div
                            key={letter.id}
                            className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                          >
                            <div className="flex flex-col items-center">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                <span className="text-xl font-bold">{letter.character}</span>
                              </div>
                              <p className="text-sm font-medium text-center">{letter.name}</p>
                              <div className="w-full mt-2">
                                <Progress value={(mastery / 5) * 100} className="h-1" />
                              </div>
                              <p className="text-xs text-gray-500 mt-1">Level {mastery}/5</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Vyanjanagalu (Consonants) Section */}
                  <div>
                    <h3 className="font-medium text-lg mb-3">Vyanjanagalu (Consonants)</h3>
                    
                    {/* First 25 consonants in a 5x5 grid */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Main Consonants</h4>
                      <div className="grid grid-cols-5 gap-4">
                        {kannadaAlphabet.slice(15, 40).map((letter) => {
                          const letterProgress = progress.find(p => p.letter_id === letter.id);
                          const mastery = letterProgress ? letterProgress.mastery_level : 0;
                          const isCompleted = letterProgress ? letterProgress.completed : false;

                          return (
                            <div
                              key={letter.id}
                              className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                  <span className="text-xl font-bold">{letter.character}</span>
                                </div>
                                <p className="text-sm font-medium text-center">{letter.name}</p>
                                <div className="w-full mt-2">
                                  <Progress value={(mastery / 5) * 100} className="h-1" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Level {mastery}/5</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {/* Remaining 9 consonants */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Consonants</h4>
                      <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-3 gap-4">
                        {kannadaAlphabet.slice(40, 49).map((letter) => {
                          const letterProgress = progress.find(p => p.letter_id === letter.id);
                          const mastery = letterProgress ? letterProgress.mastery_level : 0;
                          const isCompleted = letterProgress ? letterProgress.completed : false;

                          return (
                            <div
                              key={letter.id}
                              className={`p-3 rounded-lg border ${isCompleted ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}
                            >
                              <div className="flex flex-col items-center">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isCompleted ? 'bg-green-100' : 'bg-gray-100'}`}>
                                  <span className="text-xl font-bold">{letter.character}</span>
                                </div>
                                <p className="text-sm font-medium text-center">{letter.name}</p>
                                <div className="w-full mt-2">
                                  <Progress value={(mastery / 5) * 100} className="h-1" />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Level {mastery}/5</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
}
