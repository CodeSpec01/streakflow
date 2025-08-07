import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'StreakFlow - Track Your Daily Activities',
  description: 'Visualize your consistency, build lasting habits, and achieve your goals through beautiful heatmaps and insightful statistics.',
};

declare global {
  namespace NodeJS {
    interface Global {
      mongoose: {
        conn: any;
        promise: any;
      };
    }
  }

  var mongoose: {
    conn: any;
    promise: any;
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}