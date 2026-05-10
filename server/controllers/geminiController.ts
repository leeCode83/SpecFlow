import { Request, Response, NextFunction } from "express";
import { geminiService } from "../services/geminiService";
import { specService } from "../services/specService";
import { ApiError } from "../lib/ApiError";

/**
 * Controller for Gemini AI related operations.
 */
export class GeminiController {
  async analyzeIdea(req: Request, res: Response, next: NextFunction) {
    try {
      const { idea, mode } = req.body;
      const result = await geminiService.analyzeIdea(idea, mode);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  async chatWithIdea(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, idea, mode } = req.body;
      const result = await geminiService.chatWithIdea(messages, idea, mode);
      res.json({ text: result });
    } catch (error) {
      next(error);
    }
  }

  async generateSpec(req: Request, res: Response, next: NextFunction) {
    try {
      const { messages, specType, projectContext, similarSpecs, existingProjectSpecs } = req.body;
      const result = await geminiService.generateSpec(
        messages, 
        specType, 
        projectContext, 
        similarSpecs, 
        existingProjectSpecs
      );
      res.json({ text: result });
    } catch (error) {
      next(error);
    }
  }

  async simplifyProjectDescription(req: Request, res: Response, next: NextFunction) {
    try {
      const { originalIdea, analysisFeedback, chatMessages } = req.body;
      const result = await geminiService.simplifyProjectDescription(originalIdea, analysisFeedback, chatMessages);
      res.json({ text: result });
    } catch (error) {
      next(error);
    }
  }

  async getEmbedding(req: Request, res: Response, next: NextFunction) {
    try {
      const { text } = req.body;
      const result = await geminiService.getEmbedding(text);
      res.json({ embedding: result });
    } catch (error) {
      next(error);
    }
  }

  async embedSpec(req: Request, res: Response, next: NextFunction) {
    try {
      const { specId, contentToSave } = req.body;
      
      if (!specId) {
        throw new ApiError(400, "Spec ID is required");
      }

      const embedding = await geminiService.getEmbedding(contentToSave.substring(0, 5000));
      await specService.updateSpec(specId, { embedding });
      
      res.json({ success: true });
    } catch (error) {
      next(error);
    }
  }
}

export const geminiController = new GeminiController();
