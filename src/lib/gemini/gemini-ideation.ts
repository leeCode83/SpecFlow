import { IdeaFeedback, Mode } from "@/lib/types";
import { authenticatedFetch } from "@/lib/api-client";

export const analyzeIdea = async (idea: string, mode: Mode): Promise<IdeaFeedback> => {
  const res = await authenticatedFetch("/api/gemini/analyze-idea", {
    method: "POST",
    body: JSON.stringify({ idea, mode })
  });
  if (!res.ok) throw new Error("Failed to analyze idea");
  return res.json();
};

