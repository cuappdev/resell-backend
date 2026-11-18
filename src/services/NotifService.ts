import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { NotificationData, FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { firebaseAdmin } from '../firebase';

const getMessaging = () => firebaseAdmin.messaging();

// Message type from firebase-admin
interface Message {
  notification?: {
    title?: string;
    body?: string;
  };
  data?: { [key: string]: string };
  token: string;
}

interface NotifPayload {
    title: string;
    body: string;
    data: Record<string, any>;
}

interface NotifResult {
    message: string;
    httpCode: number;
    sentCount: number;
    failedCount: number;
    persistenceFailedCount: number;
}

@Service()
export class NotifService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

    /**
     * fetch all FCM tokens for a user
     */
    private async getTokensForUser(
        fcmTokenRepository: ReturnType<typeof Repositories.fcmToken>,
        userId: string
    ): Promise<string[]> {
        const tokenRecords = await fcmTokenRepository.getTokensByUserId(userId);
        return tokenRecords.map(t => t.token);
    }

    /**
     * Send to every token and report FCM and persistence outcomes separately.
     */
    private async sendToUser(
        userId: string,
        tokens: string[],
        payload: NotifPayload,
        notifRepository: ReturnType<typeof Repositories.notification>
    ): Promise<Pick<NotifResult, 'sentCount' | 'failedCount' | 'persistenceFailedCount'>> {
        // "Sent" means accepted by FCM, not confirmed delivery to the device.
        const result = { sentCount: 0, failedCount: 0, persistenceFailedCount: 0 };
        for (const token of tokens) {
            const msg: Message = {
                notification: {
                    title: payload.title,
                    body: payload.body,
                },
                data: payload.data as { [key: string]: string },
                token: token,
            };
            try {
                await getMessaging().send(msg);
                result.sentCount++;
            } catch (error) {
                result.failedCount++;
                console.warn(`Failed to send notification "${payload.title}": ${error.message}`);
                continue;
            }
            try {
                await notifRepository.save({
                    userId: userId,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data as unknown as JSON,
                    read: false
                });
            } catch (error) {
                result.persistenceFailedCount++;
                console.error(`Failed to persist notification "${payload.title}": ${error.message}`);
            }
        }
        return result;
    }

    /**
     * send a notification to a user by userId
     * gets tokens, sends, persists, and returns result
     */
    private async sendNotificationToUser(
        transactionalEntityManager: EntityManager,
        userId: string,
        payload: NotifPayload
    ): Promise<NotifResult> {
        const fcmTokenRepository = Repositories.fcmToken(transactionalEntityManager);
        const notifRepository = Repositories.notification(transactionalEntityManager);

        const tokens = await this.getTokensForUser(fcmTokenRepository, userId);
        if (tokens.length === 0) {
            return { message: "No device tokens found", httpCode: 200, sentCount: 0, failedCount: 0, persistenceFailedCount: 0 };
        }

        try {
            const result = await this.sendToUser(userId, tokens, payload, notifRepository);
            if (result.sentCount === 0) {
                return { message: "Notification not sent", httpCode: 500, ...result };
            }
            if (result.persistenceFailedCount > 0) {
                return { message: "Notification sending completed with persistence failures", httpCode: 500, ...result };
            }
            if (result.failedCount > 0) {
                return { message: "Notification partially sent", httpCode: 207, ...result };
            }
            return { message: "Notification sent successfully", httpCode: 200, ...result };
        } catch (err) {
            console.error('Failed to send notification:', err);
            throw err;
        }
    }

    public async sendNotifs(request: FindTokensRequest): Promise<NotifResult> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const user = await userRepository.getUserByEmail(request.email);
            if (!user) {
                throw new NotFoundError("User not found!");
            }

            return this.sendNotificationToUser(transactionalEntityManager, user.firebaseUid, {
                title: request.title,
                body: request.body,
                data: request.data as Record<string, any>
            });
        });
    }

    public async sendDiscountNotification(request: DiscountNotificationRequest): Promise<NotifResult> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const postRepository = Repositories.post(transactionalEntityManager);

            const user = await userRepository.getUserById(request.sellerId);
            if (!user) {
                throw new NotFoundError("User not found!");
            }

            const post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }

            return this.sendNotificationToUser(transactionalEntityManager, user.firebaseUid, {
                title: "Price Drop Alert!",
                body: `${post.title} is now available at $${request.newPrice}!`,
                data: {
                    postId: post.id,
                    postTitle: post.title,
                    originalPrice: String(request.oldPrice),
                    newPrice: String(request.newPrice),
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username
                }
            });
        });
    }

    public async sendRequestMatchNotification(request: RequestMatchNotificationRequest): Promise<NotifResult> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const postRepository = Repositories.post(transactionalEntityManager);
            const requestRepository = Repositories.request(transactionalEntityManager);

            const user = await userRepository.getUserById(request.userId);
            if (!user) {
                throw new NotFoundError("User not found!");
            }

            const post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }

            const userRequest = await requestRepository.getRequestById(request.requestId);
            if (!userRequest) {
                throw new NotFoundError("Request not found!");
            }

            const price = post.alteredPrice > 0 ? post.alteredPrice : post.originalPrice;

            return this.sendNotificationToUser(transactionalEntityManager, request.userId, {
                title: "Request Match Found!",
                body: `We found a match for your request: ${post.title}`,
                data: {
                    postId: post.id,
                    postTitle: post.title,
                    price: String(price),
                    requestId: userRequest.id,
                    requestTitle: userRequest.title,
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username
                }
            });
        });
    }

  public async getRecentNotifications(userId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const notifRepository = Repositories.notification(
        transactionalEntityManager,
      );
      return await notifRepository.getRecentNotifications(userId);
    });
  }

  async getUnreadNotifications(userId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const repo = Repositories.notification(transactionalEntityManager);
      return repo.getUnread(userId);
    });
  }

  async getNotificationsLast7Days(userId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const repo = Repositories.notification(transactionalEntityManager);
      return repo.getFromLastDays(userId, 7);
    });
  }

  async getNotificationsLast30Days(userId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const repo = Repositories.notification(transactionalEntityManager);
      return repo.getFromLastDays(userId, 30);
    });
  }

  async markAsRead(userId: string, notifId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const notifRepository = Repositories.notification(transactionalEntityManager);
      const notif = await notifRepository.findOne({ where: { id: notifId } });
      if (!notif) {
        throw new NotFoundError("Notification not found");
      }
      if (notif.userId !== userId) {
        throw new NotFoundError("Notification not found");
      }
      return await notifRepository.markAsRead(notifId);
    });
  }

  /**
   * Send a transaction confirmation notification to the buyer
   * This asks them to confirm if the meetup happened
   */
  async sendTransactionConfirmationNotification(transactionId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);
      const fcmTokenRepository = Repositories.fcmToken(transactionalEntityManager);
      const notifRepository = Repositories.notification(transactionalEntityManager);

      const transaction = await transactionRepository.getTransactionById(transactionId);
      if (!transaction) {
        throw new NotFoundError("Transaction not found!");
      }

      // Don't send if already completed
      if (transaction.completed) {
        return { message: "Transaction already completed", sent: false };
      }

      const buyer = transaction.buyer;
      const seller = transaction.seller;
      const post = transaction.post;

      if (!buyer || !seller || !post) {
        throw new NotFoundError("Transaction missing buyer, seller, or post");
      }

      const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

      // Get buyer's FCM tokens
      const tokens = await fcmTokenRepository.getTokensByUserId(buyer.firebaseUid);
      const deviceTokens = tokens.map(t => t.token);

      const notificationData = {
        type: "transaction_confirmation",
        transactionId: transaction.id,
        postId: post.id,
        postTitle: post.title,
        sellerId: seller.firebaseUid,
        sellerUsername: seller.username,
        imageUrl: imageUrl
      };

      // Send FCM notification to each device
      for (const token of deviceTokens) {
        try {
          const msg = {
            notification: {
              title: "Confirm your meetup",
              body: `Did your meetup with ${seller.username} for '${post.title}' happen?`
            },
            data: notificationData as unknown as { [key: string]: string },
            token: token
          };
          await getMessaging().send(msg);
        } catch (error) {
          console.warn(`Failed to send to token: ${error.message}`);
        }
      }

      // Save notification to database
      const savedNotif = await notifRepository.save({
        userId: buyer.firebaseUid,
        title: "Confirm your meetup",
        body: `Did your meetup with ${seller.username} for '${post.title}' happen?`,
        data: notificationData,
        read: false
      });

      // Mark that we've sent the confirmation notification (so we don't spam them)
      await transactionRepository.markConfirmationSent(transactionId);

      return {
        message: "Transaction confirmation notification sent",
        sent: true,
        notification: savedNotif
      };
    });
  }

  /**
   * Check for transactions with past meeting times and send confirmation notifications
   * This can be called by a cron job or manually
   */
  async sendPendingTransactionConfirmations() {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const transactionRepository = Repositories.transaction(transactionalEntityManager);

      // Get all incomplete transactions where meeting time has passed
      const pendingTransactions = await transactionRepository.getPendingConfirmations();

      const results = [];
      for (const transaction of pendingTransactions) {
        try {
          const result = await this.sendTransactionConfirmationNotification(transaction.id);
          results.push({ transactionId: transaction.id, ...result });
        } catch (error) {
          results.push({ transactionId: transaction.id, error: error.message });
        }
      }

      return {
        message: `Processed ${pendingTransactions.length} pending transactions`,
        results
      };
    });
  }

  async deleteNotification(userId: string, notifId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const notifRepository = Repositories.notification(transactionalEntityManager);
      const notif = await notifRepository.findOne({ where: { id: notifId } });
      if (!notif) {
        throw new NotFoundError("Notification not found");
      }
      if (notif.userId !== userId) {
        throw new NotFoundError("Notification not found");
      }
      return await notifRepository.deleteNotification(notif);
    });
  }
}
