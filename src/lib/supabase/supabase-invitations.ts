import { supabase } from './supabase';
import type { Database } from './supabase';

export type InvitationStatus = 'pending' | 'accepted' | 'declined' | 'expired';

export interface ProjectInvitation {
  id: string;
  project_id: string;
  email: string;
  token: string;
  status: InvitationStatus;
  expires_at: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface InvitationWithProject extends ProjectInvitation {
  project?: {
    id: string;
    title: string;
    user_id: string;
  };
}

export const getInvitationsByProject = async (projectId: string): Promise<ProjectInvitation[]> => {
  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const createInvitation = async (
  projectId: string,
  email: string
): Promise<ProjectInvitation> => {
  const { data, error } = await supabase
    .from('project_invitations')
    .insert({
      project_id: projectId,
      email: email.toLowerCase().trim(),
      status: 'pending',
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      throw new Error('An invitation for this email already exists for this project');
    }
    throw error;
  }

  return data;
};

export const acceptInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_invitations')
    .update({ status: 'accepted' })
    .eq('id', invitationId)
    .eq('status', 'pending');

  if (error) throw error;
};

export const declineInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_invitations')
    .update({ status: 'declined' })
    .eq('id', invitationId)
    .eq('status', 'pending');

  if (error) throw error;
};

export const getInvitationByToken = async (token: string): Promise<InvitationWithProject | null> => {
  const { data, error } = await supabase
    .from('project_invitations')
    .select(`
      *,
      project:projects(
        id,
        title,
        user_id
      )
    `)
    .eq('token', token)
    .single();

  if (error) return null;
  return data;
};

export const getInvitationById = async (id: string): Promise<ProjectInvitation | null> => {
  const { data, error } = await supabase
    .from('project_invitations')
    .select('*')
    .eq('id', id)
    .single();

  if (error) return null;
  return data;
};

export const getUserPendingInvitations = async (): Promise<InvitationWithProject[]> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return [];

  const { data, error } = await supabase
    .from('project_invitations')
    .select(`
      *,
      project:projects(
        id,
        title,
        user_id
      )
    `)
    .eq('email', user.email.toLowerCase())
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
};

export const deleteInvitation = async (invitationId: string): Promise<void> => {
  const { error } = await supabase
    .from('project_invitations')
    .delete()
    .eq('id', invitationId);

  if (error) throw error;
};

export const checkInvitationExpiry = async (invitation: ProjectInvitation): Promise<boolean> => {
  if (invitation.status !== 'pending') {
    return invitation.status === 'expired';
  }

  if (new Date(invitation.expires_at) < new Date()) {
    const { error } = await supabase
      .from('project_invitations')
      .update({ status: 'expired' })
      .eq('id', invitation.id);

    if (!error) return true;
  }

  return false;
};