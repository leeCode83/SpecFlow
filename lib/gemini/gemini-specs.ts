import { Message } from "@/lib/types";
import { ai } from "./gemini-client";

export const generateSpec = async (
  messages: Message[],
  specType: string,
  projectContext: string,
  similarSpecs?: string[]
): Promise<string> => {
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
  Similar past specs: ${similarSpecs?.join('\n\n') || 'None'}
  `;

  const response = await ai.models.generateContent({
    model,
    contents: JSON.stringify(messages),
    config: { systemInstruction },
  });

  return response.text;
};
