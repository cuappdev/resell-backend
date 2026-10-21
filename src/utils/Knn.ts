/**
 * Exact k-nearest neighbors via cosine similarity (in-process).
 * No pgvector / ANN index required.
 */

export function cosineSimilarity(a: number[], b: number[]): number {
  if (!a?.length || !b?.length || a.length !== b.length) {
    return 0;
  }

  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

export type KnnCandidate<T> = {
  embedding: number[];
  value: T;
};

/**
 * Return the top-k candidates most similar to query (highest cosine similarity).
 */
export function topKByCosine<T>(
  query: number[],
  candidates: KnnCandidate<T>[],
  k: number,
): T[] {
  if (!query?.length || k <= 0 || candidates.length === 0) {
    return [];
  }

  const scored: { score: number; value: T }[] = [];
  for (const candidate of candidates) {
    if (
      !Array.isArray(candidate.embedding) ||
      candidate.embedding.length !== query.length
    ) {
      continue;
    }
    scored.push({
      score: cosineSimilarity(query, candidate.embedding),
      value: candidate.value,
    });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, k).map((s) => s.value);
}

/** Parse embedding stored as number[] or JSON string. */
export function parseEmbedding(raw: unknown): number[] | null {
  if (Array.isArray(raw) && raw.length > 0 && typeof raw[0] === "number") {
    return raw as number[];
  }
  if (typeof raw === "string" && raw.length > 2) {
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed as number[];
      }
    } catch {
      // pgvector text format: [1,2,3]
      if (raw.startsWith("[") && raw.endsWith("]")) {
        const parts = raw.slice(1, -1).split(",");
        const nums = parts.map((p) => Number(p.trim()));
        if (nums.length > 0 && nums.every((n) => !Number.isNaN(n))) {
          return nums;
        }
      }
    }
  }
  return null;
}
