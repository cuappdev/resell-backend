import { Connection } from "typeorm";
import { NotifController } from "../api/controllers/NotifController";
import { NotifModel } from "../models/NotifModel";
import { ControllerFactory } from "./controllers";
import {
  DatabaseConnection,
  DataFactory,
  UserFactory,
  NotifFactory,
} from "./data";

let conn: Connection;
let notifController: NotifController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  notifController = ControllerFactory.notif(conn);
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe("notification tests", () => {
  test("get recent notifications - no notifications", async () => {
    const [user] = UserFactory.create(1);
    await new DataFactory().createUsers(user).write();

    const response = await notifController.getRecentNotifications(user);
    expect(response).toHaveLength(0);
  });

  test("get recent notifications - single notification", async () => {
    const [user] = UserFactory.create(1);
    const [notif] = NotifFactory.create();
    notif.userId = user.firebaseUid;

    await new DataFactory()
      .createUsers(user)
      .createNotifications(notif)
      .write();

    const response = await notifController.getRecentNotifications(user);
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe(notif.id);
    expect(response[0].title).toBe(notif.title);
    expect(response[0].body).toBe(notif.body);
    expect(response[0].userId).toBe(user.firebaseUid);
  });

  test("get recent notifications - multiple notifications ordered by date", async () => {
    const [user] = UserFactory.create(1);

    const date1 = new Date("2025-02-18T12:00:00");
    const date2 = new Date("2025-02-18T13:00:00");
    const date3 = new Date("2025-02-18T14:00:00");

    const [notif1, notif2, notif3] = NotifFactory.create(3);

    notif1.userId = user.firebaseUid;
    notif1.createdAt = date1;

    notif2.userId = user.firebaseUid;
    notif2.createdAt = date2;

    notif3.userId = user.firebaseUid;
    notif3.createdAt = date3;

    await new DataFactory()
      .createUsers(user)
      .createNotifications(notif1, notif2, notif3)
      .write();

    const response = await notifController.getRecentNotifications(user);
    expect(response).toHaveLength(3);
    expect(response[0].id).toBe(notif3.id); // Most recent first
    expect(response[1].id).toBe(notif2.id);
    expect(response[2].id).toBe(notif1.id);
  });

  test("get recent notifications - limit to 10", async () => {
    const [user] = UserFactory.create(1);
    const notifs = NotifFactory.create(15);
    notifs.forEach((notif) => (notif.userId = user.firebaseUid));

    await new DataFactory()
      .createUsers(user)
      .createNotifications(...notifs)
      .write();

    const response = await notifController.getRecentNotifications(user);
    expect(response).toHaveLength(10); // Should be limited to 10
  });

  test("get recent notifications - only returns user's notifications", async () => {
    const [user1, user2] = UserFactory.create(2);

    const [notif1, notif2] = NotifFactory.create(2);
    notif1.userId = user1.firebaseUid;
    notif2.userId = user2.firebaseUid;

    await new DataFactory()
      .createUsers(user1, user2)
      .createNotifications(notif1, notif2)
      .write();

    const response = await notifController.getRecentNotifications(user1);
    expect(response).toHaveLength(1);
    expect(response[0].id).toBe(notif1.id);
  });
});
