import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
);

export interface NoteRow {
  step_id: string;
  content: string;
  updated_at: string;
}

export interface FeedbackRow {
  id: string;
  step_id: string;
  author: string;
  content: string;
  created_at: string;
}
