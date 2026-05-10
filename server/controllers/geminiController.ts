import { Request, Response } from "express";
import { geminiService } from "../services/geminiService";
import { specService } from "../services/specService";

export class GeminiController {
  async analyzeIdea(req: Request, res: Response) {
    try {
      const { idea, mode } = req.body;
      const result = await geminiService.analyzeIdea(idea, mode);
      res.json(result);
    } catch (error) {
      console.error('Error analyzing idea:', error);
      res.status(500).json({ error: 'Failed to analyze idea' });
    }
  }

  async chatWithIdea(req: Request, res: Response) {
    try {
      const { messages, idea, mode } = req.body;
      const result = await geminiService.chatWithIdea(messages, idea, mode);
      res.json({ text: result });
    } catch (error) {
      console.error('Error in chat:', error);
      res.status(500).json({ error: 'Failed to chat with idea' });
    }
  }

  async generateSpec(req: Request, res: Response) {
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
      console.error('Error generating spec:', error);
      res.status(500).json({ error: 'Failed to generate spec' });
    }
  }

  async simplifyProjectDescription(req: Request, res: Response) {
    try {
      const { originalIdea, analysisFeedback, chatMessages } = req.body;
      const result = await geminiService.simplifyProjectDescription(originalIdea, analysisFeedback, chatMessages);
      res.json({ text: result });
    } catch (error) {
      console.error('Error simplifying project description:', error);
      res.status(500).json({ error: 'Failed to simplify project description' });
    }
  }

  async getEmbedding(req: Request, res: Response) {
    try {
      const { text } = req.body;
      const result = await geminiService.getEmbedding(text);
      res.json({ embedding: result });
    } catch (error) {
      console.error('Error generating embedding:', error);
      res.status(500).json({ error: 'Failed to generate embedding' });
    }
  }

  async embedSpec(req: Request, res: Response) {
    try {
      const { specId, contentToSave } = req.body;
      
      console.log(`Starting ingestion for specId: ${specId}`);
      const embedding = await geminiService.getEmbedding(contentToSave.substring(0, 5000));
      await specService.updateSpec(specId, { embedding });
      console.log(`Vector index updated for specId: ${specId}`);
      
      res.json({ success: true });
    } catch (error) {
      console.error("Embedding generation failed:", error);
      res.status(500).json({ error: "Embedding generation failed" });
    }
  }
}

export const geminiController = new GeminiController();
