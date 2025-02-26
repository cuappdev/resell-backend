import { Service } from 'typedi';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { UserModel } from '../models/UserModel';
import Repositories, { TransactionsManager } from '../repositories';

@Service()
export class AuthService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async authorize(user: UserModel, fcmToken: string): Promise<UserModel | null> { 
    if (user.isNewUser) {
      return null;
    }
    // TODO: add fcm token to future fcm token model
    return user;
  }
}
