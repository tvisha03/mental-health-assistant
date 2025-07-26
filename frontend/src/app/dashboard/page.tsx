// frontend/src/app/dashboard/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading dashboard...</div>;
  }

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Welcome, {user.email}!</h1>
        <p className="text-gray-700 text-lg mb-8 text-center">
          This is your personal dashboard for the Mental Health & Self-Help Assistant.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-blue-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-blue-700">Chat with AI</h2>
            <p className="text-gray-600 mb-4">Get instant support and information.</p>
            <Link href="/chat" className="text-blue-500 hover:underline font-medium">
              Go to Chat
            </Link>
          </div>

          <div className="bg-green-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-green-700">Mood Tracker</h2>
            <p className="text-gray-600 mb-4">Log your daily mood and see trends.</p>
            <Link href="/mood" className="text-green-500 hover:underline font-medium">
              Track Mood
            </Link>
          </div>

          <div className="bg-purple-50 p-6 rounded-lg shadow-sm">
            <h2 className="text-xl font-semibold mb-3 text-purple-700">Journaling</h2>
            <p className="text-gray-600 mb-4">Write down your thoughts and feelings securely.</p>
            <Link href="/journal" className="text-purple-500 hover:underline font-medium">
              Open Journal
            </Link>
          </div>

          {/* Add more feature links here */}
        </div>

        <div className="mt-10 text-center">
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-6 rounded focus:outline-none focus:shadow-outline"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}