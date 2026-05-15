import React from 'react';
import { Activity, ChevronLeft, ChevronRight, Clock, PlusCircle, GitBranch, Edit2, UserPlus, UserMinus, FilePlus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProjectLog } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface LogPanelProps {
  logs: ProjectLog[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * LogPanel Component
 * Displays recent activities and events in the project.
 * Includes detailed rendering of common project events.
 */
export function LogPanel({
  logs,
  page,
  totalPages,
  onPageChange
}: LogPanelProps) {
  
  /**
   * Helper to render action-specific details
   */
  const renderLogDetails = (log: ProjectLog) => {
    const details = (log.details as any) || {};
    const action = log.action || '';
    const actUpper = action.toUpperCase().replace(/_/g, ' ');
    
    if (actUpper.includes('CREATE SPEC')) {
      return (
        <div className="flex flex-col gap-1">
          <p className="text-foreground/90 text-xs">
            Generated a new <span className="font-bold text-primary/80">{details.type || 'Custom'}</span> specification
          </p>
          <p className="text-[10px] text-muted-foreground">Title: "{details.title || 'Untitled'}"</p>
        </div>
      );
    }
    if (actUpper.includes('UPDATE GITHUB')) {
      return (
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-foreground/90">Linked a new GitHub repository</p>
          <p className="text-[10px] bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20 w-fit truncate max-w-xs">{details.url || 'No URL'}</p>
        </div>
      );
    }
    if (actUpper.includes('EDIT SPEC')) {
      return (
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-foreground/90">Updated specification content</p>
          {details.title && <p className="text-[10px] text-muted-foreground">Title: "{details.title}"</p>}
        </div>
      );
    }
    if (actUpper.includes('ADD MEMBER')) {
      return (
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-foreground/90">Added a new contributor to the team</p>
          <p className="text-[10px] text-success font-medium">{details.email || details.uuid || 'Unknown User'}</p>
        </div>
      );
    }
    if (actUpper.includes('UPLOAD FILE')) {
      return (
        <div className="flex flex-col gap-1 text-xs">
          <p className="text-foreground/90">Uploaded project asset: <span className="text-cyan-400 font-medium">{details.filename || 'File'}</span></p>
          {details.size && <p className="text-[10px] text-muted-foreground italic">File Size: {(details.size / 1024 / 1024).toFixed(2)} MB</p>}
        </div>
      );
    }

    const message = details.message || (typeof details === 'string' ? details : null);
    return (
      <div className="flex flex-col gap-1 italic text-muted-foreground text-[10px]">
        {message ? <p>{message}</p> : <p>Performed {log.action || 'an action'}</p>}
      </div>
    );
  };

  return (
    <div className="bg-card/60 rounded-2xl border border-border/50 overflow-hidden flex flex-col max-h-[500px]">
      <div className="p-4 border-b border-border/50 flex items-center justify-between bg-card/20">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Activity Log</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6" 
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-[10px] text-muted-foreground font-mono">{page}/{totalPages}</span>
          <Button 
            size="icon" 
            variant="ghost" 
            className="h-6 w-6" 
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {logs.map(log => (
          <div key={log.id} className="relative pl-6 pb-2 border-l border-border last:pb-0">
            <div className="absolute left-[-5px] top-1 w-2.5 h-2.5 rounded-full bg-muted border-2 border-background" />
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-primary uppercase tracking-tight">{log.action}</span>
              <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDistanceToNow(new Date(log.created_at))} ago
              </span>
            </div>
            {renderLogDetails(log)}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 italic">
            <Activity className="w-8 h-8 mb-2 opacity-20" />
            <p className="text-xs">No activity yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
