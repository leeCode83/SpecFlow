import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { Activity, LayoutDashboard, Zap, Rocket, GraduationCap, ChevronLeft, ChevronRight, Code } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { getRecentProjects } from '@/lib/supabase/supabase-projects';
import { getAllRecentLogs } from '@/lib/supabase/supabase-logs';
import { Project, ProjectLog } from '@/lib/types';
import { PendingInvitations } from './workspace/PendingInvitations';
import { StatCard } from './dashboard/StatCard';
import { LogItem } from './dashboard/LogItem';
import { RecentProjects } from './dashboard/RecentProjects';
import { QuickActions } from './dashboard/QuickActions';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface DashboardProps {
  onSelectProject: (id: string) => void;
  onCreateProject: () => void;
  onViewAllProjects: () => void;
  user?: User | null;
}

function getGreeting(email?: string): { greeting: string; name: string } {
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const name = email ? email.split('@')[0] : 'there';
  const displayName = name.charAt(0).toUpperCase() + name.slice(1);
  return { greeting: `${timeGreeting}, ${displayName}`, name: displayName };
}

const statCards = [
  { icon: LayoutDashboard, label: 'Total Projects', key: 'total' as const, accentClass: 'bg-blue-500/20 text-blue-400' },
  { icon: Zap, label: 'Hackathons', key: 'hackathon' as const, accentClass: 'bg-orange-500/20 text-orange-500' },
  { icon: Rocket, label: 'Startups', key: 'startup' as const, accentClass: 'bg-emerald-500/20 text-emerald-500' },
  { icon: GraduationCap, label: 'Learning', key: 'learning' as const, accentClass: 'bg-purple-500/20 text-purple-400' },
];

export function Dashboard({ onSelectProject, onCreateProject, onViewAllProjects, user }: DashboardProps) {
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
        getRecentProjects(50),
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

  const getProjectName = useCallback((projectId: string) => {
    const p = projects.find(p => p.id === projectId);
    return p ? p.title : 'Unknown Project';
  }, [projects]);

  const { greeting } = getGreeting(user?.email);

  const hackathonCount = projects.filter(p => p.mode === 'Hackathon').length;
  const startupCount = projects.filter(p => p.mode === 'Startup').length;
  const learningCount = projects.filter(p => p.mode === 'Learning').length;

  const counts = { total: projects.length, hackathon: hackathonCount, startup: startupCount, learning: learningCount };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
        <div className="space-y-2">
          <Skeleton className="h-8 w-72 bg-slate-800" />
          <Skeleton className="h-5 w-48 bg-slate-800" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} size="sm" className="border-slate-800 bg-slate-900/50">
              <div className="p-4 flex items-center gap-4">
                <Skeleton className="w-10 h-10 rounded-xl bg-slate-800" />
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-20 bg-slate-800" />
                  <Skeleton className="h-6 w-12 bg-slate-800" />
                </div>
              </div>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-32 bg-slate-800" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} size="sm" className="border-slate-800 bg-slate-900/50">
                <div className="p-4 space-y-3">
                  <Skeleton className="w-9 h-9 rounded-xl bg-slate-800" />
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <Skeleton className="h-3 w-1/2 bg-slate-800" />
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-16 rounded-full bg-slate-800" />
                    <Skeleton className="h-3 w-20 bg-slate-800" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-5 w-36 bg-slate-800" />
          <div className="bg-slate-900/30 rounded-3xl border border-slate-800/50 p-4 space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-10 h-10 rounded-xl bg-slate-800 shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4 bg-slate-800" />
                  <Skeleton className="h-3 w-1/2 bg-slate-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-white">
            {greeting}
          </h1>
          <p className="text-sm text-slate-500">
            {projects.length} {projects.length === 1 ? 'project' : 'projects'} in your pipeline
          </p>
        </div>
        <QuickActions
          onCreateProject={onCreateProject}
          onViewAllProjects={onViewAllProjects}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
          <StatCard
            key={stat.key}
            icon={stat.icon}
            label={stat.label}
            value={counts[stat.key]}
            accentClass={stat.accentClass}
            delay={0.1 + i * 0.1}
          />
        ))}
      </div>

      <RecentProjects
        projects={projects}
        onSelectProject={onSelectProject}
        onViewAll={onViewAllProjects}
      />

      <PendingInvitations onInvitationAccepted={() => fetchDashboardData(page)} />

      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Activity className="w-5 h-5 text-orange-500" />
          <h2 className="text-lg font-bold">Recent Activity</h2>
        </div>

        <div className="bg-slate-900/30 rounded-3xl border border-slate-800/50 overflow-hidden">
          <div className="divide-y divide-slate-800/50">
            {logs.map((log, index) => (
              <LogItem
                key={log.id}
                log={log}
                projectName={getProjectName(log.project_id)}
                index={index}
              />
            ))}

            {logs.length === 0 && (
              <div className="py-16 text-center space-y-3">
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
