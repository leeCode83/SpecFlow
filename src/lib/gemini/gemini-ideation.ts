import { IdeaFeedback, Mode } from "@/lib/types";

export const analyzeIdea = async (idea: string, mode: Mode): Promise<IdeaFeedback> => {
  const res = await fetch("/api/gemini/analyze-idea", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idea, mode })
  });
  if (!res.ok) throw new Error("Failed to analyze idea");
  return res.json();
};

