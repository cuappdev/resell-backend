import { AbstractRepository, EntityRepository } from "typeorm";
import { TransactionModel } from "../models/TransactionModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import { Uuid } from "../types";

@EntityRepository(TransactionModel)
export class TransactionRepository extends AbstractRepository<TransactionModel> {
  // Fetch all transactions
  public async getAllTransactions(): Promise<TransactionModel[]> {
    return await this.repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.buyer", "buyer")
      .leftJoinAndSelect("transaction.seller", "seller")
      .leftJoinAndSelect("transaction.post", "post")
      .getMany();
  }

  // Fetch a transaction by its ID
  public async getTransactionById(id: Uuid): Promise<TransactionModel | undefined> {
    return await this.repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.buyer", "buyer")
      .leftJoinAndSelect("transaction.seller", "seller")
      .leftJoinAndSelect("transaction.post", "post")
      .where("transaction.id = :id", { id })
      .getOne();
  }

  // Fetch transactions by buyer ID
  public async getTransactionsByBuyerId(buyerId: Uuid): Promise<TransactionModel[]> {
    return await this.repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.buyer", "buyer")
      .leftJoinAndSelect("transaction.seller", "seller")
      .leftJoinAndSelect("transaction.post", "post")
      .where("buyer.id = :buyerId", { buyerId })
      .getMany();
  }

  // Fetch transactions by seller ID
  public async getTransactionsBySellerId(sellerId: Uuid): Promise<TransactionModel[]> {
    return await this.repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.buyer", "buyer")
      .leftJoinAndSelect("transaction.seller", "seller")
      .leftJoinAndSelect("transaction.post", "post")
      .where("seller.id = :sellerId", { sellerId })
      .getMany();
  }

  // Fetch a transaction by post ID
  public async getTransactionByPostId(postId: Uuid): Promise<TransactionModel | undefined> {
    return await this.repository
      .createQueryBuilder("transaction")
      .leftJoinAndSelect("transaction.post", "post")
      .where("post.id = :postId", { postId })
      .getOne();
  }

  // Create a new transaction
  public async createTransaction(
    location: string,
    amount: number,
    transactionDate: Date,
    post: PostModel,
    buyer: UserModel,
    seller: UserModel,
    completed = false
  ): Promise<TransactionModel> {
    const transaction = new TransactionModel();
    transaction.location = location;
    transaction.amount = amount;
    transaction.transactionDate = transactionDate;
    transaction.post = post;
    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.completed = completed;

    return await this.repository.save(transaction);
  }

  // Update a transaction's completed status
  public async completeTransaction(transaction: TransactionModel): Promise<TransactionModel> {
    transaction.completed = true;
    return await this.repository.save(transaction);
  }

}
