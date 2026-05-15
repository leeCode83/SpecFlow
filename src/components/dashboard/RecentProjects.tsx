import { Zap, Rocket, GraduationCap, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Project } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface RecentProjectsProps {
  projects: Project[];
  onSelectProject: (id: string) => void;
  onViewAll: () => void;
}

const modeConfig = {
  Hackathon: { icon: Zap, color: 'text-primary', bg: 'bg-primary/20', border: 'border-orange-500/20', label: 'Hackathon' },
  Startup: { icon: Rocket, color: 'text-emerald-500', bg: 'bg-success/20', border: 'border-emerald-500/20', label: 'Startup' },
  Learning: { icon: GraduationCap, color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-purple-500/20', label: 'Learning' },
};

export function RecentProjects({ projects, onSelectProject, onViewAll }: RecentProjectsProps) {
  if (projects.length === 0) return null;

  const recent = projects.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Recent Projects</h2>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary hover:text-primary/80 text-xs">
          View All <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {recent.map((project) => {
          const mode = modeConfig[project.mode] || modeConfig.Learning;
          const ModeIcon = mode.icon;
          return (
            <Card
              key={project.id}
              size="sm"
              className="bg-card border-border cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onSelectProject(project.id)}
            >
              <div className="p-4 space-y-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${mode.bg} ${mode.color}`}>
                  <ModeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{project.title}</h3>
                  {project.description && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0 border-transparent ${mode.bg} ${mode.color}`}>
                    {mode.label}
                  </Badge>
                  <span className="text-[9px] text-slate-600">
                    {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
