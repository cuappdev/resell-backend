import { EntityManager } from "typeorm";

import { FeedbackRepository } from "./FeedbackRepository";
import { PostRepository } from "./PostRepository";
import { RequestRepository } from "./RequestRepository";
import { UserRepository } from "./UserRepository";
import { UserReviewRepository } from "./UserReviewRepository";
import { ReportRepository } from "./ReportRepository";
import { TransactionRepository } from "./TransactionRepository";
import { TransactionReviewRepository } from "./TransactionReviewRepository";
import { NotifRepository } from "./NotifRepository";
import { FcmTokenRepository } from "./FcmTokenRepository";
import { CategoryRepository } from "./CategoryRepository";
import { SearchRepository } from "./SearchRepository";

export default class Repositories {
  public static user(
    transactionalEntityManager: EntityManager,
  ): UserRepository {
    return transactionalEntityManager.getCustomRepository(UserRepository);
  }

  public static post(
    transactionalEntityManager: EntityManager,
  ): PostRepository {
    return transactionalEntityManager.getCustomRepository(PostRepository);
  }

  public static category(
    transactionalEntityManager: EntityManager,
  ): CategoryRepository {
    return transactionalEntityManager.getCustomRepository(CategoryRepository);
  }

  public static feedback(
    transactionalEntityManager: EntityManager,
  ): FeedbackRepository {
    return transactionalEntityManager.getCustomRepository(FeedbackRepository);
  }

  public static request(
    transactionalEntityManager: EntityManager,
  ): RequestRepository {
    return transactionalEntityManager.getCustomRepository(RequestRepository);
  }

  public static userReview(
    transactionalEntityManager: EntityManager,
  ): UserReviewRepository {
    return transactionalEntityManager.getCustomRepository(UserReviewRepository);
  }

  public static report(
    transactionalEntityManager: EntityManager,
  ): ReportRepository {
    return transactionalEntityManager.getCustomRepository(ReportRepository);
  }

  public static transaction(
    transactionalEntityManager: EntityManager,
  ): TransactionRepository {
    return transactionalEntityManager.getCustomRepository(
      TransactionRepository,
    );
  }

  public static transactionReview(
    transactionalEntityManager: EntityManager,
  ): TransactionReviewRepository {
    return transactionalEntityManager.getCustomRepository(
      TransactionReviewRepository,
    );
  }

  public static notification(
    transactionalEntityManager: EntityManager,
  ): NotifRepository {
    return transactionalEntityManager.getCustomRepository(NotifRepository);
  }

  public static fcmToken(
    transactionalEntityManager: EntityManager,
  ): FcmTokenRepository {
    return transactionalEntityManager.getCustomRepository(FcmTokenRepository);
  }

  public static search(
    transactionalEntityManager: EntityManager,
  ): SearchRepository {
    return transactionalEntityManager.getCustomRepository(SearchRepository);
  }
}

export class TransactionsManager {
  private transactionalEntityManager: EntityManager;

  constructor(transactionalEntityManager: EntityManager) {
    this.transactionalEntityManager = transactionalEntityManager;
  }

  public readOnly<T>(
    fn: (transactionalEntityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.transactionalEntityManager.transaction("REPEATABLE READ", fn);
  }

  public readWrite<T>(
    fn: (transactionalEntityManager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.transactionalEntityManager.transaction("SERIALIZABLE", fn);
  }
}
