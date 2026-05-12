import React, { useState } from 'react';
import { Github, ExternalLink, Plus, FolderTree, RefreshCw, Link2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Project, GithubRepoData } from '@/lib/types';
import { parseGithubUrl, connectGithub } from '@/lib/github/github-client';
import { toast } from 'sonner';

interface WorkspaceHeaderProps {
  project: Project | null;
  githubRepo: GithubRepoData | null;
  githubTokenAvailable: boolean;
  onUpdateGithub: (url: string) => Promise<void>;
  onSyncGithub: (fullName: string) => Promise<any>;
  onBrowseRepo: () => void;
  onNewSpec: () => void;
}

export function WorkspaceHeader({
  project,
  githubRepo,
  githubTokenAvailable,
  onUpdateGithub,
  onSyncGithub,
  onBrowseRepo,
  onNewSpec
}: WorkspaceHeaderProps) {
  const [editingGithub, setEditingGithub] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [githubUrl, setGithubUrl] = useState(project?.github_url || '');

  const repoNeedsConnect = !!project?.github_url && !githubTokenAvailable;

  const handleUpdateGithub = async () => {
    await onUpdateGithub(githubUrl);
    setEditingGithub(false);
  };

  const handleSync = async () => {
    const fullName = project?.github_url ? parseGithubUrl(project.github_url) : null;
    if (!fullName) return;
    setSyncing(true);
    try {
      await onSyncGithub(fullName);
    } finally {
      setSyncing(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      await connectGithub();
      toast.success("GitHub account connected!");

      const fullName = project?.github_url ? parseGithubUrl(project.github_url) : null;
      if (fullName) {
        await onSyncGithub(fullName);
      }

      window.location.reload();
    } catch (err: any) {
      if (!err.message.includes("timed out")) {
        toast.error(err.message);
      }
    } finally {
      setConnecting(false);
    }
  };

  const repoLabel = githubRepo
    ? `${githubRepo.fullName} ${githubRepo.stars > 0 ? `★ ${githubRepo.stars}` : ''}${githubRepo.language ? ` • ${githubRepo.language}` : ''}`
    : null;

  return (
    <div className="flex-1 flex flex-col md:flex-row md:items-center gap-4">
      <div className="flex-1 min-w-0">
        <h1 className="text-3xl font-bold tracking-tight truncate">{project?.title}</h1>
        <div className="flex items-center gap-3 mt-1 text-slate-500 text-sm flex-wrap">
          <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20">
            {project?.mode}
          </Badge>
          <span>•</span>
          <div className="flex items-center gap-2">
            <Github className="w-4 h-4 shrink-0" />
            {repoNeedsConnect ? (
              <div className="flex items-center gap-2">
                <span className="italic opacity-60">Repository linked</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="h-7 px-3 text-[11px] border-orange-500/30 text-orange-400 hover:bg-orange-500/10 gap-1.5"
                >
                  {connecting ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : (
                    <Link2 className="w-3 h-3" />
                  )}
                  Connect GitHub Account
                </Button>
              </div>
            ) : githubRepo ? (
              <div className="flex items-center gap-2">
                <a
                  href={`https://github.com/${githubRepo.fullName}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-500 transition-colors underline flex items-center gap-1 text-xs"
                >
                  {repoLabel} <ExternalLink className="w-3 h-3" />
                </a>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onBrowseRepo}
                    className="h-6 px-2 text-[11px] text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 gap-1"
                  >
                    <FolderTree className="w-3 h-3" />
                    Browse
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSync}
                    disabled={syncing}
                    className="h-6 px-2 text-[11px] text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 gap-1"
                  >
                    <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                    Sync
                  </Button>
                </div>
              </div>
            ) : project?.github_url ? (
              <div className="flex items-center gap-2">
                <a
                  href={project.github_url}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-orange-500 transition-colors underline flex items-center gap-1"
                >
                  Repository <ExternalLink className="w-3 h-3" />
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSync}
                  disabled={syncing}
                  className="h-6 px-2 text-[11px] text-slate-400 hover:text-orange-500 gap-1"
                >
                  <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin' : ''}`} />
                  Sync
                </Button>
              </div>
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
