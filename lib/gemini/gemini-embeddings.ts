import { ai } from "./gemini-client";

export const getEmbedding = async (text: string): Promise<number[]> => {
  const model = "gemini-embedding-001";
  const result = await ai.models.embedContent({
    model,
    contents: [{ parts: [{ text }] }],
  });
  return result.embeddings[0].values;
};
