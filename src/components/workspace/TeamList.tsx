import React, { useState, useEffect } from 'react';
import { Users, User, Trash2, UserPlus, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/lib/types';
import { authenticatedFetch } from '@/lib/api-client';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TeamListProps {
  project: Project | null;
  isOwner: boolean;
  currentUserId?: string;
  onAddMember: (email: string) => Promise<void>;
  onRemoveMember: (uuid: string) => Promise<void>;
  onOpenInviteModal?: () => void;
}

export function TeamList({
  project,
  isOwner,
  currentUserId,
  onAddMember,
  onRemoveMember,
  onOpenInviteModal,
}: TeamListProps) {
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [emailMap, setEmailMap] = useState<Record<string, string>>({});
  const [loadingEmails, setLoadingEmails] = useState(false);

  useEffect(() => {
    const teammateIds = project?.teammates || [];
    if (teammateIds.length === 0) {
      setEmailMap({});
      return;
    }

    let cancelled = false;
    setLoadingEmails(true);

    authenticatedFetch('/api/users/batch-emails', {
      method: 'POST',
      body: JSON.stringify({ ids: teammateIds }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to fetch emails');
        const data = await res.json();
        if (!cancelled) setEmailMap(data);
      })
      .catch(() => {
        if (!cancelled) {
          const fallback: Record<string, string> = {};
          teammateIds.forEach((id: string) => { fallback[id] = id.substring(0, 8) + '...'; });
          setEmailMap(fallback);
        }
      })
      .finally(() => {
        if (!cancelled) setLoadingEmails(false);
      });

    return () => { cancelled = true; };
  }, [project?.teammates]);

  const handleAdd = async () => {
    if (!newMemberEmail.trim()) return;
    await onAddMember(newMemberEmail);
    setNewMemberEmail('');
  };

  const displayName = (uuid: string): string => {
    return emailMap[uuid] || uuid.substring(0, 8) + '...';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Team</h2>
        <span className="text-xs text-muted-foreground">
          {(project?.teammates?.length || 0) + 1} member{(project?.teammates?.length || 0) + 1 !== 1 ? 's' : ''}
        </span>
      </div>

      <TooltipProvider delay={200}>
        <div className="flex flex-wrap items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary/30 shrink-0 cursor-default">
                <User className="w-5 h-5" />
              </div>
            </TooltipTrigger>
            <TooltipContent side="bottom" className="bg-card border-border text-xs">
              <p className="font-medium text-primary/80">Owner</p>
              <p className="text-muted-foreground">{currentUserId ? 'You' : 'Founder'}</p>
            </TooltipContent>
          </Tooltip>

          {loadingEmails && project?.teammates?.length ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            project?.teammates?.map(teammateId => (
              <Tooltip key={teammateId}>
                <TooltipTrigger asChild>
                  <div className="relative group/avatar">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground border-2 border-border/70 shrink-0 cursor-default">
                      <User className="w-5 h-5" />
                    </div>
                    {isOwner && (
                      <button
                        onClick={() => onRemoveMember(teammateId)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <Trash2 className="w-2.5 h-2.5 text-white" />
                      </button>
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-card border-border text-xs">
                  <p>{displayName(teammateId)}</p>
                  <p className="text-muted-foreground text-[10px]">Member</p>
                </TooltipContent>
              </Tooltip>
            ))
          )}

          {isOwner && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={onOpenInviteModal}
                  className="w-10 h-10 rounded-full bg-muted hover:bg-muted/80 flex items-center justify-center text-muted-foreground hover:text-primary/80 border-2 border-dashed border-border/70 shrink-0 transition-colors"
                >
                  <UserPlus className="w-4 h-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="bg-card border-border text-xs">
                Invite member
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>

      {isOwner && !onOpenInviteModal && (
        <div className="flex gap-2 pt-2">
          <Input
            placeholder="Email address..."
            className="h-8 text-xs bg-background border-border rounded-lg flex-1"
            value={newMemberEmail}
            onChange={(e) => setNewMemberEmail(e.target.value)}
          />
          <Button onClick={handleAdd} size="icon" className="h-8 w-8 shrink-0 bg-muted hover:bg-muted/80">
            <UserPlus className="w-3.5 h-3.5 text-primary" />
          </Button>
        </div>
      )}
    </div>
  );
}
