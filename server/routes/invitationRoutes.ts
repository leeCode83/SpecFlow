import { Router } from "express";
import { invitationController } from "../controllers/invitationController";
import { requireAuth } from "../middleware/auth";

export const invitationRoutes = Router();
export const projectInvitationRoutes = Router();

invitationRoutes.use(requireAuth);
projectInvitationRoutes.use(requireAuth);

projectInvitationRoutes.post("/:projectId/invitations", invitationController.createInvitation.bind(invitationController));
projectInvitationRoutes.get("/:projectId/invitations", invitationController.getInvitationsByProject.bind(invitationController));

invitationRoutes.get("/user/pending", invitationController.getUserPendingInvitations.bind(invitationController));
invitationRoutes.get("/:invitationId", invitationController.getInvitationByToken.bind(invitationController));
invitationRoutes.post("/:invitationId/accept", invitationController.acceptInvitation.bind(invitationController));
invitationRoutes.post("/:invitationId/decline", invitationController.declineInvitation.bind(invitationController));
invitationRoutes.delete("/:invitationId", invitationController.deleteInvitation.bind(invitationController));