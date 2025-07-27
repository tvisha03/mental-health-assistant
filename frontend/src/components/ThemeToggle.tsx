// frontend/src/components/ThemeToggle.tsx
'use client';

import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <button
      onClick={toggleTheme}
      className="fixed bottom-4 right-4 p-3 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-lg z-50 transition-colors duration-300 hover:bg-gray-300 dark:hover:bg-gray-600"
      aria-label="Toggle dark mode"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? '🌙' : '☀️'}
    </button>
  );
}
