// frontend/src/app/insights/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'; // Import Recharts components

interface TagInsight {
  tag: string;
  count: number;
}

interface DayOfWeekMood {
  day: string;
  average_mood: number;
}

interface SentimentSummary {
  total_entries: number;
  positive_percentage: number;
  negative_percentage: number;
  neutral_percentage: number;
  most_common_sentiment: string;
}

// Constants for chart colors
const PIE_COLORS = ['#82ca9d', '#ffc658', '#8884d8']; // Positive, Neutral, Negative (adjust as needed)
const BAR_COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#FF8042', '#AF19FF', '#FF0000', '#00C49F']; // Example colors for days


export default function InsightsPage() {
  const { user, isLoading, isAuthReady } = useAuth();
  const router = useRouter();

  const [moodTags, setMoodTags] = useState<TagInsight[]>([]);
  const [moodByDayOfWeek, setMoodByDayOfWeek] = useState<DayOfWeekMood[]>([]);
  const [journalSentimentSummary, setJournalSentimentSummary] = useState<SentimentSummary | null>(null);

  const [loadingTags, setLoadingTags] = useState(true);
  const [loadingMoodByDay, setLoadingMoodByDay] = useState(true);
  const [loadingSentimentSummary, setLoadingSentimentSummary] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthReady) {
      return; // Wait for authentication status to be ready
    }
    if (!user) {
      router.push('/login'); // Redirect if not authenticated
      return;
    }
    // User is authenticated and auth is ready, fetch insights
    fetchInsights();
  }, [user, isAuthReady, router]);

  const fetchInsights = async () => {
    setError(null);

    // Fetch Mood Tags
    setLoadingTags(true);
    try {
      const response = await apiClient.get<TagInsight[]>('/insights/mood/tags');
      setMoodTags(response.data);
    } catch (err) {
      console.error('Failed to fetch mood tags:', err);
      setError('Failed to load mood tag insights.');
    } finally {
      setLoadingTags(false);
    }

    // Fetch Mood by Day of Week
    setLoadingMoodByDay(true);
    try {
      const response = await apiClient.get<DayOfWeekMood[]>('/insights/mood/avg-by-day');
      setMoodByDayOfWeek(response.data);
    } catch (err) {
      console.error('Failed to fetch mood by day of week:', err);
      setError('Failed to load mood by day insights.');
    } finally {
      setLoadingMoodByDay(false);
    }

    // Fetch Journal Sentiment Summary
    setLoadingSentimentSummary(true);
    try {
      const response = await apiClient.get<SentimentSummary>('/insights/journal/sentiment-summary');
      setJournalSentimentSummary(response.data);
    } catch (err) {
      console.error('Failed to fetch journal sentiment summary:', err);
      setError('Failed to load journal sentiment summary.');
    } finally {
      setLoadingSentimentSummary(false);
    }
  };

  if (!isAuthReady) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  const sentimentData = journalSentimentSummary ? [
    { name: 'Positive', value: journalSentimentSummary.positive_percentage, color: PIE_COLORS[0] },
    { name: 'Neutral', value: journalSentimentSummary.neutral_percentage, color: PIE_COLORS[1] },
    { name: 'Negative', value: journalSentimentSummary.negative_percentage, color: PIE_COLORS[2] },
  ] : [];


  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8 pt-20">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-8 text-center text-indigo-800 dark:text-indigo-300">
          Your Personal Insights
        </h1>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Mood Tags Insight */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-blue-700 dark:text-blue-200">Most Frequent Mood Tags</h2>
            {loadingTags ? (
              <p>Loading tags...</p>
            ) : moodTags.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">No tags logged yet. Log some moods with tags!</p>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {moodTags.map((item, index) => (
                  <li key={index} className="text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-blue-600 dark:text-blue-300">{item.tag}</span>: {item.count} times
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Average Mood by Day of Week Chart */}
          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <h2 className="text-2xl font-semibold mb-4 text-green-700 dark:text-green-200">Average Mood by Day of Week</h2>
            {loadingMoodByDay ? (
              <p>Loading data...</p>
            ) : moodByDayOfWeek.length === 0 ? (
              <p className="text-gray-600 dark:text-gray-400">Not enough mood data to show daily averages. Log more moods!</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={moodByDayOfWeek}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis domain={[0, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip formatter={(value: number) => [`Avg. Mood: ${value.toFixed(1)}`, 'Mood']} />
                  <Bar dataKey="average_mood" fill="#8884d8">
                    {moodByDayOfWeek.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Journal Sentiment Summary */}
        <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200 text-center">Journal Sentiment Distribution</h2>
          {loadingSentimentSummary ? (
            <p className="text-center">Loading sentiment data...</p>
          ) : journalSentimentSummary && journalSentimentSummary.total_entries > 0 ? (
            <div className="flex flex-col md:flex-row items-center justify-center">
              <ResponsiveContainer width="100%" height={250} className="md:w-1/2">
                <PieChart>
                  <Pie
                    data={sentimentData.filter(d => d.value > 0)} // Only show slices with actual percentage
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value.toFixed(1)}%`, 'Share']}/>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 md:mt-0 md:ml-8 text-gray-700 dark:text-gray-300 md:w-1/2 text-center md:text-left">
                <p className="text-lg">Total Entries Analyzed: <span className="font-semibold">{journalSentimentSummary.total_entries}</span></p>
                <p>Most Common Sentiment: <span className="font-semibold">{journalSentimentSummary.most_common_sentiment}</span></p>
                <ul className="mt-2 space-y-1">
                  <li>Positive: <span className="font-semibold">{journalSentimentSummary.positive_percentage}%</span></li>
                  <li>Neutral: <span className="font-semibold">{journalSentimentSummary.neutral_percentage}%</span></li>
                  <li>Negative: <span className="font-semibold">{journalSentimentSummary.negative_percentage}%</span></li>
                </ul>
              </div>
            </div>
          ) : (
            <p className="text-center text-gray-600 dark:text-gray-400">No journal entries with sentiment data yet. Write some entries!</p>
          )}
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