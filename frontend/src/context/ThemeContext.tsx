// frontend/src/context/ThemeContext.tsx
'use client'; // This directive tells Next.js to treat this as a Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ThemeContextType {
  theme: string;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Lazy init: read theme from localStorage once, before first render
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [mounted, setMounted] = useState(false); // New state to track if component is mounted client-side

  useEffect(() => {
    // This code only runs on the client after hydration
    setMounted(true); // Mark component as mounted
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      setTheme(storedTheme as 'light' | 'dark');
      document.documentElement.classList.toggle('dark', storedTheme === 'dark');
    } else {
      // If no theme in localStorage, apply initial light theme class
      document.documentElement.classList.remove('dark');
    }
  }, []);

  useEffect(() => {
    // This effect runs whenever 'theme' state changes (either from localStorage or toggleTheme)
    if (mounted) { // Only run if component is mounted on client
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      // Save preference to localStorage only on client
      localStorage.setItem('theme', theme);
    }
  }, [theme, mounted]); // Depend on mounted state as well

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
