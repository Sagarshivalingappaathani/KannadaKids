
'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/AuthContext';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { kannadaAlphabet } from '@/lib/alphabetData';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Progress } from '@/components/ui/progress';
import { Loader2, Star } from 'lucide-react';

export default function LearnPage() {
  const { user } = useAuth();
  const [progressData, setProgressData] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching progress:', error);
          return;
        }

        const progressByLetterId = data.reduce((acc: Record<string, any>, item: any) => {
          acc[item.letter_id] = item;
          return acc;
        }, {});

        setProgressData(progressByLetterId);
      } catch (error) {
        console.error('Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-2">Learn Kannada Alphabet</h1>
          <p className="text-gray-600 mb-8">Explore all the letters and start learning at your own pace.</p>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-kid-purple" />
            </div>
          ) : (
            <div className="space-y-10">
              {/* Svaragalu (Vowels) Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-purple-100 text-kid-purple rounded-lg px-3 py-1 mr-2">ಸ್ವರಗಳು</span>
                  <span>Svaragalu (Vowels)</span>
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                  {kannadaAlphabet.slice(0, 15).map((letter) => {
                    const progress = progressData[letter.id];
                    const mastery = progress ? progress.mastery_level : 0;
                    const isCompleted = progress ? progress.completed : false;

                    return (
                      <Link href={`/learn/${letter.id}`} key={letter.id}>
                        <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 h-full flex flex-col">
                          <div className="flex justify-between items-start mb-3">
                            <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center">
                              <span className="text-3xl font-bold text-kid-purple">{letter.character}</span>
                            </div>

                            {isCompleted && (
                              <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                Completed
                              </div>
                            )}
                          </div>

                          <h2 className="text-lg font-bold mb-1">{letter.name}</h2>
                          <p className="text-sm text-gray-500 mb-3">{letter.pronunciation}</p>

                          <div className="mt-auto">
                            <div className="flex space-x-1 mb-2">
                              {[1, 2, 3, 4, 5].map((level) => (
                                <Star
                                  key={level}
                                  className={`h-4 w-4 ${level <= mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                />
                              ))}
                            </div>

                            <Progress
                              value={mastery * 20}
                              className="h-1"
                            />
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Vyanjanagalu (Consonants) Section */}
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center">
                  <span className="bg-purple-100 text-kid-purple rounded-lg px-3 py-1 mr-2">ವ್ಯಂಜನಗಳು</span>
                  <span>Vyanjanagalu (Consonants)</span>
                </h2>

                {/* First 25 consonants in a 5x5 grid */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Main Consonants</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {kannadaAlphabet.slice(15, 40).map((letter) => {
                      const progress = progressData[letter.id];
                      const mastery = progress ? progress.mastery_level : 0;
                      const isCompleted = progress ? progress.completed : false;

                      return (
                        <Link href={`/learn/${letter.id}`} key={letter.id}>
                          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-kid-purple">{letter.character}</span>
                              </div>

                              {isCompleted && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                  Completed
                                </div>
                              )}
                            </div>

                            <h2 className="text-lg font-bold mb-1">{letter.name}</h2>
                            <p className="text-sm text-gray-500 mb-3">{letter.pronunciation}</p>

                            <div className="mt-auto">
                              <div className="flex space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <Star
                                    key={level}
                                    className={`h-4 w-4 ${level <= mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>

                              <Progress
                                value={mastery * 20}
                                className="h-1"
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>

                {/* Remaining 9 consonants */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-3">Additional Consonants</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
                    {kannadaAlphabet.slice(40, 49).map((letter) => {
                      const progress = progressData[letter.id];
                      const mastery = progress ? progress.mastery_level : 0;
                      const isCompleted = progress ? progress.completed : false;

                      return (
                        <Link href={`/learn/${letter.id}`} key={letter.id}>
                          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100 h-full flex flex-col">
                            <div className="flex justify-between items-start mb-3">
                              <div className="w-16 h-16 rounded-xl bg-purple-100 flex items-center justify-center">
                                <span className="text-3xl font-bold text-kid-purple">{letter.character}</span>
                              </div>

                              {isCompleted && (
                                <div className="bg-green-100 text-green-700 text-xs font-medium px-2 py-1 rounded-full">
                                  Completed
                                </div>
                              )}
                            </div>

                            <h2 className="text-lg font-bold mb-1">{letter.name}</h2>
                            <p className="text-sm text-gray-500 mb-3">{letter.pronunciation}</p>

                            <div className="mt-auto">
                              <div className="flex space-x-1 mb-2">
                                {[1, 2, 3, 4, 5].map((level) => (
                                  <Star
                                    key={level}
                                    className={`h-4 w-4 ${level <= mastery ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`}
                                  />
                                ))}
                              </div>

                              <Progress
                                value={mastery * 20}
                                className="h-1"
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
