import { GoogleGenAI, Type } from "@google/genai";
import { IdeaFeedback, Mode, Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const analyzeIdea = async (idea: string, mode: Mode): Promise<IdeaFeedback> => {
  const model = "gemini-3-flash-preview";
  
  const systemInstruction = `You are a product strategist. Analyze the user's idea based on the selected mode: ${mode}.
  Return the analysis as a structured JSON object.
  
  Modes logic:
  - Hackathon: originality, buildability (24-48h), demo impact.
  - Learning: feasibility for beginners, learning value, time estimate.
  - Startup: market size, monetization potential, MVP scope.
  
  Tech Stack recommendations should be modern and build-ready.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      originality: { type: Type.NUMBER, description: "Score from 0 to 10" },
      buildability: { type: Type.NUMBER, description: "Score from 0 to 10" },
      impact: { type: Type.NUMBER, description: "Score from 0 to 10" },
      feasibility: { type: Type.NUMBER, description: "Score from 0 to 10" },
      learningValue: { type: Type.NUMBER, description: "Score from 0 to 10" },
      marketSize: { type: Type.NUMBER, description: "Score from 0 to 10" },
      monetization: { type: Type.NUMBER, description: "Score from 0 to 10" },
      techStack: {
        type: Type.OBJECT,
        properties: {
          frontend: { type: Type.ARRAY, items: { type: Type.STRING } },
          backend: { type: Type.ARRAY, items: { type: Type.STRING } },
          ai: { type: Type.ARRAY, items: { type: Type.STRING } },
          infrastructure: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      },
      summary: { type: Type.STRING },
      nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
    required: ["originality", "techStack", "summary", "nextSteps"]
  };

  const response = await ai.models.generateContent({
    model,
    contents: idea,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
    },
  });

  return JSON.parse(response.text);
};

export const generateSpec = async (
  messages: Message[],
  specType: string,
  projectContext: string,
  similarSpecs?: string[]
): Promise<string> => {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a Technical Architect. Based on the interview conversation, project context, and similar previous specs, generate a comprehensive ${specType} specification in Markdown.
  
  Sections:
  1. Requirements / User Stories
  2. Technical Decisions + Rationale
  3. Code Structure Proposal
  4. Dependencies & Setup
  5. Edge Cases
  
  Project context: ${projectContext}
  Similar past specs: ${similarSpecs?.join('\n\n') || 'None'}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: JSON.stringify(messages),
    config: { systemInstruction },
  });

  return response.text;
};

export const getEmbedding = async (text: string): Promise<number[]> => {
  const model = "gemini-embedding-2-preview";
  const result = await ai.models.embedContent({
    model,
    contents: [{ parts: [{ text }] }],
  });
  return result.embeddings[0].values;
};
