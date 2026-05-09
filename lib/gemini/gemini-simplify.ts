import { ai } from "./gemini-client";
import { Message, IdeaFeedback } from "../types";

export const simplifyProjectDescription = async (
  originalIdea: string,
  analysisFeedback: IdeaFeedback,
  chatMessages: Message[]
): Promise<string> => {
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

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: inputContext,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      }
    });

    return response.text || "Failed to generate refined description.";
  } catch (error) {
    console.error("Error simplifying project description:", error);
    throw error;
  }
};
