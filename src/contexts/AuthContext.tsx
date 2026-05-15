import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/supabase';
import type { User } from '@supabase/supabase-js';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  configured: boolean;
  checkConfigured: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  configured: false,
  checkConfigured: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

  return (
    <AuthContext.Provider value={{ user, loading, configured, checkConfigured: () => setConfigured(isSupabaseConfigured()) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
