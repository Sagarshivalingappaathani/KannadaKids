
'use client';

import React, { useEffect, useState } from 'react';
import NavBar from './NavBar';
import Hero3D from './Hero3D';
import AlphabetCard from './AlphabetCard';
import Footer from './Footer';
import { kannadaAlphabet } from '../lib/alphabetData';
import { Button } from "../components/ui/button";
import { ArrowRight, BookOpen, Play, Star } from 'lucide-react';

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Set loaded state after a short delay to enable animations
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <NavBar />
      
      {/* Hero Section */}
      <section id="home" className="pt-16">
        <div className="container mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                <div className="inline-block bg-purple-100 text-kid-purple px-4 py-1 rounded-full text-sm font-medium mb-4">
                  Fun Learning for Kids
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
                  Learn Kannada Alphabet<br />
                  <span className="text-kid-purple">the Fun Way!</span>
                </h1>
                <p className="text-lg text-gray-600 mb-8 max-w-lg">
                  An interactive and engaging way for children aged 3-5 to learn the Kannada alphabet through play and discovery.
                </p>
                
                <div className="flex flex-wrap gap-4">
                  <Button className="btn-primary">
                    Start Learning
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="border-2 border-kid-blue text-kid-blue hover:bg-kid-blue/10">
                    Watch Demo
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="md:w-1/2">
              <div className={`transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                <Hero3D />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Kids Love Our App</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Designed specifically for young learners to make the journey of learning Kannada enjoyable and effective.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Feature 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <BookOpen className="h-8 w-8 text-kid-purple" />
              </div>
              <h3 className="text-xl font-bold mb-3">Interactive Learning</h3>
              <p className="text-gray-600">
                Engaging activities and animations that make learning the alphabet a joyful experience.
              </p>
            </div>
            
            {/* Feature 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Play className="h-8 w-8 text-kid-blue" />
              </div>
              <h3 className="text-xl font-bold mb-3">Learn Through Play</h3>
              <p className="text-gray-600">
                Games and activities designed to reinforce alphabet recognition and pronunciation.
              </p>
            </div>
            
            {/* Feature 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Star className="h-8 w-8 text-kid-green" />
              </div>
              <h3 className="text-xl font-bold mb-3">Child-Friendly Design</h3>
              <p className="text-gray-600">
                Intuitive interface with bright colors and clear navigation, perfect for young users.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Learn Section */}
      <section id="learn" className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-block bg-blue-100 text-kid-blue px-4 py-1 rounded-full text-sm font-medium mb-4">
              Start Learning
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Explore Kannada Alphabet</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Discover the beauty of Kannada letters through our interactive cards. Tap on each card to learn more!
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {kannadaAlphabet.map((letter, index) => (
              <AlphabetCard key={letter.id} letter={letter} index={index} />
            ))}
          </div>
          
          <div className="text-center mt-12">
            <Button className="btn-secondary">
              View All Letters
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="bg-gradient-to-r from-kid-purple to-kid-blue py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Ready to Start the Learning Adventure?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy children who are learning Kannada in a fun and interactive way.
          </p>
          <Button className="bg-white text-kid-purple hover:bg-gray-100 transition-colors px-8 py-6 text-lg font-bold rounded-full shadow-lg">
            Get Started for Free
          </Button>
        </div>
      </section>
      
      <Footer />
      
      {/* Add custom CSS for 3D effects that can't be directly added in Tailwind */}
      <style>
        {`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
        `}
      </style>
    </div>
  );
};

export default Index;
