import { AbstractRepository, EntityRepository } from 'typeorm';

import { TransactionReviewModel } from '../models/TransactionReviewModel';
import { TransactionModel } from '../models/TransactionModel';
import { Uuid } from '../types';

@EntityRepository(TransactionReviewModel)
export class TransactionReviewRepository extends AbstractRepository<TransactionReviewModel> {
  // Fetch all transaction reviews
  public async getAllTransactionReviews(): Promise<TransactionReviewModel[]> {
    return await this.repository
      .createQueryBuilder("review")
      .leftJoinAndSelect("review.transaction", "transaction")
      .getMany();
  }

  // Fetch a transaction review by ID
  public async getTransactionReviewById(id: Uuid): Promise<TransactionReviewModel | undefined> {
    return await this.repository
      .createQueryBuilder("review")
      .leftJoinAndSelect("review.transaction", "transaction")
      .where("review.id = :id", { id })
      .getOne();
  }

  // Fetch a transaction review by Transaction ID
  public async getTransactionReviewByTransactionId(transactionId: Uuid): Promise<TransactionReviewModel | undefined> {
    return await this.repository
      .createQueryBuilder("review")
      .leftJoinAndSelect("review.transaction", "transaction")
      .where("transaction.id = :transactionId", { transactionId })
      .getOne();
  }
  
  // Create a new transaction review
  public async createTransactionReview(
    stars: number,
    comments: string | null,
    hadIssues: boolean,
    issueCategory: string | null,
    issueDetails: string | null,
    transaction: TransactionModel
  ): Promise<TransactionReviewModel> {
    const review = new TransactionReviewModel();
    review.stars = stars;
    review.comments = comments;
    review.hadIssues = hadIssues;
    review.issueCategory = issueCategory;
    review.issueDetails = issueDetails;
    review.transaction = transaction;
    return await this.repository.save(review);
  }
  // Delete a transaction review
  public async deleteTransactionReview(review: TransactionReviewModel): Promise<TransactionReviewModel> {
    return await this.repository.remove(review);
  }
}
