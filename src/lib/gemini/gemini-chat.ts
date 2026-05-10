import { Message } from "@/lib/types";
import { authenticatedFetch } from "@/lib/api-client";

export const chatWithIdea = async (
  messages: Message[],
  idea: string,
  mode: string
): Promise<string> => {
  const res = await authenticatedFetch("/api/gemini/chat", {
    method: "POST",
    body: JSON.stringify({ messages, idea, mode })
  });
  if (!res.ok) throw new Error("Failed to chat with idea");
  const data = await res.json();
  return data.text;
};
