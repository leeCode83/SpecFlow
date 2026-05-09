import { Message } from "@/lib/types";

export const chatWithIdea = async (
  messages: Message[],
  idea: string,
  mode: string
): Promise<string> => {
  const res = await fetch("/api/gemini/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, idea, mode })
  });
  if (!res.ok) throw new Error("Failed to chat with idea");
  const data = await res.json();
  return data.text;
};
