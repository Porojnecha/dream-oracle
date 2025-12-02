import type { Metadata } from 'next';
import { Manrope } from 'next/font/google';
import './globals.css';

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'DreamOracle AI',
  description: 'Український езотеричний оракул для розшифровки снів'
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="uk" className="dark">
      <body className={`${manrope.variable} font-sans bg-nocturne-gradient`}>
        {children}
      </body>
    </html>
  );
}

