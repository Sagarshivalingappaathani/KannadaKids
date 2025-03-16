// This is a server component
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { kannadaAlphabet } from '@/lib/alphabetData';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import LetterLesson from '@/components/LetterLesson';
import { Loader2 } from 'lucide-react';


export default function LetterPage() {
  const params = useParams();
  const letterId = params?.id as string;

  // Render the client component
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="pt-20 pb-16">
        <LetterContent letterId={letterId} />
      </main>
      <Footer />
    </div>
  );
}

// Client component for letter content
function LetterContent({ letterId }: { letterId: string }) {
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundLetter = kannadaAlphabet.find(l => l.id === letterId);
    setLetter(foundLetter || null);
    setLoading(false);
  }, [letterId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-kid-purple" />
      </div>
    );
  }

  if (!letter) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Letter Not Found</h1>
          <p className="text-gray-600">The letter you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return <LetterLesson letter={letter} />;
}
