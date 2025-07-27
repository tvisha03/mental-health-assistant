'use client';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider, useTheme } from '@/context/ThemeContext';
import { ReactNode } from 'react';

const inter = Inter({ subsets: ['latin'] });

// Metadata export removed: not allowed in a 'use client' component.

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg z-50 transition-colors duration-300"
      aria-label="Toggle dark mode"
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <ThemeToggle />
        </ThemeProvider>
      </body>
    </html>
  );
}
