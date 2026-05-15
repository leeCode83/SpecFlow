import { Plus, LayoutDashboard, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface QuickActionsProps {
  onCreateProject: () => void;
  onViewAllProjects: () => void;
  onStartIdeation?: () => void;
}

export function QuickActions({ onCreateProject, onViewAllProjects, onStartIdeation }: QuickActionsProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Button
        variant="default"
        size="sm"
        className="bg-primary hover:bg-orange-600 text-white"
        onClick={onCreateProject}
      >
        <Plus className="w-4 h-4 mr-1.5" />
        New Project
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="border-border text-muted-foreground hover:text-foreground"
        onClick={onViewAllProjects}
      >
        <LayoutDashboard className="w-4 h-4 mr-1.5" />
        All Projects
      </Button>
      {onStartIdeation && (
        <Button
          variant="outline"
          size="sm"
        className="border-border text-muted-foreground hover:text-foreground"
          onClick={onStartIdeation}
        >
          <Lightbulb className="w-4 h-4 mr-1.5" />
          Ideation
        </Button>
      )}
    </div>
  );
}
