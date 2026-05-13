import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/lib/types';

interface WorkspaceHeaderProps {
  project: Project | null;
  onNewSpec: () => void;
}

export function WorkspaceHeader({
  project,
  onNewSpec
}: WorkspaceHeaderProps) {
  return (
    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight truncate">{project?.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm flex-wrap">
          <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20">
            {project?.mode}
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button onClick={onNewSpec} className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold px-6 h-9">
          <Plus className="w-4 h-4" />
          New Spec
        </Button>
      </div>
    </div>
  );
}
