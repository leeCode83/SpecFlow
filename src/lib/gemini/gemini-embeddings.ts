import { authenticatedFetch } from "@/lib/api-client";

export const getEmbedding = async (text: string): Promise<number[]> => {
  const res = await authenticatedFetch("/api/gemini/embedding", {
    method: "POST",
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error("Failed to get embedding");
  const data = await res.json();
  return data.embedding;
};
