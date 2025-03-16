'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy, HelpCircle, Volume2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { KannadaLetter } from '@/lib/alphabetData';

// Define the types for puzzle pieces
type PuzzlePiece = {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    position: number;
    currentPosition: number;
    isCorrect: boolean;
};

type JigsawLevel = 'easy' | 'medium' | 'hard';

const KannadaJigsawGame: React.FC = () => {
    const [currentLetter, setCurrentLetter] = useState<KannadaLetter | null>(null);
    const [puzzlePieces, setPuzzlePieces] = useState<PuzzlePiece[]>([]);
    const [completedPuzzles, setCompletedPuzzles] = useState<number>(0);
    const [totalPuzzles, setTotalPuzzles] = useState<number>(5);
    const [gameComplete, setGameComplete] = useState<boolean>(false);
    const [gameStarted, setGameStarted] = useState<boolean>(false);
    const [level, setLevel] = useState<JigsawLevel>('easy');
    const [draggedPiece, setDraggedPiece] = useState<string | null>(null);
    const [showHint, setShowHint] = useState<boolean>(false);
    const [kannadaLetters, setKannadaLetters] = useState<KannadaLetter[]>([]);
    const [imageLoaded, setImageLoaded] = useState<boolean>(false);
    const [currentPuzzleComplete, setCurrentPuzzleComplete] = useState<boolean>(false);
    const letterImageRef = useRef<HTMLImageElement | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch letters data at component mount
    useEffect(() => {
        // In a real implementation, you would import this from your alphabetData file
        const fetchLetters = async () => {
            try {
                // For demo purposes, using a simplified version of your alphabet data
                // In your actual implementation, you would use the imported kannadaAlphabet
                const sampleLetters: KannadaLetter[] = [
                    {
                        id: "vowel-a",
                        character: "ಅ",
                        name: "a",
                        pronunciation: "a as in 'america'",
                        examples: ["ಅಮ್ಮ (amma) - mother", "ಅಪ್ಪ (appa) - father"],
                        category: "vowel",
                        audio: "/audio/1.mp3",
                        word: 'ಅಪ್ಪ',
                        image: '/images/words/1.jpg',
                        transliteration: 'appa (father)',
                    },
                    {
                        id: "vowel-aa",
                        character: "ಆ",
                        name: "aa",
                        pronunciation: "aa as in 'art'",
                        examples: ["ಆನೆ (aane) - elephant", "ಆಕಾಶ (aakaasha) - sky"],
                        category: "vowel",
                        audio: "/audio/2.mp3",
                        word: 'ಆನೆ',
                        image: '/images/words/2.jpg',
                        transliteration: 'aane (elephant)',
                    },
                    // More letters would be here in the actual implementation
                ];

                setKannadaLetters(sampleLetters);
            } catch (error) {
                console.error("Error fetching Kannada letters:", error);
            }
        };

        fetchLetters();
    }, []);

    // Initialize game
    useEffect(() => {
        if (kannadaLetters.length > 0) {
            startNewGame();
        }
    }, [kannadaLetters, level]);

    // Generate puzzle pieces when image is loaded
    useEffect(() => {
        if (imageLoaded && letterImageRef.current && currentLetter) {
            generatePuzzlePieces();
        }
    }, [imageLoaded, currentLetter]);

    const generatePuzzlePieces = () => {
        if (!letterImageRef.current || !currentLetter) return;

        const img = letterImageRef.current;
        const imgWidth = img.naturalWidth;
        const imgHeight = img.naturalHeight;

        // Determine grid dimensions based on difficulty level
        let gridSize = 2; // easy: 2x2 grid
        if (level === 'medium') gridSize = 3; // 3x3 grid
        if (level === 'hard') gridSize = 4; // 4x4 grid

        const pieceWidth = imgWidth / gridSize;
        const pieceHeight = imgHeight / gridSize;
        const totalPieces = gridSize * gridSize;

        const pieces: PuzzlePiece[] = [];

        // Create pieces by dividing the image into a grid
        for (let y = 0; y < gridSize; y++) {
            for (let x = 0; x < gridSize; x++) {
                const position = y * gridSize + x;
                pieces.push({
                    id: `piece-${position}`,
                    x: x * pieceWidth,
                    y: y * pieceHeight,
                    width: pieceWidth,
                    height: pieceHeight,
                    position: position,
                    currentPosition: -1, // Not placed yet
                    isCorrect: false
                });
            }
        }
        
        console.log(pieces);
        // Shuffle the pieces
        setPuzzlePieces(pieces.sort(() => Math.random() - 0.5));
        setCurrentPuzzleComplete(false);
    };

    const startNewGame = () => {
        setGameComplete(false);
        setCompletedPuzzles(0);
        setShowHint(false);
        setImageLoaded(false);
        setCurrentPuzzleComplete(false);

        // Determine number of puzzles based on level
        let puzzleCount = 3; // easy
        if (level === 'medium') puzzleCount = 5;
        if (level === 'hard') puzzleCount = 7;
        setTotalPuzzles(puzzleCount);

        // Select a random letter
        selectRandomLetter();
    };

    const selectRandomLetter = () => {
        if (kannadaLetters.length === 0) return;

        const randomIndex = Math.floor(Math.random() * kannadaLetters.length);
        const selectedLetter = kannadaLetters[randomIndex];
        setCurrentLetter(selectedLetter);
    };

    const handleStartGame = () => {
        setGameStarted(true);
    };

    const handleImageLoad = () => {
        setImageLoaded(true);
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

    const handleDragStart = (e: React.DragEvent, pieceId: string) => {
        setDraggedPiece(pieceId);
        e.dataTransfer.setData('text/plain', pieceId);
        // Add a ghost image or set opacity for better drag visualization
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '0.6';
        }
    };

    const handleDragEnd = (e: React.DragEvent) => {
        // Reset opacity
        if (e.currentTarget instanceof HTMLElement) {
            e.currentTarget.style.opacity = '1';
        }
        setDraggedPiece(null);
    };

    const handleDragOver = (e: React.DragEvent, dropPosition: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropPosition: number) => {
        e.preventDefault();
        const pieceId = e.dataTransfer.getData('text/plain');

        // Update the piece's current position
        const updatedPieces = puzzlePieces.map(piece => {
            if (piece.id === pieceId) {
                // Check if the piece is dropped in its correct position
                const isCorrect = piece.position === dropPosition;

                // Play sound based on correct/incorrect placement
                if (isCorrect) {
                    const successSound = new Audio('/audio/success.mp3');
                    successSound.play().catch(error => {
                        console.error("Success sound playback failed:", error);
                    });
                } else {
                    const errorSound = new Audio('/audio/error.mp3');
                    errorSound.play().catch(error => {
                        console.error("Error sound playback failed:", error);
                    });
                }

                return {
                    ...piece,
                    currentPosition: dropPosition,
                    isCorrect: isCorrect
                };
            }
            // If another piece is already in this position, move it back to unplaced
            if (piece.currentPosition === dropPosition) {
                return {
                    ...piece,
                    currentPosition: -1,
                    isCorrect: false
                };
            }
            return piece;
        });

        setPuzzlePieces(updatedPieces);

        // Check if puzzle is complete
        const isPuzzleComplete = updatedPieces.every(piece => piece.isCorrect);

        if (isPuzzleComplete) {
            // Set current puzzle as complete
            setCurrentPuzzleComplete(true);

            // Trigger confetti effect
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            // Play completion sound
            const completionSound = new Audio('/audio/completion.mp3');
            completionSound.play().catch(error => {
                console.error("Completion sound playback failed:", error);
            });

            const newCompletedCount = completedPuzzles + 1;
            setCompletedPuzzles(newCompletedCount);

            if (newCompletedCount >= totalPuzzles) {
                // Game is completely finished
                setGameComplete(true);
            } else {
                // Move to next puzzle after a delay
                setTimeout(() => {
                    setImageLoaded(false);
                    setCurrentPuzzleComplete(false);
                    selectRandomLetter();
                }, 2000);
            }
        }
    };

    const getGridClass = () => {
        switch (level) {
            case 'easy':
                return 'grid-cols-2';
            case 'medium':
                return 'grid-cols-3';
            case 'hard':
                return 'grid-cols-4';
            default:
                return 'grid-cols-2';
        }
    };

    const getBackgroundStyle = (position: number, gridSize: number) => {
        if (!letterImageRef.current || !currentLetter) {
            return {};
        }
        
        // Calculate the x and y coordinates within the grid
        const x = position % gridSize;
        const y = Math.floor(position / gridSize);
        
        // For background-position, we need to use specific percentages
        // that correspond to the piece's position in the original image
        
        // Calculate the percentage step based on grid size
        // For a 2x2 grid, the steps are 0% and 100%
        // For a 3x3 grid, the steps are 0%, 50%, and 100%
        // For a 4x4 grid, the steps are 0%, 33.33%, 66.66%, and 100%
        console.log(currentLetter.image);
        console.log(`${gridSize * 100}%`);
        console.log(`${x * 100/(gridSize-1)}% ${y * 100/(gridSize-1)}%`);
        return {
            backgroundImage: `url(${currentLetter.image})`,
            // This scales the image to be gridSize times larger than the container
            backgroundSize: `${gridSize * 100}%`,
            // This positions the background so only the correct portion shows
            // The multiplication by 100/(gridSize-1) converts grid position to percentage
            backgroundPosition: `${x * 100/(gridSize-1)}% ${y * 100/(gridSize-1)}%`
        };
    };

    return (
        <div className="flex flex-col items-center p-4">
            {/* Hidden audio element for playing sounds */}
            <audio ref={audioRef} />

            {/* Hidden image for preloading and reference */}
            {currentLetter && (
                <img
                    ref={letterImageRef}
                    src={currentLetter.image}
                    alt={`Full ${currentLetter.character} letter`}
                    className="hidden"
                    onLoad={handleImageLoad}
                />
            )}

            {/* Game Header */}
            <div className="w-full flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <div className="flex gap-4">
                    <div className="bg-white rounded-lg px-3 py-2 shadow">
                        <div className="text-sm text-gray-500">Progress</div>
                        <div className="text-2xl font-bold">{completedPuzzles}/{totalPuzzles}</div>
                    </div>

                    {currentLetter && (
                        <div className="bg-white rounded-lg px-3 py-2 shadow flex items-center">
                            <div>
                                <div className="text-sm text-gray-500">Current Letter</div>
                                <div className="text-2xl font-bold font-baloo">{currentLetter.character}</div>
                            </div>
                            {currentLetter.audio && (
                                <button
                                    className="ml-2 text-blue-500 hover:text-blue-700"
                                    onClick={() => playAudio(currentLetter.audio)}
                                >
                                    <Volume2 className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    )}
                </div>

                <div className="space-y-3 w-full sm:w-auto">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <select
                            className="block w-full p-2 border rounded"
                            value={level}
                            onChange={(e) => setLevel(e.target.value as JigsawLevel)}
                            disabled={gameStarted && !gameComplete}
                        >
                            <option value="easy">Easy (2×2 puzzle)</option>
                            <option value="medium">Medium (3×3 puzzle)</option>
                            <option value="hard">Hard (4×4 puzzle)</option>
                        </select>

                        <Button
                            onClick={handleStartGame}
                            className="flex items-center gap-2 w-full"
                            disabled={gameStarted && !gameComplete}
                        >
                            Start Game
                        </Button>
                    </div>

                    {gameStarted && !gameComplete && (
                        <div className="flex gap-2">
                            <Button
                                onClick={() => setShowHint(!showHint)}
                                variant="outline"
                                className="flex-1"
                            >
                                <HelpCircle className="h-4 w-4 mr-2" />
                                {showHint ? 'Hide Hint' : 'Show Hint'}
                            </Button>

                            <Button
                                onClick={startNewGame}
                                variant="outline"
                                className="flex-1"
                            >
                                <RefreshCw className="h-4 w-4 mr-2" />
                                Reset
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Game Instructions */}
            {!gameStarted && (
                <div className="bg-blue-50 p-4 rounded-lg mb-8 w-full max-w-2xl">
                    <h3 className="font-bold text-blue-700 mb-2">How to Play:</h3>
                    <p className="mb-2">
                        Complete the jigsaw puzzle by dragging and dropping the pieces to their correct positions.
                    </p>
                    <p>Each puzzle is a Kannada letter. Complete {totalPuzzles} puzzles to win!</p>
                    <p className="mt-2">You can use the hint button if you need help seeing the full letter.</p>
                    <p className="mt-2">Click the sound icon <Volume2 className="inline h-4 w-4" /> to hear pronunciation.</p>
                </div>
            )}

            {/* Game Board */}
            {gameStarted && !gameComplete && currentLetter && imageLoaded && (
                <div className="w-full max-w-2xl">
                    {/* Hint section */}
                    {showHint && (
                        <div className="mb-6 bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                            <h3 className="font-bold text-yellow-700 mb-2">Hint:</h3>
                            <div className="flex items-center gap-4">
                                <div className="flex-shrink-0">
                                    <img
                                        src={currentLetter.image}
                                        alt={currentLetter.character}
                                        className="h-24 object-contain"
                                    />
                                </div>
                                <div>
                                    <p>Letter: <strong className="font-baloo">{currentLetter.character}</strong> <strong>({currentLetter.name})</strong></p>
                                    <p>Pronunciation: {currentLetter.pronunciation}</p>
                                    <p>Example: {currentLetter.examples[0]}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Puzzle board - this is where pieces are placed */}
                    <div className="mb-8">
                        <h3 className="text-center font-bold text-gray-700 mb-3">
                            Puzzle Board
                        </h3>

                        {/* Show complete image when puzzle is solved */}
                        {currentPuzzleComplete ? (
                            <div
                                className="border-4 border-green-500 rounded-lg overflow-hidden animate-celebrate"
                                style={{
                                    aspectRatio: letterImageRef.current ?
                                        `${letterImageRef.current.naturalWidth}/${letterImageRef.current.naturalHeight}` : '1/1'
                                }}
                            >
                                <img
                                    src={currentLetter.image}
                                    alt={currentLetter.character}
                                    className="w-full h-full object-contain"
                                />
                            </div>
                        ) : (
                            <div
                                className={`grid ${getGridClass()} gap-1 bg-gray-200 p-2 rounded-lg`}
                                style={{
                                    aspectRatio: letterImageRef.current ?
                                        `${letterImageRef.current.naturalWidth}/${letterImageRef.current.naturalHeight}` : '1/1'
                                }}
                            >
                                {/* Create drop zones based on difficulty level */}
                                {Array.from({ length: level === 'easy' ? 4 : level === 'medium' ? 9 : 16 }).map((_, index) => {
                                    const placedPiece = puzzlePieces.find(piece => piece.currentPosition === index);
                                    const gridSize = level === 'easy' ? 2 : level === 'medium' ? 3 : 4;

                                    return (
                                        <div
                                            key={`dropzone-${index}`}
                                            className={`
                                                aspect-square bg-gray-100 rounded border-2 
                                                ${placedPiece ?
                                                    (placedPiece.isCorrect ? 'border-green-400' : 'border-red-400') :
                                                    'border-dashed border-gray-400'}
                                                flex items-center justify-center overflow-hidden
                                            `}
                                            onDragOver={(e) => handleDragOver(e, index)}
                                            onDrop={(e) => handleDrop(e, index)}
                                        >
                                            {placedPiece && letterImageRef.current && (
                                                <div
                                                    className="w-full h-full"
                                                    draggable="true"
                                                    onDragStart={(e) => handleDragStart(e, placedPiece.id)}
                                                    onDragEnd={handleDragEnd}
                                                >
                                                    <div
                                                        className="w-full h-full"
                                                        style={getBackgroundStyle(placedPiece.position, gridSize)}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Puzzle pieces tray */}
                    {!currentPuzzleComplete && (
                        <div>
                            <h3 className="text-center font-bold text-gray-700 mb-3">
                                Puzzle Pieces
                            </h3>
                            <div className="flex flex-wrap gap-2 p-3 bg-blue-50 rounded-lg min-h-24 justify-center">
                                {letterImageRef.current && puzzlePieces.filter(piece => piece.currentPosition === -1).map((piece) => (
                                    <div
                                        key={piece.id}
                                        className="w-16 h-16 md:w-20 md:h-20 bg-white rounded shadow-md cursor-move hover:shadow-lg transition-all border-2 border-blue-200"
                                        draggable="true"
                                        onDragStart={(e) => handleDragStart(e, piece.id)}
                                        onDragEnd={handleDragEnd}
                                    >
                                        <div
                                            className="w-full h-full"
                                            style={getBackgroundStyle(piece.position, level === 'easy' ? 2 : level === 'medium' ? 3 : 4)}
                                        />
                                    </div>
                                ))}
                                {puzzlePieces.filter(piece => piece.currentPosition === -1).length === 0 && !currentPuzzleComplete && (
                                    <p className="text-gray-500 italic">All pieces placed!</p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Game Complete Overlay */}
            {gameComplete && (
                <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-pop w-full max-w-md">
                    <div className="flex items-center justify-center mb-4">
                        <Trophy className="text-yellow-500 h-8 w-8 mr-3" />
                        <h3 className="text-2xl font-bold text-green-600">
                            Fantastic Job!
                        </h3>
                    </div>
                    <p className="text-center mb-4">
                        You completed all {totalPuzzles} puzzles!
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
                
                .animate-celebrate {
                    animation: celebrate 0.7s ease-out;
                }
                
                @keyframes pop {
                    0% { transform: scale(0.8); opacity: 0; }
                    100% { transform: scale(1); opacity: 1; }
                }
                
                @keyframes celebrate {
                    0% { transform: scale(0.9); }
                    50% { transform: scale(1.05); }
                    100% { transform: scale(1); }
                }
                
                .font-baloo {
                    font-family: 'Baloo Tamma 2', 'Noto Sans Kannada', sans-serif;
                }
            `}</style>
        </div>
    );
};

export default KannadaJigsawGame;