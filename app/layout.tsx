import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Wortwerk — German Practice',
  description: 'Practise German vocabulary, grammar and everyday phrases.',
  openGraph: {
    title: 'Wortwerk — German Practice',
    description: 'Build your German one question at a time.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Wortwerk — German Practice',
    description: 'Build your German one question at a time.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
