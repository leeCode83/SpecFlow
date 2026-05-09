export const getEmbedding = async (text: string): Promise<number[]> => {
  const res = await fetch("/api/gemini/embedding", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text })
  });
  if (!res.ok) throw new Error("Failed to get embedding");
  const data = await res.json();
  return data.embedding;
};
