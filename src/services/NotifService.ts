import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
import { NotificationData, FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import { getMessaging, Message } from 'firebase-admin/messaging';

interface NotifPayload {
    title: string;
    body: string;
    data: Record<string, any>;
}

interface NotifResult {
    message: string;
    httpCode: number;
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
     * send notification to a user and persist it, skips invalid tokens
     */
    private async sendToUser(
        userId: string,
        tokens: string[],
        payload: NotifPayload,
        notifRepository: ReturnType<typeof Repositories.notification>
    ): Promise<void> {
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
                await notifRepository.save({
                    userId: userId,
                    title: payload.title,
                    body: payload.body,
                    data: payload.data as unknown as JSON,
                    read: false
                });
            } catch (error) {
                console.warn(`Skipping invalid token for notification "${payload.title}": ${error.message}`);
                continue;
            }
        }
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
            return { message: "No device tokens found", httpCode: 200 };
        }

        try {
            await this.sendToUser(userId, tokens, payload, notifRepository);
            return { message: "Notification sent successfully", httpCode: 200 };
        } catch (err) {
            console.error('Failed to send notification:', err);
            return { message: "Notification not sent", httpCode: 500 };
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

            const price = post.altered_price > 0 ? post.altered_price : post.original_price;

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
            const notifRepository = Repositories.notification(transactionalEntityManager);
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