import React, { useState } from 'react';
import { ChevronLeft, Plus, Shield, Database, Monitor, Brain, Server, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project, SpecType } from '@/lib/types';

const SPEC_TYPES: SpecType[] = ['Auth', 'API', 'Frontend', 'AI', 'Infrastructure', 'Custom'];

const TYPE_ICONS: Record<SpecType, React.ComponentType<{ className?: string }>> = {
  Auth: Shield,
  API: Database,
  Frontend: Monitor,
  AI: Brain,
  Infrastructure: Server,
  Custom: Zap,
};

interface WorkspaceHeaderProps {
  project: Project | null;
  onBack: () => void;
  onCreateSpec: (type: SpecType) => void;
}

export function WorkspaceHeader({ project, onBack, onCreateSpec }: WorkspaceHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3 min-w-0">
            <Button variant="ghost" onClick={onBack} className="p-2 hover:bg-slate-800 rounded-xl shrink-0">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-bold truncate">{project?.title}</h1>
            <Badge variant="outline" className="bg-orange-500/5 text-orange-500 border-orange-500/20 text-[10px] px-2 hidden sm:inline-flex">
              {project?.mode}
            </Badge>
          </div>
          <div className="relative">
            <Button
              onClick={() => setMenuOpen(!menuOpen)}
              className="bg-orange-500 hover:bg-orange-600 gap-2 font-bold shrink-0"
            >
              <Plus className="w-4 h-4" />
              New Spec
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl">
                  <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 py-2 border-b border-slate-800 mb-1">
                    Select Template
                  </p>
                  {SPEC_TYPES.map(type => {
                    const Icon = TYPE_ICONS[type];
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          onCreateSpec(type);
                          setMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800 transition-colors flex items-center gap-3"
                      >
                        <Icon className="w-3.5 h-3.5 text-orange-500" />
                        <span>{type}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
