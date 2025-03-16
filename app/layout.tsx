
import '@/styles/globals.css';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { baloo, nunito } from '@/lib/fonts';
import { AuthProvider } from '@/lib/AuthContext';

export const metadata = {
  title: 'KannadaKids - Learn Kannada Alphabet',
  description: 'An interactive and engaging way for children aged 3-5 to learn the Kannada alphabet through play and discovery.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            {children}
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
