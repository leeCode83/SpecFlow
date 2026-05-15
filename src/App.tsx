import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from 'sonner';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute';
import { ProtectedLayout } from '@/components/routing/ProtectedLayout';
import { AuthCallback } from '@/components/routing/AuthCallback';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { SpecDetail } from './components/SpecDetail';
import { CreateProject } from './components/CreateProject';
import { IdeationPage } from './components/IdeationPage';
import { AllProjects } from './components/AllProjects';
import { Auth } from './components/Auth';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}

function SupabaseGate({ children }: { children: React.ReactNode }) {
  const { configured, checkConfigured } = useAuth();

  if (!configured) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex p-4 bg-orange-500/10 rounded-full">
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Supabase Required</h1>
          <p className="text-slate-400">
            Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in the Secrets panel to use IdeaFrame MVP.
          </p>
          <div className="p-4 bg-slate-800 rounded-lg text-left text-xs font-mono overflow-auto">
            <p># Example .env</p>
            <p>VITE_SUPABASE_URL=&quot;https://your-proj.supabase.co&quot;</p>
            <p>VITE_SUPABASE_ANON_KEY=&quot;your-anon-key&quot;</p>
          </div>
          <Button variant="outline" className="w-full" onClick={checkConfigured}>
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

function AppShell() {
  return (
    <SupabaseGate>
      <TooltipProvider>
        <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30">
          <Toaster position="top-right" theme="dark" />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/ideation" element={<IdeationPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<ProtectedLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/projects" element={<AllProjects />} />
                <Route path="/projects/new" element={<CreateProject />} />
                <Route path="/projects/:projectId" element={<Workspace />} />
                <Route path="/projects/:projectId/spec/:specId" element={<SpecDetail />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </TooltipProvider>
    </SupabaseGate>
  );
}
