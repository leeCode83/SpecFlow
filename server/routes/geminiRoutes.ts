import { Router } from "express";
import { geminiController } from "../controllers/geminiController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { 
  AnalyzeIdeaSchema, 
  ChatWithIdeaSchema, 
  GenerateSpecSchema, 
  SimplifyProjectDescriptionSchema, 
  GetEmbeddingSchema 
} from "../schemas/geminiSchemas";

export const geminiRoutes = Router();

// All gemini routes require authentication
geminiRoutes.use(requireAuth);

geminiRoutes.post("/analyze-idea", validateBody(AnalyzeIdeaSchema), geminiController.analyzeIdea.bind(geminiController));
geminiRoutes.post("/chat", validateBody(ChatWithIdeaSchema), geminiController.chatWithIdea.bind(geminiController));
geminiRoutes.post("/generate-spec", validateBody(GenerateSpecSchema), geminiController.generateSpec.bind(geminiController));
geminiRoutes.post("/simplify-description", validateBody(SimplifyProjectDescriptionSchema), geminiController.simplifyProjectDescription.bind(geminiController));
geminiRoutes.post("/embedding", validateBody(GetEmbeddingSchema), geminiController.getEmbedding.bind(geminiController));
