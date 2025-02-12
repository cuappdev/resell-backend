import { NotFoundError } from 'routing-controllers';
import { Service } from 'typedi';
// import { UserRepository } from 'src/repositories/UserRepository';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import * as admin from 'firebase-admin';

@Service()
export class NotifService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    /** Send Firebase Cloud Messaging notifs **/
    public async sendNotifChunks(notifs: { fcmToken: string; title: string; body: string; data: any }[]) {
        try {
            const response = await admin.messaging().sendEachForMulticast({
                tokens: notifs.map(n => n.fcmToken),
                notification: {
                title: notifs[0].title,
                body: notifs[0].body,
                },
                data: notifs[0].data,
            });
            console.log('FCM Response:', response);
        } catch (error) {
            console.error('FCM Error:', error);
        }
    }

    /** Get FCM tokens and send notifications to all devices **/
    public async sendNotifs(request: { email: string; title: string; body: string; data: any }) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const userSessionRepository = Repositories.session(transactionalEntityManager);
            let user = await userRepository.getUserByEmail(request.email);
            if (!user) {
                throw new NotFoundError("User not found!");
            }
            
            const allFcmTokens = [];
            const allSessions = await userSessionRepository.getSessionsByUserId(user.id);
            for (var sess of allSessions) {
                if (sess.fcmToken) {
                    allFcmTokens.push(sess.fcmToken);
                }
            }
            
            if (allFcmTokens.length > 0) {
                const notifs = allFcmTokens.map(fcmToken => ({
                    fcmToken,
                    title: request.title,
                    body: request.body,
                    data: request.data,
                }));
                
                await this.sendNotifChunks(notifs);
            }
        });
    }

    public async sendDiscountNotification(request: { listingId: string; oldPrice: number; newPrice: number }) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const postRepository = Repositories.post(transactionalEntityManager);
            const userRepository = Repositories.user(transactionalEntityManager);
            
            const post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }
            
            const usersWithSavedPost = await userRepository.getUsersWhoSavedPost(post.id);
            for (const user of usersWithSavedPost) {
                const userSessionRepository = Repositories.session(transactionalEntityManager);
                const allFcmTokens = [];
                const allSessions = await userSessionRepository.getSessionsByUserId(user.id);
                
                for (var sess of allSessions) {
                    if (sess.fcmToken) {
                        allFcmTokens.push(sess.fcmToken);
                    }
                }
                
                if (allFcmTokens.length > 0) {
                    const discountPercentage = Math.round(
                        ((request.oldPrice - request.newPrice) / request.oldPrice) * 100
                    );
                    
                    const notifs = allFcmTokens.map(fcmToken => ({
                        fcmToken,
                        title: 'Price Drop Alert! 🎉',
                        body: `A post you saved is now ${discountPercentage}% off!`,
                        data: { postId: request.listingId, oldPrice: request.oldPrice, newPrice: request.newPrice },
                    }));
                    
                    await this.sendNotifChunks(notifs);
                }
            }
        });
    }

    public async sendRequestMatchNotification(request: { listingId: string; requestId: string; userId: string }) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const postRepository = Repositories.post(transactionalEntityManager);
            const requestRepository = Repositories.request(transactionalEntityManager);
            
            const post = await postRepository.getPostById(request.listingId);
            const userRequest = await requestRepository.getRequestById(request.requestId);
            
            if (!post || !userRequest) {
                throw new NotFoundError("Post or Request not found!");
            }
            
            const userSessionRepository = Repositories.session(transactionalEntityManager);
            const allFcmTokens = [];
            const allSessions = await userSessionRepository.getSessionsByUserId(request.userId);
            
            for (var sess of allSessions) {
                if (sess.fcmToken) {
                    allFcmTokens.push(sess.fcmToken);
                }
            }
            
            if (allFcmTokens.length > 0) {
                const notifs = allFcmTokens.map(fcmToken => ({
                    fcmToken,
                    title: 'Request Match Found! 🎯',
                    body: `We found a post that matches your request!`,
                    data: { postId: request.listingId, requestId: request.requestId },
                }));
                
                await this.sendNotifChunks(notifs);
            }
        });
    }
}
