import { NotFoundError} from 'routing-controllers';
import { Service } from 'typedi';

import { ExpoPushMessage, PushTicket, FindTokensRequest } from '../types';
import { Expo } from 'expo-server-sdk';
import { UserRepository } from 'src/repositories/UserRepository';
const expoServer = new Expo({ accessToken: 'lohuh5OtdO1KS4I_kJGdE0PDtnxgV4GEpTiJAIoZ' });


@Service()
export class NotifService {
// /**
//  * Takes an array of notifications and sends them to users in batches (called chunks)
//  * @param {NotifObject[]} notifs an array of notification objects
//  * @param {Object} expoServer the server object to connect with
//  */

    private userRepository: UserRepository

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

    public async sendNotifs(request: FindTokensRequest, json = {}) {
        let user = await this.userRepository.getUserByEmail(request.email);
        if (!user) {
            throw new NotFoundError('User not found!');
        }
        let notif: ExpoPushMessage= 
            {
                to: user.deviceTokens,
                sound: 'default',
                title: request.title,
                body: request.body,
                data: request.data
            }
        
        try {
            let notifs : ExpoPushMessage[] = [];
            notif.to.forEach(token => {
                notifs.push({
                    to: notif.to,
                    sound: notif.sound,
                    title: notif.title,
                    body: notif.body,
                    data: notif.data
                })
            })

            this.sendNotifChunks(notifs, expoServer)
        }
        // Simply do nothing if the user has no tokens
        catch (err) { console.log(err) }
    }

}