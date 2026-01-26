import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UserModel } from "../models/UserModel";
import Repositories, { TransactionsManager } from "../repositories";
import { NotFoundError } from "routing-controllers";

@Service()
export class AuthService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public async authorize(
    user: UserModel,
    fcmToken: string,
  ): Promise<UserModel | null> {
    if (user.isNewUser) {
      return null;
    }
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const fcmRepository = Repositories.fcmToken(transactionalEntityManager);
      const token = await fcmRepository.createFcmToken(
        fcmToken,
        true,
        new Date(),
        user,
      );
      return user;
    });
  }
}
