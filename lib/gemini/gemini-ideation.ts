import { IdeaFeedback, Mode } from "@/lib/types";
import { ai } from "./gemini-client";
import { IDEATION_PROMPTS } from "@/constants/AI-BRIEF";

export const analyzeIdea = async (idea: string, mode: Mode): Promise<IdeaFeedback> => {
  const model = "gemini-3-flash-preview"; // using latest flash preview
  
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
};

