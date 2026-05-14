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
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body.error === 'string' ? body.error : body.message;
    throw new Error(message || "Rate limit reached. Please wait a moment and try again.");
  }
  if (!res.ok) throw new Error("Failed to chat with idea");
  const data = await res.json();
  return data.text;
};
