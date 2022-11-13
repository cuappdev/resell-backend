import { UserController } from 'src/api/controllers/UserController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedUser: UserModel;
let conn: Connection;
let userController: UserController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  userController = ControllerFactory.user(conn);

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedUser = new UserModel();
  expectedUser.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedUser.givenName = 'Shungo';
  expectedUser.familyName = 'Najima';
  expectedUser.username = 'snajima';
  expectedUser.netid = 'sn999';
  expectedUser.admin = false;
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

describe('user tests', () => {
  test('get all users - no users', async () => {
    const user = UserFactory.fake();
    user.admin = true;
    const getUsersResponse = await userController.getUsers(user);

    expect(getUsersResponse.users).toHaveLength(0);
  });

  test('get all users - one user', async () => {
    const user = UserFactory.fake();
    user.admin = true

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUsersResponse = await userController.getUsers(user);

    expect(getUsersResponse.users).toHaveLength(1);
  });

  test('get all users - multiple users', async () => {
    const [user1, user2] = UserFactory.create(2);
    user1.admin = true

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    const getUsersResponse = await userController.getUsers(user1);

    expect(getUsersResponse.users).toHaveLength(2);
  });

  test('get user by id', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserById(uuidParam);

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by email', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByEmail({ email: 'sn999@cornell.edu' });

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by google id', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByGoogleId('shungoGoogleID');

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('edit profile', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    await userController.editProfile({
      photoUrlBase64: undefined,
      username: undefined,
      venmoHandle: '@Shungo-Najima1',
      bio: 'Mateo Slay'
    }, user);

    expectedUser.bio = "Mateo Slay";
    expectedUser.venmoHandle = "@Shungo-Najima1";

    const getUserResponse = await userController.getUserByGoogleId('shungoGoogleID');

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('set super admin status', async () => {
    const authController = ControllerFactory.auth(conn);

    const createUserRequest = {
      username: "admin",
      netid: "adm999",
      givenName: "administrator",
      familyName: "Weiner",
      photoUrl: "https://melmagazine.com/wp-content/uploads/2021/01/66f-1.jpg",
      venmoHandle: "@admin-Weiner",
      email: "appdevresell@gmail.com",
      googleId: "mateoGoogleId",
      bio: "Personally, I would not stand for this.",
    }

    const createUserRequestResponse = await authController.createUser(createUserRequest);

    expect(createUserRequestResponse.user?.admin).toEqual(true);
  });

  test('set admin status from super user', async () => {
    const admin = UserFactory.fakeTemplate();
    admin.email = 'appdevresell@gmail.com';
    let user = UserFactory.fake();

    await new DataFactory()
      .createUsers(admin, user)
      .write();

    expectedUser.admin = true;

    const getUserResponse = await userController.setAdmin({ email: user.email, status: true }, admin);

    expect(getUserResponse.user?.admin).toBe(true);
  });
});