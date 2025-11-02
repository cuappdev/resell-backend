import { ForbiddenError, NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { EntityManager, getManager } from 'typeorm';
// import { InjectManager } from 'typeorm-typedi-extensions';

import { CreateTransactionReviewRequest } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { UuidParam } from '../api/validators/GenericRequests';
import { TransactionReviewModel } from '../models/TransactionReviewModel';
import { TransactionModel } from '../models/TransactionModel';

@Service()
export class TransactionReviewService {
  private transactions: TransactionsManager;

  constructor(entityManager?: EntityManager) {
    const manager = entityManager || getManager();
    
    this.transactions = new TransactionsManager(manager);
  }

  // Get all transaction reviews
  public async getAllTransactionReviews(): Promise<TransactionReviewModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionReviewRepository = Repositories.transactionReview(transactionalEntityManager);
      return await transactionReviewRepository.getAllTransactionReviews();
    });
  }

  // Get a transaction review by its ID
  public async getTransactionReviewById(params: UuidParam): Promise<TransactionReviewModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionReviewRepository = Repositories.transactionReview(transactionalEntityManager);
      const transactionReview = await transactionReviewRepository.getTransactionReviewById(params.id);
      if (!transactionReview) throw new NotFoundError('Transaction Review not found!');
      return transactionReview;
    });
  }

  // Get a transaction review by Transaction ID
  public async getTransactionReviewByTransactionId(transactionId: UuidParam): Promise<TransactionReviewModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionReviewRepository = Repositories.transactionReview(transactionalEntityManager);
      const transactionReview = await transactionReviewRepository.getTransactionReviewByTransactionId(transactionId.id);
      if (!transactionReview) throw new NotFoundError('Transaction Review for the given transaction not found!');
      return transactionReview;
    });
  }

  // Create a transaction review
  public async createTransactionReview(review: CreateTransactionReviewRequest): Promise<TransactionReviewModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);      
      const transaction = await transactionRepository.getTransactionById(review.transactionId);
      if (!transaction) throw new NotFoundError('Transaction not found!');

      const transactionReviewRepository = Repositories.transactionReview(transactionalEntityManager);
      const freshTransactionReview = await transactionReviewRepository.createTransactionReview(
        review.stars,
        review.comments || null,
        transaction
      );
      return freshTransactionReview;
    });
  }

  // Delete a transaction review
  public async deleteTransactionReviewById(params: UuidParam): Promise<TransactionReviewModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionReviewRepository = Repositories.transactionReview(transactionalEntityManager);
      const transactionReview = await transactionReviewRepository.getTransactionReviewById(params.id);
      if (!transactionReview) throw new NotFoundError('Transaction Review not found!');
      return transactionReviewRepository.deleteTransactionReview(transactionReview);
    });
  }
}
