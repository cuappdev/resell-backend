import { cosineSimilarity, parseEmbedding, topKByCosine } from "../utils/Knn";

describe("Knn", () => {
  test("cosineSimilarity is 1 for identical vectors", () => {
    expect(cosineSimilarity([1, 0, 0], [1, 0, 0])).toBeCloseTo(1);
  });

  test("cosineSimilarity is 0 for orthogonal vectors", () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0);
  });

  test("topKByCosine returns nearest neighbors in order", () => {
    const query = [1, 0, 0];
    const result = topKByCosine(
      query,
      [
        { embedding: [0.9, 0.1, 0], value: "near" },
        { embedding: [0, 1, 0], value: "far" },
        { embedding: [0.8, 0.2, 0], value: "mid" },
      ],
      2,
    );
    expect(result).toEqual(["near", "mid"]);
  });

  test("parseEmbedding handles arrays and JSON strings", () => {
    expect(parseEmbedding([1, 2, 3])).toEqual([1, 2, 3]);
    expect(parseEmbedding("[1,2,3]")).toEqual([1, 2, 3]);
    expect(parseEmbedding(null)).toBeNull();
  });
});
