import { Router } from "express";
import { geminiController } from "../controllers/geminiController";
import { requireAuth } from "../middleware/auth";
import { validateBody } from "../middleware/validate";
import { aiLimiter, embeddingLimiter, publicAiLimiter } from "../middleware/rateLimiter";
import { 
  AnalyzeIdeaSchema, 
  ChatWithIdeaSchema, 
  GenerateSpecSchema, 
  SimplifyProjectDescriptionSchema, 
  GetEmbeddingSchema,
  EmbedSpecSchema
} from "../schemas/geminiSchemas";

export const geminiRoutes = Router();

// Public: landing page demo — no auth, strict 5 req/min rate limit
geminiRoutes.post("/analyze-idea", publicAiLimiter, validateBody(AnalyzeIdeaSchema), geminiController.analyzeIdea.bind(geminiController));
// Authenticated routes below
geminiRoutes.post("/chat", requireAuth, aiLimiter, validateBody(ChatWithIdeaSchema), geminiController.chatWithIdea.bind(geminiController));
geminiRoutes.post("/generate-spec", requireAuth, aiLimiter, validateBody(GenerateSpecSchema), geminiController.generateSpec.bind(geminiController));
geminiRoutes.post("/simplify-description", requireAuth, aiLimiter, validateBody(SimplifyProjectDescriptionSchema), geminiController.simplifyProjectDescription.bind(geminiController));
geminiRoutes.post("/embedding", requireAuth, embeddingLimiter, validateBody(GetEmbeddingSchema), geminiController.getEmbedding.bind(geminiController));
geminiRoutes.post("/embed-spec", requireAuth, embeddingLimiter, validateBody(EmbedSpecSchema), geminiController.embedSpec.bind(geminiController));
