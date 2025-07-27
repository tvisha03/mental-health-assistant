// frontend/src/context/AuthContext.tsx
'use client'; // This directive tells Next.js to treat this as a Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import apiClient from '@/lib/api'; // Use alias @/lib/api for cleaner imports
import { User, UserLogin, UserCreate, Token, JournalStreak } from '@/types'; // <-- IMPORT JournalStreak

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (credentials: UserLogin) => Promise<User | null>;
  register: (userData: UserCreate) => Promise<User | null>;
  logout: () => void;
  journalStreak: number | null; // <-- ADD journalStreak to context type
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalStreak, setJournalStreak] = useState<number | null>(null); // <-- ADD state for streak

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserDataAndStreak(storedToken); // <-- Call combined fetch function
    } else {
      setIsLoading(false); // If no token, no loading needed
    }
  }, []);

  const fetchUserDataAndStreak = async (accessToken: string) => {
    setIsLoading(true); // Keep loading true until all data is fetched
    try {
      // Fetch user data
      const userResponse = await apiClient.get<User>('/auth/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(userResponse.data);

      // Fetch journal streak
      const streakResponse = await apiClient.get<JournalStreak>('/journal/streak/', {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Ensure token is passed
        },
      });
      setJournalStreak(streakResponse.data.streak);

    } catch (error) {
      console.error('Failed to fetch user data or streak:', error);
      logout(); // Invalidate token and log out if any fetch fails
    } finally {
      setIsLoading(false);
    }
  };


  const login = async (credentials: UserLogin): Promise<User | null> => {
    setIsLoading(true);
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', credentials.email); // OAuth2 spec uses 'username' for email
      formBody.append('password', credentials.password);

      const tokenResponse = await apiClient.post<Token>('/auth/token', formBody.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded', // Important for OAuth2PasswordRequestForm
        },
      });

      const { access_token } = tokenResponse.data;
      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      await fetchUserDataAndStreak(access_token); // Fetch user data and streak after login
      return user; // Will be updated by fetchUserFromToken
    } catch (error: unknown) {
      console.error('Login failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Login error response:', error.response.data);
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      throw error; // Re-throw to handle in UI
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: UserCreate): Promise<User | null> => {
    setIsLoading(true);
    try {
      const response = await apiClient.post<User>('/auth/register', userData);
      // After successful registration, you might automatically log them in
      await login({ email: userData.email, password: userData.password });
      return response.data;
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        console.error('Registration error response:', error.response.data);
      }
      setUser(null);
      setToken(null);
      localStorage.removeItem('access_token');
      throw error; // Re-throw to handle in UI
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    // Optionally redirect to login page
    // router.push('/login'); // If using Next.js useRouter
  };

  const value = { user, token, isLoading, login, register, logout, journalStreak };

  return (
    <AuthContext.Provider value={value}>
      {isLoading ? <div>Loading user session...</div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};