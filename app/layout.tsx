import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { MotionProvider } from '@/lib/MotionContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  title: 'SherkByte | IT Services and Consulting',
  description:
    'End-to-end IT solutions: infrastructure installs, cloud architecture, data analytics, AI integration, and quality assurance.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased" style={{ fontFamily: 'var(--font-inter), system-ui, sans-serif' }}>
        <MotionProvider>{children}</MotionProvider>
      </body>
    </html>
  );
}
