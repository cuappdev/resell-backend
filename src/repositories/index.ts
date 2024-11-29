import { EntityManager } from "typeorm";

import { FeedbackRepository } from "./FeedbackRepository";
import { PostRepository } from "./PostRepository";
import { RequestRepository } from "./RequestRepository";
import { UserRepository } from "./UserRepository";
import { UserReviewRepository } from "./UserReviewRepository";
import { UserSessionRepository } from "./UserSessionRepository";
import { ReportRepository } from "./ReportRepository";
import { TransactionRepository } from "./TransactionRepository";

export default class RRepositories {
  public static user(
    transactionalEntityManager: EntityManager
  ): UserRepository {
    return transactionalEntityManager.getCustomRepository(UserRepository);
  }

  public static post(
    transactionalEntityManager: EntityManager
  ): PostRepository {
    return transactionalEntityManager.getCustomRepository(PostRepository);
  }

  public static feedback(
    transactionalEntityManager: EntityManager
  ): FeedbackRepository {
    return transactionalEntityManager.getCustomRepository(FeedbackRepository);
  }

  public static request(
    transactionalEntityManager: EntityManager
  ): RequestRepository {
    return transactionalEntityManager.getCustomRepository(RequestRepository);
  }

  public static userReview(
    transactionalEntityManager: EntityManager
  ): UserReviewRepository {
    return transactionalEntityManager.getCustomRepository(UserReviewRepository);
  }

  public static session(
    transactionalEntityManager: EntityManager
  ): UserSessionRepository {
    return transactionalEntityManager.getCustomRepository(
      UserSessionRepository
    );
  }

  public static report(
    transactionalEntityManager: EntityManager
  ): ReportRepository {
    return transactionalEntityManager.getCustomRepository(ReportRepository);
  }

  public static transaction(
    transactionalEntityManager: EntityManager
  ): TransactionRepository {
    return transactionalEntityManager.getCustomRepository(TransactionRepository);
  }
}

export class TransactionsManager {
  private transactionalEntityManager: EntityManager;

  constructor(transactionalEntityManager: EntityManager) {
    this.transactionalEntityManager = transactionalEntityManager;
  }

  public readOnly<T>(
    fn: (transactionalEntityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    return this.transactionalEntityManager.transaction("REPEATABLE READ", fn);
  }

  public readWrite<T>(
    fn: (transactionalEntityManager: EntityManager) => Promise<T>
  ): Promise<T> {
    return this.transactionalEntityManager.transaction("SERIALIZABLE", fn);
  }
}
