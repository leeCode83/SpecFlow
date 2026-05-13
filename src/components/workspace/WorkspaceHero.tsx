import React from 'react';
import { FileText, Calendar, Users, FileCode, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Project, Spec, ProjectFile } from '@/lib/types';
import ReactMarkdown from 'react-markdown';

interface WorkspaceHeroProps {
  project: Project | null;
  specs: Spec[];
  files: ProjectFile[];
  teamCount: number;
}

export function WorkspaceHero({ project, specs, files, teamCount }: WorkspaceHeroProps) {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold">{project?.title}</h1>
          <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20 text-xs px-3 py-1">
            {project?.mode}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            Created {project?.created_at ? new Date(project.created_at).toLocaleDateString() : ''}
          </span>
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            {specs.length} {specs.length === 1 ? 'spec' : 'specs'}
          </span>
          <span className="flex items-center gap-1">
            <FileCode className="w-3 h-3" />
            {files.length} {files.length === 1 ? 'file' : 'files'}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            {teamCount} {teamCount === 1 ? 'member' : 'members'}
          </span>
        </div>
      </div>

      {project?.description && (
        <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
          <div className="flex items-center gap-2 text-slate-400 mb-3">
            <FileText className="w-4 h-4" />
            <h2 className="font-bold text-sm">Description</h2>
          </div>
          <div className="prose prose-invert prose-orange max-w-none prose-sm">
            <ReactMarkdown>{project.description}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
