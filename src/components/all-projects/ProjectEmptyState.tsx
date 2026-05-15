import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProjectEmptyStateProps {
  onCreateProject: () => void;
  isSearching?: boolean;
  searchQuery?: string;
}

export function ProjectEmptyState({ onCreateProject, isSearching, searchQuery }: ProjectEmptyStateProps) {
  if (isSearching) {
    return (
      <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-4">
          <FolderPlus className="w-8 h-8 text-slate-600" />
        </div>
        <h3 className="text-lg font-semibold text-foreground/80">No results found</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          No projects match &ldquo;{searchQuery}&rdquo;. Try a different search term.
        </p>
      </div>
    );
  }

  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-card flex items-center justify-center mb-4">
        <FolderPlus className="w-8 h-8 text-slate-600" />
      </div>
      <h3 className="text-lg font-semibold text-foreground/80">No projects yet</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
        Create your first project to get started with IdeaFrame.
      </p>
      <Button
        variant="default"
        className="mt-6 bg-primary hover:bg-orange-600 text-white"
        onClick={onCreateProject}
      >
        Create Project
      </Button>
    </div>
  );
}
