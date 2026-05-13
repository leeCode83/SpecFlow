import React from 'react';
import { Plus, MoreVertical, Edit2, Trash2, FileText, Shield, Database, Monitor, Brain, Server, Zap, LucideProps } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Spec, SpecType } from '@/lib/types';

// Constants for spec types and icons
const SPEC_TYPES: SpecType[] = ['Auth', 'API', 'Frontend', 'AI', 'Infrastructure', 'Custom'];

const TYPE_ICONS: Record<SpecType, React.ComponentType<LucideProps>> = {
  Auth: Shield,
  API: Database,
  Frontend: Monitor,
  AI: Brain,
  Infrastructure: Server,
  Custom: Zap
};

interface SpecListProps {
  specs: Spec[];
  onSelectSpec: (id: string) => void;
  onRenameSpec: (spec: Spec) => void;
  onDeleteSpec: (spec: Spec) => void;
  showAddMenu: boolean;
  setShowAddMenu: (val: boolean) => void;
  onCreateSpec: (type: SpecType) => void;
}

/**
 * SpecList Component
 * Displays the sidebar list of specifications with templates and management actions.
 */
export function SpecList({
  specs,
  onSelectSpec,
  onRenameSpec,
  onDeleteSpec,
  showAddMenu,
  setShowAddMenu,
  onCreateSpec
}: SpecListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-2">
        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500">Spec Collection</h3>
        <div className="relative">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-7 w-7 rounded-lg hover:bg-slate-800 text-orange-500"
            onClick={() => setShowAddMenu(!showAddMenu)}
          >
            <Plus className="w-4 h-4" />
          </Button>

          {showAddMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAddMenu(false)} />
              <div className="absolute left-0 mt-2 w-48 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 overflow-hidden backdrop-blur-xl">
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
                        setShowAddMenu(false);
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

      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-2 space-y-1">
        {specs.map(spec => (
          <div key={spec.id} className="relative group">
            <button
              onClick={() => onSelectSpec(spec.id)}
              className="w-full text-left px-3 py-2.5 rounded-xl hover:bg-slate-900/60 transition-all flex items-center gap-3 pr-10"
            >
              <div className={`p-1.5 rounded-lg ${
                spec.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-800 text-slate-400'
              }`}>
                {TYPE_ICONS[spec.type] ? React.createElement(TYPE_ICONS[spec.type], { className: "w-3.5 h-3.5" }) : <FileText className="w-3.5 h-3.5" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate text-slate-300 group-hover:text-white transition-colors">{spec.title}</p>
                <div className="text-[9px] text-slate-500 flex items-center gap-1 mt-0.5">
                  <Badge variant="outline" className="text-[8px] px-1 py-0 h-3 border-slate-800">{spec.type}</Badge>
                  <span>•</span>
                  {spec.status === 'completed' ? 'Ready' : 'Draft'}
                </div>
              </div>
            </button>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-slate-400 hover:text-white outline-none cursor-pointer")}>
                  <MoreVertical className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-32 bg-slate-900 border-slate-800">
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onRenameSpec(spec);
                    }}
                    className="text-xs text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSpec(spec);
                    }}
                    className="text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
        {specs.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-[10px] text-slate-600 italic">No specifications yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
