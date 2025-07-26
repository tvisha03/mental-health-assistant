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