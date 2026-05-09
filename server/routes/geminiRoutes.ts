import { Router } from "express";
import { geminiController } from "../controllers/geminiController";

export const geminiRoutes = Router();

geminiRoutes.post("/analyze-idea", geminiController.analyzeIdea.bind(geminiController));
geminiRoutes.post("/chat", geminiController.chatWithIdea.bind(geminiController));
geminiRoutes.post("/generate-spec", geminiController.generateSpec.bind(geminiController));
geminiRoutes.post("/simplify-description", geminiController.simplifyProjectDescription.bind(geminiController));
geminiRoutes.post("/embedding", geminiController.getEmbedding.bind(geminiController));
