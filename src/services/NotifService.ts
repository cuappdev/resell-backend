import { NotFoundError } from "routing-controllers";
import { Service } from "typedi";
import {
  NotificationData,
  FindTokensRequest,
  DiscountNotificationRequest,
  RequestMatchNotificationRequest,
  TokenWrapper,
} from "../types";
import Repositories, { TransactionsManager } from "../repositories";
import { EntityManager } from "typeorm";
import { InjectManager } from "typeorm-typedi-extensions";
import { getMessaging, Message } from "firebase-admin/messaging";

@Service()
export class NotifService {
  private transactions: TransactionsManager;

  constructor(@InjectManager() entityManager: EntityManager) {
    this.transactions = new TransactionsManager(entityManager);
  }

  public sendFCMNotifs = async (notifs: NotificationData[], userId: string) => {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const notifRepository = Repositories.notification(
        transactionalEntityManager,
      );
      console.log(notifs);
      for (const notif of notifs) {
        const msg: Message = {
          notification: {
            title: notif.title,
            body: notif.body,
          },
          data: notif.data as unknown as { [key: string]: string },
          token: notif.to[0],
        };
        try {
          // Send FCM notification
          const response = await getMessaging().send(msg);
          console.log(`Notification sent successfully: ${response}`);

          // Save notification to database
          await notifRepository.save({
            userId: userId,
            title: notif.title,
            body: notif.body,
            data: notif.data,
            read: false,
          });
        } catch (error) {
          console.warn(
            `Skipping invalid token for notification "${notif.title}": ${error.message}`,
          );
          // Do NOT throw, just skip
          continue;
        }
      }
    });
  };

  public async sendNotifs(request: FindTokensRequest) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const fcmTokenRepository = Repositories.fcmToken(
        transactionalEntityManager,
      );
      const user = await userRepository.getUserByEmail(request.email);
      if (!user) {
        throw new NotFoundError("User not found!");
      }
      const allDeviceTokens = [];
      const alltokens = await fcmTokenRepository.getTokensByUserId(
        user.firebaseUid,
      );
      for (const token of alltokens) {
        allDeviceTokens.push(token);
      }
      console.log(allDeviceTokens);

      const notif: NotificationData = {
        to: allDeviceTokens.map((tokenObj) => tokenObj.token),
        sound: "default",
        title: request.title,
        body: request.body,
        data: request.data as unknown as JSON,
      };
      try {
        const notifs: NotificationData[] = [];
        notif.to.forEach((token) => {
          notifs.push({
            to: [token],
            sound: notif.sound,
            title: notif.title,
            body: notif.body,
            data: notif.data,
          });
        });
        await this.sendFCMNotifs(notifs, user.firebaseUid);
        return {
          message: "Notification sent successfully",
          httpCode: 200,
        };
      } catch (err) {
        console.log(err);
        return {
          message: "Notification not sent",
          httpCode: 500,
        };
      }
    });
  }

  public async sendDiscountNotification(request: DiscountNotificationRequest) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const fcmTokenRepository = Repositories.fcmToken(
        transactionalEntityManager,
      );
      const postRepository = Repositories.post(transactionalEntityManager);

      const user = await userRepository.getUserById(request.sellerId);
      if (!user) {
        throw new NotFoundError("User not found!");
      }

      const post = await postRepository.getPostById(request.listingId);
      if (!post) {
        throw new NotFoundError("Post not found!");
      }

      const allDeviceTokens = [];
      const allTokens = await fcmTokenRepository.getTokensByUserId(
        user.firebaseUid,
      );
      for (const token of allTokens) {
        allDeviceTokens.push(token);
      }
      console.log(allDeviceTokens);

      const notif: NotificationData = {
        to: allDeviceTokens.map((tokenObj) => tokenObj.token),
        sound: "default",
        title: "Price Drop Alert!",
        body: `${post.title} is now available at $${request.newPrice}!`,
        data: {
          postId: post.id,
          postTitle: post.title,
          originalPrice: request.oldPrice,
          newPrice: request.newPrice,
          sellerId: post.user.firebaseUid,
          sellerUsername: post.user.username,
        } as unknown as JSON,
      };

      try {
        const notifs: NotificationData[] = [];
        notif.to.forEach((token) => {
          notifs.push({
            to: [token],
            sound: notif.sound,
            title: notif.title,
            body: notif.body,
            data: notif.data,
          });
        });
        await this.sendFCMNotifs(notifs, user.firebaseUid);
        return {
          message: "Notification sent successfully",
          httpCode: 200,
        };
      } catch (err) {
        console.log(err);
        return {
          message: "Notification not sent",
          httpCode: 500,
        };
      }
    });
  }

  public async sendRequestMatchNotification(
    request: RequestMatchNotificationRequest,
  ) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const userRepository = Repositories.user(transactionalEntityManager);
      const fcmTokenRepository = Repositories.fcmToken(
        transactionalEntityManager,
      );
      const postRepository = Repositories.post(transactionalEntityManager);
      const requestRepository = Repositories.request(
        transactionalEntityManager,
      );

      const user = await userRepository.getUserById(request.userId);
      if (!user) {
        throw new NotFoundError("User not found!");
      }

      const post = await postRepository.getPostById(request.listingId);
      if (!post) {
        throw new NotFoundError("Post not found!");
      }

      const userRequest = await requestRepository.getRequestById(
        request.requestId,
      );
      if (!userRequest) {
        throw new NotFoundError("Request not found!");
      }

      const allDeviceTokens = [];
      const allTokens = await fcmTokenRepository.getTokensByUserId(
        user.firebaseUid,
      );
      for (const token of allTokens) {
        allDeviceTokens.push(token);
      }

      const notif: NotificationData = {
        to: allDeviceTokens.map((tokenObj) => tokenObj.token),
        sound: "default",
        title: "Request Match Found!",
        body: `We found a match for your request: ${post.title}`,
        data: {
          postId: post.id,
          postTitle: post.title,
          price:
            post.altered_price > 0 ? post.altered_price : post.original_price,
          requestId: userRequest.id,
          requestTitle: userRequest.title,
          sellerId: post.user.firebaseUid,
          sellerUsername: post.user.username,
        } as unknown as JSON,
      };

      try {
        const notifs: NotificationData[] = [];
        notif.to.forEach((token) => {
          notifs.push({
            to: [token],
            sound: notif.sound,
            title: notif.title,
            body: notif.body,
            data: notif.data,
          });
        });
        await this.sendFCMNotifs(notifs, request.userId);
        return {
          message: "Notification sent successfully",
          httpCode: 200,
        };
      } catch (err) {
        console.log(err);
        return {
          message: "Notification not sent",
          httpCode: 500,
        };
      }
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
