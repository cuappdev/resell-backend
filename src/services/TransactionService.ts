import { Service } from "typedi";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { UuidParam } from "../api/validators/GenericRequests";
import { TransactionModel } from "../models/TransactionModel";
import { UserModel } from "../models/UserModel";
import { PostModel } from "../models/PostModel";
import Repositories, { TransactionsManager } from "../repositories";
import { CreateTransactionRequest, FindTokensRequest, UpdateTransactionStatusRequest, Uuid } from "../types";
import { TransactionRepository } from "../repositories/TransactionRepository";
import { NotFoundError, ForbiddenError } from "routing-controllers";
import { NotifService } from "./NotifService";

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
      const postRepository = Repositories.post(transactionalEntityManager);
      const transactionRepository = Repositories.transaction(transactionalEntityManager);

      const transaction = await transactionRepository.getTransactionById(params.id);

      if (!transaction) throw new NotFoundError("Transaction not found!");
      transaction.completed = request.completed;

      const post = await postRepository.getPostById(transaction.post.id);
      if (!post) throw new NotFoundError("Post not found!");
      post.sold = true;
      await postRepository.markPostAsSold(post);

      // Track notified users by their ids
      const notifiedUserIds = new Set<string>();
      const notifService = new NotifService(transactionalEntityManager);

      // Get the first image from the post (if available)
      const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

      // Notify the buyer
      if (!notifiedUserIds.has(transaction.buyer.firebaseUid)) {
        const buyerNotifRequest: FindTokensRequest = {
          email: transaction.buyer.email,
          title: "Item Sold Notification",
          body: `'${post.title}' has been sold to you!`,
          data: {
            type: "transactions",
            imageUrl: imageUrl,
            postId: post.id,
            postTitle: post.title,
            transactionId: transaction.id,
            sellerId: transaction.seller.firebaseUid,
            sellerUsername: transaction.seller.username,
            sellerPhotoUrl: transaction.seller.photoUrl,
            price: transaction.amount
          } as unknown as JSON
        };
        await notifService.sendNotifs(buyerNotifRequest);
        notifiedUserIds.add(transaction.buyer.firebaseUid);
      }

      // Notify the seller
      if (!notifiedUserIds.has(transaction.seller.firebaseUid)) {
        const sellerNotifRequest: FindTokensRequest = {
          email: transaction.seller.email,
          title: "Item Sold Notification",
          body: `Your item '${post.title}' has been sold!`,
          data: {
            type: "transactions",
            imageUrl: imageUrl,
            postId: post.id,
            postTitle: post.title,
            transactionId: transaction.id,
            buyerId: transaction.buyer.firebaseUid,
            buyerUsername: transaction.buyer.username,
            buyerPhotoUrl: transaction.buyer.photoUrl,
            price: transaction.amount
          } as unknown as JSON
        };
        await notifService.sendNotifs(sellerNotifRequest);
        notifiedUserIds.add(transaction.seller.firebaseUid);
      }

      const postWithSavers = await postRepository.getPostWithSaversById(post.id);
      if (!postWithSavers) throw new NotFoundError("Post not found!");

      // Notify all users who saved the post (excluding duplicates)
      if (postWithSavers.savers){
        for (const user of postWithSavers.savers) {
          if (!notifiedUserIds.has(user.firebaseUid)) {
            const postSoldNotifRequest: FindTokensRequest = {
              email: user.email,
              title: "Item Sold Notification",
              body: `The '${post.title}' you bookmarked has been sold.`,
              data: {
                type: "bookmarks",
                imageUrl: imageUrl,
                postId: post.id,
                postTitle: post.title,
                transactionId: transaction.id,
                sellerId: transaction.seller.firebaseUid,
                sellerUsername: transaction.seller.username,
                sellerPhotoUrl: transaction.seller.photoUrl,
                buyerId: transaction.buyer.firebaseUid,
                buyerUsername: transaction.buyer.username
              } as unknown as JSON
            };
            await notifService.sendNotifs(postSoldNotifRequest);
            notifiedUserIds.add(user.firebaseUid);
          }
        }
      }

      // Need to now archive the sold post from the seller's active posts
      await postRepository.archivePost(post);

      
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

}
