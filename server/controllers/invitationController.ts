import { Request, Response, NextFunction } from "express";
import { invitationService } from "../services/invitationService";
import { ApiError } from "../lib/ApiError";
import { supabaseAdmin } from "../lib/supabase";

/**
 * Controller for project invitation operations.
 */
export class InvitationController {
  async createInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const { email } = req.body;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      if (!email) {
        throw new ApiError(400, 'Email is required');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new ApiError(400, 'Invalid email format');
      }

      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (!project) {
        throw new ApiError(404, 'Project not found');
      }

      if (project.user_id !== user.id) {
        throw new ApiError(403, 'Only project owner can invite members');
      }

      // Check self-invite using user's email from auth
      if (user.email?.toLowerCase() === email.toLowerCase()) {
        throw new ApiError(400, 'You cannot invite yourself');
      }

      const invitation = await invitationService.createInvitation(
        projectId,
        email,
        user.id
      );

      res.status(201).json(invitation);
    } catch (error) {
      next(error);
    }
  }

  async getInvitationsByProject(req: Request, res: Response, next: NextFunction) {
    try {
      const { projectId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      const { data: project } = await supabaseAdmin
        .from('projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (!project) {
        throw new ApiError(404, 'Project not found');
      }

      if (project.user_id !== user.id) {
        throw new ApiError(403, 'Only project owner can view invitations');
      }

      const invitations = await invitationService.getInvitationsByProject(projectId);

      res.json(invitations);
    } catch (error) {
      next(error);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      const invitation = await invitationService.getInvitationById(invitationId);

      if (!invitation) {
        throw new ApiError(404, 'Invitation not found');
      }

      await invitationService.acceptInvitation(
        invitationId,
        user.id,
        user.email || ''
      );

      res.json({ success: true, message: 'Invitation accepted successfully' });
    } catch (error: any) {
      if (error.message.includes('different email') ||
          error.message.includes('already been') ||
          error.message.includes('expired')) {
        next(new ApiError(400, error.message));
      } else {
        next(error);
      }
    }
  }

  async declineInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      const invitation = await invitationService.getInvitationById(invitationId);

      if (!invitation) {
        throw new ApiError(404, 'Invitation not found');
      }

      await invitationService.declineInvitation(
        invitationId,
        user.id,
        user.email || ''
      );

      res.json({ success: true, message: 'Invitation declined successfully' });
    } catch (error: any) {
      if (error.message.includes('different email') ||
          error.message.includes('already been')) {
        next(new ApiError(400, error.message));
      } else {
        next(error);
      }
    }
  }

  async getInvitationByToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params;

      const invitation = await invitationService.getInvitationByToken(token);

      if (!invitation) {
        throw new ApiError(404, 'Invitation not found');
      }

      res.json(invitation);
    } catch (error) {
      next(error);
    }
  }

  async deleteInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const { invitationId } = req.params;
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      await invitationService.deleteInvitation(invitationId, user.id);

      res.json({ success: true, message: 'Invitation deleted successfully' });
    } catch (error: any) {
      if (error.message.includes('not found') || error.message.includes('Only project owner')) {
        next(new ApiError(403, error.message));
      } else {
        next(error);
      }
    }
  }

  async getUserPendingInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new ApiError(401, 'Authorization required');
      }

      const token = authHeader.split(' ')[1];
      const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);

      if (authError || !user) {
        throw new ApiError(401, 'Invalid authorization token');
      }

      const invitations = await invitationService.getUserPendingInvitations(user.email || '');

      res.json(invitations);
    } catch (error) {
      next(error);
    }
  }
}

export const invitationController = new InvitationController();