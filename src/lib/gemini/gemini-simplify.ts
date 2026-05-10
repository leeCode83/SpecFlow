import { Message, IdeaFeedback } from "../types";
import { authenticatedFetch } from "@/lib/api-client";

export const simplifyProjectDescription = async (
  originalIdea: string,
  analysisFeedback: IdeaFeedback,
  chatMessages: Message[]
): Promise<string> => {
  const res = await authenticatedFetch("/api/gemini/simplify-description", {
    method: "POST",
    body: JSON.stringify({ originalIdea, analysisFeedback, chatMessages })
  });
  if (!res.ok) throw new Error("Failed to simplify project description");
  const data = await res.json();
  return data.text;
};
