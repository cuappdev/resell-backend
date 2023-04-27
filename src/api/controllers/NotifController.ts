import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { ExpoPushMessage, PushTicket, FindTokensRequest } from 'src/types';
import { NotifService } from '../../services/NotifService';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Post()
    async sendPost(@Body() findTokensRequest: FindTokensRequest) {
      return this.notifService.sendNotifs(findTokensRequest);
    }
}

//TODO:
//The frontend sends in an email... We retrive the user and all of their tokens
//Create an ExpoPushMessage with all of those tokens 
//Call SendNotifs on it