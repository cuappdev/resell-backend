import { NotifModel } from '../../models/NotifModel';
import { UserFactory } from './UserFactory';

export class NotifFactory {
  public static create(n: number = 1): NotifModel[] {
    return Array(n).fill(null).map(() => NotifFactory.fake());
  }

  public static fake(): NotifModel {
    const notif = new NotifModel();
    notif.userId = UserFactory.create(1)[0].id;
    notif.title = 'Test notification title';
    notif.body = 'Test notification message';
    notif.read = false;
    notif.createdAt = new Date();
    notif.updatedAt = new Date();
    return notif;
  }

  public static fakeTemplate(): NotifModel {
    const notif = new NotifModel();
    notif.userId = UserFactory.create(1)[0].id;
    notif.title = 'Template notification title';
    notif.body = 'Template notification message';
    notif.read = false;
    notif.createdAt = new Date();
    notif.updatedAt = new Date();
    return notif;
  }
}