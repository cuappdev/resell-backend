import { BlockingController } from "src/api/controllers/BlockingController";
import { Connection } from "typeorm";

import { UuidParam, UuidParams } from "../api/validators/GenericRequests";
import { BlockingModel } from "../models/BlockingModel";
import { ControllerFactory } from "./controllers";
import {
  DatabaseConnection,
  DataFactory,
  UserFactory,
  BlockingFactory,
} from "./data";
import { UserModel } from "../models/UserModel";
import exp from "constants";

let uuidParam: UuidParam;
let uuidParams: UuidParams;
let expectedBlocking: BlockingModel;
let expectedBlocker: UserModel;
let expectedBlocked: UserModel;
let conn: Connection;
let blockingController: BlockingController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  blockingController = ControllerFactory.blocking(conn);

  uuidParam = new UuidParam();
  uuidParam.id = "81e6896c-a549-41bf-8851-604e7fbd4f1f";

  // uuidParams = new UuidParams();
  // uuidParams.id1 = '1e900348-df68-42b3-a8c9-270205575314';
  // uuidParams.id2 = '1e900348-df68-42b3-a8c9-270205575314';

  expectedBlocker = UserFactory.fakeTemplate();
  expectedBlocker.id = "81e6896c-a549-41bf-8851-604e7fbd4f1f";
  expectedBlocker.givenName = "Shungo";
  expectedBlocker.familyName = "Najima";
  expectedBlocker.username = "snajima";
  expectedBlocker.netid = "sn999";
  expectedBlocker.admin = false;
  expectedBlocker.stars = 0;
  expectedBlocker.numReviews = 0;
  expectedBlocker.photoUrl =
    "https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs";
  expectedBlocker.email = expectedBlocker.netid + "@cornell.edu";
  expectedBlocker.googleId = "shungoGoogleID";
  expectedBlocker.bio = "";
  expectedBlocker.venmoHandle = "@Shungo-Najima";

  expectedBlocked = UserFactory.fakeTemplate2();
  expectedBlocked.id = "c6f0a14a-48ae-4b1c-bd6f-5f3b7e8c2b99";
  expectedBlocked.givenName = "Tony";
  expectedBlocked.familyName = "Matchev";
  expectedBlocked.username = "tmatchev";
  expectedBlocked.netid = "tkm21";
  expectedBlocked.admin = false;
  expectedBlocked.photoUrl =
    "https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs";
  expectedBlocked.email = expectedBlocked.netid + "@cornell.edu";
  expectedBlocked.googleId = "tonyGoogleID";
  expectedBlocked.venmoHandle = "@Tony-Matchev";

  expectedBlocking = new BlockingModel();
  expectedBlocking.blocker = expectedBlocker;
  expectedBlocking.blocked = expectedBlocked;

  return expectedBlocking;
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe("blocking tests", () => {
  test("get all blockings - no blockings", async () => {
    const user = UserFactory.fake();
    user.admin = true;
    const blocking = BlockingFactory.fake();
    const getBlockingsResponse = await blockingController.getAllBlockings(user);
    expect(getBlockingsResponse.blockings).toHaveLength(0);
  });

  test("get all blockings - user not admin", async () => {
    const user = UserFactory.fake();
    user.admin = false;
    try {
      await blockingController.getAllBlockings(user);
    } catch (e) {
      expect(e.httpCode).toBe(401);
    }
  });

  test("get all blockings - one blocking", async () => {
    const blocking = BlockingFactory.fake();
    const dataFactory = await new DataFactory();
    blocking.blocked.admin = true;
    dataFactory.createUsers(blocking.blocked, blocking.blocker).write();
    dataFactory.createBlockings(blocking).write();
    const getUserBlockingsResponse = await blockingController.getAllBlockings(
      blocking.blocked
    );

    expect(getUserBlockingsResponse.blockings).toHaveLength(1);
  });
});
