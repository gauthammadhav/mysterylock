import { RetrievedPassage, DocumentChunkRecord } from "@/types/rag";
import { generateEmbedding, cosineSimilarity } from "@/lib/embeddings/provider";

export interface SearchOptions {
  topK?: number;
  similarityThreshold?: number;
  hybridWeight?: number; // 0.7 vector, 0.3 keyword
}

/**
 * Computes BM25/keyword overlap score between query and document text.
 */
function keywordRelevanceScore(query: string, content: string): number {
  const queryTokens = query.toLowerCase().split(/\W+/).filter((t) => t.length > 2);
  if (queryTokens.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;
  for (const token of queryTokens) {
    if (contentLower.includes(token)) {
      matches++;
    }
  }
  return matches / queryTokens.length;
}

/**
 * Performs hybrid vector + keyword similarity search over a set of document chunks.
 */
export async function searchDocumentChunks(
  query: string,
  chunks: DocumentChunkRecord[],
  options: SearchOptions = {}
): Promise<RetrievedPassage[]> {
  const { topK = 5, similarityThreshold = 0.25, hybridWeight = 0.75 } = options;

  if (!chunks || chunks.length === 0) return [];

  // Generate embedding for query
  const queryEmbedding = await generateEmbedding(query);

  const scoredPassages: RetrievedPassage[] = [];

  for (const chunk of chunks) {
    let vectorScore = 0;
    if (chunk.embedding && chunk.embedding.length > 0) {
      vectorScore = cosineSimilarity(queryEmbedding, chunk.embedding);
    }

    const keywordScore = keywordRelevanceScore(query, chunk.content);

    // Combined hybrid score
    const combinedScore = vectorScore * hybridWeight + keywordScore * (1 - hybridWeight);

    if (combinedScore >= similarityThreshold) {
      scoredPassages.push({
        id: chunk.id,
        document_id: chunk.document_id,
        chunk_index: chunk.chunk_index,
        page_number: chunk.page_number,
        section_heading: chunk.section_heading,
        content: chunk.content,
        relevance_score: Math.round(combinedScore * 100) / 100,
      });
    }
  }

  // Sort descending by score
  scoredPassages.sort((a, b) => b.relevance_score - a.relevance_score);

  return scoredPassages.slice(0, topK);
}
