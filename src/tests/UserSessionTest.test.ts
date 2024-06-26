import { AuthController } from 'src/api/controllers/AuthController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserFactory, UserSessionFactory } from './data';
import { FactoryUtils, TimeUnits } from './data/FactoryUtils';

let uuidParam: UuidParam;
let expectedUser: UserModel;
let conn: Connection;
let authController: AuthController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  authController = ControllerFactory.auth(conn);

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedUser = new UserModel();
  expectedUser.givenName = 'Shungo';
  expectedUser.familyName = 'Najima';
  expectedUser.username = 'snajima';
  expectedUser.netid = 'sn999';
  expectedUser.admin = false;
  expectedUser.isActive = true;
  expectedUser.numReviews = 0;
  expectedUser.stars = 0;
  expectedUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
  expectedUser.email = expectedUser.netid + '@cornell.edu';
  expectedUser.googleId = 'shungoGoogleID';
  expectedUser.bio = "";
  expectedUser.venmoHandle = "@Shungo-Najima";
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('user session tests', () => {
  test('create new user', async () => {
    const createUserRequest = {
      username: "mateow",
      netid: "maw999",
      givenName: "Mateo",
      familyName: "Weiner",
      photoUrl: "https://melmagazine.com/wp-content/uploads/2021/01/66f-1.jpg",
      venmoHandle: "@Mateo-Weiner",
      email: "maw999@cornell.edu",
      googleId: "mateoGoogleId",
      bio: "Personally, I would not stand for this.",
    }

    const createUserRequestResponse = await authController.createUser(createUserRequest);

    expect(createUserRequestResponse.user?.givenName).toEqual("Mateo");
  });

  test('delete user', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUsersResponse = await authController.deleteUserById(uuidParam);
    if (getUsersResponse.user != undefined) {
      getUsersResponse.user.stars = Number(getUsersResponse.user.stars);
    }
    expect(getUsersResponse.user).toEqual(expectedUser);
  });

  test('get sessions by user id', async () => {
    const user = UserFactory.fake();
    const [session1, session2] = UserSessionFactory.create(2);
    session1.user = user;
    session1.userId = user.id;
    session2.user = user;
    session2.userId = user.id;

    await new DataFactory()
      .createUsers(user)
      .createUserSessions(session1, session2)
      .write();

    uuidParam.id = user.id;

    const getSessionsResponse = await authController.getSessionsByUserId(uuidParam);

    expect(getSessionsResponse.sessions).toHaveLength(2);
  });

  test('refresh unexpired session', async () => {
    const user = UserFactory.fake();
    const session = UserSessionFactory.fake();
    session.user = user;
    session.userId = user.id;

    await new DataFactory()
      .createUsers(user)
      .createUserSessions(session)
      .write();

    const refreshToken = session.refreshToken;
    const accessToken = session.accessToken;

    const getSessionResponse = await authController.refreshToken(refreshToken);

    expect(getSessionResponse.session.accessToken).not.toEqual(accessToken);
    expect(getSessionResponse.session.refreshToken).not.toEqual(refreshToken);
    expect(getSessionResponse.session.expiresAt).toBeCloseTo(Math.floor(new Date().getTime()) +
      FactoryUtils.getTimeInMilliseconds(1, TimeUnits.Months), -3);
  });

  test('refresh expired session', async () => {
    const user = UserFactory.fake();
    const session = UserSessionFactory.fake();
    session.expiresAt = new Date();
    session.user = user;
    session.userId = user.id;

    await new DataFactory()
      .createUsers(user)
      .createUserSessions(session)
      .write();

    const refreshToken = session.refreshToken;
    const accessToken = session.accessToken;

    const getSessionResponse = await authController.refreshToken(refreshToken);

    expect(getSessionResponse.session.accessToken).not.toEqual(accessToken);
    expect(getSessionResponse.session.refreshToken).not.toEqual(refreshToken);
    expect(getSessionResponse.session.expiresAt).toBeCloseTo(Math.floor(new Date().getTime()) +
      FactoryUtils.getTimeInMilliseconds(1, TimeUnits.Months), -3);
  });
});