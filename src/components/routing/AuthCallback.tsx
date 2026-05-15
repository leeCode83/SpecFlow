import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase/supabase';

export function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      navigate('/auth', { replace: true });
      return;
    }

    const params = new URLSearchParams(hash.slice(1));
    const access_token = params.get('access_token');
    const refresh_token = params.get('refresh_token');

    if (!access_token || !refresh_token) {
      navigate('/auth', { replace: true });
      return;
    }

    supabase.auth.setSession({ access_token, refresh_token })
      .then(({ error }) => {
        if (error) throw error;
        if (window.opener) {
          window.opener.postMessage({ type: 'github-oauth-complete' }, window.location.origin);
          setTimeout(() => window.close(), 500);
        } else {
          navigate('/dashboard', { replace: true });
        }
      })
      .catch(() => {
        navigate('/auth', { replace: true });
      });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: '#0f172a',
          color: '#38bdf8',
          fontFamily: 'sans-serif',
          fontSize: '18px',
        }}
      >
        <span>Connected! Redirecting...</span>
      </div>
    </div>
  );
}
