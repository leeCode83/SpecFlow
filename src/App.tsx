/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  LogOut, 
  ChevronRight,
  ChevronLeft,
  Folder,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/supabase';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { Workspace } from './components/Workspace';
import { SpecDetail } from './components/SpecDetail';
import { CreateProject } from './components/CreateProject';
import { IdeationPage } from './components/IdeationPage';
import { Project } from '@/lib/types';

import { Auth } from './components/Auth';

type View = 'landing' | 'auth' | 'ideation' | 'dashboard' | 'workspace' | 'spec' | 'create_project';

export default function App() {
  const [view, setView] = useState<View>('landing');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSpecId, setSelectedSpecId] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  const [configured, setConfigured] = useState(isSupabaseConfigured());
  const [ideationData, setIdeationData] = useState<{ title: string; description: string; mode: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);

  const fetchProjects = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);
      if (error) throw error;
      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects for sidebar:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user]); // Re-fetch on user change

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (window.opener) {
          window.close();
        } else {
          setView(prev => (prev === 'landing' || prev === 'auth') ? 'dashboard' : prev);
        }
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        if (window.opener) {
          window.close();
        } else {
          setView(prev => (prev === 'landing' || prev === 'auth') ? 'dashboard' : prev);
        }
      } else if (!session?.user) {
        setView(prev => (prev !== 'landing' && prev !== 'auth' && prev !== 'ideation') ? 'landing' : prev);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [configured]);

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
            Please configure <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in the Secrets panel to use IdeaFrame MVP.
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
  if (!user && view !== 'landing' && view !== 'auth' && view !== 'ideation') {
    return <Auth onBack={() => setView('landing')} />;
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-orange-500/30">
        <Toaster position="top-right" theme="dark" />
        
        {/* Sidebar / Navigation */}
        {view !== 'landing' && view !== 'auth' && view !== 'ideation' && (
          <motion.aside 
            initial={false}
            animate={{ width: isSidebarCollapsed ? 80 : 256 }}
            className="fixed left-0 top-0 bottom-0 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50 flex flex-col transition-all duration-300 ease-in-out"
          >
            <div className="p-4 flex items-center justify-between border-b border-slate-800/50 mb-2">
              <div 
                className={cn(
                  "flex items-center gap-3 cursor-pointer group overflow-hidden transition-all duration-300",
                  isSidebarCollapsed ? "w-0 opacity-0" : "w-auto opacity-100"
                )}
                onClick={() => setView('dashboard')}
              >
                <img src="/logo.png" alt="IdeaFrame" className="w-7 h-7 shrink-0" />
                <span className="font-bold tracking-tight text-lg truncate text-orange-500">IdeaFrame</span>
              </div>
              
              {isSidebarCollapsed && (
                <div className="mx-auto">
                  <img src="/logo.png" alt="IdeaFrame" className="w-8 h-8 cursor-pointer" onClick={() => setView('dashboard')} />
                </div>
              )}

              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white shrink-0"
              >
                {isSidebarCollapsed ? <PanelLeftOpen className="w-4 h-4" /> : <PanelLeftClose className="w-4 h-4" />}
              </button>
            </div>

            <nav className="flex-1 px-3 space-y-1 py-4">
              <NavItem 
                icon={<LayoutDashboard className="w-4 h-4" />} 
                label="Dashboard" 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')} 
                collapsed={isSidebarCollapsed}
              />
              
              <div className="relative group/projects">
                <NavItem 
                  icon={<Folder className="w-4 h-4" />} 
                  label="Your Projects" 
                  active={view === 'dashboard'}
                  onClick={() => setView('dashboard')} 
                  collapsed={isSidebarCollapsed}
                />
                
                {/* Dropdown on Hover */}
                <div className={cn(
                  "absolute left-full top-0 ml-2 w-48 opacity-0 invisible group-hover/projects:opacity-100 group-hover/projects:visible transition-all duration-200 z-[60]",
                  isSidebarCollapsed ? "ml-4" : "ml-2"
                )}>
                  <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 overflow-hidden backdrop-blur-xl">
                    <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-2 border-b border-slate-800 mb-1">
                      Recent Projects
                    </p>
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {projects.length > 0 ? (
                        projects.map((project) => (
                          <button
                            key={project.id}
                            onClick={() => {
                              setSelectedProjectId(project.id);
                              setView('workspace');
                            }}
                            className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center justify-between group/item"
                          >
                            <span className="truncate flex-1">{project.title}</span>
                            <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                          </button>
                        ))
                      ) : (
                        <p className="text-[10px] text-slate-600 px-3 py-4 text-center">No projects yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <NavItem 
                icon={<Plus className="w-4 h-4" />} 
                label="New Project" 
                active={view === 'create_project'}
                onClick={() => setView('create_project')} 
                collapsed={isSidebarCollapsed}
              />
            </nav>

            <div className="p-3 border-t border-slate-800">
              <div className={cn(
                "flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 overflow-hidden transition-all duration-300",
                isSidebarCollapsed ? "justify-center" : ""
              )}>
                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                  {user?.email?.[0].toUpperCase() ?? 'U'}
                </div>
                {!isSidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium truncate text-slate-400">{user?.email}</p>
                  </div>
                )}
                {!isSidebarCollapsed && (
                  <button 
                    onClick={handleLogout}
                    className="p-1.5 hover:bg-slate-800 rounded-lg transition-colors text-slate-400 hover:text-white shrink-0"
                  >
                    <LogOut className="w-3 h-3" />
                  </button>
                )}
              </div>
              {isSidebarCollapsed && (
                <button 
                  onClick={handleLogout}
                  className="w-full mt-2 p-2 hover:bg-slate-800 rounded-lg transition-colors text-slate-500 hover:text-white flex justify-center"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.aside>
        )}

        <motion.main 
          initial={false}
          animate={{ paddingLeft: (view === 'landing' || view === 'auth' || view === 'ideation') ? 0 : (isSidebarCollapsed ? 80 : 256) }}
          className="min-h-screen transition-all duration-300 ease-in-out"
        >
          <AnimatePresence mode="wait">
            {view === 'landing' && (
              <motion.div
                key="landing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <LandingPage onCreateProject={handleCreateProject} onSignIn={() => setView('auth')} onStartIdeation={() => setView('ideation')} />
              </motion.div>
            )}
            {view === 'ideation' && (
              <motion.div
                key="ideation"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <IdeationPage 
                  onBack={() => setView('landing')}
                  onCreateProject={(id, title, desc, feedback, mode) => {
                    setIdeationData({ title: title || '', description: desc || '', mode: mode || 'Startup' });
                    setView('create_project');
                  }} 
                />
              </motion.div>
            )}
            {view === 'auth' && (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Auth onBack={() => setView('landing')} />
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
                  onStartIdeation={() => setView('ideation')}
                  initialData={ideationData}
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
        </motion.main>
      </div>
    </TooltipProvider>
  );
}

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void, collapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative",
        active 
          ? 'bg-orange-500/10 text-orange-500 font-medium' 
          : 'text-slate-400 hover:text-white hover:bg-slate-900',
        collapsed ? "justify-center px-0" : ""
      )}
      title={collapsed ? label : undefined}
    >
      <div className={cn(
        "shrink-0 transition-colors",
        active ? 'text-orange-500' : 'text-slate-500 group-hover:text-white'
      )}>
        {icon}
      </div>
      {!collapsed && <span className="text-sm truncate">{label}</span>}
      {!collapsed && active && <ChevronRight className="w-4 h-4 ml-auto shrink-0" />}
      
      {collapsed && (
        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-900 text-white text-[10px] rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[70] whitespace-nowrap border border-slate-800">
          {label}
        </div>
      )}
    </button>
  );
}

