// frontend/src/app/journal/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import apiClient from '@/lib/api';
import { JournalEntry, JournalEntryCreate } from '@/types';
import Link from 'next/link';

import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';

const SENTIMENT_EMOJIS: { [key: string]: string } = {
  'Positive': '😊',
  'Negative': '😞',
  'Neutral': '😐',
};

const SENTIMENT_COLORS: { [key: string]: string } = {
  'Positive': 'text-green-600 dark:text-green-300',
  'Negative': 'text-red-600 dark:text-red-300',
  'Neutral': 'text-gray-600 dark:text-gray-400',
};




export default function JournalPage() {
  // Calendar streak state and logic
  const [calendarDate, setCalendarDate] = useState<Date>(new Date());
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const journalDates = useMemo(() => {
    return new Set(journalEntries.map((entry: JournalEntry) => new Date(entry.timestamp).toISOString().split('T')[0]));
  }, [journalEntries]);
  const { user, isLoading, isAuthReady, token } = useAuth(); // <-- Get `token` as well
  const router = useRouter();
  const [title, setTitle] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEntryId, setEditingEntryId] = useState<number | null>(null);

  // --- New states for search/filter ---
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  // --- End new states ---

  useEffect(() => {
    // 1. If auth check is ready AND user is NOT authenticated, redirect
    if (isAuthReady && !user) {
      console.log('JOURNAL_PAGE_EFFECT: Not authenticated, redirecting to login.');
      router.push('/login');
      return; // IMPORTANT: Exit early after redirect
    }

    // 2. If auth check is ready AND user IS authenticated AND we have a token, fetch data
    // Also, ensure `user` is not null before attempting fetches
    if (isAuthReady && user && token) { // <-- Only fetch if user and token are present
      console.log('JOURNAL_PAGE_EFFECT: User authenticated, fetching journal data.');
      fetchJournalEntries();
    }
    // The empty else-if (isLoading && !user) path is now covered by `!isAuthReady` initial render.
  }, [user, isAuthReady, token, router]); // <-- Add `token` to dependencies

  const fetchJournalEntries = async () => {
    setLoadingEntries(true);
    setError(null);
    try {
      const response = await apiClient.get<JournalEntry[]>('/journal');
      setJournalEntries(response.data);
    } catch (err) {
      console.error('Failed to fetch journal entries:', err);
      setError('Failed to load journal entries. Please try again.');
    } finally {
      setLoadingEntries(false);
    }
  };

  const handleJournalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Journal content cannot be empty.');
      return;
    }

    try {
      if (editingEntryId) {
        await apiClient.put(`/journal/${editingEntryId}`, { title: title || null, content });
        setEditingEntryId(null);
      } else {
        const newEntry: JournalEntryCreate = { title: title || null, content };
        await apiClient.post<JournalEntry>('/journal', newEntry);
      }
      setTitle('');
      setContent('');
      fetchJournalEntries();
    } catch (err) {
      console.error('Failed to save journal entry:', err);
      setError('Failed to save journal entry. Please try again.');
    }
  };

  const handleEditClick = (entry: JournalEntry) => {
    setEditingEntryId(entry.id);
    setTitle(entry.title || '');
    setContent(entry.content);
  };

  const handleDeleteClick = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this journal entry?')) {
      try {
        await apiClient.delete(`/journal/${id}`);
        fetchJournalEntries();
      } catch (err) {
        console.error('Failed to delete journal entry:', err);
        setError('Failed to delete entry. Please try again.');
      }
    }
  };

  // --- Filtered entries logic ---
  const filteredEntries = useMemo(() => {
    let filtered = journalEntries;

    // Filter by search term
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (entry) =>
          (entry.title && entry.title.toLowerCase().includes(lowerCaseSearchTerm)) ||
          entry.content.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    // Filter by date range
    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter((entry) => new Date(entry.timestamp) >= start);
    }
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include full end day
      filtered = filtered.filter((entry) => new Date(entry.timestamp) <= end);
    }

    return filtered;
  }, [journalEntries, searchTerm, startDate, endDate]);
  // --- End filtered entries logic ---

  // Render loading state while auth status is being determined
  if (!isAuthReady) {
    console.log('JOURNAL_PAGE_RENDER: isAuthReady is false, showing loading...');
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // If auth is ready but user is null, this component will return null,
  // and the useEffect above will handle the redirect.
  if (!user) {
    console.log('JOURNAL_PAGE_RENDER: isAuthReady true, user is null, returning null (redirect expected).');
    return null;
  }

  // Fix: tileClassName must be defined before use
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month') {
      const dateString = date.toISOString().split('T')[0];
      if (journalDates.has(dateString)) {
        return 'highlight-journal-day';
      }
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800 p-8">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold mb-6 text-center text-purple-800 dark:text-purple-300">Your Journal</h1>

        {/* Journal Entry Form */}
        <form onSubmit={handleJournalSubmit} className="mb-8 p-6 border rounded-lg bg-purple-50 dark:bg-purple-900">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200">
            {editingEntryId ? 'Edit Journal Entry' : 'New Journal Entry'}
          </h2>
          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="mb-4">
            <label htmlFor="title" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Title (Optional):
            </label>
            <input
              type="text"
              id="title"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-800 dark:border-gray-600"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Morning Thoughts, Feeling Grateful"
            />
          </div>

          <div className="mb-4">
            <label htmlFor="content" className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
              Content (Markdown supported):
            </label>
            <textarea
              id="content"
              rows={8}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 leading-tight focus:outline-none focus:shadow-outline bg-white dark:bg-gray-800 dark:border-gray-600"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write freely about your day, thoughts, feelings. Use **bold**, *italics*, - lists."
              required
            ></textarea>
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
          >
            {editingEntryId ? 'Update Entry' : 'Save Entry'}
          </button>
          {editingEntryId && (
            <button
              type="button"
              onClick={() => { setEditingEntryId(null); setTitle(''); setContent(''); }}
              className="mt-2 bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              Cancel Edit
            </button>
          )}
        </form>

        {/* Journal Calendar */}
        <div className="mb-8 p-6 border rounded-lg bg-white dark:bg-gray-700 shadow-md">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200 text-center">Journal Activity</h2>
          <Calendar
            onChange={(date) => {
              if (date instanceof Date) setCalendarDate(date);
            }}
            value={calendarDate}
            className="react-calendar-override dark:react-calendar-override-dark mx-auto"
            tileClassName={tileClassName}
          />
        </div>

        {/* Journal Entries List & Filter */}
        <div className="p-6 border rounded-lg bg-gray-50 dark:bg-gray-800">
          <h2 className="text-2xl font-semibold mb-4 text-purple-700 dark:text-purple-200">Past Entries</h2>

          {/* Search and Filter Inputs */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-gray-700 text-sm font-bold mb-2">
                Search:
              </label>
              <input
                type="text"
                id="search"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Search title or content"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="startDate" className="block text-gray-700 text-sm font-bold mb-2">
                From Date:
              </label>
              <input
                type="date"
                id="startDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-gray-700 text-sm font-bold mb-2">
                To Date:
              </label>
              <input
                type="date"
                id="endDate"
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>


          {loadingEntries ? (
            <p className="dark:text-gray-300">Loading journal entries...</p>
          ) : filteredEntries.length === 0 ? (
            <p className="text-gray-600 dark:text-gray-400">No matching journal entries found.</p>
          ) : (
            <ul className="space-y-4">
              {filteredEntries.map((entry) => (
                <li key={entry.id} className="p-4 border rounded-lg bg-white dark:bg-gray-700 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-medium text-purple-800 dark:text-purple-300">
                      {entry.title || `Entry #${entry.id}`}
                    </h3>
                    <div className="flex items-center space-x-4">
                      {/* --- ADD SENTIMENT DISPLAY HERE --- */}
                      {entry.sentiment_label && (
                        <div className="flex items-center text-sm font-semibold">
                          <span className={`mr-1 ${SENTIMENT_COLORS[entry.sentiment_label]}`}>
                            {SENTIMENT_EMOJIS[entry.sentiment_label]}
                          </span>
                          <span className={SENTIMENT_COLORS[entry.sentiment_label]}>
                            {entry.sentiment_label}
                          </span>
                        </div>
                      )}
                      {/* --- END SENTIMENT DISPLAY --- */}
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditClick(entry)}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100 text-sm font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClick(entry.id)}
                          className="text-red-500 hover:text-red-700 dark:text-red-300 dark:hover:text-red-100 text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Render Markdown content */}
                  <div className="prose max-w-none text-gray-700 dark:text-gray-300 mb-2">
                    <ReactMarkdown rehypePlugins={[rehypeRaw]}>
                      {entry.content}
                    </ReactMarkdown>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-xs text-right">
                    {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/dashboard" className="text-purple-500 hover:underline dark:text-purple-300">
            &larr; Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
