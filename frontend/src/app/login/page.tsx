// frontend/src/app/login/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation'; // For navigation
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, user, isLoading, isAuthReady, authError } = useAuth(); // <-- Add isAuthReady
  const router = useRouter();

  // Redirect if already logged in - only after auth is ready
  useEffect(() => {
    if (isAuthReady && user) {
      console.log('LOGIN_PAGE: User already authenticated, redirecting to dashboard');
      router.push('/dashboard');
    }
  }, [user, isAuthReady, router]); // Use isAuthReady instead of isLoading

  // Show loading while checking auth status
  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Don't render login form if user is already logged in
  if (user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const loggedInUser = await login({ email, password });
      if (loggedInUser) {
        console.log('LOGIN_PAGE: Login successful, redirecting to dashboard');
        router.push('/dashboard'); // Redirect on successful login
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Login</h1>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {authError && <p className="text-red-500 text-center mb-4">{authError}</p>} {/* <-- DISPLAY authError */}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-600 dark:border-gray-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Password:
            </label>
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 mb-3 leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-600 dark:border-gray-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Login
          </button>
        </form>
        <p className="text-center text-gray-600 dark:text-gray-400 text-sm mt-4">
          Don't have an account?{' '}
          <Link href="/register" className="text-blue-500 dark:text-blue-300 hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}