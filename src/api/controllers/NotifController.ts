import { Body, Post, JsonController } from 'routing-controllers';
import { NotifService } from '../../services/NotifService';

@JsonController('notif/')
export class NotifController {
    private notifService: NotifService;

    constructor(notifService: NotifService) {
      this.notifService = notifService;
    }

    @Post()
    async sendNotif(@Body() request: { email: string; title: string; body: string; data: any }) {
      return this.notifService.sendNotifs(request);
    }

    @Post('discount')
    async sendDiscountNotif(@Body() request: { listingId: string; oldPrice: number; newPrice: number }) {
        return this.notifService.sendDiscountNotification(request);
    }

    @Post('request-match')
    async sendRequestMatchNotif(@Body() request: { listingId: string; requestId: string; userId: string }) {
        return this.notifService.sendRequestMatchNotification(request);
    }
}
