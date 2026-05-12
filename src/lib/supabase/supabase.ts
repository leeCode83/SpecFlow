import { createClient } from '@supabase/supabase-js';
import type { IdeaFeedback } from '../types';

/**
 * Supabase client and database schema definitions.
 */

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

// Server-side admin client (bypasses RLS)
const supabaseUrlServer = process.env.SUPABASE_URL || supabaseUrl;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrlServer, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })
  : supabase; // Fallback to anon client if service key not available

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
          refined_idea_json: IdeaFeedback | null; // AI-generated feedback in JSON format
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          description: string;
          mode: string;
          teammates?: string[];
          refined_idea_json?: IdeaFeedback | null;
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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
        };
      };
      project_invitations: {
        Row: {
          id: string;
          project_id: string;
          email: string;
          token: string;
          status: 'pending' | 'accepted' | 'declined' | 'expired';
          expires_at: string;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          email: string;
          token?: string;
          status?: 'pending' | 'accepted' | 'declined' | 'expired';
          expires_at: string;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
