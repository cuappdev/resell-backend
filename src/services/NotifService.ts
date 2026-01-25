import { NotFoundError} from 'routing-controllers';
import { Service } from 'typedi';
import { NotificationData, FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest, TokenWrapper } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
// var accessToken = process.env['EXPO_ACCESS_TOKEN']
// const expoServer = new Expo({ accessToken: accessToken });
// import * as admin from 'firebase-admin';
import { getMessaging, Message } from 'firebase-admin/messaging';
import { admin } from '../app';

@Service()
export class NotifService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    public sendFCMNotifs = async (notifs: NotificationData[], userId: string) => {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const notifRepository = Repositories.notification(transactionalEntityManager);
            console.log(notifs);
            for (let notif of notifs) {
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
                        read: false
                    });
                } catch (error) {
                    console.warn(
                        `Skipping invalid token for notification "${notif.title}": ${error.message}`
                      );
                      // Do NOT throw, just skip
                      continue;
                }
            }
        });
    }

  


    public async sendNotifs(request: FindTokensRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const fcmTokenRepository = Repositories.fcmToken(transactionalEntityManager);
            let user = await userRepository.getUserByEmail(request.email);
            if (!user) {
                throw new NotFoundError("User not found!");
            }
            const allDeviceTokens = [];
            const alltokens = await fcmTokenRepository.getTokensByUserId(user.firebaseUid);
            for (var token of alltokens) {
       
                allDeviceTokens.push(token);
                
            }
            console.log(allDeviceTokens);
        
            let notif: NotificationData = {
                to: allDeviceTokens.map(tokenObj => tokenObj.token),
                sound: 'default',
                title: request.title,
                body: request.body,
                data: request.data as unknown as JSON

            }
            try {
                let notifs: NotificationData[] = [];
                notif.to.forEach(token => {
                    notifs.push({
                        to: [token],
                        sound: notif.sound,
                        title: notif.title,
                        body: notif.body,
                        data: notif.data
                    })
                })
                await this.sendFCMNotifs(notifs, user.firebaseUid)
                return {
                    message: "Notification sent successfully",
                    httpCode: 200
                  };
            } catch (err) {
                console.log(err)
                return {
                    message: "Notification not sent",
                    httpCode: 500
                  };
            }
        })
    }

    public async sendDiscountNotification(request: DiscountNotificationRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const fcmTokenRepository = Repositories.fcmToken(transactionalEntityManager);
            const postRepository = Repositories.post(transactionalEntityManager);

            let user = await userRepository.getUserById(request.sellerId);
            if (!user) {
                throw new NotFoundError("User not found!");
            }

            let post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }

            const allDeviceTokens = [];
            const allTokens = await fcmTokenRepository.getTokensByUserId(user.firebaseUid);
            for (var token of allTokens) {
       
                allDeviceTokens.push(token);
                
            }
            console.log(allDeviceTokens);

            // Get the first image from the post (if available)
            const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

            let notif: NotificationData = {
                to: allDeviceTokens.map(tokenObj => tokenObj.token),
                sound: 'default',
                title: "Price Drop Alert!",
                body: `${post.title} is now available at $${request.newPrice}!`,
                data: {
                    type: "bookmarks",  // For frontend filtering
                    imageUrl: imageUrl,
                    postId: post.id,
                    postTitle: post.title,
                    originalPrice: request.oldPrice,
                    newPrice: request.newPrice,
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username,
                    sellerPhotoUrl: post.user.photoUrl
                } as unknown as JSON
            }

            try {
                let notifs: NotificationData[] = [];
                notif.to.forEach(token => {
                    notifs.push({
                        to: [token],
                        sound: notif.sound,
                        title: notif.title,
                        body: notif.body,
                        data: notif.data
                    });
                });
                await this.sendFCMNotifs(notifs, user.firebaseUid);
                return {
                    message: "Notification sent successfully",
                    httpCode: 200
                  };
            } catch (err) {
                console.log(err);
                return {
                    message: "Notification not sent",
                    httpCode: 500
                  };
            }
        });
    }

    public async sendRequestMatchNotification(request: RequestMatchNotificationRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const fcmTokenRepository = Repositories.fcmToken(transactionalEntityManager);
            const postRepository = Repositories.post(transactionalEntityManager);
            const requestRepository = Repositories.request(transactionalEntityManager);

            let user = await userRepository.getUserById(request.userId);
            if (!user) {
                throw new NotFoundError("User not found!");
            }

            let post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }

            let userRequest = await requestRepository.getRequestById(request.requestId);
            if (!userRequest) {
                throw new NotFoundError("Request not found!");
            }

            const allDeviceTokens = [];
            const allTokens = await fcmTokenRepository.getTokensByUserId(user.firebaseUid);
            for (var token of allTokens) {
       
                allDeviceTokens.push(token);
                
            }

            // Get the first image from the post (if available)
            const imageUrl = post.images && post.images.length > 0 ? post.images[0] : null;

            let notif: NotificationData = {
                to: allDeviceTokens.map(tokenObj => tokenObj.token),
                sound: 'default',
                title: "Request Match Found!",
                body: `We found a match for your request: ${post.title}`,
                data: {
                    type: "requests",  // For frontend filtering
                    imageUrl: imageUrl,
                    postId: post.id,
                    postTitle: post.title,
                    price: post.altered_price > 0 ? post.altered_price : post.original_price,
                    requestId: userRequest.id,
                    requestTitle: userRequest.title,
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username,
                    sellerPhotoUrl: post.user.photoUrl
                } as unknown as JSON
            }

            try {
                let notifs: NotificationData[] = [];
                notif.to.forEach(token => {
                    notifs.push({
                        to: [token],
                        sound: notif.sound,
                        title: notif.title,
                        body: notif.body,
                        data: notif.data
                    });
                });
                await this.sendFCMNotifs(notifs, request.userId);
                return {
                    message: "Notification sent successfully",
                    httpCode: 200
                  };
            } catch (err) {
                console.log(err);
                return {
                    message: "Notification not sent",
                    httpCode: 500
                  };
            }
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

    /**
     * Mark a notification as read
     */
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
     * Create a test notification for development/testing
     * @param userId - The user to create the notification for
     * @param type - Type of notification: messages, requests, bookmarks, transactions
     */
    async createTestNotification(userId: string, type: string) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const notifRepository = Repositories.notification(transactionalEntityManager);
            const userRepository = Repositories.user(transactionalEntityManager);
            
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new NotFoundError("User not found");
            }

            // Sample test data based on type
            const testData: Record<string, any> = {
                messages: {
                    title: "New Message",
                    body: "Test User sent you a message about 'iPhone 13 Pro'",
                    data: {
                        type: "messages",
                        imageUrl: "https://picsum.photos/200",
                        postId: "test-post-123",
                        postTitle: "iPhone 13 Pro",
                        chatId: "test-chat-456",
                        sellerId: "test-seller-789",
                        sellerUsername: "test_seller",
                        sellerPhotoUrl: "https://picsum.photos/100"
                    }
                },
                requests: {
                    title: "Request Match Found!",
                    body: "We found a match for your request: 'Looking for MacBook'",
                    data: {
                        type: "requests",
                        imageUrl: "https://picsum.photos/200",
                        postId: "test-post-456",
                        postTitle: "MacBook Pro 14\"",
                        requestId: "test-request-123",
                        requestTitle: "Looking for MacBook",
                        price: 1299.99,
                        sellerId: "test-seller-789",
                        sellerUsername: "tech_seller",
                        sellerPhotoUrl: "https://picsum.photos/100"
                    }
                },
                bookmarks: {
                    title: "Price Drop Alert!",
                    body: "AirPods Pro is now available at $199!",
                    data: {
                        type: "bookmarks",
                        imageUrl: "https://picsum.photos/200",
                        postId: "test-post-789",
                        postTitle: "AirPods Pro",
                        originalPrice: 249.99,
                        newPrice: 199.99,
                        sellerId: "test-seller-123",
                        sellerUsername: "audio_deals",
                        sellerPhotoUrl: "https://picsum.photos/100"
                    }
                },
                transactions: {
                    title: "Meeting Confirmed!",
                    body: "seller_jane accepted your meeting proposal for 'Vintage Camera'",
                    data: {
                        type: "transactions",
                        imageUrl: "https://picsum.photos/200",
                        postId: "test-post-999",
                        postTitle: "Vintage Camera",
                        transactionId: "test-transaction-123",
                        sellerId: "test-seller-456",
                        sellerUsername: "seller_jane",
                        sellerPhotoUrl: "https://picsum.photos/100",
                        price: 150.00,
                        meetingTime: new Date().toISOString()
                    }
                }
            };

            const notifData = testData[type] || testData.messages;

            // Save directly to database (skip FCM for testing)
            const savedNotif = await notifRepository.save({
                userId: userId,
                title: notifData.title,
                body: notifData.body,
                data: notifData.data,
                read: false
            });

            return {
                message: `Test ${type} notification created`,
                notification: savedNotif
            };
        });
    }
}