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
import { admin } from "../app";

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

  async deleteNotification(userId: string, notifId: string) {
    return this.transactions.readWrite(async (transactionalEntityManager) => {
      const notifRepository = Repositories.notification(
        transactionalEntityManager,
      );
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
