import { NotFoundError} from 'routing-controllers';
import { Service } from 'typedi';
import { ExpoPushMessage, PushTicket, FindTokensRequest } from '../types';
import { Expo } from 'expo-server-sdk';
import { UserRepository } from 'src/repositories/UserRepository';
import Repositories, { TransactionsManager } from '../repositories';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
var accessToken = process.env['EXPO_ACCESS_TOKEN']
const expoServer = new Expo({ accessToken: accessToken });


@Service()
export class NotifService {
// /**
//  * Takes an array of notifications and sends them to users in batches (called chunks)
//  * @param {NotifObject[]} notifs an array of notification objects
//  * @param {Object} expoServer the server object to connect with
//  */

    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    public sendNotifChunks = async (notifs : ExpoPushMessage[], expoServer : Expo) => {
        let chunks = expoServer.chunkPushNotifications(notifs);
        console.log("7")
        let tickets = [];
        // console.log(chunks)

        for (let chunk of chunks) {
            console.log("here")
            try {
                console.log("9")
                let ticketChunk = await expoServer.sendPushNotificationsAsync(chunk);
                // store tickets to check for notif status later
                console.log("10")
                tickets.push(...ticketChunk);
            } catch (err) {
                console.log("Error while sending notif chunk");
            }
            console.log(tickets);
        }
    }

    public async sendNotifs(request: FindTokensRequest) {
        // console.log(request)
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            let user = await userRepository.getUserByEmail(request.email);
            console.log("1")
            if (!user) {
                console.log("2")
                throw new NotFoundError("User not found!");
            }
            console.log("3")
            let notif: ExpoPushMessage= 
                {
                    to: user.deviceTokens,
                    sound: 'default',
                    title: request.title,
                    body: request.body,
                    data: request.data
                }
            // console.log(notif)
            try {
                let notifs : ExpoPushMessage[] = [];
                console.log("5")
                notif.to.forEach(token => {
                    notifs.push({
                        to: [token],
                        sound: notif.sound,
                        title: notif.title,
                        body: notif.body,
                        data: notif.data
                    })
                })
                console.log(notifs)
                this.sendNotifChunks(notifs, expoServer)
            }
            // Simply do nothing if the user has no tokens
            catch (err) { 
                console.log("hai");
                console.log(err) }
        })
    }
}