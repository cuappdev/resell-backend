import { embedText } from "../utils/EmbeddingService";

describe("EmbeddingService", () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.restoreAllMocks();
  });

  test("returns null in test environment without calling OpenAI", async () => {
    process.env.NODE_ENV = "test";
    process.env.OPENAI_API_KEY = "sk-test";
    const fetchSpy = jest.spyOn(require("node-fetch"), "default");

    const result = await embedText("vintage jacket");

    expect(result).toBeNull();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("returns null when OPENAI_API_KEY is missing outside test", async () => {
    process.env.NODE_ENV = "development";
    delete process.env.OPENAI_API_KEY;

    const result = await embedText("vintage jacket");

    expect(result).toBeNull();
  });
});
