import { NotFoundError} from 'routing-controllers';
import { Service } from 'typedi';
import { NotificationData, FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest } from '../types';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
// var accessToken = process.env['EXPO_ACCESS_TOKEN']
// const expoServer = new Expo({ accessToken: accessToken });
import * as admin from 'firebase-admin';
import { getMessaging, Message } from 'firebase-admin/messaging';


var serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (!serviceAccountPath) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.');
}

const serviceAccount = require(serviceAccountPath);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   // Optionally, you can specify the database URL if needed:
//   // databaseURL: "https://resell-e99a2-default-rtdb.firebaseio.com"
//   });


@Service()
export class NotifService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    public sendFCMNotifs = async (notifs: NotificationData[], userId: string) => {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const notifRepository = Repositories.notification(transactionalEntityManager);
            
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
                    console.error(
                        `Error sending notification for title "${notif.title}" to token ${notif.to[0]}:`,
                        error
                    );
                    throw error;
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
                if (token.fcmToken) {
                    allDeviceTokens.push(token.fcmToken);
                }
            }
            let notif: NotificationData = {
                to: allDeviceTokens,
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
            } catch (err) {
                console.log(err)
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
                if (token.fcmToken) {
                    allDeviceTokens.push(token.fcmToken);
                }
            }

            let notif: NotificationData = {
                to: allDeviceTokens,
                sound: 'default',
                title: "Price Drop Alert!",
                body: `${post.title} is now available at $${request.newPrice}!`,
                data: {
                    postId: post.id,
                    postTitle: post.title,
                    originalPrice: request.oldPrice,
                    newPrice: request.newPrice,
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username
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
            } catch (err) {
                console.log(err);
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
                if (token.fcmToken) {
                    allDeviceTokens.push(token.fcmToken);
                }
            }

            let notif: NotificationData = {
                to: allDeviceTokens,
                sound: 'default',
                title: "Request Match Found!",
                body: `We found a match for your request: ${post.title}`,
                data: {
                    postId: post.id,
                    postTitle: post.title,
                    price: post.altered_price > 0 ? post.altered_price : post.original_price,
                    requestId: userRequest.id,
                    requestTitle: userRequest.title,
                    sellerId: post.user.firebaseUid,
                    sellerUsername: post.user.username
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
            } catch (err) {
                console.log(err);
            }
        });
    }

    public async getRecentNotifications(userId: string) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const notifRepository = Repositories.notification(transactionalEntityManager);
            return await notifRepository.getRecentNotifications(userId);
        });
    }
}