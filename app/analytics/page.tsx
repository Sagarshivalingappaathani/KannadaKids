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
import { Loader2, BarChart3, AlertTriangle, ChevronLeft, Trophy, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader,TableRow } from '@/components/ui/table';

// Analytics interface
interface LetterAnalytics {
  letter_id: string;
  total_attempts: number;
  correct_attempts: number;
  wrong_attempts: number;
  last_practiced: string;
}

interface LetterWithAnalytics {
  id: string;
  character: string;
  name: string;
  pronunciation: string;
  type: 'vowel' | 'consonant';
  total_attempts: number;
  correct_attempts: number;
  wrong_attempts: number;
  accuracy_rate: number;
  last_practiced: string | null;
}

export default function AnalyticsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<LetterAnalytics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentSort, setCurrentSort] = useState<{column: string, direction: 'asc' | 'desc'}>({
    column: 'name',
    direction: 'asc'
  });
  const [filteredLetters, setFilteredLetters] = useState<LetterWithAnalytics[]>([]);
  const [letterType, setLetterType] = useState<'all' | 'vowel' | 'consonant'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user) return;

      try {
        const { data, error } = await supabase
          .from('learning_progress')
          .select('*')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching analytics:', error);
          return;
        }

        if (data) {
          setAnalytics(data);
        }
        console.log("This is the console : ", data);

      } catch (error) {
        console.error('Error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  useEffect(() => {
    // Process and merge alphabet with analytics
    const processedLetters = kannadaAlphabet.map(letter => {
      const letterAnalytics = analytics.find(a => a.letter_id === letter.id) || {
        total_attempts: 0,
        correct_attempts: 0,
        wrong_attempts: 0,
        last_practiced: null
      };
      
      const accuracy = letterAnalytics.total_attempts > 0 
        ? (letterAnalytics.correct_attempts / letterAnalytics.total_attempts) * 100 
        : 0;
      
      // Determine if vowel or consonant based on position in array
      const type = letter.id.startsWith('vowel') ? 'vowel' : 'consonant';
      
      return {
        ...letter,
        type,
        total_attempts: letterAnalytics.total_attempts,
        correct_attempts: letterAnalytics.correct_attempts,
        wrong_attempts: letterAnalytics.wrong_attempts,
        accuracy_rate: accuracy,
        last_practiced: letterAnalytics.last_practiced
      };
    });

    // Filter by search term
    let filtered = processedLetters.filter(letter => 
      letter.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      letter.character.includes(searchTerm)
    );

    // Filter by letter type
    if (letterType !== 'all') {
      filtered = filtered.filter(letter => letter.type === letterType);
    }

    // Sort
    filtered.sort((a, b) => {
      const aValue = a[currentSort.column as keyof LetterWithAnalytics];
      const bValue = b[currentSort.column as keyof LetterWithAnalytics];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return currentSort.direction === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return currentSort.direction === 'asc' 
          ? aValue.localeCompare(bValue) 
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    setFilteredLetters(filtered as LetterWithAnalytics[]);
  }, [analytics, searchTerm, currentSort, letterType]);

  const handleSort = (column: keyof LetterWithAnalytics) => {
    setCurrentSort(prevSort => ({
      column,
      direction: prevSort.column === column && prevSort.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Calculate overview metrics
  const totalAttempts = filteredLetters.reduce((sum, letter) => sum + letter.total_attempts, 0);
  const correctAttempts = filteredLetters.reduce((sum, letter) => sum + letter.correct_attempts, 0);
  const overallAccuracy = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;
  
  // Find difficult letters (low accuracy rate with at least 5 attempts)
  const difficultLetters = filteredLetters
    .filter(letter => letter.total_attempts >= 5 && letter.accuracy_rate < 60)
    .sort((a, b) => a.accuracy_rate - b.accuracy_rate)
    .slice(0, 5);

  // Find most practiced letters
  const mostPracticedLetters = [...filteredLetters]
    .sort((a, b) => b.total_attempts - a.total_attempts)
    .slice(0, 5);

  if (authLoading) {
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
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
            <div>
              <Button 
                variant="ghost" 
                onClick={() => router.push('/dashboard')}
                className="mb-2 pl-0 text-kid-purple hover:text-kid-purple/80 hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Back to Dashboard
              </Button>
              <h1 className="text-3xl font-bold text-gray-800">Detailed Learning Analytics</h1>
              <p className="text-gray-600 mt-1">Track your child's progress with each Kannada letter</p>
            </div>
          </div>

          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Total Practice Attempts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <BarChart3 className="h-8 w-8 text-blue-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{totalAttempts}</p>
                    <p className="text-sm text-gray-500">Across all letters</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Overall Accuracy</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Trophy className="h-8 w-8 text-amber-500 mr-3" />
                  <div>
                    <p className="text-3xl font-bold">{Math.round(overallAccuracy)}%</p>
                    <p className="text-sm text-gray-500">Correct attempts ratio</p>
                  </div>
                </div>
                <Progress value={overallAccuracy} className="h-2 mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium text-gray-700">Needs Improvement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center mb-2">
                  <AlertTriangle className="h-7 w-7 text-orange-500 mr-3" />
                  <p className="text-sm text-gray-600">Letters with low accuracy</p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {difficultLetters.length > 0 ? (
                    difficultLetters.map(letter => (
                      <div key={letter.id} className="flex flex-col items-center">
                        <div className="w-10 h-10 rounded-lg bg-orange-100 flex items-center justify-center">
                          <span className="text-lg font-bold text-orange-700">{letter.character}</span>
                        </div>
                        <span className="text-xs mt-1 text-gray-500">{Math.round(letter.accuracy_rate)}%</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 italic">No difficult letters identified yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs for different views */}
          <Tabs defaultValue="all-letters" className="mb-6">
            <TabsList>
              <TabsTrigger value="all-letters">All Letters</TabsTrigger>
              <TabsTrigger value="difficult-letters">Difficult Letters</TabsTrigger>
              <TabsTrigger value="most-practiced">Most Practiced</TabsTrigger>
            </TabsList>
            
            <div className="mt-6 mb-4 flex flex-col sm:flex-row gap-4 justify-between">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  placeholder="Search letters..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  variant={letterType === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLetterType('all')}
                  className={letterType === 'all' ? 'bg-kid-purple hover:bg-kid-purple/90' : ''}
                >
                  All
                </Button>
                <Button
                  variant={letterType === 'vowel' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLetterType('vowel')}
                  className={letterType === 'vowel' ? 'bg-kid-purple hover:bg-kid-purple/90' : ''}
                >
                  Vowels
                </Button>
                <Button
                  variant={letterType === 'consonant' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setLetterType('consonant')}
                  className={letterType === 'consonant' ? 'bg-kid-purple hover:bg-kid-purple/90' : ''}
                >
                  Consonants
                </Button>
              </div>
            </div>

            <TabsContent value="all-letters">
              <Card>
                <CardContent className="pt-6">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[100px]" onClick={() => handleSort('character')}>
                          Letter
                          {currentSort.column === 'character' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead onClick={() => handleSort('name')}>
                          Name
                          {currentSort.column === 'name' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleSort('total_attempts')}>
                          Total Attempts
                          {currentSort.column === 'total_attempts' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleSort('correct_attempts')}>
                          Correct
                          {currentSort.column === 'correct_attempts' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleSort('wrong_attempts')}>
                          Wrong
                          {currentSort.column === 'wrong_attempts' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead className="text-right" onClick={() => handleSort('accuracy_rate')}>
                          Accuracy
                          {currentSort.column === 'accuracy_rate' && (currentSort.direction === 'asc' ? ' ↑' : ' ↓')}
                        </TableHead>
                        <TableHead className="text-right">Last Practice</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto text-kid-purple" />
                          </TableCell>
                        </TableRow>
                      ) : filteredLetters.length > 0 ? (
                        filteredLetters.map((letter) => (
                          <TableRow key={letter.id}>
                            <TableCell className="font-medium">
                              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                                <span className="text-lg font-bold text-kid-purple">{letter.character}</span>
                              </div>
                            </TableCell>
                            <TableCell>{letter.name}</TableCell>
                            <TableCell className="text-right">{letter.total_attempts}</TableCell>
                            <TableCell className="text-right text-green-600">{letter.correct_attempts}</TableCell>
                            <TableCell className="text-right text-red-600">{letter.wrong_attempts}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <span
                                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                                    letter.accuracy_rate >= 80
                                      ? 'bg-green-100 text-green-800'
                                      : letter.accuracy_rate >= 50
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {letter.total_attempts > 0 ? Math.round(letter.accuracy_rate) : 0}%
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right text-sm text-gray-500">
                              {letter.last_practiced 
                                ? new Date(letter.last_practiced).toLocaleDateString() 
                                : 'Never'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-4 text-gray-500">
                            No letters found matching your search
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="difficult-letters">
              <Card>
                <CardHeader>
                  <CardTitle>Letters Needing More Practice</CardTitle>
                  <CardDescription>
                    These letters have an accuracy rate below 60% with at least 5 attempts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {difficultLetters.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {difficultLetters.map(letter => (
                        <Card key={letter.id} className="overflow-hidden">
                          <div className={`h-2 ${
                            letter.accuracy_rate < 30 ? 'bg-red-500' : 
                            letter.accuracy_rate < 50 ? 'bg-orange-500' : 'bg-yellow-500'
                          }`}></div>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-lg bg-purple-100 flex items-center justify-center">
                                <span className="text-2xl font-bold text-kid-purple">{letter.character}</span>
                              </div>
                              <div>
                                <h3 className="font-bold text-lg">{letter.name}</h3>
                                <p className="text-sm text-gray-500">{letter.type === 'vowel' ? 'Vowel' : 'Consonant'}</p>
                                <div className="mt-2">
                                  <Progress value={letter.accuracy_rate} className="h-2 mb-1" />
                                  <div className="flex justify-between text-sm">
                                    <span>{Math.round(letter.accuracy_rate)}% accuracy</span>
                                    <span>{letter.correct_attempts} / {letter.total_attempts} correct</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                        <Trophy className="h-8 w-8 text-green-600" />
                      </div>
                      <p>Great job! No difficult letters identified yet.</p>
                      <p className="text-sm">Keep practicing to maintain your progress!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="most-practiced">
              <Card>
                <CardHeader>
                  <CardTitle>Most Practiced Letters</CardTitle>
                  <CardDescription>Letters you've practiced the most</CardDescription>
                </CardHeader>
                <CardContent>
                  {mostPracticedLetters.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {mostPracticedLetters.map((letter, index) => (
                        <Card key={letter.id}>
                          <CardContent className="pt-6">
                            <div className="flex items-center gap-3">
                              <div className="relative">
                                <div className="w-14 h-14 rounded-lg bg-purple-100 flex items-center justify-center">
                                  <span className="text-2xl font-bold text-kid-purple">{letter.character}</span>
                                </div>
                                {index < 3 && (
                                  <div className={`absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                    index === 0 ? 'bg-yellow-500' : 
                                    index === 1 ? 'bg-gray-400' : 'bg-amber-700'
                                  }`}>
                                    #{index + 1}
                                  </div>
                                )}
                              </div>
                              <div>
                                <h3 className="font-medium">{letter.name}</h3>
                                <div className="flex gap-4 mt-1">
                                  <div>
                                    <p className="text-xs text-gray-500">Total</p>
                                    <p className="font-bold">{letter.total_attempts}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-green-600">Correct</p>
                                    <p className="font-bold text-green-600">{letter.correct_attempts}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs text-red-600">Wrong</p>
                                    <p className="font-bold text-red-600">{letter.wrong_attempts}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No practice data recorded yet.</p>
                      <p className="text-sm">Start practicing to see your most practiced letters!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}