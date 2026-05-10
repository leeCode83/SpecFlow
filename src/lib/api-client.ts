import { supabase } from "./supabase/supabase";

export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  } as Record<string, string>;

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return fetch(url, {
    ...options,
    headers,
  });
};
