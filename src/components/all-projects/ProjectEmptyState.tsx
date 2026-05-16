import { FolderPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { EmptyProjectIllustration } from '@/components/ui/illustrations';

interface ProjectEmptyStateProps {
  onCreateProject: () => void;
  isSearching?: boolean;
  searchQuery?: string;
}

export function ProjectEmptyState({ onCreateProject, isSearching, searchQuery }: ProjectEmptyStateProps) {
  if (isSearching) {
    return (
      <EmptyState
        icon={<FolderPlus className="w-8 h-8" />}
        title="No results found"
        description={`No projects match "${searchQuery}". Try a different search term.`}
      />
    );
  }

  return (
    <EmptyState
      icon={<FolderPlus className="w-8 h-8" />}
      title="No projects yet"
      description="Create your first project to get started with IdeaFrame."
      illustration={<EmptyProjectIllustration className="w-32 h-32" />}
      action={
        <Button
          variant="default"
          className="bg-primary hover:bg-brand/90 text-white"
          onClick={onCreateProject}
        >
          Create Project
        </Button>
      }
    />
  );
}
