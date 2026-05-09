import { Message, IdeaFeedback } from "../types";

export const simplifyProjectDescription = async (
  originalIdea: string,
  analysisFeedback: IdeaFeedback,
  chatMessages: Message[]
): Promise<string> => {
  const res = await fetch("/api/gemini/simplify-description", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ originalIdea, analysisFeedback, chatMessages })
  });
  if (!res.ok) throw new Error("Failed to simplify project description");
  const data = await res.json();
  return data.text;
};
