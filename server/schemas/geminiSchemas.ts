import { z } from "zod";

export const AnalyzeIdeaSchema = z.object({
  idea: z.string().min(1).max(10000),
  mode: z.enum(['Learning', 'Hackathon', 'Startup']).optional(),
});

export const ChatWithIdeaSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  idea: z.string().min(1),
  mode: z.enum(['Learning', 'Hackathon', 'Startup']).optional(),
});

export const GenerateSpecSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })),
  specType: z.string().min(1),
  projectContext: z.string().optional(),
  similarSpecs: z.array(z.string()).optional(),
  existingProjectSpecs: z.array(z.string()).optional(),
});

export const SimplifyProjectDescriptionSchema = z.object({
  originalIdea: z.string().min(1),
  analysisFeedback: z.any().optional(),
  chatMessages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

export const GetEmbeddingSchema = z.object({
  text: z.string().min(1),
});

export const EmbedSpecSchema = z.object({
  specId: z.string().uuid(),
  contentToSave: z.string().min(1),
});
