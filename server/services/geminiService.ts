import { GoogleGenAI } from "@google/genai";
import { IDEATION_PROMPTS } from "../../src/constants/AI-BRIEF";
import { Message, IdeaFeedback, Mode } from "../../src/lib/types";
import { ApiError } from "../lib/ApiError";

/**
 * Service to interact with Google Gemini AI models.
 * Includes retry logic, message history management, and result parsing.
 */

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

export class GeminiService {
  /**
   * Helper to truncate message history to keep within model context limits.
   * Keeps the last 15 messages by default.
   */
  private truncateHistory(messages: Message[], limit: number = 15): Message[] {
    if (messages.length <= limit) return messages;
    return messages.slice(-limit);
  }

  /**
   * Safe JSON parsing for AI responses.
   * Cleans up potential Markdown formatting or extra text.
   */
  private safeParseJSON<T>(text: string, fallback: T): T {
    try {
      // Remove potential markdown code blocks
      let cleanText = text.replace(/```json\n?|```/g, '').trim();
      // Extract JSON substring in case model appends extra text after the JSON
      const firstBrace = cleanText.indexOf('{');
      const lastBrace = cleanText.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace > firstBrace) {
        cleanText = cleanText.slice(firstBrace, lastBrace + 1);
      }
      return JSON.parse(cleanText) as T;
    } catch (e) {
      console.error("Failed to parse AI JSON response:", e, "Text:", text);
      return fallback;
    }
  }

  private async withRetry<T>(fn: () => Promise<T>, maxRetries: number = 2): Promise<T> {
    let lastError: Error | undefined;
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error: any) {
        lastError = error;
        const status = error?.status || error?.response?.status;
        if (status === 429 || (status >= 500 && status <= 599)) {
          const delay = Math.pow(2, i) * 1000;
          console.warn(`Gemini API error ${status}. Retrying in ${delay}ms... (Attempt ${i + 1}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        throw error;
      }
    }
    throw new ApiError(429, "AI service is temporarily overloaded. Please try again in a moment.");
  }

  private async withModelFallback<T>(
    primaryModel: string,
    fallbackModel: string,
    fn: (model: string) => Promise<T>
  ): Promise<T> {
    try {
      return await this.withRetry(() => fn(primaryModel));
    } catch (primaryError: any) {
      const status = primaryError?.status || primaryError?.response?.status;
      console.warn(`Model ${primaryModel} failed (${status}), falling back to ${fallbackModel}`);
    }
    return this.withRetry(() => fn(fallbackModel)).catch(() => {
      throw new ApiError(429, "AI service is temporarily overloaded. Please try again in a moment.");
    });
  }

  async analyzeIdea(idea: string, mode: Mode): Promise<IdeaFeedback> {
    const model = "gemini-3-flash-preview";
    const fallbackModel = "gemini-3.1-flash-lite-preview";
    const systemInstruction = IDEATION_PROMPTS[mode.toLowerCase() as keyof typeof IDEATION_PROMPTS];

    const response = await this.withModelFallback(model, fallbackModel, (m) => ai.models.generateContent({
      model: m,
      contents: idea,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
      },
    }));

    const parsed = this.safeParseJSON(response.text || '{}', {});
    return { ...parsed, mode } as IdeaFeedback;
  }

  async chatWithIdea(messages: Message[], idea: string, mode: string): Promise<string> {
    const model = "gemini-3.1-pro-preview";
    const fallbackModel = "gemini-3.1-flash-lite-preview";
    const history = this.truncateHistory(messages);
    
    const systemInstruction = `You are a helpful product strategist consultant. The user wants to build an app based on this idea: "${idea}" with mode "${mode}".
  Your goal is to help them refine, elaborate, and solidify their project idea. Ask clarifying questions, suggest features, and help them arrive at a clear project title and description.`;

    const response = await this.withModelFallback(model, fallbackModel, (m) => ai.models.generateContent({
      model: m,
      contents: JSON.stringify(history),
      config: { systemInstruction },
    }));

    return response.text || '';
  }

  async generateSpec(
    messages: Message[],
    specType: string,
    projectContext: string,
    similarSpecs?: string[],
    existingProjectSpecs?: string[]
  ): Promise<string> {
    const model = "gemini-3-flash-preview";
    const fallbackModel = "gemini-3.1-flash-lite-preview";
    const history = this.truncateHistory(messages);

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

    const response = await this.withModelFallback(model, fallbackModel, (m) => ai.models.generateContent({
      model: m,
      contents: JSON.stringify(history),
      config: { systemInstruction },
    }));

    return response.text || '';
  }

  async simplifyProjectDescription(
    originalIdea: string,
    analysisFeedback: IdeaFeedback,
    chatMessages: Message[]
  ): Promise<string> {
    const model = "gemini-3.1-pro-preview";
    const fallbackModel = "gemini-3.1-flash-lite-preview";
    const history = this.truncateHistory(chatMessages);
    
    const systemPrompt = `You are an expert product manager and software architect.
Your task is to take a user's original raw idea, the structural analysis of that idea, and the elaboration chat history, and synthesize them into a clear, cohesive, and comprehensive project description.

Do not just concatenate the information. Rewrite it into a single narrative that a developer can use as a "Project Context" or "Project Description".

It should include:
- A concise summary (One-liner)
- The core problem being solved
- Target User
- Key features to be built based on the chat elaboration and initial analysis.
- The refined scope of the project based on the discussion.

Keep it well-structured using Markdown, clear, and professional. Avoid conversational filler.`;

    const inputContext = `
## Original Idea
${originalIdea}

## System Analysis Summary
One liner: ${analysisFeedback.refinedIdea?.oneLiner || ""}
Problem: ${analysisFeedback.refinedIdea?.problem || ""}
Target User: ${analysisFeedback.refinedIdea?.targetUser || ""}

## Elaboration Chat History
${history.length > 0 ? history.map(m => `**${m.role === 'user' ? 'User' : 'AI Consultant'}**: ${m.content}`).join('\n') : "No elaboration conversation."}
  `;

    const response = await this.withModelFallback(model, fallbackModel, (m) => ai.models.generateContent({
      model: m,
      contents: inputContext,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    }));

    return response.text || "Failed to generate refined description.";
  }

  async getEmbedding(text: string): Promise<number[]> {
    const model = "gemini-embedding-001";
    const result = await this.withRetry(() => ai.models.embedContent({
      model,
      contents: text,
      config: {
        outputDimensionality: 768
      }
    }));
    return (result.embeddings?.[0]?.values as number[]) || [];
  }
}

export const geminiService = new GeminiService();
