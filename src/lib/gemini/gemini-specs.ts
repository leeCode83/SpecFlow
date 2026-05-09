import { Message } from "@/lib/types";

export const generateSpec = async (
  messages: Message[],
  specType: string,
  projectContext: string,
  similarSpecs?: string[],
  existingProjectSpecs?: string[]
): Promise<string> => {
  const res = await fetch("/api/gemini/generate-spec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messages, specType, projectContext, similarSpecs, existingProjectSpecs })
  });
  if (!res.ok) throw new Error("Failed to generate spec");
  const data = await res.json();
  return data.text;
};
