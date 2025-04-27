import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UserModel } from '../models/UserModel';
import { TimeParam, UuidParam, FirebaseUidParam } from '../api/validators/GenericRequests';
import { PostModel } from 'src/models/PostModel';
import { RequestModel } from '../models/RequestModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreateRequestRequest } from '../types';
import { getLoadedModel } from '../utils/SentenceEncoder';
import pgvector from 'pgvector'

@Service()
export class RequestService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllRequest(): Promise<RequestModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      return await requestRepository.getAllRequest();
    });
  }

  public async getRequestById(params: UuidParam): Promise<RequestModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError('Request not found!');
      return request;
    });
  }

  public async getRequestByUserId(params: FirebaseUidParam): Promise<RequestModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      const request = await requestRepository.getRequestByUserId(params.id);
      if (!request) throw new NotFoundError('User not found!');
      return request;
    });
  }

  public async createRequest(request: CreateRequestRequest): Promise<RequestModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(request.userId);
      if (!user) throw new NotFoundError('User not found!');
      const requestRepository = Repositories.request(transactionalEntityManager);
      
      // compute embedding of request
      let embedding = null
      try {
        const model = await getLoadedModel();
        // Combine title and description
        const sentence = `${request.title} ${request.description}`;
        const sentences = [sentence];
        const embeddingTensor = await model.embed(sentences);
        const embeddings = await embeddingTensor.array();
        // Convert the embedding to SQL vector format using pgvector.toSql
        embedding = pgvector.toSql(embeddings[0]);
      } catch (error) {
        console.error("Error computing embedding:", error);
      }

      return await requestRepository.createRequest(request.title, request.description, request.archive, user, embedding);
    });
  }

  public async deleteRequestById(params: UuidParam): Promise<RequestModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError('Request not found!');
      return await requestRepository.deleteRequest(request);
    });
  }

  public async archiveRequest(user: UserModel, params: UuidParam): Promise<RequestModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      const request = await requestRepository.getRequestById(params.id);
      if (!request) throw new NotFoundError('Request not found!');
      if (request.user.isActive == false) throw new NotFoundError('User is not active!');
      if (user.firebaseUid != request.user?.firebaseUid) throw new ForbiddenError('User is not poster!');
      return await requestRepository.archiveRequest(request);
    });
  }

  public async archiveAllRequestsByUserId(params: FirebaseUidParam): Promise<RequestModel[]> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(params.id)
      if (!user) throw new NotFoundError('User not found!');
      if (!user.isActive) throw new NotFoundError('User is not active!');
      const requests = await requestRepository.getRequestByUserId(user.firebaseUid);
      for (const request of requests) {
        if (!request) throw new NotFoundError('Request not found!');
        await requestRepository.archiveRequest(request);
      }
      return requests;
    });
  }


  public async getMatchesByRequestId(params: TimeParam): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      let request;
      if (params.time === undefined) {
        request = await requestRepository.getAllMatchesByRequestId(params.id);
      }
      else {
        request = await requestRepository.getTimedMatchesByRequestId(params.id, params.time);
      }
      if (!request) throw new NotFoundError('Request not found!');
      return request.matches;
    });
  }
}