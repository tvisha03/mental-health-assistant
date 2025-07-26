'use client'; // This directive tells Next.js to treat this as a Client Component

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        router.push('/dashboard'); // Redirect to dashboard if logged in
      } else {
        router.push('/login'); // Redirect to login if not logged in
      }
    }
  }, [user, isLoading, router]);

  // You can render a loading spinner or message while checking auth status
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <p className="text-gray-600">Loading...</p>
    </div>
  );
}
