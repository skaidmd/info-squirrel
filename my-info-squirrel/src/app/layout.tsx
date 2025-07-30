import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'InfoSquirrel - ウェブページスクレイピングツール',
  description: 'ウェブページから簡単に情報を取得するためのツールです。',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="version-number">v1.0.0</div>
        {children}
      </body>
    </html>
  );
} 