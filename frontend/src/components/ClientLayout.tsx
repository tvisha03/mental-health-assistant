'use client';

import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';
import ThemeToggle from './ThemeToggle';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({ children }: ClientLayoutProps) {
  return (
    <ThemeProvider>
      <AuthProvider>
        {children}
        <ThemeToggle />
      </AuthProvider>
    </ThemeProvider>
  );
}
