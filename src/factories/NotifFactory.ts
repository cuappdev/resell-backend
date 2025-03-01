// NotifFactory.ts
import { define } from 'typeorm-seeding';
import { NotifModel } from '../models/NotifModel';
import { UserModel } from '../models/UserModel';

// Define a factory for NotifModel
define(NotifModel, (_, context?: { user?: UserModel; index?: number }) => {
  const notif = new NotifModel();
  const index = context?.index ?? 1; // Default to 1 if context or index is undefined

  notif.title = `Notification ${index}`;
  notif.body = `This is notification ${index} for testing purposes`;
  notif.read = false;
  
  if (context?.user) {
    notif.userId = context.user.firebaseUid;
    notif.user = context.user;
  }

  return notif;
});