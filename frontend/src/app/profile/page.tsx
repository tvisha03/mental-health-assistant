// frontend/src/app/profile/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { ChatMessage, User } from '@/types';
import Select from 'react-select'; // For multi-select tags

// Define UserProfileUpdate type locally since it's not exported from @/types
export interface UserProfileUpdate {
  full_name?: string | null;
  date_of_birth?: string | Date | null;
  gender?: string | null;
  triggers?: string[] | null;
  areas_of_focus?: string[] | null;
}

// Example options for Select components
const GENDER_OPTIONS = [
  { value: 'Male', label: 'Male' },
  { value: 'Female', label: 'Female' },
  { value: 'Non-binary', label: 'Non-binary' },
  { value: 'Prefer not to say', label: 'Prefer not to say' },
];

const COMMON_TRIGGERS = [
  { value: 'Work Stress', label: 'Work Stress' },
  { value: 'Social Gatherings', label: 'Social Gatherings' },
  { value: 'Financial Pressure', label: 'Financial Pressure' },
  { value: 'Lack of Sleep', label: 'Lack of Sleep' },
  { value: 'Conflict', label: 'Conflict' },
  { value: 'Loneliness', label: 'Loneliness' },
];

const FOCUS_AREAS = [
  { value: 'Anxiety Management', label: 'Anxiety Management' },
  { value: 'Sleep Improvement', label: 'Sleep Improvement' },
  { value: 'Stress Reduction', label: 'Stress Reduction' },
  { value: 'Self-Esteem', label: 'Self-Esteem' },
  { value: 'Emotional Regulation', label: 'Emotional Regulation' },
  { value: 'Relationship Skills', label: 'Relationship Skills' },
  { value: 'Mindfulness', label: 'Mindfulness' },
];

export default function ProfilePage() {
  const { user, isLoading, isAuthReady, refreshUser, token } = useAuth(); // <-- Get `token` as well
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState<any>(null);
  const [selectedTriggers, setSelectedTriggers] = useState<any[]>([]);
  const [selectedFocusAreas, setSelectedFocusAreas] = useState<any[]>([]);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // 1. If auth check is ready AND user is NOT authenticated, redirect
    if (isAuthReady && !user) {
      console.log('PROFILE_PAGE_EFFECT: Not authenticated, redirecting to login.');
      router.push('/login');
      return; // IMPORTANT: Exit early after redirect
    }

    // 2. If auth check is ready AND user IS authenticated AND we have a token, populate form
    // Also, ensure `user` is not null before attempting to populate form
    if (isAuthReady && user && token) { // <-- Only populate if user and token are present
      console.log('PROFILE_PAGE_EFFECT: User authenticated, populating profile form.');
      setFullName(user.full_name || '');
      setDateOfBirth(user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '');
      setGender(GENDER_OPTIONS.find(opt => opt.value === user.gender) || null);
      setSelectedTriggers(user.triggers?.map((t: string) => ({ value: t, label: t })) || []);
      setSelectedFocusAreas(user.areas_of_focus?.map((a: string) => ({ value: a, label: a })) || []);
    }
  }, [user, isAuthReady, token, router]); // <-- Add `token` to dependencies

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSaveStatus(null);

    const updateData: UserProfileUpdate = {
      full_name: fullName || null,
      date_of_birth: dateOfBirth ? new Date(dateOfBirth) : null,
      gender: gender ? gender.value : null,
      triggers: selectedTriggers.map(t => t.value) || null,
      areas_of_focus: selectedFocusAreas.map(a => a.value) || null,
    };

    try {
      if (user) {
        await apiClient.put(`/user-profile/me`, updateData);
        await refreshUser(); // <-- CALL refreshUser() after successful update
        setSaveStatus('Profile updated successfully!');
      }
    } catch (err) {
      console.error('Failed to update profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 3000); // Clear status message after 3 seconds
    }
  };

  // Render loading state while auth status is being determined
  if (!isAuthReady) {
    console.log('PROFILE_PAGE_RENDER: isAuthReady is false, showing loading...');
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If auth is ready but user is null, this component will return null,
  // and the useEffect above will handle the redirect.
  if (!user) {
    console.log('PROFILE_PAGE_RENDER: isAuthReady true, user is null, returning null (redirect expected).');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8 pt-20"> {/* Add pt-20 for header space */}
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 dark:text-blue-300">
          Profile Settings
        </h1>

        {saveStatus && <p className="text-green-500 text-center mb-4">{saveStatus}</p>}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Email (read-only):
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 cursor-not-allowed"
              disabled
            />
          </div>

          <div>
            <label htmlFor="fullName" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Full Name:
            </label>
            <input
              type="text"
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 dark:border-gray-500"
              placeholder="Your full name"
            />
          </div>

          <div>
            <label htmlFor="dateOfBirth" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Date of Birth:
            </label>
            <input
              type="date"
              id="dateOfBirth"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 dark:border-gray-500"
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Gender:
            </label>
            <Select
              id="gender"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={(newValue) => setGender(newValue)}
              className="basic-single-select dark:text-gray-900" // Ensure text is visible in dark mode
              classNamePrefix="select"
              placeholder="Select gender..."
            />
          </div>

          <div>
            <label htmlFor="triggers" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Common Triggers (e.g., 'Work Stress', 'Loneliness'):
            </label>
            <Select
              id="triggers"
              options={COMMON_TRIGGERS}
              isMulti
              value={selectedTriggers}
              onChange={(newValue) => setSelectedTriggers(newValue as any[])}
              className="basic-multi-select dark:text-gray-900"
              classNamePrefix="select"
              placeholder="Select or type triggers..."
            />
          </div>

          <div>
            <label htmlFor="focusAreas" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Areas of Focus (e.g., 'Anxiety Management', 'Sleep Improvement'):
            </label>
            <Select
              id="focusAreas"
              options={FOCUS_AREAS}
              isMulti
              value={selectedFocusAreas}
              onChange={(newValue) => setSelectedFocusAreas(newValue as any[])}
              className="basic-multi-select dark:text-gray-900"
              classNamePrefix="select"
              placeholder="Select or type areas..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded focus:outline-none focus:shadow-outline w-full transition-colors duration-200"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-500 dark:text-blue-300 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}