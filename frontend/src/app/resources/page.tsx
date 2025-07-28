// frontend/src/app/resources/page.tsx
'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ResourcesPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading resources...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8 pt-20"> {/* Add pt-20 for header space */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-green-800 dark:text-green-300">
          Curated Resources
        </h1>
        <p className="text-gray-700 dark:text-gray-300 mb-6 text-center">
          A library of helpful articles, videos, and tools for your well-being journey.
        </p>

        <div className="text-center text-gray-500 dark:text-gray-400 my-10">
          <p className="text-lg mb-2">Content coming soon!</p>
          <p>This section will be populated with a browsable library of resources.</p>
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-500 dark:text-blue-300 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}