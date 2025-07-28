// frontend/src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, isAuthReady, logout, journalStreak, token } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // 1. If auth check is ready AND user is NOT authenticated, redirect
    if (isAuthReady && !user) {
      console.log('DASHBOARD_EFFECT: Not authenticated, redirecting to login.');
      router.push('/login');
      return; // IMPORTANT: Exit early after redirect
    }

    // 2. If auth check is ready AND user IS authenticated AND we have a token, data is already available
    // No additional data fetching needed for dashboard
    if (isAuthReady && user && token) {
      console.log('DASHBOARD_EFFECT: User authenticated, dashboard ready.');
    }
  }, [user, isAuthReady, token, router]);

  // Render loading state while auth status is being determined
  if (!isAuthReady) {
    console.log('DASHBOARD_RENDER: isAuthReady is false, showing loading...');
    return <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100">Loading dashboard...</div>;
  }

  // If auth is ready but user is null, this component will return null,
  // and the useEffect above will handle the redirect.
  if (!user) {
    console.log('DASHBOARD_RENDER: isAuthReady true, user is null, returning null (redirect expected).');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8">
      <div className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-900 dark:text-gray-100">Welcome, {user.email}!</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg mb-8 text-center">
          This is your personal dashboard for the Mental Health & Self-Help Assistant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <Link href="/chat" className="text-blue-500 dark:text-blue-300 hover:underline font-medium">
              Go to Chat
            </Link>
          </div>

          <div className="bg-green-50 dark:bg-green-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-green-700 dark:text-green-200">Mood Tracker</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Log your daily mood and see trends.</p>
            <Link href="/mood" className="text-green-500 dark:text-green-300 hover:underline font-medium">
              Track Mood
            </Link>
          </div>

          <div className="bg-purple-50 dark:bg-purple-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-purple-700 dark:text-purple-200">Journaling</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Write down your thoughts and feelings securely.</p>
            <Link href="/journal" className="text-purple-500 dark:text-purple-300 hover:underline font-medium">
              Open Journal
            </Link>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-indigo-700 dark:text-indigo-200">Your Insights</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">Discover patterns in your mood and journal data.</p>
            <Link href="/insights" className="text-indigo-500 dark:text-indigo-300 hover:underline font-medium">
              View Insights
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={() => logout()}
            className="bg-red-500 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-800 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline transition-colors duration-200"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}