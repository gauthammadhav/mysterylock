import { GoogleGenAI } from "@google/genai";

export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMENSION = 3072;

/**
 * Calculates cosine similarity between two numerical vectors.
 */
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }

  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
}

/**
 * Deterministic pseudo-embedding generator used as fallback when API key is unavailable.
 */
function generateDeterministicFallbackVector(text: string, dimension: number = EMBEDDING_DIMENSION): number[] {
  const vector: number[] = new Array(dimension).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }

  for (let i = 0; i < dimension; i++) {
    const val = Math.sin(hash + i) * Math.cos((hash * (i + 1)) % 1000);
    vector[i] = Math.round(val * 10000) / 10000;
  }

  // Normalize
  const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
  return vector.map((v) => v / norm);
}

/**
 * Generates an embedding vector for a single text string using Google Gemini.
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (apiKey) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text.slice(0, 8000), // Protect token boundaries
      });

      const values = response.embeddings?.[0]?.values;
      if (values && values.length > 0) {
        return values;
      }
    } catch (error: any) {
      console.warn("Gemini embedding error, utilizing deterministic vector:", error?.message);
    }
  }

  return generateDeterministicFallbackVector(text);
}

/**
 * Batch generates embeddings for multiple chunks.
 */
export async function generateBatchEmbeddings(texts: string[]): Promise<number[][]> {
  const results: number[][] = [];
  // Process sequentially or in small parallel batches to respect rate limits
  for (const text of texts) {
    const vec = await generateEmbedding(text);
    results.push(vec);
  }
  return results;
}
