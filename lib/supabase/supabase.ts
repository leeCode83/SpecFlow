import { createClient } from '@supabase/supabase-js';

const getEnv = (key: string) => {
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
    return (import.meta as any).env[key];
  }
  return '';
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

// Initialize with placeholders if missing to prevent crash, 
// the UI will handle showing the configuration warning.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);

export const isSupabaseConfigured = () => {
  return !!supabaseUrl && !!supabaseAnonKey && supabaseUrl !== 'https://placeholder.supabase.co';
};

// Types for the database tables
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string;
          mode: string;
          teammates: string[];
          refined_idea_json: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          mode: string;
          teammates?: string[];
          refined_idea_json?: any;
          created_at?: string;
        };
      };
      specs: {
        Row: {
          id: string;
          project_id: string;
          title: string;
          type: string;
          content: string;
          status: string;
          embedding: number[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          title: string;
          type: string;
          content: string;
          status?: string;
          embedding?: number[] | null;
          created_at?: string;
        };
      };
    };
  };
}
