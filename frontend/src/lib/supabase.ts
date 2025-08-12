import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Debug logging
console.log('Supabase URL exists:', !!supabaseUrl);
console.log('Supabase Anon Key exists:', !!supabaseAnonKey);
console.log('Supabase URL length:', supabaseUrl?.length);
console.log('Supabase Anon Key length:', supabaseAnonKey?.length);

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types
export type User = {
  id: string;
  email: string;
  created_at: string;
};

export type Project = {
  id: string;
  user_id: string;
  vercel_url: string;
  title: string;
  description: string;
  thumbnail_url?: string;
  media_urls?: string[];
  created_at: string;
  vote_count?: number;
  user_email?: string;
};

export type Vote = {
  id: string;
  user_id: string;
  project_id: string;
  created_at: string;
};

export type Comment = {
  id: string;
  user_id: string;
  project_id: string;
  parent_id?: string;
  content: string;
  created_at: string;
  updated_at: string;
  user_email?: string;
  replies?: Comment[];
};
