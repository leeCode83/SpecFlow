import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
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

const navItemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

function NavItem({
  icon,
  label,
  active,
  onClick,
  collapsed,
  index = 0,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  collapsed?: boolean;
  index?: number;
}) {
  return (
    <motion.button
      variants={navItemVariants}
      initial="hidden"
      animate="visible"
      transition={{ delay: index * 0.05, duration: 0.25, ease: 'easeOut' }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group relative',
        active
          ? 'bg-primary/12 text-primary/80 font-medium border border-primary/20 shadow-[0_0_20px_-12px_rgba(249,115,22,0.25)]'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/[0.04] border border-transparent',
        collapsed ? 'justify-center px-0' : '',
      )}
    >
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-primary rounded-r-full shadow-[0_0_8px_rgba(249,115,22,0.5)]"
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        />
      )}
      <motion.div
        className={cn(
          'shrink-0 transition-colors',
          active ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground',
        )}
        whileHover={{ scale: 1.1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {icon}
      </motion.div>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.2 }}
            className="text-sm truncate"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {!collapsed && active && (
          <motion.div
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -4 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight className="w-4 h-4 ml-auto shrink-0" />
          </motion.div>
        )}
      </AnimatePresence>
      {collapsed && (
        <div className="absolute left-full ml-3 px-3 py-1.5 bg-background/80 backdrop-blur-xl text-foreground/80 text-xs rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-[70] whitespace-nowrap border border-white/[0.08] shadow-xl">
          {label}
        </div>
      )}
    </motion.button>
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
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 border-r border-white/[0.06] bg-background/70 backdrop-blur-2xl z-50 flex flex-col overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <motion.div
            className="absolute -top-24 -left-24 w-48 h-48 bg-primary/8 rounded-full blur-[80px]"
            animate={{ x: [0, 16, 0], y: [0, 12, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-20 -right-16 w-36 h-36 bg-indigo-500/[0.05] rounded-full blur-[60px]"
            animate={{ x: [0, -12, 0], y: [0, -8, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>

        <div className="relative p-4 flex items-center justify-between border-b border-white/[0.06] mb-2">
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                key="logo-expanded"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-center gap-3 cursor-pointer group overflow-hidden"
                onClick={() => navigate('/dashboard')}
              >
                <img src="/logo.png" alt="IdeaFrame" className="w-7 h-7 shrink-0" />
                <span className="font-bold tracking-tight text-lg truncate text-primary whitespace-nowrap">
                  IdeaFrame
                </span>
              </motion.div>
            )}
            {isSidebarCollapsed && (
              <motion.div
                key="logo-collapsed"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="mx-auto"
              >
                <img
                  src="/logo.png"
                  alt="IdeaFrame"
                  className="w-8 h-8 cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                />
              </motion.div>
            )}
          </AnimatePresence>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="p-2 bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.08] rounded-xl transition-colors text-muted-foreground hover:text-foreground shrink-0 backdrop-blur-sm"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </motion.button>
        </div>

        <nav className="relative flex-1 px-3 space-y-1 py-4">
          <NavItem
            icon={<LayoutDashboard className="w-5 h-5" />}
            label="Dashboard"
            active={isActive('/dashboard')}
            onClick={() => navigate('/dashboard')}
            collapsed={isSidebarCollapsed}
            index={0}
          />

          <div className="relative group/projects">
            <NavItem
              icon={<Folder className="w-5 h-5" />}
              label="Your Projects"
              active={isActive('/projects')}
              onClick={() => navigate('/projects')}
              collapsed={isSidebarCollapsed}
              index={1}
            />
            <div
              className={cn(
                'absolute left-full top-0 opacity-0 invisible group-hover/projects:opacity-100 group-hover/projects:visible transition-all duration-200 z-[60]',
                isSidebarCollapsed ? 'ml-4' : 'ml-2',
              )}
            >
              <motion.div
                initial={{ opacity: 0, x: -4, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                className="bg-background/60 backdrop-blur-2xl border border-white/[0.06] rounded-2xl shadow-2xl p-3 overflow-hidden"
              >
                <p className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground px-3 py-2 border-b border-white/[0.06] mb-2">
                  Recent Projects
                </p>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {projects.length > 0 ? (
                    projects.map((project, i) => (
                      <motion.button
                        key={project.id}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => navigate(`/projects/${project.id}`)}
                        className="w-full text-left px-3 py-2 rounded-xl text-xs text-muted-foreground hover:text-foreground hover:bg-white/[0.06] transition-colors flex items-center justify-between group/item"
                      >
                        <span className="truncate flex-1">{project.title}</span>
                        <ChevronRight className="w-3 h-3 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                      </motion.button>
                    ))
                  ) : (
                    <p className="text-[10px] text-slate-600 px-3 py-4 text-center">
                      No projects yet
                    </p>
                  )}
                </div>
              </motion.div>
            </div>
          </div>

          <NavItem
            icon={<Plus className="w-5 h-5" />}
            label="New Project"
            active={isActive('/projects/new')}
            onClick={() => navigate('/projects/new')}
            collapsed={isSidebarCollapsed}
            index={2}
          />
        </nav>

        <div className="relative p-3 border-t border-white/[0.06]">
          <div
            className={cn(
              'flex items-center gap-3 p-3 rounded-2xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-sm overflow-hidden transition-all duration-300',
              isSidebarCollapsed ? 'justify-center' : '',
            )}
          >
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-amber-500 flex items-center justify-center text-xs font-bold text-white">
                {user?.email?.[0].toUpperCase() ?? 'U'}
              </div>
              <div className="absolute inset-0 rounded-full ring-2 ring-primary/30 ring-offset-2 ring-offset-background" />
            </div>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  <p className="text-xs font-medium truncate text-foreground/90">
                    {user?.email}
                  </p>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary/80 border border-primary/20 mt-1">
                    Creator
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
            <AnimatePresence>
              {!isSidebarCollapsed && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-white/[0.08] rounded-lg transition-colors text-muted-foreground hover:text-foreground shrink-0"
                >
                  <LogOut className="w-4 h-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
          <AnimatePresence>
            {isSidebarCollapsed && (
              <motion.button
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.2 }}
                onClick={handleLogout}
                className="w-full mt-2 p-2 hover:bg-white/[0.06] rounded-xl transition-colors text-muted-foreground hover:text-foreground flex justify-center border border-transparent hover:border-white/[0.06]"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </motion.aside>

      <motion.main
        initial={false}
        animate={{ paddingLeft: isSidebarCollapsed ? 80 : 256 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="min-h-screen"
      >
        <Outlet />
      </motion.main>
    </>
  );
}
