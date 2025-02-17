import { Body, CurrentUser, Delete, Get, JsonController, Params, Post } from 'routing-controllers';
import { FindTokensRequest, DiscountNotificationRequest, RequestMatchNotificationRequest } from 'src/types';
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

    @Post('discount')
    async sendDiscountNotif(@Body() discountRequest: DiscountNotificationRequest) {
        return this.notifService.sendDiscountNotification(discountRequest);
    }

    @Post('request-match')
    async sendRequestMatchNotif(@Body() matchRequest: RequestMatchNotificationRequest) {
        return this.notifService.sendRequestMatchNotification(matchRequest);
    }
}

