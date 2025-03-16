import React, { useState, useEffect } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Home, BookOpen, Play, Star, User, LogOut, Info } from "lucide-react";
import { useAuth } from '@/lib/AuthContext';  // Import authentication hook

const NavBar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const { user, signOut } = useAuth(); // Get user and signOut function
  console.log(user);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 py-4 px-6 md:px-10",
        scrolled 
          ? "bg-white/80 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-kid-purple to-kid-blue flex items-center justify-center shadow-md animate-float">
            <span className="text-2xl font-baloo font-bold text-white">ಕ</span>
          </div>
          <h1 className="ml-3 text-2xl font-baloo font-bold bg-clip-text text-transparent bg-gradient-to-r from-kid-purple to-kid-blue">
            KannadaKids
          </h1>
        </div>

        <nav className="hidden md:flex items-center space-x-6">
          <a href="/" className="nav-link">Home</a>
          <a href="/dashboard" className="nav-link">Dashboard</a>
          <a href="/learn" className="nav-link">Learn</a>
          <a href="/play" className="nav-link">Play</a>
          <a href="/about" className="nav-link">About</a>
        </nav>

        {/* User Authentication Status */}
        <div className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <span className="text-sm font-medium">Hello, {user.user_metadata.full_name}</span>
              <Button variant="outline" onClick={signOut} className="flex items-center">
                <LogOut size={18} className="mr-1" /> Logout
              </Button>
            </>
          ) : (
            <a href="/auth/login">
              <Button className="btn-primary flex items-center">
                <User size={18} className="mr-1" /> Login
              </Button>
            </a>
          )}
        </div>

        {/* Mobile Navigation */}
        <nav className="md:hidden flex items-center justify-center fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-md rounded-full shadow-lg px-6 py-3 space-x-8 border border-gray-100">
          <a href="/" className="flex flex-col items-center text-kid-purple">
            <Home size={24} />
            <span className="text-xs mt-1">Home</span>
          </a>
          <a href="/learn" className="flex flex-col items-center text-kid-blue">
            <BookOpen size={24} />
            <span className="text-xs mt-1">Learn</span>
          </a>
          <a href="/dashboard" className="flex flex-col items-center text-kid-green">
            <Play size={24} />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
          <a href="/play" className="flex flex-col items-center text-kid-orange">
            <Star size={24} />
            <span className="text-xs mt-1">Play</span>
          </a>
          <a href="/about" className="flex flex-col items-center text-kid-purple">
            <Info size={24} />
            <span className="text-xs mt-1">About</span>
          </a>
        </nav>
      </div>
    </header>
  );
};

export default NavBar;
