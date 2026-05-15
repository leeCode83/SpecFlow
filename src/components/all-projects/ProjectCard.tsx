import { motion } from 'motion/react';
import { ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Mode } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
  index: number;
}

const modeConfig: Record<Mode, { label: string; color: string; bg: string; borderClass: string }> = {
  Hackathon: { label: 'Hackathon', color: 'text-primary', bg: 'bg-primary/20', borderClass: 'border-t-primary/30' },
  Startup: { label: 'Startup', color: 'text-emerald-500', bg: 'bg-success/20', borderClass: 'border-t-emerald-500/30' },
  Learning: { label: 'Learning', color: 'text-purple-400', bg: 'bg-purple-500/20', borderClass: 'border-t-purple-500/30' },
};

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const mode = modeConfig[project.mode];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        size="sm"
        className={`group/card cursor-pointer border-border bg-card transition-all duration-200 hover:-translate-y-1 hover:border-border/70 hover:shadow-xl hover:shadow-black/20 border-t-2 ${mode.borderClass}`}
        onClick={() => onClick(project.id)}
      >
        <CardContent className="flex flex-col gap-3 pt-5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base text-foreground leading-snug">
              {project.title}
            </h3>
            <ChevronRight className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5 opacity-0 transition-all group-hover/card:opacity-100 group-hover/card:translate-x-0.5" />
          </div>

          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {project.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-transparent ${mode.bg} ${mode.color}`}>
              {mode.label}
            </Badge>
            <span className="text-[10px] text-muted-foreground font-mono">
              {new Date(project.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
