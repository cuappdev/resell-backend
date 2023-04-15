import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { ExpoPushMessage, PushTicket } from 'src/types';
import { NotifService } from '../../services/NotifService';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Post()
    async sendPost( notifRequest : ExpoPushMessage ) {
        return this.notifService.sendNotifs(notifRequest, {});
    }
}

//TODO:
//The frontend sends in an email... We retrive the user and all of their tokens
//Create an ExpoPushMessage with all of those tokens 
//Call SendNotifs on it