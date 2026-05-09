import { GoogleGenAI } from "@google/genai";
import { IDEATION_PROMPTS } from "../../src/constants/AI-BRIEF";
import { Message, IdeaFeedback, Mode } from "../../src/lib/types";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export class GeminiService {
  async analyzeIdea(idea: string, mode: Mode): Promise<IdeaFeedback> {
    const model = "gemini-3-flash-preview";
    const systemInstruction = IDEATION_PROMPTS[mode.toLowerCase() as keyof typeof IDEATION_PROMPTS];

    const response = await ai.models.generateContent({
      model,
      contents: idea,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return { ...parsed, mode } as IdeaFeedback;
  }

  async chatWithIdea(messages: Message[], idea: string, mode: string): Promise<string> {
    const model = "gemini-3.1-pro-preview";
    const systemInstruction = `You are a helpful product strategist consultant. The user wants to build an app based on this idea: "${idea}" with mode "${mode}".
  Your goal is to help them refine, elaborate, and solidify their project idea. Ask clarifying questions, suggest features, and help them arrive at a clear project title and description.`;

    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify(messages),
      config: { systemInstruction },
    });

    return response.text || '';
  }

  async generateSpec(
    messages: Message[],
    specType: string,
    projectContext: string,
    similarSpecs?: string[],
    existingProjectSpecs?: string[]
  ): Promise<string> {
    const model = "gemini-3.1-pro-preview";
    const systemInstruction = `You are a Technical Architect. Your goal is to DISCUSS and REFINE the ${specType} specification with the user first.
  
  GUIDELINES:
  1. Do NOT generate the full specification immediately unless the user explicitly asks for it or you have enough info.
  2. Ask clarifying questions one by one about requirements, tech stack, and edge cases.
  3. When you are ready to propose a specification update, wrap the ENTIRE Markdown content inside [GENERATE_SPEC] and [/GENERATE_SPEC] tags.
  4. Always provide a brief explanation or summary outside the tags of what you are proposing to update.
  
  Specification Sections should include:
  1. Requirements / User Stories
  2. Technical Decisions + Rationale
  3. Code Structure Proposal
  4. Dependencies & Setup
  5. Edge Cases
  
  Project context: ${projectContext}
  Existing specs in CURRENT project (ensure compatibility with these):
  ${existingProjectSpecs?.join('\n\n') || 'None'}
  
  Similar past specs from you/others (for reference/ideas): ${similarSpecs?.join('\n\n') || 'None'}
  `;

    const response = await ai.models.generateContent({
      model,
      contents: JSON.stringify(messages),
      config: { systemInstruction },
    });

    return response.text || '';
  }

  async simplifyProjectDescription(
    originalIdea: string,
    analysisFeedback: IdeaFeedback,
    chatMessages: Message[]
  ): Promise<string> {
    const model = "gemini-3.1-pro-preview";
    const systemPrompt = `You are an expert product manager and software architect.
Your task is to take a user's original raw idea, the structural analysis of that idea, and the elaboration chat history, and synthesize them into a clear, cohesive, and comprehensive project description.

Do not just concatenate the information. Rewrite it into a single narrative that a developer can use as a "Project Context" or "Project Description".

It should include:
- A concise summary (One-liner)
- The core problem being solved
- Target User
- Key features to be built based on the chat elaboration and initial analysis.
- The refined scope of the project based on the discussion.

Keep it well-structured using Markdown, clear, and professional. Avoid conversational filler (like "Sure, I can help with that").`;

    const inputContext = `
## Original Idea
${originalIdea}

## System Analysis Summary
One liner: ${analysisFeedback.refinedIdea?.oneLiner || ""}
Problem: ${analysisFeedback.refinedIdea?.problem || ""}
Target User: ${analysisFeedback.refinedIdea?.targetUser || ""}

## Elaboration Chat History
${chatMessages.length > 0 ? chatMessages.map(m => `**${m.role === 'user' ? 'User' : 'AI Consultant'}**: ${m.content}`).join('\n') : "No elaboration conversation."}
  `;

    const response = await ai.models.generateContent({
      model: model,
      contents: inputContext,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate refined description.";
  }

  async getEmbedding(text: string): Promise<number[]> {
    const model = "gemini-embedding-001";
    const result = await ai.models.embedContent({
      model,
      contents: text,
      config: {
        outputDimensionality: 768
      }
    });
    return (result.embeddings?.[0]?.values as number[]) || [];
  }
}

export const geminiService = new GeminiService();
