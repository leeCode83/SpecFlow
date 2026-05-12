import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase/supabase';
import { authenticatedFetch } from '@/lib/api-client';
import {
  ProjectInvitation,
  InvitationWithProject,
  getInvitationsByProject,
  getUserPendingInvitations,
  createInvitation as createInvitationApi,
  deleteInvitation as deleteInvitationApi,
  checkInvitationExpiry,
} from '@/lib/supabase/supabase-invitations';
import { toast } from 'sonner';

/**
 * Hook to manage project invitations.
 */
export function useInvitations(projectId?: string) {
  const [invitations, setInvitations] = useState<ProjectInvitation[]>([]);
  const [pendingInvitations, setPendingInvitations] = useState<InvitationWithProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [pendingLoading, setPendingLoading] = useState(false);

  const fetchInvitations = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getInvitationsByProject(projectId);
      setInvitations(data);
    } catch (error) {
      console.error('Error fetching invitations:', error);
      toast.error('Failed to load invitations');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchUserPendingInvitations = useCallback(async () => {
    setPendingLoading(true);
    try {
      const data = await getUserPendingInvitations();
      setPendingInvitations(data);
    } catch (error) {
      console.error('Error fetching user invitations:', error);
    } finally {
      setPendingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvitations();
    fetchUserPendingInvitations();
  }, [fetchInvitations, fetchUserPendingInvitations]);

  const createInvitation = async (email: string) => {
    if (!projectId) return;
    try {
      await createInvitationApi(projectId, email);
      await fetchInvitations();
      toast.success('Invitation sent successfully');
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        toast.error('An invitation for this email already exists');
      } else {
        toast.error('Failed to send invitation');
      }
      throw error;
    }
  };

  const acceptInvitation = async (invitationId: string) => {
    try {
      const invitation = pendingInvitations.find(i => i.id === invitationId);
      if (invitation) {
        const isExpired = await checkInvitationExpiry(invitation);
        if (isExpired) {
          toast.error('This invitation has expired');
          await fetchUserPendingInvitations();
          return;
        }
      }

      const res = await authenticatedFetch(`/api/invitations/${invitationId}/accept`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to accept invitation' }));
        throw new Error(err.message || err.error || 'Failed to accept invitation');
      }

      await fetchUserPendingInvitations();
      toast.success('Invitation accepted! You now have access to the project.');
    } catch (error) {
      console.error('Error accepting invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to accept invitation');
      throw error;
    }
  };

  const declineInvitation = async (invitationId: string) => {
    try {
      const res = await authenticatedFetch(`/api/invitations/${invitationId}/decline`, {
        method: 'POST',
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: 'Failed to decline invitation' }));
        throw new Error(err.message || err.error || 'Failed to decline invitation');
      }

      await fetchUserPendingInvitations();
      toast.success('Invitation declined');
    } catch (error) {
      console.error('Error declining invitation:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to decline invitation');
      throw error;
    }
  };

  const deleteInvitation = async (invitationId: string) => {
    try {
      await deleteInvitationApi(invitationId);
      await fetchInvitations();
      toast.success('Invitation deleted');
    } catch (error) {
      console.error('Error deleting invitation:', error);
      toast.error('Failed to delete invitation');
      throw error;
    }
  };

  return {
    invitations,
    pendingInvitations,
    loading,
    pendingLoading,
    createInvitation,
    acceptInvitation,
    declineInvitation,
    deleteInvitation,
    refreshInvitations: fetchInvitations,
    refreshUserInvitations: fetchUserPendingInvitations,
  };
}