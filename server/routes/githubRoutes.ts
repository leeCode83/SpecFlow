import { Router } from "express";
import { GithubController } from "../controllers/githubController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import {
  SyncRepoSchema,
  GetContentsSchema,
  GetFileSchema,
  CreatePRSchema,
} from "../schemas/githubSchemas";

export const githubRoutes = Router();
const controller = new GithubController();

githubRoutes.use(requireAuth);

githubRoutes.post("/sync", validateBody(SyncRepoSchema), controller.sync.bind(controller));
githubRoutes.get("/repo-status", controller.getRepoStatus.bind(controller));
githubRoutes.get("/contents", controller.getContents.bind(controller));
githubRoutes.get("/file", controller.getFile.bind(controller));
githubRoutes.post("/create-pr", validateBody(CreatePRSchema), controller.createPR.bind(controller));
