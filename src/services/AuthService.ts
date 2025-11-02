import { Service } from 'typedi';
import { EntityManager, getManager } from 'typeorm';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';
import { NotFoundError } from 'routing-controllers';


@Service()
export class AuthService {
  private transactions: TransactionsManager;

  constructor(entityManager?: EntityManager) {
    const manager = entityManager || getManager();
    this.transactions = new TransactionsManager(manager);
  }

  public async authorize(user: UserModel, fcmToken: string): Promise<UserModel | null> {
    if (user.isNewUser) {
      return null;
    }
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const fcmRepository = Repositories.fcmToken(transactionalEntityManager);
      await fcmRepository.createFcmToken(
        fcmToken,
        true,
        new Date(),
        user
      );
      return user;
    });
  }
}
