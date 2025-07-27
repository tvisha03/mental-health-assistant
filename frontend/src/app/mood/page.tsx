// frontend/src/app/mood/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { MoodEntry, MoodEntryCreate } from '@/types';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'; // <-- Import Recharts components
import Select from 'react-select'; // <-- Import react-select

interface MoodTrendData {
  date: string;
  average_mood: number;
}

const MOOD_EMOJIS: { [key: number]: string } = {
  1: '😞', // Very Bad
  2: '😔', // Bad
  3: '😐', // Neutral
  4: '😊', // Good
  5: '😁', // Excellent
};

const MOOD_COLORS: { [key: number]: string } = {
  1: 'bg-red-100 border-red-300',
  2: 'bg-orange-100 border-orange-300',
  3: 'bg-yellow-100 border-yellow-300',
  4: 'bg-green-100 border-green-300',
  5: 'bg-blue-100 border-blue-300',
};

const TAG_OPTIONS = [ // Example tags, you might load these dynamically later
  { value: 'work', label: 'Work' },
  { value: 'stress', label: 'Stress' },
  { value: 'family', label: 'Family' },
  { value: 'friends', label: 'Friends' },
  { value: 'sleep', label: 'Sleep' },
  { value: 'exercise', label: 'Exercise' },
  { value: 'food', label: 'Food' },
  { value: 'positive', label: 'Positive' },
  { value: 'negative', label: 'Negative' },
  { value: 'health', label: 'Health' },
];


export default function MoodPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [moodValue, setMoodValue] = useState<number>(3);
  const [notes, setNotes] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<any[]>([]); // For react-select
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);
  const [moodTrends, setMoodTrends] = useState<MoodTrendData[]>([]); // State for trend data
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [loadingTrends, setLoadingTrends] = useState(true); // New loading state for trends
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      fetchMoodEntries();
      fetchMoodTrends(); // Fetch trends on load
    }
  }, [user, isLoading, router]);

  const fetchMoodEntries = async () => {
    setLoadingEntries(true);
    setError(null);
    try {
      const response = await apiClient.get<MoodEntry[]>('/mood');
      setMoodEntries(response.data);
    } catch (err) {
      console.error('Failed to fetch mood entries:', err);
      setError('Failed to load mood entries. Please try again.');
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchMoodTrends = async () => {
    setLoadingTrends(true);
    try {
      const response = await apiClient.get<MoodTrendData[]>('/mood/trends/?days=30'); // Fetch 30 days of data
      setMoodTrends(response.data);
    } catch (err) {
      console.error('Failed to fetch mood trends:', err);
      setError('Failed to load mood trends. Please try again.');
    } finally {
      setLoadingTrends(false);
    }
  };

  const handleMoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const tagsToSubmit = selectedTags.map(tag => tag.value);
      const newEntry: MoodEntryCreate = {
        mood_value: moodValue,
        notes: notes || null,
        tags: tagsToSubmit.length > 0 ? tagsToSubmit : null // Send null if no tags selected
      };
      await apiClient.post<MoodEntry>('/mood', newEntry);
      setMoodValue(3);
      setNotes('');
      setSelectedTags([]); // Reset tags input
      fetchMoodEntries(); // Refresh lists
      fetchMoodTrends(); // Refresh trends
    } catch (err) {
      console.error('Failed to create mood entry:', err);
      setError('Failed to log mood. Please try again.');
    }
  };

  const getMoodEmoji = (value: number) => MOOD_EMOJIS[value] || '�';
  const getMoodColorClass = (value: number) => MOOD_COLORS[value] || 'bg-gray-100 border-gray-300';

  if (isLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-800">Mood Tracker</h1>

        {/* Mood Logging Form */}
        <form onSubmit={handleMoodSubmit} className="mb-8 p-6 border rounded-lg bg-blue-50">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Log Your Mood</h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">How are you feeling?</label>
            <div className="flex justify-around items-center text-4xl mb-4">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMoodValue(value)}
                  className={`p-2 rounded-full transition-transform transform ${
                    moodValue === value ? 'scale-125 ring-2 ring-blue-500' : 'hover:scale-110'
                  }`}
                  aria-label={`Mood value ${value}`}
                >
                  {getMoodEmoji(value)}
                </button>
              ))}
            </div>
            <p className="text-center text-gray-600 text-sm">
              Selected Mood: {getMoodEmoji(moodValue)} (Value: {moodValue})
            </p>
          </div>

          <div className="mb-4">
            <label htmlFor="notes" className="block text-gray-700 text-sm font-bold mb-2">
              Optional Notes:
            </label>
            <textarea
              id="notes"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Feeling calm after meditation."
            ></textarea>
          </div>

          {/* Tags Input */}
          <div className="mb-6">
            <label htmlFor="tags" className="block text-gray-700 text-sm font-bold mb-2">
              Tags (Optional):
            </label>
            <Select
              id="tags"
              options={TAG_OPTIONS}
              isMulti
              value={selectedTags}
              onChange={(newValue) => setSelectedTags(newValue as any[])}
              className="basic-multi-select"
              classNamePrefix="select"
              placeholder="Select tags..."
            />
          </div>

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            Log Mood
          </button>
        </form>

        {/* Mood Trends Chart */}
        <div className="mb-8 p-6 border rounded-lg bg-white shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700 text-center">Your Mood Trends (Last 30 Days)</h2>
          {loadingTrends ? (
            <p className="text-center">Loading mood trends...</p>
          ) : moodTrends.length === 0 ? (
            <p className="text-center text-gray-600">No mood data to display trends yet. Log some moods!</p>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart
                data={moodTrends}
                margin={{
                  top: 5, right: 30, left: 20, bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                <Tooltip formatter={(value: number) => [getMoodEmoji(Math.round(value)) + ` (${value.toFixed(1)})`, 'Avg. Mood']} />
                <Line type="monotone" dataKey="average_mood" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>


        {/* Mood Entries List */}
        <div className="p-6 border rounded-lg bg-gray-50">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Your Mood History</h2>
          {loadingEntries ? (
            <p>Loading mood entries...</p>
          ) : moodEntries.length === 0 ? (
            <p className="text-gray-600">No mood entries logged yet.</p>
          ) : (
            <ul className="space-y-4">
              {moodEntries.map((entry) => (
                <li
                  key={entry.id}
                  className={`p-4 border rounded-lg bg-white flex flex-col justify-between shadow-sm ${getMoodColorClass(entry.mood_value)}`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-medium">
                      {getMoodEmoji(entry.mood_value)} Mood: {entry.mood_value}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {new Date(entry.timestamp).toLocaleString()}
                    </p>
                  </div>
                  {entry.notes && <p className="text-gray-700 text-sm italic mt-1 mb-2">"{entry.notes}"</p>}
                  {entry.tags && entry.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {entry.tags.map((tag, index) => (
                        <span key={index} className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  {/* Add delete button later if desired */}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-blue-500 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
