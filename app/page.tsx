
'use client';

import Index from '../components/Index';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Index />
    </Suspense>
  );
}
