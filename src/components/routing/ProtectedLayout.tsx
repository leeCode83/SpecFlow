import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  LayoutDashboard,
  Plus,
  LogOut,
  ChevronRight,
  Folder,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase/supabase';
import { useAuth } from '@/contexts/AuthContext';
import type { Project } from '@/lib/types';

function NavItem({ icon, label, active, onClick, collapsed }: { icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void; collapsed?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        active
          ? 'bg-orange-500/10 text-orange-500 font-medium'
          : 'text-slate-400 hover:text-white hover:bg-slate-900',
        collapsed ? 'justify-center px-0' : '',
      )}
      title={collapsed ? label : undefined}
    >
      <div className={cn(
        'shrink-0 transition-colors',
        active ? 'text-orange-500' : 'text-slate-500 group-hover:text-white',
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

export function ProtectedLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(6)
      .then(({ data, error }) => {
        if (!error) setProjects(data || []);
      });
  }, [user]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      <motion.aside
        initial={false}
        animate={{ width: isSidebarCollapsed ? 80 : 256 }}
        className="fixed left-0 top-0 bottom-0 border-r border-slate-800 bg-slate-950/50 backdrop-blur-xl z-50 flex flex-col transition-all duration-300 ease-in-out"
      >
        <div className="p-4 flex items-center justify-between border-b border-slate-800/50 mb-2">
          <div
            className={cn(
              'flex items-center gap-3 cursor-pointer group overflow-hidden transition-all duration-300',
              isSidebarCollapsed ? 'w-0 opacity-0' : 'w-auto opacity-100',
            )}
            onClick={() => navigate('/dashboard')}
          >
            <img src="/logo.png" alt="IdeaFrame" className="w-7 h-7 shrink-0" />
            <span className="font-bold tracking-tight text-lg truncate text-orange-500">IdeaFrame</span>
          </div>
          {isSidebarCollapsed && (
            <div className="mx-auto">
              <img src="/logo.png" alt="IdeaFrame" className="w-8 h-8 cursor-pointer" onClick={() => navigate('/dashboard')} />
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
            active={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
            collapsed={isSidebarCollapsed}
          />

          <div className="relative group/projects">
            <NavItem
              icon={<Folder className="w-4 h-4" />}
              label="Your Projects"
              active={isActive('/projects')}
              onClick={() => navigate('/projects')}
              collapsed={isSidebarCollapsed}
            />
            <div className={cn(
              'absolute left-full top-0 ml-2 w-48 opacity-0 invisible group-hover/projects:opacity-100 group-hover/projects:visible transition-all duration-200 z-[60]',
              isSidebarCollapsed ? 'ml-4' : 'ml-2',
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
                        onClick={() => navigate(`/projects/${project.id}`)}
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
            active={isActive('/projects/new')}
            onClick={() => navigate('/projects/new')}
            collapsed={isSidebarCollapsed}
          />
        </nav>

        <div className="p-3 border-t border-slate-800">
          <div className={cn(
            'flex items-center gap-3 p-2 rounded-xl bg-slate-900/50 overflow-hidden transition-all duration-300',
            isSidebarCollapsed ? 'justify-center' : '',
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

      <motion.main
        initial={false}
        animate={{ paddingLeft: isSidebarCollapsed ? 80 : 256 }}
        className="min-h-screen transition-all duration-300 ease-in-out"
      >
        <Outlet />
      </motion.main>
    </>
  );
}
