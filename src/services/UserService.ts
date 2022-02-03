
import { Service } from 'typedi';
import { InjectManager } from 'typeorm-typedi-extensions';
import { EntityManager } from 'typeorm';
import Repositories, { TransactionsManager } from '../repos';
import { NotFoundError, ForbiddenError } from 'routing-controllers';
import {
  PostUserRequest,
  PrivateProfile,
  Uuid,
} from '../types';
import UserModel from '../models/UserModel';

@Service()
export default class UserService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async getAllUsers(): Promise<UserModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.getAllUsers();
    });
  }

  public async postUser(user: PostUserRequest): Promise<PrivateProfile> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.postUser(user.email, user.googleId, user.name, user.profilePictureUrl, user.bio);
    });
  }
}