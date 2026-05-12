import { supabaseAdmin } from '../lib/supabase';

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
  project_title?: string;
  project_owner_email?: string;
}

const INVITATION_EXPIRY_DAYS = 7;

export class InvitationService {
  private getExpiryDate(): string {
    const expiry = new Date();
    expiry.setDate(expiry.getDate() + INVITATION_EXPIRY_DAYS);
    return expiry.toISOString();
  }

  async createInvitation(
    projectId: string,
    email: string,
    createdBy: string
  ): Promise<ProjectInvitation> {
    if (!createdBy) {
      throw new Error('User ID is required');
    }

    const expiresAt = this.getExpiryDate();

    const { data, error } = await supabaseAdmin
      .from('project_invitations')
      .insert({
        project_id: projectId,
        email: email.toLowerCase().trim(),
        status: 'pending',
        expires_at: expiresAt,
        created_by: createdBy,
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
  }

  async acceptInvitation(
    invitationId: string,
    userId: string,
    userEmail: string
  ): Promise<void> {
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('project_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('This invitation is for a different email address');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    if (new Date(invitation.expires_at) < new Date()) {
      await supabaseAdmin
        .from('project_invitations')
        .update({ status: 'expired' })
        .eq('id', invitationId);
      throw new Error('Invitation has expired');
    }

    const { error: updateError } = await supabaseAdmin
      .from('project_invitations')
      .update({ status: 'accepted' })
      .eq('id', invitationId);

    if (updateError) throw updateError;

    const { data: project, error: projectError } = await supabaseAdmin
      .from('projects')
      .select('teammates')
      .eq('id', invitation.project_id)
      .single();

    if (projectError) throw projectError;

    const currentTeammates = project.teammates || [];
    if (!currentTeammates.includes(userId)) {
      const { error: projectUpdateError } = await supabaseAdmin
        .from('projects')
        .update({ teammates: [...currentTeammates, userId] })
        .eq('id', invitation.project_id);

      if (projectUpdateError) throw projectUpdateError;
    }
  }

  async declineInvitation(invitationId: string, userId: string, userEmail: string): Promise<void> {
    const { data: invitation, error: fetchError } = await supabaseAdmin
      .from('project_invitations')
      .select('*')
      .eq('id', invitationId)
      .single();

    if (fetchError || !invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.email.toLowerCase() !== userEmail.toLowerCase()) {
      throw new Error('This invitation is for a different email address');
    }

    if (invitation.status !== 'pending') {
      throw new Error(`Invitation has already been ${invitation.status}`);
    }

    const { error: updateError } = await supabaseAdmin
      .from('project_invitations')
      .update({ status: 'declined' })
      .eq('id', invitationId);

    if (updateError) throw updateError;
  }

  async getInvitationsByProject(projectId: string): Promise<ProjectInvitation[]> {
    const { data, error } = await supabaseAdmin
      .from('project_invitations')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getInvitationByToken(token: string): Promise<InvitationWithProject | null> {
    const { data, error } = await supabaseAdmin
      .from('project_invitations')
      .select(`
        *,
        project:projects(
          title,
          user_id,
          owner:profiles!projects_user_id_fkey(
            email
          )
        )
      `)
      .eq('token', token)
      .single();

    if (error) return null;
    return data;
  }

  async getInvitationById(id: string): Promise<ProjectInvitation | null> {
    const { data, error } = await supabaseAdmin
      .from('project_invitations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return null;
    return data;
  }

  async getUserPendingInvitations(userEmail: string): Promise<InvitationWithProject[]> {
    await this.expireOldInvitations();

    const { data, error } = await supabaseAdmin
      .from('project_invitations')
      .select(`
        *,
        project:projects(
          id,
          title,
          user_id,
          owner:profiles!projects_user_id_fkey(
            email,
            full_name
          )
        )
      `)
      .eq('email', userEmail.toLowerCase())
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async expireOldInvitations(): Promise<void> {
    const { error } = await supabaseAdmin
      .from('project_invitations')
      .update({ status: 'expired' })
      .eq('status', 'pending')
      .lt('expires_at', new Date().toISOString());

    if (error) {
      console.error('Error expiring invitations:', error);
    }
  }

  async deleteInvitation(invitationId: string, projectOwnerId: string): Promise<void> {
    const { data: invitation } = await supabaseAdmin
      .from('project_invitations')
      .select('project_id, created_by')
      .eq('id', invitationId)
      .single();

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    const { data: project } = await supabaseAdmin
      .from('projects')
      .select('user_id')
      .eq('id', invitation.project_id)
      .single();

    if (!project) {
      throw new Error('Project not found');
    }

    if (project.user_id !== projectOwnerId) {
      throw new Error('Only project owner can delete invitations');
    }

    const { error } = await supabaseAdmin
      .from('project_invitations')
      .delete()
      .eq('id', invitationId);

    if (error) throw error;
  }

  async getUsersEmails(userIds: string[]): Promise<Record<string, string>> {
    const result: Record<string, string> = {};
    for (const id of userIds) {
      try {
        const { data, error } = await supabaseAdmin.auth.admin.getUserById(id);
        if (!error && data?.user?.email) {
          result[id] = data.user.email;
        }
      } catch (e) {
        console.error(`Error fetching user email for ${id}:`, e);
      }
    }
    return result;
  }
}

export const invitationService = new InvitationService();