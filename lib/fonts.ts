
import { Nunito, Baloo_2 } from 'next/font/google';

export const nunito = Nunito({
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

export const baloo = Baloo_2({
  subsets: ['latin'],
  variable: '--font-baloo',
  display: 'swap',
  weight: ['400', '500', '600', '700', '800'],
});
