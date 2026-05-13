import React, { useState, useRef, useEffect } from 'react';
import { FileText, Calendar, Users, FileCode, Shield, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
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
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setIsOverflowing(contentRef.current.scrollHeight > 120);
    }
  }, [project?.description]);

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
          <div className="relative">
            <div
              ref={contentRef}
              className={`prose prose-invert prose-orange max-w-none prose-sm overflow-hidden transition-all duration-300 ${
                !expanded ? 'max-h-[120px]' : ''
              }`}
              style={
                !expanded
                  ? { maskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to bottom, black 60%, transparent 100%)' }
                  : {}
              }
            >
              <ReactMarkdown>{project.description}</ReactMarkdown>
            </div>
            {isOverflowing && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 text-xs text-orange-500 hover:text-orange-400 transition-colors mt-2"
              >
                <motion.span
                  animate={{ rotate: expanded ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="inline-flex"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
                {expanded ? 'View less' : 'View more'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
