'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { ReactNode } from 'react';
import Header from '@/components/Header';

const inter = Inter({ subsets: ['latin'] });

// Metadata export removed: not allowed in a 'use client' component.

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300 flex flex-col min-h-screen`}>
      <body>
        <ThemeProvider>
          <AuthProvider>
            <Header /> {/* <-- RENDER THE HEADER COMPONENT HERE */}
            <main className="flex-grow"> {/* Add flex-grow to main content area for sticky header/footer */}
              {children}
            </main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
