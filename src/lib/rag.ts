import { supabase } from "./supabase/supabase";
import { getEmbedding } from "./gemini/gemini-embeddings";

export interface SimilarSpec {
  id: string;
  title: string;
  content: string;
  type: string;
  similarity: number;
}

export const retrieveSimilarSpecs = async (
  query: string,
  specType: string,
  userId: string,
  limit: number = 3
): Promise<SimilarSpec[]> => {
  try {
    // Generate embedding for the query
    const queryEmbedding = await getEmbedding(query);

    // Call Supabase RPC
    const { data, error } = await supabase.rpc("match_specs", {
      query_embedding: queryEmbedding,
      match_threshold: 0.7, // Only return reasonably similar results
      match_count: limit,
      filter_user_id: userId,
      filter_type: specType,
    });

    if (error) {
      console.error("Error retrieving similar specs:", error);
      return [];
    }

    return (data as SimilarSpec[]) || [];
  } catch (err) {
    console.error("Failed to retrieve similar specs:", err);
    return [];
  }
};
