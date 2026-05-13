import React from 'react';
import { MoreVertical, Edit2, Trash2, FileText, Shield, Database, Monitor, Brain, Server, Zap, LucideProps } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Spec } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpecType } from '@/lib/types';

const TYPE_ICONS: Record<SpecType, React.ComponentType<LucideProps>> = {
  Auth: Shield,
  API: Database,
  Frontend: Monitor,
  AI: Brain,
  Infrastructure: Server,
  Custom: Zap,
};

const TYPE_COLORS: Record<SpecType, string> = {
  Auth: 'text-violet-500 bg-violet-500/10 border-violet-500/20',
  API: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
  Frontend: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
  AI: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
  Infrastructure: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
  Custom: 'text-slate-400 bg-slate-800 border-slate-700',
};

interface SpecListProps {
  specs: Spec[];
  onSelectSpec: (id: string) => void;
  onRenameSpec: (spec: Spec) => void;
  onDeleteSpec: (spec: Spec) => void;
}

export function SpecList({
  specs,
  onSelectSpec,
  onRenameSpec,
  onDeleteSpec,
}: SpecListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Specifications</h2>
        <span className="text-xs text-slate-500">{specs.length} total</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {specs.map(spec => {
          const Icon = TYPE_ICONS[spec.type] || FileText;
          const colorClass = TYPE_COLORS[spec.type] || TYPE_COLORS.Custom;

          return (
            <Card key={spec.id} size="sm" className="bg-slate-900/40 border-slate-800/60 hover:border-slate-700/60 transition-colors cursor-pointer group/card" onClick={() => onSelectSpec(spec.id)}>
              <CardHeader className="flex-row items-center gap-3 pb-0">
                <div className={cn("w-9 h-9 rounded-lg border flex items-center justify-center shrink-0", colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <CardTitle className="text-sm font-semibold truncate flex-1 min-w-0">
                  {spec.title}
                </CardTitle>
                <div className="opacity-0 group-hover/card:opacity-100 transition-opacity -mr-1" onClick={e => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "h-7 w-7 text-slate-400 hover:text-white outline-none cursor-pointer")}>
                      <MoreVertical className="w-4 h-4" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-32 bg-slate-900 border-slate-800">
                      <DropdownMenuItem
                        onClick={() => onRenameSpec(spec)}
                        className="text-xs text-slate-300 focus:bg-slate-800 focus:text-white cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 mr-2" /> Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onDeleteSpec(spec)}
                        className="text-xs text-red-400 focus:bg-red-500/10 focus:text-red-400 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 border-slate-700 text-slate-400">{spec.type}</Badge>
                  <span className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-medium",
                    spec.status === 'completed'
                      ? 'text-emerald-400 bg-emerald-500/10'
                      : 'text-amber-400 bg-amber-500/10'
                  )}>
                    {spec.status === 'completed' ? 'Ready' : 'Draft'}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
        {specs.length === 0 && (
          <div className="sm:col-span-2 xl:col-span-3 py-16 text-center border-2 border-dashed border-slate-800 rounded-2xl">
            <FileText className="w-10 h-10 text-slate-800 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No specifications yet</p>
            <p className="text-slate-600 text-xs mt-1">Click "New Spec" in the header to create one</p>
          </div>
        )}
      </div>
    </div>
  );
}
