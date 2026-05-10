import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LayoutDashboard, Clock, Activity, PlusCircle, GitBranch, Edit2, UserPlus, UserMinus, FilePlus, Trash2, Rocket, Code, GraduationCap, Zap, User, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getProjects } from '@/lib/supabase/supabase-projects';
import { getAllRecentLogs } from '@/lib/supabase/supabase-logs';
import { Project, ProjectLog } from '@/lib/types';
import { toast } from 'sonner';

interface DashboardProps {
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
}

export function Dashboard({ onSelectProject, onCreateProject }: DashboardProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [logs, setLogs] = useState<ProjectLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    fetchDashboardData(page);
  }, [page]);

  const fetchDashboardData = async (currentPage: number) => {
    setLoading(true);
    try {
      const [projData, logsData] = await Promise.all([
        getProjects(),
        getAllRecentLogs(currentPage, ITEMS_PER_PAGE)
      ]);
      setProjects(projData);
      setLogs(logsData.data);
      setTotalPages(Math.max(1, Math.ceil(logsData.count / ITEMS_PER_PAGE)));
    } catch (error) {
      console.error(error);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const getLogVisuals = (action: string) => {
    const act = (action || '').toUpperCase().replace(/_/g, ' ');
    if (act.includes('CREATE SPEC')) return { icon: PlusCircle, color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/20' };
    if (act.includes('UPDATE GITHUB')) return { icon: GitBranch, color: 'text-blue-400', bg: 'bg-blue-500/20', border: 'border-blue-500/20' };
    if (act.includes('EDIT SPEC')) return { icon: Edit2, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20' };
    if (act.includes('ADD MEMBER')) return { icon: UserPlus, color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/20' };
    if (act.includes('REMOVE MEMBER')) return { icon: UserMinus, color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/20' };
    if (act.includes('UPLOAD FILE')) return { icon: FilePlus, color: 'text-cyan-400', bg: 'bg-cyan-500/20', border: 'border-cyan-500/20' };
    if (act.includes('DELETE FILE')) return { icon: Trash2, color: 'text-rose-400', bg: 'bg-rose-500/20', border: 'border-rose-500/20' };

    const palettes = [
      { color: 'text-indigo-400', bg: 'bg-indigo-500/20', border: 'border-indigo-500/20' },
      { color: 'text-pink-400', bg: 'bg-pink-500/20', border: 'border-pink-500/20' },
      { color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/20' },
      { color: 'text-lime-400', bg: 'bg-lime-500/20', border: 'border-lime-500/20' },
      { color: 'text-teal-400', bg: 'bg-teal-500/20', border: 'border-teal-500/20' },
      { color: 'text-fuchsia-400', bg: 'bg-fuchsia-500/20', border: 'border-fuchsia-500/20' },
      { color: 'text-violet-400', bg: 'bg-violet-500/20', border: 'border-violet-500/20' },
      { color: 'text-sky-400', bg: 'bg-sky-500/20', border: 'border-sky-500/20' }
    ];
    let hash = 0;
    for (let i = 0; i < act.length; i++) {
        hash = act.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % palettes.length;
    return { icon: Activity, ...palettes[index] };
  };

  const renderLogDetails = (log: ProjectLog) => {
    const details = (log.details as any) || {};
    const action = log.action || '';
    const actUpper = action.toUpperCase().replace(/_/g, ' ');
    
    if (actUpper.includes('CREATE SPEC')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200">
            Generated a new <span className="font-bold text-orange-400">{details.type || 'Custom'}</span> specification
          </p>
          <p className="text-xs text-slate-400">Title: "{details.title || 'Untitled'}"</p>
        </div>
      );
    }
    if (actUpper.includes('UPDATE GITHUB')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200">Linked a new GitHub repository</p>
          <p className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 w-fit truncate max-w-xs">{details.url || 'No URL'}</p>
        </div>
      );
    }
    if (actUpper.includes('EDIT SPEC')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200">Updated specification content</p>
          {details.title && <p className="text-xs text-slate-400">Title: "{details.title}"</p>}
        </div>
      );
    }
    if (actUpper.includes('ADD MEMBER')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200">Added a new contributor to the team</p>
          <p className="text-xs text-emerald-400 font-medium">{details.email || details.uuid || 'Unknown User'}</p>
        </div>
      );
    }
    if (actUpper.includes('REMOVE MEMBER')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200 text-red-300/80">Revoked teammate access</p>
          <p className="text-[10px] text-slate-500">Member ID: {details.uuid || 'N/A'}</p>
        </div>
      );
    }
    if (actUpper.includes('UPLOAD FILE')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-200">Uploaded project asset: <span className="text-cyan-400 font-medium">{details.filename || 'File'}</span></p>
          {details.size && <p className="text-[10px] text-slate-500 italic">File Size: {(details.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>
      );
    }
    if (actUpper.includes('DELETE FILE')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-slate-400">Deleted asset from storage: <span className="text-rose-400/80 line-through">{details.filename}</span></p>
        </div>
      );
    }
    const message = details.message || (typeof details === 'string' ? details : null);
    return (
      <div className="flex flex-col gap-1 italic text-slate-400 text-xs">
        {message ? <p>{message}</p> : <p>Performed {log.action || 'an action'}</p>}
      </div>
    );
  };

  const getProjectName = (projectId: string) => {
    const p = projects.find(p => p.id === projectId);
    return p ? p.title : 'Unknown Project';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Activity className="w-8 h-8 animate-pulse text-orange-500" />
      </div>
    );
  }

  const hackathonCount = projects.filter(p => p.mode === 'Hackathon').length;
  const startupCount = projects.filter(p => p.mode === 'Startup').length;
  const learningCount = projects.filter(p => p.mode === 'Learning').length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 pb-20">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-rose-400 to-purple-500">
          Good to see you again!
        </h1>
        <p className="text-slate-400 text-lg">Here's an overview of what you've been working on.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Total Projects</p>
              <h3 className="text-3xl font-bold">{projects.length}</h3>
            </div>
          </Card>
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 bg-orange-500/20 text-orange-500 rounded-2xl flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Hackathons</p>
              <h3 className="text-3xl font-bold">{hackathonCount}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="p-6 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-500 rounded-2xl flex items-center justify-center">
              <Rocket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Startups</p>
              <h3 className="text-3xl font-bold">{startupCount}</h3>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="p-6 bg-slate-900/50 border-slate-800 flex flex-col gap-4">
            <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">Learning</p>
              <h3 className="text-3xl font-bold">{learningCount}</h3>
            </div>
          </Card>
        </motion.div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-orange-500" />
          <h2 className="text-xl font-bold">Recent Activity</h2>
        </div>

        <div className="bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden">
          <div className="divide-y divide-slate-800/50">
            {logs.map((log, index) => {
              const visuals = getLogVisuals(log.action);
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: index * 0.05 }}
                  key={log.id} 
                  className="p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:bg-slate-800/30 transition-colors group"
                >
                  <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 ${visuals.bg} ${visuals.color} ${visuals.border}`}>
                    <visuals.icon className="w-5 h-5" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0 border-transparent ${visuals.bg} ${visuals.color}`}>
                          {log.action}
                        </Badge>
                        <span className="text-xs font-semibold text-slate-300">
                          {getProjectName(log.project_id)}
                        </span>
                      </div>
                      
                      <span className="text-[10px] text-slate-600 font-mono flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                    
                    <div className="text-sm mb-3">
                      {renderLogDetails(log)}
                    </div>

                    <div className="flex items-center gap-2 text-[9px] text-slate-500">
                      <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center">
                        <User className="w-2.5 h-2.5" />
                      </div>
                      <span>ID: {log.user_id?.substring(0, 8)}...</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
            
            {logs.length === 0 && (
              <div className="py-20 text-center space-y-3">
                <Code className="w-8 h-8 text-slate-800 mx-auto" />
                <p className="text-slate-500 text-sm">No activity records found yet. Start building something awesome!</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800/50 flex items-center justify-between bg-slate-900/50">
              <span className="text-sm text-slate-400">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="border-slate-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="border-slate-800"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

