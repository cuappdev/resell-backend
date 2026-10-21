import { ForbiddenError, NotFoundError } from "routing-controllers";
import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";

import { UserModel } from "../models/UserModel";
import {
  TimeParam,
  UuidParam,
  FirebaseUidParam,
} from "../api/validators/GenericRequests";
import { PostModel } from "src/models/PostModel";
import { RequestModel } from "../models/RequestModel";
import Repositories, { TransactionsManager } from "../repositories";
import { CreateRequestRequest } from "../types";
import { embedText } from "../utils/EmbeddingService";

@Service()
export class RequestService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllRequest(): Promise<RequestModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      return await requestRepository.getAllRequest();
    });
  }

  public async getRequestById(params: UuidParam): Promise<RequestModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError("Request not found!");
      return request;
    });
  }

  public async getRequestByUserId(
    params: FirebaseUidParam,
  ): Promise<RequestModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      const request = await requestRepository.getRequestByUserId(params.id);
      if (!request) throw new NotFoundError("User not found!");
      return request;
    });
  }

  public async createRequest(
    request: CreateRequestRequest,
  ): Promise<RequestModel> {
    const freshRequest = await this.transactions.readWrite(
      async (transactionalEntityManager) => {
        const userRepository = Repositories.user(transactionalEntityManager);
        const user = await userRepository.getUserById(request.userId);
        if (!user) throw new NotFoundError("User not found!");
        const requestRepository = Repositories.request(
          transactionalEntityManager,
        );
        // Embed asynchronously after respond — don't block create on OpenAI
        return await requestRepository.createRequest(
          request.title,
          request.description,
          request.archive,
          user,
          null,
        );
      },
    );

    void this.finalizeRequestEmbedding(
      freshRequest.id,
      `${request.title} ${request.description}`,
      request.userId,
    );

    return freshRequest;
  }

  /**
   * Compute embedding and post matches after create returns (fire-and-forget).
   */
  private async finalizeRequestEmbedding(
    requestId: string,
    text: string,
    ownerUid: string,
  ): Promise<void> {
    try {
      const embedding = await embedText(text);
      if (!embedding) return;

      await this.transactions.readWrite(async (transactionalEntityManager) => {
        const requestRepository = Repositories.request(
          transactionalEntityManager,
        );
        const req = await requestRepository.getRequestById(requestId);
        if (!req) return;

        req.embedding = embedding;
        await requestRepository.saveRequest(req);

        const postRepository = Repositories.post(transactionalEntityManager);
        const similarPosts = await postRepository.findSimilarPosts(
          embedding,
          ownerUid,
          10,
        );
        for (const post of similarPosts) {
          await requestRepository.addMatchToRequest(req, post);
        }
      });
    } catch (error) {
      console.error("Error finalizing request embedding:", error);
    }
  }

  public async deleteRequestById(params: UuidParam): Promise<RequestModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError("Request not found!");
      return await requestRepository.deleteRequest(request);
    });
  }

  public async archiveRequest(
    user: UserModel,
    params: UuidParam,
  ): Promise<RequestModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError("Request not found!");
      if (request.user.isActive == false)
        throw new NotFoundError("User is not active!");
      if (user.firebaseUid != request.user?.firebaseUid)
        throw new ForbiddenError("User is not poster!");
      return await requestRepository.archiveRequest(request);
    });
  }

  public async archiveAllRequestsByUserId(
    params: FirebaseUidParam,
  ): Promise<RequestModel[]> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id);
      if (!user) throw new NotFoundError("User not found!");
      if (!user.isActive) throw new NotFoundError("User is not active!");
      const requests = await requestRepository.getRequestByUserId(
        user.firebaseUid,
      );
      for (const request of requests) {
        if (!request) throw new NotFoundError("Request not found!");
        await requestRepository.archiveRequest(request);
      }
      return requests;
    });
  }

  public async getMatchesByRequestId(params: TimeParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );
      let request;
      if (params.time === undefined) {
        request = await requestRepository.getAllMatchesByRequestId(params.id);
      } else {
        request = await requestRepository.getTimedMatchesByRequestId(
          params.id,
          params.time,
        );
      }
      if (!request) throw new NotFoundError("Request not found!");
      return request.matches;
    });
  }
}
