import React, { useState } from 'react';
import { Github, ExternalLink, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/types';

interface WorkspaceHeaderProps {
  project: Project | null;
  onUpdateGithub: (url: string) => Promise<void>;
  onNewSpec: () => void;
}

/**
 * WorkspaceHeader Component
 * Displays project title, metadata, and main actions like GitHub linking and creating new specs.
 */
export function WorkspaceHeader({
  project,
  onUpdateGithub,
  onNewSpec
}: WorkspaceHeaderProps) {
  const [editingGithub, setEditingGithub] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '');

  const handleUpdateGithub = async () => {
    await onUpdateGithub(githubUrl);
    setEditingGithub(false);
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight truncate">{project?.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm">
          <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20">
            {project?.mode}
          </Badge>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4" />
            {project?.github_url ? (
              <a 
                href={project.github_url} 
                target="_blank" 
                rel="noreferrer" 
                className="hover:text-orange-500 transition-colors underline flex items-center gap-1"
              >
                Repository <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <span className="italic opacity-60">No repository linked</span>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {editingGithub ? (
          <div className="flex items-center gap-2 bg-slate-900 p-1 pr-1 rounded-xl border border-slate-800">
            <Input 
              value={githubUrl} 
              onChange={(e) => setGithubUrl(e.target.value)} 
              placeholder="https://github.com/..."
              className="bg-transparent border-none focus-visible:ring-0 text-xs w-48"
            />
            <Button size="sm" onClick={handleUpdateGithub} className="bg-orange-500 text-xs h-7 px-3">Save</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditingGithub(false)} className="text-xs h-7 px-2">Cancel</Button>
          </div>
        ) : (
          <Button variant="outline" onClick={() => setEditingGithub(true)} className="gap-2 border-slate-800 text-xs py-1 h-9">
            <Github className="w-4 h-4" />
            {project?.github_url ? 'Change Repo' : 'Link GitHub'}
          </Button>
        )}
        <Button onClick={onNewSpec} className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold px-6 h-9">
          <Plus className="w-4 h-4" />
          New Spec
        </Button>
      </div>
    </div>
  );
}
