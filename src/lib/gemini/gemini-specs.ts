import { Message } from "@/lib/types";
import { authenticatedFetch } from "@/lib/api-client";

export const generateSpec = async (
  messages: Message[],
  specType: string,
  projectContext: string,
  similarSpecs?: string[],
  existingProjectSpecs?: string[]
): Promise<string> => {
  const res = await authenticatedFetch("/api/gemini/generate-spec", {
    method: "POST",
    body: JSON.stringify({ messages, specType, projectContext, similarSpecs, existingProjectSpecs })
  });
  if (res.status === 429) {
    const body = await res.json().catch(() => ({}));
    const message = typeof body.error === 'string' ? body.error : body.message;
    throw new Error(message || "Rate limit reached. Please wait a moment and try again.");
  }
  if (!res.ok) throw new Error("Failed to generate spec");
  const data = await res.json();
  return data.text;
};
