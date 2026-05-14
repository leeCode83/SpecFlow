import { IdeaFeedback, Mode } from "@/lib/types";
import { authenticatedFetch } from "@/lib/api-client";

export const analyzeIdea = async (idea: string, mode: Mode): Promise<IdeaFeedback> => {
  const res = await authenticatedFetch("/api/gemini/analyze-idea", {
    method: "POST",
    body: JSON.stringify({ idea, mode })
  });
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || "Rate limit reached. Please wait a moment and try again.");
  }
  if (!res.ok) throw new Error("Failed to analyze idea");
  return res.json();
};

