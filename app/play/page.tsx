
'use client';

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import PuzzleGame from '@/components/games/PuzzleGame';
import MemoryGame from '@/components/games/MemoryGame';
import MatchGame from '@/components/games/MatchGame';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from '@/components/NavBar'

const PlayPage = () => {
  const [selectedGame, setSelectedGame] = useState<string | null>('puzzle');

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 pt-24 pb-16 px-6">
      {/* Back button */}
      <div className="container mx-auto mb-8">
        <Navbar />

        <div className="text-center mb-12 animate-fade-in-up">
          <h1 className="text-4xl md:text-5xl font-bold font-baloo mb-4 text-transparent bg-clip-text bg-gradient-to-r from-kid-purple via-kid-blue to-kid-green">
            Fun & Games!
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Play these fun games to practice Kannada letters while having a great time!
          </p>
        </div>

        <Tabs defaultValue="all" className="w-full max-w-4xl mx-auto">
          <TabsList className="grid w-full grid-cols-3 mb-8 bg-white/50 backdrop-blur-md">
            <TabsTrigger value="all">All Games</TabsTrigger>
            <TabsTrigger value="beginner">Beginner</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Game Cards */}
              <GameCard 
                title="Letter Puzzle"
                description="Drag and drop puzzle pieces to form Kannada letters"
                color="from-kid-purple/20 to-kid-blue/20"
                icon="🧩"
                onClick={() => setSelectedGame('puzzle')}
              />
              
              <GameCard 
                title="Memory Match"
                description="Match pairs of Kannada letters and pictures"
                color="from-kid-blue/20 to-kid-green/20"
                icon="🔤"
                onClick={() => setSelectedGame('memory')}
              />
              
              <GameCard 
                title="Letter Match"
                description="Match Kannada letters with their corresponding images"
                color="from-kid-purple/20 to-kid-blue/20"
                icon="🔤"
                onClick={() => setSelectedGame('match')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="beginner" className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GameCard 
                title="Memory Match"
                description="Match pairs of Kannada letters and pictures"
                color="from-kid-blue/20 to-kid-green/20"
                icon="🔤"
                onClick={() => setSelectedGame('memory')}
              />
            </div>
          </TabsContent>
          
          <TabsContent value="advanced" className="animate-fade-in-up">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <GameCard 
                title="Letter Puzzle"
                description="Drag and drop puzzle pieces to form Kannada letters"
                color="from-kid-purple/20 to-kid-blue/20"
                icon="🧩"
                onClick={() => setSelectedGame('puzzle')}
              />
              
              <GameCard 
                title="Letter Match"
                description="Match Kannada letters with their corresponding images"
                color="from-kid-purple/20 to-kid-blue/20"
                icon="🔤"
                onClick={() => setSelectedGame('match')}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Game Display */}
        {selectedGame && (
          <div className="mt-12 bg-white rounded-3xl shadow-xl p-6 animate-pop max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-baloo">
                {selectedGame === 'puzzle' && 'Letter Puzzle'}
                {selectedGame === 'memory' && 'Memory Match'}
                {selectedGame === 'match' && 'Letter Match'}
              </h2>
              <Button 
                variant="outline" 
                onClick={() => setSelectedGame(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                Close Game
              </Button>
            </div>
            
            <div className="game-container min-h-[400px]">
              {selectedGame === 'puzzle' && <PuzzleGame />}
              {selectedGame === 'memory' && <MemoryGame />}
              {selectedGame === 'match' && <MatchGame />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Game Card Component
const GameCard = ({ 
  title, 
  description, 
  color, 
  icon, 
  onClick 
}: { 
  title: string; 
  description: string; 
  color: string; 
  icon: string; 
  onClick: () => void; 
}) => {
  return (
    <div 
      className={`rounded-3xl p-6 bg-gradient-to-br ${color} backdrop-blur-sm border border-white/20 shadow-md hover:shadow-lg transition-all duration-300 cursor-pointer hover:-translate-y-1 h-full flex flex-col`}
      onClick={onClick}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-xl font-bold font-baloo mb-2">{title}</h3>
      <p className="text-gray-600 text-sm flex-grow">{description}</p>
      <Button className="mt-4 w-full btn-primary">Play Now</Button>
    </div>
  );
};

export default PlayPage;