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
     * Uses REAL data from the database so notifications can navigate properly
     * @param userId - The user to create the notification for
     * @param type - Type of notification: messages, requests, bookmarks, transactions
     */
    async createTestNotification(userId: string, type: string) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const notifRepository = Repositories.notification(transactionalEntityManager);
            const userRepository = Repositories.user(transactionalEntityManager);
            const postRepository = Repositories.post(transactionalEntityManager);
            const requestRepository = Repositories.request(transactionalEntityManager);
            const transactionRepository = Repositories.transaction(transactionalEntityManager);
            
            // Get the current user (firebaseUid is the primary key)
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new NotFoundError("User not found");
            }

            // Fetch real data from the database
            const posts = await postRepository.getAllPosts();
            const post = posts && posts.length > 0 ? posts[0] : null;
            
            const requests = await requestRepository.getAllRequest();
            const request = requests && requests.length > 0 ? requests[0] : null;
            
            const transactions = await transactionRepository.getAllTransactions();
            const transaction = transactions && transactions.length > 0 ? transactions[0] : null;

            // Fallback values if no real data exists
            const fallbackImageUrl = "https://picsum.photos/200";
            const fallbackPrice = 99.99;

            // Build notification data using REAL IDs from database
            let notifData: { title: string; body: string; data: Record<string, any> };

            switch (type) {
                case 'messages':
                    notifData = {
                        title: "New Message",
                        body: `${post?.user?.username || 'Someone'} sent you a message about '${post?.title || 'an item'}'`,
                        data: {
                            type: "messages",
                            imageUrl: post?.images?.[0] || fallbackImageUrl,
                            postId: post?.id || null,  // REAL post ID
                            postTitle: post?.title || "Test Item",
                            chatId: post ? `${user.firebaseUid}_${post.user?.firebaseUid}` : null,  // Constructed chat ID
                            sellerId: post?.user?.firebaseUid || null,  // REAL seller ID (firebaseUid)
                            sellerUsername: post?.user?.username || "seller",
                            sellerPhotoUrl: post?.user?.photoUrl || fallbackImageUrl
                        }
                    };
                    break;

                case 'requests':
                    notifData = {
                        title: "Request Match Found!",
                        body: `We found a match for your request: '${request?.title || 'Your Request'}'`,
                        data: {
                            type: "requests",
                            imageUrl: post?.images?.[0] || fallbackImageUrl,
                            postId: post?.id || null,  // REAL post ID
                            postTitle: post?.title || "Matching Item",
                            requestId: request?.id || null,  // REAL request ID
                            requestTitle: request?.title || "Your Request",
                            price: post?.altered_price || post?.original_price || fallbackPrice,
                            sellerId: post?.user?.firebaseUid || null,
                            sellerUsername: post?.user?.username || "seller",
                            sellerPhotoUrl: post?.user?.photoUrl || fallbackImageUrl
                        }
                    };
                    break;

                case 'bookmarks':
                    const originalPrice = post?.original_price || 100;
                    const newPrice = post?.altered_price || originalPrice * 0.8;  // 20% discount
                    notifData = {
                        title: "Price Drop Alert!",
                        body: `${post?.title || 'An item you saved'} is now available at $${newPrice}!`,
                        data: {
                            type: "bookmarks",
                            imageUrl: post?.images?.[0] || fallbackImageUrl,
                            postId: post?.id || null,  // REAL post ID
                            postTitle: post?.title || "Saved Item",
                            originalPrice: originalPrice,
                            newPrice: newPrice,
                            sellerId: post?.user?.firebaseUid || null,
                            sellerUsername: post?.user?.username || "seller",
                            sellerPhotoUrl: post?.user?.photoUrl || fallbackImageUrl
                        }
                    };
                    break;

                case 'transactions':
                    notifData = {
                        title: "Meeting Confirmed!",
                        body: `${transaction?.seller?.username || post?.user?.username || 'Seller'} accepted your meeting proposal for '${transaction?.post?.title || post?.title || 'an item'}'`,
                        data: {
                            type: "transactions",
                            imageUrl: transaction?.post?.images?.[0] || post?.images?.[0] || fallbackImageUrl,
                            postId: transaction?.post?.id || post?.id || null,  // REAL post ID
                            postTitle: transaction?.post?.title || post?.title || "Item",
                            transactionId: transaction?.id || null,  // REAL transaction ID
                            sellerId: transaction?.seller?.firebaseUid || post?.user?.firebaseUid || null,
                            sellerUsername: transaction?.seller?.username || post?.user?.username || "seller",
                            sellerPhotoUrl: transaction?.seller?.photoUrl || post?.user?.photoUrl || fallbackImageUrl,
                            buyerId: transaction?.buyer?.firebaseUid || user.firebaseUid,
                            buyerUsername: transaction?.buyer?.username || user.username,
                            price: transaction?.amount || post?.altered_price || post?.original_price || fallbackPrice,
                            meetingTime: transaction?.transactionDate?.toISOString() || new Date().toISOString()
                        }
                    };
                    break;

                case 'transaction_confirmation':
                    notifData = {
                        title: "Confirm your meetup",
                        body: `Did your meetup with ${transaction?.seller?.username || post?.user?.username || 'the seller'} for '${transaction?.post?.title || post?.title || 'an item'}' happen?`,
                        data: {
                            type: "transaction_confirmation",
                            transactionId: transaction?.id || null,  // REAL transaction ID
                            postId: transaction?.post?.id || post?.id || null,  // REAL post ID
                            postTitle: transaction?.post?.title || post?.title || "Item",
                            sellerId: transaction?.seller?.firebaseUid || post?.user?.firebaseUid || null,
                            sellerUsername: transaction?.seller?.username || post?.user?.username || "seller",
                            imageUrl: transaction?.post?.images?.[0] || post?.images?.[0] || fallbackImageUrl
                        }
                    };
                    break;

                default:
                    // Default to messages type
                    notifData = {
                        title: "New Notification",
                        body: "You have a new notification",
                        data: {
                            type: type,
                            imageUrl: post?.images?.[0] || fallbackImageUrl,
                            postId: post?.id || null
                        }
                    };
            }

            // Save directly to database (skip FCM for testing)
            const savedNotif = await notifRepository.save({
                userId: userId,
                title: notifData.title,
                body: notifData.body,
                data: notifData.data,
                read: false
            });

            return {
                message: `Test ${type} notification created with real data`,
                notification: savedNotif,
                debug: {
                    hasRealPost: !!post,
                    hasRealRequest: !!request,
                    hasRealTransaction: !!transaction,
                    postId: post?.id,
                    requestId: request?.id,
                    transactionId: transaction?.id
                }
            };
        });
    }
}