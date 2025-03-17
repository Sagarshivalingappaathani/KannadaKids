'use client';

import React, { useState, useEffect } from 'react';
import { kannadaAlphabet } from '@/lib/alphabetData';
import { Button } from '@/components/ui/button';
import { RefreshCw, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

type Card = {
  id: string;
  content: string;
  flipped: boolean;
  matched: boolean;
  type: 'letter' | 'word';
};

const MemoryGame: React.FC = () => {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matches, setMatches] = useState<number>(0);
  const [moves, setMoves] = useState<number>(0);
  const [gameComplete, setGameComplete] = useState<boolean>(false);
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [gameStarted, setGameStarted] = useState<boolean>(false);

  // Generate game
  useEffect(() => {
    startNewGame();
  }, [difficulty]);

  const startNewGame = () => {
    // Reset game state
    setFlippedCards([]);
    setMatches(0);
    setMoves(0);
    setGameComplete(false);
    setGameStarted(false);

    // Determine number of pairs based on difficulty
    let numPairs = 4; // easy
    if (difficulty === 'medium') numPairs = 6;
    if (difficulty === 'hard') numPairs = 8;

    // Get random letters from the alphabet
    const shuffledAlphabet = [...kannadaAlphabet].sort(() => Math.random() - 0.5);
    const selectedLetters = shuffledAlphabet.slice(0, numPairs);

    // Create pairs of cards (letter and word example)
    const newCards: Card[] = [];

    selectedLetters.forEach((letter, index) => {
      // Letter card
      newCards.push({
        id: `letter-${index}`,
        content: letter.character,
        flipped: false,
        matched: false,
        type: 'letter'
      });

      // Word example card (using first example)
      const example = letter.examples[0].split(' ')[0];
      newCards.push({
        id: `word-${index}`,
        content: example,
        flipped: false,
        matched: false,
        type: 'word'
      });
    });

    // Shuffle cards
    const shuffledCards = [...newCards].sort(() => Math.random() - 0.5);
    setCards(shuffledCards);
  };

  const handleCardClick = (id: string) => {
    // Ignore if game is complete or card is already matched
    const clickedCard = cards.find(card => card.id === id);
    if (!clickedCard || clickedCard.matched || gameComplete) return;

    // Ignore if two cards already flipped or clicking on already flipped card
    if (flippedCards.length === 2 || flippedCards.includes(id)) return;

    if (!gameStarted) {
      setGameStarted(true);
    }

    // Update flipped cards
    const newFlippedCards = [...flippedCards, id];
    setFlippedCards(newFlippedCards);

    // Flip this card
    const newCards = cards.map(card =>
      card.id === id ? { ...card, flipped: true } : card
    );
    setCards(newCards);

    // If we have 2 cards flipped, check for a match
    if (newFlippedCards.length === 2) {
      setMoves(prev => prev + 1);

      // Get both flipped cards
      const firstCardId = newFlippedCards[0];
      const secondCardId = newFlippedCards[1];

      const firstCard = newCards.find(card => card.id === firstCardId);
      const secondCard = newCards.find(card => card.id === secondCardId);

      if (!firstCard || !secondCard) return;

      // Check if it's a letter-word pair match
      const isMatch =
        (firstCard.type === 'letter' && secondCard.type === 'word' &&
          firstCard.id.split('-')[1] === secondCard.id.split('-')[1]) ||
        (firstCard.type === 'word' && secondCard.type === 'letter' &&
          firstCard.id.split('-')[1] === secondCard.id.split('-')[1]);

      if (isMatch) {
        // Mark cards as matched
        const matchedCards = newCards.map(card =>
          card.id === firstCardId || card.id === secondCardId
            ? { ...card, matched: true }
            : card
        );

        const newMatchCount = matches + 1;
        setMatches(newMatchCount);
        setCards(matchedCards);
        setFlippedCards([]);

        // Check if game is complete
        const totalPairs = matchedCards.length / 2;
        if (newMatchCount === totalPairs) {
          setGameComplete(true);
          // Trigger confetti effect
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });

          const successSound = new Audio('/audio/success.mp3');
          successSound.play().catch(error => {
            console.error("Success sound playback failed:", error);
          });
        }
      } else {
        // Not a match, flip back after delay
        setTimeout(() => {
          const resetCards = newCards.map(card =>
            (card.id === firstCardId || card.id === secondCardId) && !card.matched
              ? { ...card, flipped: false }
              : card
          );
          setCards(resetCards);
          setFlippedCards([]);
        }, 1000);
      }
    }
  };

  const getCardBackgroundColor = (card: Card) => {
    if (card.type === 'letter') {
      return 'bg-kid-purple/20 hover:bg-kid-purple/30';
    }
    return 'bg-kid-blue/20 hover:bg-kid-blue/30';
  };

  const getGridClass = () => {
    if (difficulty === 'easy') return 'grid-cols-2 sm:grid-cols-4';
    if (difficulty === 'medium') return 'grid-cols-3 sm:grid-cols-4';
    return 'grid-cols-4';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="w-full flex justify-between items-center mb-6">
        <div className="flex gap-4">
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Matches</div>
            <div className="text-2xl font-bold">{matches}</div>
          </div>
          <div className="bg-white rounded-lg px-3 py-2 shadow">
            <div className="text-sm text-gray-500">Moves</div>
            <div className="text-2xl font-bold">{moves}</div>
          </div>
        </div>

        <div className="space-y-3">
          <select
            className="block w-full p-2 border rounded"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as 'easy' | 'medium' | 'hard')}
            disabled={gameStarted && !gameComplete}
          >
            <option value="easy">Easy (4 pairs)</option>
            <option value="medium">Medium (6 pairs)</option>
            <option value="hard">Hard (8 pairs)</option>
          </select>

          <Button
            variant="outline"
            onClick={startNewGame}
            className="flex items-center gap-2 w-full"
          >
            <RefreshCw className="h-4 w-4" />
            New Game
          </Button>
        </div>
      </div>

      {/* Game Board */}
      <div className={`grid ${getGridClass()} gap-4 w-full max-w-xl mx-auto`}>
        {cards.map(card => (
          <div
            key={card.id}
            className={`
              aspect-[3/4] relative cursor-pointer transform transition-all duration-300
              ${card.flipped || card.matched ? 'rotate-y-0' : 'rotate-y-180'}
              ${card.matched ? 'opacity-70' : 'opacity-100'}
            `}
            onClick={() => handleCardClick(card.id)}
          >
            {/* Card Front */}
            <div className={`
              absolute inset-0 rounded-xl ${getCardBackgroundColor(card)}
              flex items-center justify-center
              transform backface-hidden
              border-2 ${card.matched ? 'border-green-400' : 'border-transparent'}
              ${card.flipped || card.matched ? 'opacity-100' : 'opacity-0'}
            `}>
              {card.type === 'letter' ? (
                <span className="text-5xl font-baloo">{card.content}</span>
              ) : (
                <span className="text-xl font-baloo">{card.content}</span>
              )}
            </div>

            {/* Card Back */}
            <div className={`
              absolute inset-0 rounded-xl bg-gradient-to-br from-kid-orange/20 to-kid-green/20
              flex items-center justify-center
              transform backface-hidden
              ${card.flipped || card.matched ? 'opacity-0' : 'opacity-100'}
            `}>
            </div>
          </div>
        ))}
      </div>

      {/* Game Complete Overlay */}
      {gameComplete && (
        <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 animate-pop w-full">
          <div className="flex items-center justify-center mb-4">
            <Trophy className="text-yellow-500 h-8 w-8 mr-3" />
            <h3 className="text-2xl font-bold text-green-600">
              Congratulations!
            </h3>
          </div>
          <p className="text-center mb-4">
            You completed the game in {moves} moves!
          </p>
          <Button onClick={startNewGame} className="w-full">
            Play Again
          </Button>
        </div>
      )}

      {/* Add custom CSS for 3D card flipping effect */}
      <style jsx global>{`
        .rotate-y-0 {
          transform: rotateY(0deg);
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }

        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        
        .animate-pop {
          animation: pop 0.5s ease-out;
        }
        
        @keyframes pop {
          0% { transform: scale(0.8); opacity: 0; }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MemoryGame;