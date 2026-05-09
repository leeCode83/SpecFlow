import { Message } from "@/types";
import { ai } from "./gemini-client";

export const chatWithIdea = async (
  messages: Message[],
  idea: string,
  mode: string
): Promise<string> => {
  const model = "gemini-3.1-pro-preview";
  
  const systemInstruction = `You are a helpful product strategist consultant. The user wants to build an app based on this idea: "${idea}" with mode "${mode}".
  Your goal is to help them refine, elaborate, and solidify their project idea. Ask clarifying questions, suggest features, and help them arrive at a clear project title and description.`;

  const response = await ai.models.generateContent({
    model,
    contents: JSON.stringify(messages),
    config: { systemInstruction },
  });

  return response.text;
};
