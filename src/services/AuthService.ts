import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import Repositories, { TransactionsManager } from '../repositories';
import {
  CreateUserRequest,
  PrivateProfile,
  Uuid,
} from '../types';
import { UserModel } from '../models/UserModel';

@Service()
export class AuthService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async createUser(user: CreateUserRequest): Promise<PrivateProfile> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      return userRepository.createUser(user.firstName, user.lastName,
        user.profilePictureUrl, user.venmoHandle, user.email, user.googleId, user.bio);
    });
  }

  public async deleteUserById(id: Uuid): Promise<UserModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const user = await userRepository.getUserById(id);
      if (!user) throw new NotFoundError('User not found!');
      return userRepository.deleteUser(user);
    });
  }
}