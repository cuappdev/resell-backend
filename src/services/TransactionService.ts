import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UuidParam } from "../api/validators/GenericRequests";
import { TransactionModel } from "../models/TransactionModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import Repositories, { TransactionsManager } from "../repositories";
import { CreateTransactionRequest, UpdateTransactionStatusRequest } from "../types";
import { TransactionRepository } from "../repositories/TransactionRepository";
import { NotFoundError, ForbiddenError } from "routing-controllers";

@Service()
export class TransactionService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  // Get all transactions
  public async getAllTransactions(): Promise<TransactionModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      return await transactionRepository.getAllTransactions();
    });
  }

  // Get transaction by ID
  public async getTransactionById(params: UuidParam): Promise<TransactionModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      const transaction = await transactionRepository.getTransactionById(params.id);
      if (!transaction) throw new NotFoundError("Transaction not found!");
      return transaction;
    });
  }

  // Get transactions by buyer ID
  public async getTransactionsByBuyerId(params: UuidParam): Promise<TransactionModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      return await transactionRepository.getTransactionsByBuyerId(params.id);
    });
  }

  // Get transactions by seller ID
  public async getTransactionsBySellerId(params: UuidParam): Promise<TransactionModel[]> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      return await transactionRepository.getTransactionsBySellerId(params.id);
    });
  }

  // Create a new transaction
  public async createTransaction(request: CreateTransactionRequest): Promise<TransactionModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const postRepository = Repositories.post(transactionalEntityManager);
      const transactionRepository = Repositories.transaction(transactionalEntityManager);

      const buyer = await userRepository.getUserById(request.buyerId);
      const seller = await userRepository.getUserById(request.sellerId);
      const post = await postRepository.getPostById(request.postId);

      if (!buyer) throw new NotFoundError("Buyer not found!");
      if (!seller) throw new NotFoundError("Seller not found!");
      if (!post) throw new NotFoundError("Post not found!");
      if (!buyer.isActive || !seller.isActive) throw new ForbiddenError("User is not active!");

      return await transactionRepository.createTransaction(
        request.location,
        request.amount,
        request.transactionDate,
        post,
        buyer,
        seller
      );
    });
  }

  // Update transaction status (mark as completed)
  public async completeTransaction(params: UuidParam, request: UpdateTransactionStatusRequest): Promise<TransactionModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      const transaction = await transactionRepository.getTransactionById(params.id);

      if (!transaction) throw new NotFoundError("Transaction not found!");
      transaction.completed = request.completed;

      return await transactionRepository.completeTransaction(transaction);
    });
  }

  // Get transaction by post ID
  public async getTransactionByPostId(params: UuidParam): Promise<TransactionModel> {
    return this.transactions.readOnly(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      const transaction = await transactionRepository.getTransactionByPostId(params.id);
      if (!transaction) throw new NotFoundError("Transaction not found!");
      return transaction;
    });
  }

  // Delete transaction
  public async deleteTransaction(params: UuidParam): Promise<TransactionModel> {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      const transaction = await transactionRepository.getTransactionById(params.id);

      if (!transaction) throw new NotFoundError("Transaction not found!");

      return await transactionRepository.deleteTransaction(transaction);
    });
  }
}
