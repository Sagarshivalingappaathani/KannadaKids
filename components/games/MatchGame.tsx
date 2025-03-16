'use client';

import React, { useState, useEffect, useRef } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, Clock, ArrowRight, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';

type GameMode = 'letter-to-sound' | 'letter-to-word';

type MatchItem = {
    id: string;
    value: string;
    displayValue: string;
    matched: boolean;
    type: 'prompt' | 'answer';
    audio?: string;
};

const KannadaMatchGame: React.FC = () => {
    const [prompts, setPrompts] = useState<MatchItem[]>([]);
    const [answers, setAnswers] = useState<MatchItem[]>([]);
    const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [score, setScore] = useState<number>(0);
    const [totalQuestions, setTotalQuestions] = useState<number>(0);
    const [timeLeft, setTimeLeft] = useState<number>(60);
    const [gameActive, setGameActive] = useState<boolean>(false);
    const [gameComplete, setGameComplete] = useState<boolean>(false);
    const [gameMode, setGameMode] = useState<GameMode>('letter-to-sound');
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize game
    useEffect(() => {
        startNewGame();
    }, [gameMode, difficulty]);

    // Timer effect
    useEffect(() => {
        let timer: NodeJS.Timeout;

        if (gameActive && timeLeft > 0) {
            timer = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && gameActive) {
            setGameActive(false);
            setGameComplete(true);
        }

        return () => clearInterval(timer);
    }, [gameActive, timeLeft]);

    const startNewGame = () => {
        // Reset game state
        setSelectedPrompt(null);
        setSelectedAnswer(null);
        setScore(0);
        setGameActive(false);
        setGameComplete(false);

        // Set time based on difficulty
        let gameTime = 60; // easy
        if (difficulty === 'medium') gameTime = 45;
        if (difficulty === 'hard') gameTime = 30;
        setTimeLeft(gameTime);

        // Determine number of questions based on difficulty
        let numQuestions = 5; // easy
        if (difficulty === 'medium') numQuestions = 8;
        if (difficulty === 'hard') numQuestions = 10;
        setTotalQuestions(numQuestions);

        // Get random letters from the alphabet
        const shuffledAlphabet = [...kannadaAlphabet].sort(() => Math.random() - 0.5);
        const selectedLetters = shuffledAlphabet.slice(0, numQuestions);

        // Create matching items based on game mode
        const newPrompts: MatchItem[] = [];
        const newAnswers: MatchItem[] = [];

        selectedLetters.forEach((letter, index) => {
            if (gameMode === 'letter-to-sound') {
                // Match letter to its sound (transliteration)
                newPrompts.push({
                    id: `prompt-${index}`,
                    value: letter.character,
                    displayValue: letter.character,
                    matched: false,
                    type: 'prompt',
                    audio: letter.audio
                });

                newAnswers.push({
                    id: `answer-${index}`,
                    value: letter.character,
                    displayValue: letter.name,
                    matched: false,
                    type: 'answer',
                    audio: letter.audio
                });
            } else if (gameMode === 'letter-to-word') {
                // Match letter to a word starting with it
                const example = letter.examples[0].split(' ')[0];

                newPrompts.push({
                    id: `prompt-${index}`,
                    value: letter.character,
                    displayValue: letter.character,
                    matched: false,
                    type: 'prompt',
                    audio: letter.audio
                });

                newAnswers.push({
                    id: `answer-${index}`,
                    value: letter.character,
                    displayValue: example,
                    matched: false,
                    type: 'answer',
                    audio: letter.audio
                });
            }
        });

        // Shuffle answers
        const shuffledAnswers = [...newAnswers].sort(() => Math.random() - 0.5);

        setPrompts(newPrompts);
        setAnswers(shuffledAnswers);
    };

    const handleStartGame = () => {
        setGameActive(true);
    };

    const handleItemClick = (id: string, type: 'prompt' | 'answer') => {
        if (!gameActive || gameComplete) return;

        if (type === 'prompt') {
            // Clicking a prompt
            setSelectedPrompt(id);
        } else {
            // Clicking an answer
            setSelectedAnswer(id);
        }
    };

    const playAudio = (audioPath: string | undefined) => {
        if (!audioPath) return;

        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.src = audioPath;
            audioRef.current.play().catch(error => {
                console.error("Audio playback failed:", error);
            });
        }
    };

    // Check for matches when selections change
    useEffect(() => {
        if (selectedPrompt && selectedAnswer) {
            const prompt = prompts.find(p => p.id === selectedPrompt);
            const answer = answers.find(a => a.id === selectedAnswer);

            if (prompt && answer) {
                // Check if they match (have the same value)
                if (prompt.value === answer.value) {
                    // Match found
                    setPrompts(prev => prev.map(p =>
                        p.id === selectedPrompt ? { ...p, matched: true } : p
                    ));

                    setAnswers(prev => prev.map(a =>
                        a.id === selectedAnswer ? { ...a, matched: true } : a
                    ));

                    // Play success sound
                    const successSound = new Audio('/audio/success.mp3');
                    successSound.play().catch(error => {
                        console.error("Success sound playback failed:", error);
                    });

                    // Update score
                    setScore(prev => prev + 1);

                    // Check if game is complete
                    if (score + 1 === totalQuestions) {
                        setGameActive(false);
                        setGameComplete(true);
                        // Trigger confetti effect
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.6 }
                        });
                    }
                } else {
                    // Play error sound
                    const errorSound = new Audio('/audio/error.mp3');
                    errorSound.play().catch(error => {
                        console.error("Error sound playback failed:", error);
                    });
                }

                // Reset selections
                setTimeout(() => {
                    setSelectedPrompt(null);
                    setSelectedAnswer(null);
                }, 500);
            }
        }
    }, [selectedPrompt, selectedAnswer]);

    return (
        <div className="flex flex-col items-center p-4">
            {/* Hidden audio element for playing sounds */}
            <audio ref={audioRef} />

            {/* Game Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-4">
                    <div className="bg-white rounded-lg px-3 py-2 shadow">
                        <div className="text-sm text-gray-500">Score</div>
                        <div className="text-2xl font-bold">{score}/{totalQuestions}</div>
                    </div>
                    <div className="bg-white rounded-lg px-3 py-2 shadow flex items-center">
                        <Clock className="text-gray-400 mr-2 h-5 w-5" />
                        <div className="text-2xl font-bold">{timeLeft}</div>
                    </div>
                </div>

                <div className="space-y-3 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            className="block w-full p-2 border rounded"
                            value={gameMode}
                            onChange={(e) => setGameMode(e.target.value as GameMode)}
                            disabled={gameActive}
                        >
                            <option value="letter-to-sound">Letter to Sound</option>
                            <option value="letter-to-word">Letter to Word</option>
                        </select>

                        <select
                            className="block w-full p-2 border rounded"
                            value={difficulty}
                            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
                            disabled={gameActive}
                        >
                            <option value="easy">Easy (60s)</option>
                            <option value="medium">Medium (45s)</option>
                            <option value="hard">Hard (30s)</option>
                        </select>
                    </div>

                    <Button
                        onClick={gameActive ? startNewGame : handleStartGame}
                        className="flex items-center gap-2 w-full"
                        variant={gameActive ? "outline" : "default"}
                    >
                        {gameActive ? (
                            <>
                                <RefreshCw className="h-4 w-4" />
                                Reset Game
                            </>
                        ) : (
                            'Start Game'
                        )}
                    </Button>
                </div>
            </div>

            {/* Game Instructions */}
            {!gameActive && !gameComplete && (
                <div className="bg-blue-50 p-4 rounded-lg mb-8 w-full max-w-2xl">
                    <h3 className="font-bold text-blue-700 mb-2">How to Play:</h3>
                    <p className="mb-2">
                        Match each Kannada {gameMode === 'letter-to-sound' ? 'letter to its sound' : 'letter to a word'}.
                    </p>
                    <p>Click on an item from each column to make a match!</p>
                    <p className="mt-2">Click the sound icon <Volume2 className="inline h-4 w-4" /> to hear pronunciation.</p>
                </div>
            )}

            {/* Game Board */}
            {(!gameComplete || (gameComplete && score > 0)) && (
                <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-12 w-full max-w-2xl">
                    {/* Prompts Column */}
                    <div className="flex-1">
                        <h3 className="text-center font-bold text-gray-700 mb-3">
                            Kannada Letters
                        </h3>
                        <div className="space-y-3">
                            {prompts.map(prompt => (
                                <div
                                    key={prompt.id}
                                    className={`
                                        p-4 rounded-lg cursor-pointer transition-all
                                        ${prompt.matched ? 'bg-green-100 border-2 border-green-300' :
                                            selectedPrompt === prompt.id ? 'bg-yellow-100 border-2 border-yellow-300' :
                                                'bg-white border-2 border-gray-200 hover:border-blue-300'}
                                        ${!gameActive ? 'opacity-70' : 'opacity-100'}
                                    `}
                                    onClick={() => !prompt.matched && handleItemClick(prompt.id, 'prompt')}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-2xl font-baloo ${prompt.matched ? 'text-green-600' : 'text-gray-800'}`}>
                                            {prompt.displayValue}
                                        </span>
                                        
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Answers Column */}
                    <div className="flex-1">
                        <h3 className="text-center font-bold text-gray-700 mb-3">
                            {gameMode === 'letter-to-sound' ? 'Sounds' : 'Words'}
                        </h3>
                        <div className="space-y-3">
                            {answers.map(answer => (
                                <div
                                    key={answer.id}
                                    className={`
                                        p-4 rounded-lg cursor-pointer transition-all
                                        ${answer.matched ? 'bg-green-100 border-2 border-green-300' :
                                            selectedAnswer === answer.id ? 'bg-yellow-100 border-2 border-yellow-300' :
                                                'bg-white border-2 border-gray-200 hover:border-blue-300'}
                                        ${!gameActive ? 'opacity-70' : 'opacity-100'}
                                    `}
                                    onClick={() => !answer.matched && handleItemClick(answer.id, 'answer')}
                                >
                                    <div className="flex justify-between items-center">
                                        <span className={`text-2xl font-baloo ${answer.matched ? 'text-green-600' : 'text-gray-800'}`}>
                                            {answer.displayValue}
                                        </span>
                                        <div className="flex items-center">
                                            {answer.audio && (
                                                <button
                                                    className="mr-2 text-blue-500 hover:text-blue-700"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        playAudio(answer.audio);
                                                    }}
                                                >
                                                    <Volume2 className="h-5 w-5" />
                                                </button>
                                            )}
                                            {selectedAnswer === answer.id && !answer.matched && (
                                                <ArrowRight className="h-5 w-5 text-yellow-500" />
                                            )}
                                            {answer.matched && (
                                                <div className="bg-green-500 rounded-full h-5 w-5 flex items-center justify-center text-white text-xs">✓</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Game Complete Overlay */}
            {gameComplete && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-pop w-full max-w-md">
                    <div className="flex items-center justify-center mb-4">
                        <Trophy className="text-yellow-500 h-8 w-8 mr-3" />
                        <h3 className="text-2xl font-bold text-green-600">
                            Game Complete!
                        </h3>
                    </div>
                    <p className="text-center mb-4">
                        Your score: <span className="font-bold text-xl">{score}/{totalQuestions}</span>
                        <br />
                        Time remaining: <span className="font-bold">{timeLeft} seconds</span>
                    </p>
                    <Button onClick={startNewGame} className="w-full">
                        Play Again
                    </Button>
                </div>
            )}

            {/* Add custom CSS for animations */}
            <style jsx global>{`
                .animate-pop {
                    animation: pop 0.5s ease-out;
                }
                
                @keyframes pop {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                .font-baloo {
                    font-family: 'Baloo Tamma 2', 'Noto Sans Kannada', sans-serif;
                }
            `}</style>
        </div>
    );
};

export default KannadaMatchGame;