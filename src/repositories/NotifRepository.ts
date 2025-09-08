import { EntityRepository, Repository, MoreThan } from 'typeorm';
import { NotifModel } from '../models/NotifModel';

@EntityRepository(NotifModel)
export class NotifRepository extends Repository<NotifModel> {
    /**
     * Get recent notifications for a user
     * @param userId - The ID of the user
     * @param limit - Maximum number of notifications to return
     */
    async getRecentNotifications(userId: string, limit: number = 10): Promise<NotifModel[]> {
        return this.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            relations: ['user']
        });
    }

    /**
     * Mark a notification as read (not sure if this is needed.)
     */
    async markAsRead(notificationId: string): Promise<NotifModel | undefined> {
        const notification = await this.findOne(notificationId);
        if (notification) {
            notification.read = true;
            return this.save(notification);
        }
        return undefined;
    }

    /** unread (i.e. “new”) notifications */
    async getUnread(userId: string): Promise<NotifModel[]> {
        return this.find({
          where: { userId, read: false },
          order: { createdAt: 'DESC' },
          relations: ['user']
        });
    }

    async getFromLastDays(userId: string, days: number): Promise<NotifModel[]> {
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
    
        return this.find({
          where: {
            userId,
            createdAt: MoreThan(cutoff)
          },
          order: { createdAt: 'DESC' },
          relations: ['user']
        });
    }

    async deleteNotification(notif: NotifModel): Promise<NotifModel> {
        return await this.remove(notif);
    }
}