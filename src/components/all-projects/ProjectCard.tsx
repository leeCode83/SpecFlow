import { motion } from 'motion/react';
import { Zap, Rocket, GraduationCap, ChevronRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Project, Mode } from '@/lib/types';

interface ProjectCardProps {
  project: Project;
  onClick: (id: string) => void;
  index: number;
}

const modeConfig: Record<Mode, { icon: typeof Zap; label: string; color: string; bg: string }> = {
  Hackathon: { icon: Zap, label: 'Hackathon', color: 'text-orange-500', bg: 'bg-orange-500/20' },
  Startup: { icon: Rocket, label: 'Startup', color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  Learning: { icon: GraduationCap, label: 'Learning', color: 'text-purple-400', bg: 'bg-purple-500/20' },
};

export function ProjectCard({ project, onClick, index }: ProjectCardProps) {
  const mode = modeConfig[project.mode];
  const Icon = mode.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      <Card
        size="sm"
        className="cursor-pointer border-slate-800 bg-slate-900/50 transition-all duration-200 hover:-translate-y-1 hover:border-slate-700 hover:shadow-xl hover:shadow-slate-900/50"
        onClick={() => onClick(project.id)}
      >
        <CardContent className="flex flex-col gap-4 pt-4">
          <div className="flex items-start justify-between">
            <div className={`w-10 h-10 rounded-xl ${mode.bg} flex items-center justify-center shrink-0`}>
              <Icon className={`w-5 h-5 ${mode.color}`} />
            </div>
            <ChevronRight className="w-4 h-4 text-slate-600 opacity-0 transition-opacity group-hover/card:opacity-100" />
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-base text-slate-100 leading-snug">
              {project.title}
            </h3>
            {project.description && (
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {project.description}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-1">
            <Badge variant="outline" className={`text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 border-transparent ${mode.bg} ${mode.color}`}>
              {mode.label}
            </Badge>
            <span className="text-[10px] text-slate-600 font-mono">
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
