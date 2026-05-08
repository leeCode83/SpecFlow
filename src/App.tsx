/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Rocket, 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { SpecDetail } from './components/SpecDetail';
import { CreateProject } from './components/CreateProject';

import { Auth } from './components/Auth';

type View = 'landing' | 'dashboard' | 'workspace' | 'spec' | 'create_project';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [configured, setConfigured] = useState(isSupabaseConfigured());

  useEffect(() => {
    if (!configured) return;
    
    // Popup flow handler: if inside popup with access_token, send to opener and close
    if (window.opener && window.location.hash.includes('access_token=')) {
      window.opener.postMessage({ 
        type: 'OAUTH_AUTH_SUCCESS', 
        hash: window.location.hash 
      }, '*');
      window.close();
      return;
    }

    const handleMessage = async (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data.hash) {
        const hashParams = new URLSearchParams(event.data.hash.substring(1));
        const access_token = hashParams.get('access_token');
        const refresh_token = hashParams.get('refresh_token');
        
        if (access_token && refresh_token) {
          const { data, error } = await supabase.auth.setSession({
            access_token,
            refresh_token
          });
          if (!error && data.session) {
            setUser(data.session.user);
            if (view === 'landing') setView('dashboard');
          }
        }
      }
    };
    window.addEventListener('message', handleMessage);

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (window.opener) {
          window.close();
        } else if (view === 'landing') {
          setView('dashboard');
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (window.opener) {
          window.close();
        } else if (view === 'landing') {
          setView('dashboard');
        }
      } else if (!session?.user) {
        setView('landing');
      }
    });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, [configured, view]);

  const handleCreateProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('workspace');
  };

  const handleSelectProject = (projectId: string) => {
    setSelectedProjectId(projectId);
    setView('workspace');
  };

  const handleSelectSpec = (specId: string) => {
    setSelectedSpecId(specId);
    setView('spec');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('landing');
  };

  if (!configured) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center space-y-6">
          <div className="inline-flex p-4 bg-orange-500/10 rounded-full">
            <Settings className="w-8 h-8 text-orange-500" />
          </div>
          <h1 className="text-2xl font-bold">Supabase Required</h1>
          <p className="text-slate-400">
            Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in the Secrets panel to use SpecFlow MVP.
          </p>
          <div className="p-4 bg-slate-800 rounded-lg text-left text-xs font-mono overflow-auto">
            <p># Example .env</p>
            <p>VITE_SUPABASE_URL="https://your-proj.supabase.co"</p>
            <p>VITE_SUPABASE_ANON_KEY="your-anon-key"</p>
          </div>
          <Button variant="outline" className="w-full" onClick={() => setConfigured(isSupabaseConfigured())}>
            Check Again
          </Button>
        </div>
      </div>
    );
  }

  // Auth Gate
  if (!user) {
    return <Auth />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30">
        <Toaster position="top-right" theme="dark" />
        
        {/* Sidebar / Navigation */}
        {view !== 'landing' && (
          <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50 flex flex-col">
            <div className="p-6 flex items-center gap-3">
              <div className="bg-orange-500 rounded-lg p-1.5">
                <Rocket className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold tracking-tight text-xl">SpecFlow</span>
            </div>

            <nav className="flex-1 px-4 space-y-2 py-4">
              <NavItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Dashboard" 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')} 
              />
              <NavItem 
                icon={<Plus className="w-4 h-4" />} 
                label="New Project" 
                active={view === 'create_project'}
                onClick={() => setView('create_project')} 
              />
            </nav>

            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/50">
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold">
                  {user?.email?.[0].toUpperCase() ?? 'U'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{user?.email}</p>
                  <p className="text-[10px] text-slate-500">Free Tier</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </aside>
        )}

        <main className={view === 'landing' ? "" : "pl-64"}>
          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LandingPage onCreateProject={handleCreateProject} />
              </motion.div>
            )}
            {view === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Dashboard 
                  onSelectProject={handleSelectProject} 
                  onCreateProject={() => setView('create_project')}
                />
              </motion.div>
            )}
            {view === 'create_project' && (
              <motion.div
                key="create_project"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <CreateProject 
                  onBack={() => setView('dashboard')}
                  onCreateProject={handleCreateProject}
                  onStartIdeation={() => setView('landing')}
                />
              </motion.div>
            )}
            {view === 'workspace' && selectedProjectId && (
              <motion.div
                key="workspace"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Workspace 
                  projectId={selectedProjectId} 
                  onSelectSpec={handleSelectSpec}
                  onBack={() => setView('dashboard')}
                />
              </motion.div>
            )}
            {view === 'spec' && selectedSpecId && selectedProjectId && (
              <motion.div
                key="spec"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <SpecDetail 
                  specId={selectedSpecId} 
                  projectId={selectedProjectId}
                  onBack={() => setView('workspace')} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </TooltipProvider>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
        active 
          ? 'bg-orange-500/10 text-orange-500 font-medium' 
          : 'text-slate-400 hover:text-white hover:bg-slate-900'
      }`}
    >
      <div className={active ? 'text-orange-500' : 'text-slate-500 group-hover:text-white transition-colors'}>
        {icon}
      </div>
      <span className="text-sm">{label}</span>
      {active && <ChevronRight className="w-4 h-4 ml-auto" />}
    </button>
  );
}

