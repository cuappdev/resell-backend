import { UserBlockingController } from 'src/api/controllers/UserBlockingController';
import { Connection } from 'typeorm';

import { UuidParam, UuidParams } from '../api/validators/GenericRequests';
import { UserBlocking } from '../models/UserBlockingModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserBlockingFactory, UserFactory } from './data';
import { UserModel } from '../models/UserModel';

let uuidParam: UuidParam;
let expectedBlocking: UserBlocking;
let expectedBlockingUser: UserModel;
let expectedBlockedUser: UserModel;
let conn: Connection;
let userBlockingController: UserBlockingController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  userBlockingController = ControllerFactory.userBlocking(conn);

  // uuidParam = new UuidParam();
  // uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedBlockingUser = UserFactory.fakeTemplate();
  // expectedBlockingUser.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  // expectedBlockedUser.givenName = 'Shungo';
  // expectedBlockedUser.familyName = 'Najima';
  // expectedBlockedUser.username = 'snajima';
  // expectedBlockedUser.netid = 'sn999';
  // expectedBlockedUser.admin = false;
  // expectedBlockedUser.stars = 0;
  // expectedBlockedUser.numReviews = 0;
  // expectedBlockedUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
  // expectedBlockedUser.email = expectedBlockedUser.netid + '@cornell.edu';
  // expectedBlockedUser.googleId = 'shungoGoogleID';
  // expectedBlockedUser.bio = "";
  // expectedBlockedUser.venmoHandle = "@Shungo-Najima";

  expectedBlockedUser = UserFactory.fakeTemplate2();
  // expectedBlockedUser.id = 'c6f0a14a-48ae-4b1c-bd6f-5f3b7e8c2b99';
  // expectedBlockedUser.givenName = 'Tony';
  // expectedBlockedUser.familyName = 'Matchev';
  // expectedBlockedUser.username = 'tmatchev';
  // expectedBlockedUser.netid = 'tkm21';
  // expectedBlockedUser.admin = false;
  // expectedBlockedUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
  // expectedBlockedUser.email = expectedBlockedUser.netid + '@cornell.edu';
  // expectedBlockedUser.googleId = 'tonyGoogleID';
  // expectedBlockedUser.venmoHandle = "@Tony-Matchev";

  expectedBlocking = new UserBlocking();
  expectedBlocking.blockedUser = expectedBlockedUser;
  expectedBlocking.blockingUser = expectedBlockingUser;

  return expectedBlocking;
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('blocking tests', () => {
  test('get all blockings - no blockings', async () => {
    const user = UserFactory.fake();
    user.admin = true;
    const userBlocking = UserBlockingFactory.fake();
    const getBlockingsResponse = await userBlockingController.getUserBlockings(user);

    expect(getBlockingsResponse.blockings).toHaveLength(0);
  });

  test('get all blockings - one blocking', async () => {
    const user = UserFactory.fake();
    user.admin = true
    const userBlocking = UserBlockingFactory.fake();

    await new DataFactory()
      .createUserBlockings(userBlocking)
      .write();

    const getUserBlockingsResponse = await userBlockingController.getUserBlockings(user);

    expect(getUserBlockingsResponse.blockings).toHaveLength(1);
  });

  test('get all blockings - multiple blockings', async () => {
    const user = UserFactory.fake();
    user.admin = true;
    const [userBlocking1, userBlocking2] = UserBlockingFactory.create(2);

    await new DataFactory()
      .createUserBlockings(userBlocking1, userBlocking2)
      .write()

    const getUserBlockingsResponse = await userBlockingController.getUserBlockings(user);
    expect(getUserBlockingsResponse.blockings).toHaveLength(2);
  })
})

