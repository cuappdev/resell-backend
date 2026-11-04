import { BadRequestError } from "routing-controllers";
import { PostService } from "../services/PostService";
import { CreatePostRequest } from "../types";
import { UserModel } from "../models/UserModel";

jest.mock("../repositories", () => ({
  __esModule: true,
  default: {},
  TransactionsManager: jest.fn(),
}));
jest.mock("../utils/Requests", () => ({ uploadImage: jest.fn() }));
jest.mock("../services/NotifService", () => ({ NotifService: jest.fn() }));
jest.mock("../services/SearchService", () => ({ SearchService: jest.fn() }));
jest.mock("../utils/EmbeddingService", () => ({ embedText: jest.fn() }));

describe("required post condition", () => {
  const readWrite = jest.fn();
  const service: PostService = Object.assign(
    Object.create(PostService.prototype),
    { transactions: { readWrite } },
  );

  beforeEach(() => readWrite.mockReset());

  test.each([undefined, null, "", "   ", 123])(
    "rejects invalid condition %p before database or external work",
    async (condition) => {
      await expect(
        service.createPost(
          { condition } as unknown as CreatePostRequest,
          {} as UserModel,
        ),
      ).rejects.toBeInstanceOf(BadRequestError);
      expect(readWrite).not.toHaveBeenCalled();
    },
  );

  test.each(["Good", "Never Used", "Gently Used", "NEW"])(
    "preserves compatibility with explicit condition %s",
    async (condition) => {
      const stopped = new Error("Stop before executing database work");
      readWrite.mockRejectedValue(stopped);
      await expect(
        service.createPost({ condition } as CreatePostRequest, {} as UserModel),
      ).rejects.toBe(stopped);
      expect(readWrite).toHaveBeenCalledTimes(1);
    },
  );
});
