import React from 'react';
import { Mail, Check, X, Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useInvitations } from '@/hooks/useInvitations';
import { InvitationWithProject } from '@/lib/supabase/supabase-invitations';

interface PendingInvitationsProps {
  onInvitationAccepted?: () => void;
}

/**
 * PendingInvitations Component
 * Shows pending invitations for the logged-in user with Accept/Decline options.
 */
export function PendingInvitations({ onInvitationAccepted }: PendingInvitationsProps) {
  const {
    pendingInvitations,
    pendingLoading,
    acceptInvitation,
    declineInvitation,
    refreshUserInvitations,
  } = useInvitations();

  const handleAccept = async (invitationId: string) => {
    try {
      await acceptInvitation(invitationId);
      onInvitationAccepted?.();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDecline = async (invitationId: string) => {
    if (window.confirm('Are you sure you want to decline this invitation?')) {
      await declineInvitation(invitationId);
    }
  };

  if (pendingLoading) {
    return (
      <div className="bg-slate-900/30 rounded-2xl border border-slate-800/50 p-4">
        <div className="animate-pulse space-y-3">
          <div className="h-4 bg-slate-800 rounded w-1/3"></div>
          <div className="h-12 bg-slate-800/50 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (pendingInvitations.length === 0) {
    return null;
  }

  return (
    <div className="bg-orange-500/5 border border-orange-500/20 rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-full bg-orange-500/10 flex items-center justify-center">
          <Mail className="w-3 h-3 text-orange-500" />
        </div>
        <h3 className="text-xs font-bold text-orange-500">Pending Invitations</h3>
        <span className="ml-auto text-[10px] text-slate-500">
          {pendingInvitations.length} waiting
        </span>
      </div>

      <div className="space-y-2">
        {pendingInvitations.map((invitation) => (
          <InvitationCard
            key={invitation.id}
            invitation={invitation}
            onAccept={() => handleAccept(invitation.id)}
            onDecline={() => handleDecline(invitation.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface InvitationCardProps {
  invitation: InvitationWithProject;
  onAccept: () => void;
  onDecline: () => void;
}

function InvitationCard({ invitation, onAccept, onDecline }: InvitationCardProps) {
  const projectTitle = invitation.project?.title || 'Unknown Project';

  return (
    <div className="bg-slate-900/50 rounded-xl border border-slate-800/50 p-3 space-y-3">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center text-orange-500 border border-orange-500/20 shrink-0">
          <Mail className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-slate-200 truncate">{projectTitle}</p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Invited by <span className="text-slate-400">Project Owner</span>
          </p>
          <p className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            Expires {new Date(invitation.expires_at).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={onAccept}
          size="sm"
          className="flex-1 bg-green-500/10 text-green-500 hover:bg-green-500/20 border border-green-500/20 text-xs h-7"
        >
          <Check className="w-3 h-3 mr-1.5" />
          Accept
        </Button>
        <Button
          onClick={onDecline}
          variant="ghost"
          size="sm"
          className="flex-1 text-slate-400 hover:text-red-400 hover:bg-red-500/10 text-xs h-7"
        >
          <X className="w-3 h-3 mr-1.5" />
          Decline
        </Button>
      </div>
    </div>
  );
}