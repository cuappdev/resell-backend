import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';

import { UuidParam } from '../api/validators/GenericRequests';
import { PostModel } from 'src/models/PostModel';
import { RequestModel } from '../models/RequestModel';
import Repositories, { TransactionsManager } from '../repositories';
import { CreateRequestRequest, GetMatchesRequest } from '../types';

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

  public async getRequestByUserId(params: UuidParam): Promise<RequestModel[]> {
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
      return await requestRepository.createRequest(request.title, request.description, user);
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

  public async getMatchesByRequestId(params: UuidParam, getMatchesRequest: GetMatchesRequest): Promise<PostModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const requestRepository = Repositories.request(transactionalEntityManager);
      let request;
      if (getMatchesRequest.time == 0) {
        request = await requestRepository.getAllMatchesByRequestId(params.id);
      }
      else {
        request = await requestRepository.getTimedMatchesByRequestId(params.id, getMatchesRequest.time);
      }
      if (!request) throw new NotFoundError('Request not found!');
      return request.matches;
    });
  }
}