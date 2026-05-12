import { Router } from "express";
import { invitationService } from "../services/invitationService";
import { requireAuth } from "../middleware/auth";

export const userRoutes = Router();
userRoutes.use(requireAuth);

userRoutes.post("/batch-emails", async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids)) {
      return res.status(400).json({ error: "ids must be an array" });
    }

    const emails = await invitationService.getUsersEmails(ids);
    res.json(emails);
  } catch (error) {
    next(error);
  }
});
