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
    async sendNotif(@Body() findTokensRequest: FindTokensRequest) {
      return this.notifService.sendNotifs(findTokensRequest);
    }
}

