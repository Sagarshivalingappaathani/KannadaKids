
'use client';

import { useEffect } from 'react';
import { LoginForm } from '@/components/AuthForms';
import { useAuth } from '@/lib/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LoginPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (user && !isLoading) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-md">
        <div className="mb-8 text-center">
          <Link href="/">
            <div className="inline-flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-kid-purple to-kid-blue flex items-center justify-center shadow-md">
                <span className="text-2xl font-baloo font-bold text-white">ಕ</span>
              </div>
              <h1 className="ml-3 text-2xl font-baloo font-bold bg-clip-text text-transparent bg-gradient-to-r from-kid-purple to-kid-blue">
                KannadaKids
              </h1>
            </div>
          </Link>
        </div>
        
        <LoginForm />
        
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/register" className="font-medium text-kid-purple hover:text-kid-purple/80">
              Sign up
            </Link>
          </p>
        </div>
        
        <div className="mt-4 text-center">
          <Link href="/" className="inline-block">
            <Button variant="ghost">
              Return to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
