import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

if (window.opener && window.location.hash) {
  const params = new URLSearchParams(window.location.hash.slice(1));
  if (params.has('access_token')) {
    const root = document.getElementById('root')!;
    root.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;background:#0f172a;color:#38bdf8;font-family:sans-serif;font-size:18px;"><span>GitHub connected! Closing...</span></div>';
    setTimeout(() => {
      window.opener.postMessage({ type: 'github-oauth-complete' }, window.location.origin);
      window.close();
    }, 2000);
  } else {
    createRoot(document.getElementById('root')!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    );
  }
} else {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
