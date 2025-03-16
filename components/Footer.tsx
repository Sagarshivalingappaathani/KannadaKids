
'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import Link from 'next/link';

const Footer: React.FC = () => {
  return (
    <footer className="py-8 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-kid-purple to-kid-blue flex items-center justify-center">
                <span className="text-xl font-baloo font-bold text-white">ಕ</span>
              </div>
              <h2 className="ml-2 text-xl font-baloo font-bold bg-clip-text text-transparent bg-gradient-to-r from-kid-purple to-kid-blue">
                KannadaKids
              </h2>
            </div>
            <p className="mt-2 text-sm text-gray-600 max-w-md">
              Making learning the Kannada alphabet fun and engaging for children aged 3-5 years old.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-2">Learn</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Alphabet</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Sounds</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Words</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Play</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Games</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Activities</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Songs</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-2">Parents</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Resources</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Progress</Link></li>
                <li><Link href="#" className="text-gray-600 hover:text-kid-purple transition-colors">Support</Link></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-600 mb-4 md:mb-0">
            © {new Date().getFullYear()} KannadaKids. All rights reserved.
          </p>
          
          <div className="flex items-center">
            <span className="text-sm text-gray-600">Made with</span>
            <Heart size={16} className="mx-1 text-kid-pink" />
            <span className="text-sm text-gray-600">for children learning Kannada</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
