import { EntityManager } from 'typeorm';
import { UserRepository } from './UserRepository';
import { PostRepository } from './PostRepository';

export default class Repositories {
  public static user(transactionalEntityManager: EntityManager): UserRepository {
    return transactionalEntityManager.getCustomRepository(UserRepository);
  }

  public static post(transactionalEntityManager: EntityManager): PostRepository {
    return transactionalEntityManager.getCustomRepository(PostRepository);
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
  