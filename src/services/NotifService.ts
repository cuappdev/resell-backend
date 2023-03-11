import { Service } from 'typedi';

import { ExpoPushMessage, PushTicket } from '../types';
// import { uploadImage } from '../utils/Requests';
import { Expo } from 'expo-server-sdk';
const expoServer = new Expo({ accessToken: 'lohuh5OtdO1KS4I_kJGdE0PDtnxgV4GEpTiJAIoZ' });

@Service()
export class NotifService {
// /**
//  * Takes an array of notifications and sends them to users in batches (called chunks)
//  * @param {NotifObject[]} notifs an array of notification objects
//  * @param {Object} expoServer the server object to connect with
//  */
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

public sendNotifs = (notif : ExpoPushMessage, json = {}) => {
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