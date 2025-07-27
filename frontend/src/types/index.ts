// frontend/src/types/index.ts

export interface UserCreate {
  email: string;
  password: string;
}

export interface UserLogin {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  is_active: boolean;
  created_at: string; // Use string for datetime from API, convert to Date object if needed in UI
  updated_at?: string | null;
}

export interface Token {
  access_token: string;
  token_type: string;
}

export interface TokenData {
  email?: string | null;
}

// --- NEW TYPES FOR MOOD AND JOURNAL ---

export interface MoodEntryCreate {
  mood_value: number; // e.g., 1 to 5
  notes?: string | null; // Optional brief notes
  tags?: string[] | null; // Optional tags array
}

export interface MoodEntry {
  id: number;
  mood_value: number;
  notes?: string | null;
  tags?: string[] | null; // Optional tags array
  timestamp: string; // ISO 8601 string from backend
  owner_id: number;
}

export interface JournalEntryCreate {
  title?: string | null; // Optional title for the journal entry
  content: string; // The actual journal text
}

export interface JournalEntry {
  id: number;
  title?: string | null;
  content: string;
  timestamp: string; // ISO 8601 string from backend
  owner_id: number;
}

export interface GoalCreate {
  description: string;
  target_date?: string | null;
  completed?: boolean;
}

export interface Goal {
  id: number;
  description: string;
  target_date?: string | null;
  completed: boolean;
  created_at: string;
  updated_at?: string | null;
  owner_id: number;
}

// --- NEW TYPE FOR JOURNAL STREAK ---
export interface JournalStreak {
  streak: number;
}