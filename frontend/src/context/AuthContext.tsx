// frontend/src/context/AuthContext.tsx
'use client'; // This directive tells Next.js to treat this as a Client Component

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react'; // <-- ADD useCallback
import axios from 'axios';
import { useRouter } from 'next/navigation'; // <-- Import useRouter
import apiClient, { setupInterceptors } from '@/lib/api'; // <-- IMPORT setupInterceptors
import { User, UserLogin, UserCreate, Token, JournalStreak } from '@/types'; // <-- IMPORT JournalStreak

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthReady: boolean; // <-- NEW: Flag to indicate initial auth check is complete
  login: (credentials: UserLogin) => Promise<User | null>;
  register: (userData: UserCreate) => Promise<User | null>;
  logout: (isSessionExpired?: boolean) => void;
  journalStreak: number | null;
  refreshUser: () => Promise<void>;
  authError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [journalStreak, setJournalStreak] = useState<number | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false); // <-- NEW: Initial value is false
  const router = useRouter();

  // Memoize logout function to prevent unnecessary re-creations (for useEffect dependency)
  const logout = useCallback((isSessionExpired: boolean = false) => {
    console.log('LOGOUT: Function called. isSessionExpired:', isSessionExpired);
    setUser(null);
    setToken(null);
    setJournalStreak(null);
    localStorage.removeItem('access_token');
    if (isSessionExpired) {
      setAuthError('Your session has expired. Please log in again.');
    } else {
      setAuthError(null);
    }
    setIsLoading(false);
    setIsAuthReady(true);
    console.log('LOGOUT: Redirecting to login...');
    router.push('/login');
    console.log('LOGOUT: router.push("/login") called.');
  }, [router]); // logout depends on router

  // Set up Axios interceptors when token or logout function changes
  useEffect(() => {
    console.log('AUTH_CONTEXT: Setting up interceptors with token:', token ? 'present' : 'null');
    setupInterceptors(token, logout);
  }, [token, logout]); // Re-run if token or logout function changes

  // Memoize fetchUserDataAndStreak to prevent infinite loops from its dependency in useEffect
  const fetchUserDataAndStreak = useCallback(async (accessToken: string) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      // Fetch user data - use explicit Authorization header to avoid interceptor timing issues
      const userResponse = await apiClient.get<User>('/auth/users/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setUser(userResponse.data);

      // Fetch journal streak - use explicit Authorization header to avoid interceptor timing issues
      const streakResponse = await apiClient.get<JournalStreak>('/journal/streak/', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      setJournalStreak(streakResponse.data.streak);

    } catch (error) {
      console.error('FETCH: Failed to fetch user data or streak:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        setAuthError('Your session has expired. Please log in again.');
        logout(true);
        console.log('FETCH: Calling logout(true) due to 401.');
      } else {
        setAuthError('An authentication error occurred. Please try again.');
        logout(false);
        console.log('FETCH: Calling generic logout.');
      }
    } finally {
      setIsLoading(false);
      setIsAuthReady(true); // <-- Set ready after initial fetch completes (success or fail)
    }
  }, [logout]); // logout is a dependency

  useEffect(() => {
    const storedToken = localStorage.getItem('access_token');
    if (storedToken) {
      setToken(storedToken);
      fetchUserDataAndStreak(storedToken);
    } else {
      setIsLoading(false);
      setIsAuthReady(true); // <-- Set ready if no token found initially
    }
  }, [fetchUserDataAndStreak]);


  const login = useCallback(async (credentials: UserLogin): Promise<User | null> => {
    console.log('LOGIN: Starting login process for email:', credentials.email);
    setIsLoading(true);
    setAuthError(null);
    setIsAuthReady(false); // Set to false while logging in
    try {
      const formBody = new URLSearchParams();
      formBody.append('username', credentials.email);
      formBody.append('password', credentials.password);

      console.log('LOGIN: Sending token request...');
      const tokenResponse = await apiClient.post<Token>('/auth/token', formBody.toString(), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const { access_token } = tokenResponse.data;
      console.log('LOGIN: Got token, saving to localStorage and state...');
      localStorage.setItem('access_token', access_token);
      setToken(access_token);
      
      console.log('LOGIN: Fetching user data and streak...');
      await fetchUserDataAndStreak(access_token);
      
      // Return the user data that was just fetched, not the stale user state
      console.log('LOGIN: Getting fresh user data...');
      const userResponse = await apiClient.get<User>('/auth/users/me', {
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      });
      console.log('LOGIN: Login successful, returning user data');
      return userResponse.data;
    } catch (error: unknown) {
      console.error('LOGIN: Login failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        setAuthError(error.response.data.detail || 'Login failed. Please check your credentials.');
      } else {
        setAuthError('An unexpected error occurred during login.');
      }
      setUser(null);
      setToken(null);
      setJournalStreak(null);
      localStorage.removeItem('access_token');
      throw error;
    } finally {
      setIsLoading(false);
      setIsAuthReady(true); // Set ready after login attempt completes
      console.log('LOGIN: Login process completed');
    }
  }, [fetchUserDataAndStreak]); // Remove user from dependencies

  const register = useCallback(async (userData: UserCreate): Promise<User | null> => {
    setIsLoading(true);
    setAuthError(null);
    setIsAuthReady(false); // Set to false while registering
    try {
      const response = await apiClient.post<User>('/auth/register', userData);
      await login({ email: userData.email, password: userData.password });
      return response.data;
    } catch (error: unknown) {
      console.error('Registration failed:', error);
      if (axios.isAxiosError(error) && error.response) {
        setAuthError(error.response.data.detail || 'Registration failed.');
      } else {
        setAuthError('An unexpected error occurred during registration.');
      }
      setUser(null);
      setToken(null);
      setJournalStreak(null);
      localStorage.removeItem('access_token');
      throw error;
    } finally {
      setIsLoading(false);
      setIsAuthReady(true); // Set ready after register attempt completes
    }
  }, [login]); // Dependency for register

  const refreshUser = useCallback(async () => {
    if (!token) {
      setIsAuthReady(true); // If no token, ready to redirect
      return;
    }
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await apiClient.get<User>('/auth/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(response.data);
    } catch (error) {
      console.error('REFRESH: Failed to refresh user data:', error);
      if (axios.isAxiosError(error) && error.response && error.response.status === 401) {
        setAuthError('Your session has expired. Please log in again.');
        logout(true);
        console.log('REFRESH: Calling logout(true) due to 401.');
      } else {
        setAuthError('Failed to refresh profile. Please try again.');
        logout(false);
        console.log('REFRESH: Calling generic logout.');
      }
    } finally {
      setIsLoading(false);
      // setIsAuthReady(true); // No need to set here, only in initial useEffect
    }
  }, [token, logout]); // Dependencies for refreshUser

  const value = { user, token, isLoading, isAuthReady, login, register, logout, journalStreak, refreshUser, authError };

  return (
    <AuthContext.Provider value={value}>
      {/* Only show loading if not ready and still loading */}
      {isLoading && !isAuthReady ? (
        <div className="fixed inset-0 bg-gray-100 dark:bg-gray-900 bg-opacity-75 dark:bg-opacity-75 flex items-center justify-center z-50 text-gray-800 dark:text-gray-200">
          <p>Loading user session...</p>
        </div>
      ) : null}
      {authError && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white p-3 text-center z-50">
          {authError}
        </div>
      )}
      {children}
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