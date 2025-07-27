// frontend/src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, logout, journalStreak } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Welcome, {user.email}!</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 text-center">
          This is your personal dashboard for the Mental Health & Self-Help Assistant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-yellow-50 dark:bg-yellow-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-yellow-700 dark:text-yellow-200">Journal Streak</h2>
            <div className="text-3xl font-bold text-yellow-800 dark:text-yellow-100 mb-2">
              {journalStreak !== null ? journalStreak : '0'}
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              {journalStreak !== null && journalStreak > 0 
                ? `${journalStreak} day${journalStreak !== 1 ? 's' : ''} in a row!` 
                : 'Start your journal streak today!'
              }
            </p>
            <Link href="/journal" className="text-yellow-600 dark:text-yellow-300 hover:underline font-medium">
              Write Today's Entry
            </Link>
          </div>

          <div className="bg-blue-50 dark:bg-blue-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-blue-700 dark:text-blue-200">Chat with AI</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Get instant support and information.</p>
            {/* Link to Chat page (will be created later) */}
            <Link href="/chat" className="text-blue-500 dark:text-blue-300 hover:underline font-medium">
              Go to Chat
            </Link>
          </div>

          <div className="bg-green-50 dark:bg-green-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-200">Mood Tracker</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Log your daily mood and see trends.</p>
            {/* Link to Mood page */}
            <Link href="/mood" className="text-green-500 dark:text-green-300 hover:underline font-medium">
              Track Mood
            </Link>
          </div>

          <div className="bg-purple-50 dark:bg-purple-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-200">Journaling</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Write down your thoughts and feelings securely.</p>
            {/* Link to Journal page */}
            <Link href="/journal" className="text-purple-500 dark:text-purple-300 hover:underline font-medium">
              Open Journal
            </Link>
          </div>

          {/* Add more feature links here as you build them */}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}