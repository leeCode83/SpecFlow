import React, { useState } from 'react';
import { X, Mail, UserPlus, Clock, Check, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useInvitations } from '@/hooks/useInvitations';
import { ProjectInvitation } from '@/lib/supabase/supabase-invitations';

interface InviteMemberModalProps {
  projectId: string;
  isOwner: boolean;
  onClose: () => void;
}

function formatExpiryDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/10 text-amber-500 border border-amber-500/20">
          <Clock className="w-2.5 h-2.5" />
          Pending
        </span>
      );
    case 'accepted':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-500/10 text-green-500 border border-green-500/20">
          <Check className="w-2.5 h-2.5" />
          Accepted
        </span>
      );
    case 'declined':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-500/10 text-slate-400 border border-slate-500/20">
          Declined
        </span>
      );
    case 'expired':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-500/10 text-red-400 border border-red-500/20">
          Expired
        </span>
      );
    default:
      return null;
  }
}

/**
 * InviteMemberModal Component
 * UI for project owner to invite teammates by email and view invitation list.
 */
export function InviteMemberModal({ projectId, isOwner, onClose }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const {
    invitations,
    loading,
    createInvitation,
    deleteInvitation,
    refreshInvitations,
  } = useInvitations(projectId);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    try {
      await createInvitation(email.trim());
      setEmail('');
    } catch (error) {
      console.error(error);
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (invitationId: string) => {
    if (window.confirm('Are you sure you want to delete this invitation?')) {
      await deleteInvitation(invitationId);
    }
  };

  const pendingInvitations = invitations.filter(i => i.status === 'pending');
  const processedInvitations = invitations.filter(i => i.status !== 'pending');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 bg-slate-950 border border-slate-800 rounded-2xl shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
              <UserPlus className="w-4 h-4 text-orange-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-100">Invite Team Member</h2>
              <p className="text-[10px] text-slate-500">Invite someone to collaborate on this project</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
            <X className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Invite Form */}
          <form onSubmit={handleInvite} className="flex gap-2">
            <div className="flex-1">
              <Input
                type="email"
                placeholder="Enter email address..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-slate-900 border-slate-800 text-slate-100 placeholder:text-slate-500"
                disabled={sending}
              />
            </div>
            <Button
              type="submit"
              disabled={sending || !email.trim()}
              className="bg-orange-500 hover:bg-orange-600 text-white"
            >
              {sending ? 'Sending...' : 'Send'}
            </Button>
          </form>

          {/* Invitation List */}
          <div className="space-y-3">
            {loading ? (
              <div className="py-4 text-center text-xs text-slate-500">Loading invitations...</div>
            ) : invitations.length === 0 ? (
              <div className="py-4 text-center">
                <p className="text-xs text-slate-500">No invitations yet</p>
                <p className="text-[10px] text-slate-600 mt-1">Enter an email above to invite someone</p>
              </div>
            ) : (
              <>
                {/* Pending Invitations */}
                {pendingInvitations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Pending</p>
                    {pendingInvitations.map((invitation) => (
                      <InvitationItem
                        key={invitation.id}
                        invitation={invitation}
                        onDelete={handleDelete}
                        showDelete={isOwner}
                      />
                    ))}
                  </div>
                )}

                {/* Processed Invitations */}
                {processedInvitations.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-4">History</p>
                    {processedInvitations.map((invitation) => (
                      <InvitationItem
                        key={invitation.id}
                        invitation={invitation}
                        onDelete={handleDelete}
                        showDelete={isOwner}
                      />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface InvitationItemProps {
  invitation: ProjectInvitation;
  onDelete: (id: string) => void;
  showDelete: boolean;
}

function InvitationItem({ invitation, onDelete, showDelete }: InvitationItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-slate-900/50 rounded-xl border border-slate-800/50 group">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 shrink-0">
          <Mail className="w-3.5 h-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-slate-200 truncate">{invitation.email}</p>
          <div className="flex items-center gap-2 mt-0.5">
            {getStatusBadge(invitation.status)}
            <span className="text-[9px] text-slate-600">
              Expires {formatExpiryDate(invitation.expires_at)}
            </span>
          </div>
        </div>
      </div>
      {showDelete && invitation.status === 'pending' && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onDelete(invitation.id)}
          className="opacity-0 group-hover:opacity-100 h-7 w-7 shrink-0 text-slate-500 hover:text-red-400 hover:bg-red-500/10"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      )}
    </div>
  );
}