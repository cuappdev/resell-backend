import { EntityManager } from 'typeorm';

import { PostRepository } from './PostRepository';
import { UserRepository } from './UserRepository';
import { UserSessionRepository } from './UserSessionRepository';

export default class Repositories {
  public static user(transactionalEntityManager: EntityManager): UserRepository {
    return transactionalEntityManager.getCustomRepository(UserRepository);
  }

  public static post(transactionalEntityManager: EntityManager): PostRepository {
    return transactionalEntityManager.getCustomRepository(PostRepository);
  }

  public static session(transactionalEntityManager: EntityManager): UserSessionRepository {
    return transactionalEntityManager.getCustomRepository(UserSessionRepository);
  }
}

export class TransactionsManager {
    private transactionalEntityManager: EntityManager;

    constructor(transactionalEntityManager: EntityManager) {
        this.transactionalEntityManager = transactionalEntityManager;
    }

    public readOnly<T>(fn: (transactionalEntityManager: EntityManager) => Promise<T>): Promise<T> {
        return this.transactionalEntityManager.transaction('REPEATABLE READ', fn);
    }

    public readWrite<T>(fn: (transactionalEntityManager: EntityManager) => Promise<T>): Promise<T> {
        return this.transactionalEntityManager.transaction('SERIALIZABLE', fn);
    }
}
  