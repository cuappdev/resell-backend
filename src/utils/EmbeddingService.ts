import fetch from "node-fetch";

const OPENAI_EMBEDDING_MODEL = "text-embedding-3-small";
const EMBEDDING_DIMENSIONS = 512;
const EMBEDDING_TIMEOUT_MS = 10000;

/**
 * Embed text via OpenAI text-embedding-3-small at 512 dims (Matryoshka),
 * matching the existing FLOAT[512] embedding schema.
 */
export async function embedText(text: string): Promise<number[] | null> {
  if (process.env.NODE_ENV === "test") {
    return null;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY is not set; skipping embedding");
    return null;
  }

  const trimmed = text?.trim();
  if (!trimmed) {
    return null;
  }

  try {
    const embeddingPromise = (async () => {
      const response = await fetch("https://api.openai.com/v1/embeddings", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: OPENAI_EMBEDDING_MODEL,
          input: trimmed,
          dimensions: EMBEDDING_DIMENSIONS,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(
          `OpenAI embeddings error ${response.status}: ${errorBody}`,
        );
      }

      const data = (await response.json()) as {
        data?: { embedding?: number[] }[];
      };
      const embedding = data?.data?.[0]?.embedding;
      if (!Array.isArray(embedding) || embedding.length === 0) {
        throw new Error("OpenAI embeddings response missing embedding vector");
      }
      return embedding;
    })();

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error("Embedding computation timeout")),
        EMBEDDING_TIMEOUT_MS,
      ),
    );

    return await Promise.race([embeddingPromise, timeoutPromise]);
  } catch (error) {
    console.error("Error computing embedding:", error);
    return null;
  }
}
