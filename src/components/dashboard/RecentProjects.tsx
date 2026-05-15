import { ArrowRight } from 'lucide-react';
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
  Hackathon: { color: 'text-primary', bg: 'bg-primary/20', border: 'border-l-primary/40', label: 'Hackathon' },
  Startup: { color: 'text-emerald-500', bg: 'bg-success/20', border: 'border-l-emerald-500/40', label: 'Startup' },
  Learning: { color: 'text-purple-400', bg: 'bg-purple-500/20', border: 'border-l-purple-500/40', label: 'Learning' },
};

export function RecentProjects({ projects, onSelectProject, onViewAll }: RecentProjectsProps) {
  if (projects.length === 0) return null;

  const recent = projects.slice(0, 4);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground">Recent Projects</h2>
        <Button variant="ghost" size="sm" onClick={onViewAll} className="text-primary hover:text-primary/80 text-xs">
          View All <ArrowRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {recent.map((project) => {
          const mode = modeConfig[project.mode] || modeConfig.Learning;
          return (
            <Card
              key={project.id}
              size="sm"
              className={`bg-card border-border border-l-[3px] cursor-pointer hover:bg-muted/50 transition-all ${mode.border}`}
              onClick={() => onSelectProject(project.id)}
            >
              <div className="p-4 space-y-2.5">
                <div>
                  <h3 className="text-sm font-bold text-foreground truncate">{project.title}</h3>
                  {project.description && (
                    <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Badge variant="outline" className={`text-[9px] uppercase font-bold tracking-widest px-2 py-0 border-transparent ${mode.bg} ${mode.color}`}>
                    {mode.label}
                  </Badge>
                  <span className="text-[9px] text-muted-foreground">
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
