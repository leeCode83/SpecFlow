import { Router } from "express";
import { geminiController } from "../controllers/geminiController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { aiLimiter, embeddingLimiter } from "../middleware/rateLimiter";
import { 
  AnalyzeIdeaSchema, 
  ChatWithIdeaSchema, 
  GenerateSpecSchema, 
  SimplifyProjectDescriptionSchema, 
  GetEmbeddingSchema,
  EmbedSpecSchema
} from "../schemas/geminiSchemas";

export const geminiRoutes = Router();

// All gemini routes require authentication
geminiRoutes.use(requireAuth);

geminiRoutes.post("/analyze-idea", aiLimiter, validateBody(AnalyzeIdeaSchema), geminiController.analyzeIdea.bind(geminiController));
geminiRoutes.post("/chat", aiLimiter, validateBody(ChatWithIdeaSchema), geminiController.chatWithIdea.bind(geminiController));
geminiRoutes.post("/generate-spec", aiLimiter, validateBody(GenerateSpecSchema), geminiController.generateSpec.bind(geminiController));
geminiRoutes.post("/simplify-description", aiLimiter, validateBody(SimplifyProjectDescriptionSchema), geminiController.simplifyProjectDescription.bind(geminiController));
geminiRoutes.post("/embedding", embeddingLimiter, validateBody(GetEmbeddingSchema), geminiController.getEmbedding.bind(geminiController));
geminiRoutes.post("/embed-spec", embeddingLimiter, validateBody(EmbedSpecSchema), geminiController.embedSpec.bind(geminiController));
