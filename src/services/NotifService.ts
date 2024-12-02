import { NotFoundError} from 'routing-controllers';
import { Service } from 'typedi';
import { ExpoPushMessage, PushTicket, FindTokensRequest, NotifSent, DiscountNotificationRequest, RequestMatchNotificationRequest } from '../types';
import { Expo } from 'expo-server-sdk';
import { UserRepository } from 'src/repositories/UserRepository';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
var accessToken = process.env['EXPO_ACCESS_TOKEN']
const expoServer = new Expo({ accessToken: accessToken });


@Service()
export class NotifService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    // /**
//  * Takes an array of notifications and sends them to users in batches (called chunks)
//  * @param {NotifObject[]} notifs an array of notification objects
//  * @param {Object} expoServer the server object to connect with
//  */

// Comment to push main

    public sendNotifChunks = async (notifs : ExpoPushMessage[], expoServer : Expo) => {
        let chunks = expoServer.chunkPushNotifications(notifs);
        let tickets = [];

        for (let chunk of chunks) {
            try {
                let ticketChunk = await expoServer.sendPushNotificationsAsync(chunk);
                // store tickets to check for notif status later
                tickets.push(...ticketChunk);
            } catch (err) {
                console.log("Error while sending notif chunk");
            }
            console.log(tickets);
        }
    }

    public async sendNotifs(request: FindTokensRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            const userSessionRepository = Repositories.session(transactionalEntityManager);
            let user = await userRepository.getUserByEmail(request.email);
            if (!user) {
                throw new NotFoundError("User not found!");
            }
            const allDeviceTokens = [];
            const allsessions = await userSessionRepository.getSessionsByUserId(user.id);
            for (var sess of allsessions) {
                if (sess.deviceToken) {
                allDeviceTokens.push(sess.deviceToken); }
            }
            let notif: ExpoPushMessage= 
                {
                    to: allDeviceTokens,
                    sound: 'default',
                    title: request.title,
                    body: request.body,
                    data: request.data
                }
            try {
                let notifs : ExpoPushMessage[] = [];
                notif.to.forEach(token => {
                    notifs.push({
                        to: [token],
                        sound: notif.sound,
                        title: notif.title,
                        body: notif.body,
                        data: notif.data
                    })
                })
                this.sendNotifChunks(notifs, expoServer)
            }
            
            // Simply do nothing if the user has no tokens
            catch (err) { 
                console.log(err) }
        })
    }

    public async sendDiscountNotification(request: DiscountNotificationRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const postRepository = Repositories.post(transactionalEntityManager);
            const userRepository = Repositories.user(transactionalEntityManager);
            
            // Get the post
            const post = await postRepository.getPostById(request.listingId);
            if (!post) {
                throw new NotFoundError("Post not found!");
            }
            
            // Get all users who saved this post
            const usersWithSavedPost = await userRepository.getUsersWhoSavedPost(post.id);
            
            for (const user of usersWithSavedPost) {
                const userSessionRepository = Repositories.session(transactionalEntityManager);
                const allDeviceTokens = [];
                const allsessions = await userSessionRepository.getSessionsByUserId(user.id);
                
                for (var sess of allsessions) {
                    if (sess.deviceToken) {
                        allDeviceTokens.push(sess.deviceToken);
                    }
                }
                
                if (allDeviceTokens.length > 0) {
                    const discountPercentage = Math.round(
                        ((request.oldPrice - request.newPrice) / request.oldPrice) * 100
                    );

                    let notif: ExpoPushMessage = {
                        to: allDeviceTokens,
                        sound: 'default',
                        title: 'Price Drop Alert! 🎉',
                        body: `A post you saved is now ${discountPercentage}% off!`,
                        data: {
                            postId: request.listingId,
                            oldPrice: request.oldPrice,
                            newPrice: request.newPrice
                        } as unknown as JSON
                    };

                    try {
                        let notifs: ExpoPushMessage[] = [];
                        notif.to.forEach(token => {
                            notifs.push({
                                to: [token],
                                sound: 'default',
                                title: notif.title,
                                body: notif.body,
                                data: notif.data
                            });
                        });
                        await this.sendNotifChunks(notifs, expoServer);
                    } catch (err) {
                        console.log(err);
                    }
                }
            }
        });
    }

    public async sendRequestMatchNotification(request: RequestMatchNotificationRequest) {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const postRepository = Repositories.post(transactionalEntityManager);
            const requestRepository = Repositories.request(transactionalEntityManager);

            const post = await postRepository.getPostById(request.listingId);
            const userRequest = await requestRepository.getRequestById(request.requestId);

            if (!post || !userRequest) {
                throw new NotFoundError("Post or Request not found!");
            }

            const userSessionRepository = Repositories.session(transactionalEntityManager);
            const allDeviceTokens = [];
            const allsessions = await userSessionRepository.getSessionsByUserId(request.userId);
            
            for (var sess of allsessions) {
                if (sess.deviceToken) {
                    allDeviceTokens.push(sess.deviceToken);
                }
            }

            if (allDeviceTokens.length > 0) {
                let notif: ExpoPushMessage = {
                    to: allDeviceTokens,
                    sound: 'default',
                    title: 'Request Match Found! 🎯',
                    body: `We found a post that matches your request for ${userRequest.title}`,
                    data: {
                        postId: request.listingId,
                        requestId: request.requestId,
                        postTitle: post.title,
                        price: post.original_price
                    } as unknown as JSON
                };

                try {
                    let notifs: ExpoPushMessage[] = [];
                    notif.to.forEach(token => {
                        notifs.push({
                            to: [token],
                            sound: 'default',
                            title: notif.title,
                            body: notif.body,
                            data: notif.data
                        });
                    });
                    await this.sendNotifChunks(notifs, expoServer);
                } catch (err) {
                    console.log(err);
                }
            }
        });
    }
}