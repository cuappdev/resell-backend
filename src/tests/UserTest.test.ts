import { UserController } from 'src/api/controllers/UserController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserFactory } from './data';
import e from 'express';
import exp from 'constants';

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
  expectedUser.stars = 0;
  expectedUser.numReviews = 0;
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
    if (getUserResponse.user != undefined) {
      getUserResponse.user.stars = Number(getUserResponse.user.stars);
    }
    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by email', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByEmail({ email: 'sn999@cornell.edu' });
    if (getUserResponse.user != undefined) {
      getUserResponse.user.stars = Number(getUserResponse.user.stars);
    }
    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by google id', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByGoogleId('shungoGoogleID');
    if (getUserResponse.user != undefined) {
      getUserResponse.user.stars = Number(getUserResponse.user.stars);
    }
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
    if (getUserResponse.user != undefined) {
      getUserResponse.user.stars = Number(getUserResponse.user.stars);
    }
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

  test('block users', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    const blockUserResponse = await userController.blockUser({blocked: user2.id}, user1);
    if (blockUserResponse.user != undefined) {
      if (blockUserResponse.user.blocking != undefined) {
        blockUserResponse.user.blocking.forEach((user: UserModel) => {
          expect(user.id).toBe(user2.id);
        });
      }
    }
    expect(blockUserResponse.user?.blocking).toHaveLength(1);
    expect(blockUserResponse.user?.blockers).toBeUndefined();
    expect(user1.blocking).toHaveLength(1);
  });

  test('block users - user cannot block themselves', async () => {
    const user = UserFactory.fake();

    await new DataFactory()
      .createUsers(user)
      .write();

    try {
      await userController.blockUser({blocked: user.id}, user);
    } catch (error) {
      expect(error.message).toBe('User cannot block themselves!');
    }
  });

  test('block users - user is already blocked', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    await userController.blockUser({blocked: user2.id}, user1);
    try {
      await userController.blockUser({blocked: user2.id}, user1);
    } catch (error) {
      expect(error.message).toBe('User is already blocked!');
    }
  });

  test('unblock users', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    const blockUserResponse = await userController.blockUser({blocked: user2.id}, user1);
    if (blockUserResponse.user != undefined) {
      if (blockUserResponse.user.blocking != undefined) {
        blockUserResponse.user.blocking.forEach((user: UserModel) => {
          expect(user.id).toBe(user2.id);
        });
      }
    }
    expect(blockUserResponse.user?.blocking).toHaveLength(1);
    expect(blockUserResponse.user?.blockers).toBeUndefined();
    expect(user1.blocking).toHaveLength(1);

    const unblockUserResponse = await userController.unblockUser({unblocked: user2.id}, user1);
    expect(unblockUserResponse.user?.blocking).toBeUndefined();
    expect(unblockUserResponse.user?.blockers).toBeUndefined();
  });

  test('unblock users - user is not blocked', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    try {
      await userController.unblockUser({unblocked: user2.id}, user1);
    } catch (error) {
      expect(error.message).toBe('User is not blocked!');
    }
  });

  test('delete users - user deletes themselves', async () => {
    const admin = UserFactory.fake();
    const user = UserFactory.fakeTemplate();
    admin.admin = true;

    await new DataFactory()
      .createUsers(user)
      .write();

    const preDeleteUserResponse = await userController.getUsers(admin);
    expect(preDeleteUserResponse.users).toHaveLength(1);

    const getUserResponse = await userController.getUserById(uuidParam);
    if (getUserResponse.user != undefined) {
      getUserResponse.user.stars = Number(getUserResponse.user.stars);
    }
    expect(getUserResponse.user).toEqual(expectedUser);

    const deleteUserResponse = await userController.deleteUser(uuidParam, user);
    if (deleteUserResponse.user != undefined) {
      deleteUserResponse.user.stars = Number(deleteUserResponse.user.stars);
    }
    const getUsersResponse = await userController.getUsers(admin);
    expect(getUsersResponse.users).toHaveLength(0);
  });

  test('delete users - user deletes another user', async () => {
    const admin = UserFactory.fake();
    const user = UserFactory.fakeTemplate();
    admin.admin = true;

    await new DataFactory()
      .createUsers(admin, user)
      .write();

    const preDeleteUserResponse = await userController.getUsers(admin);
    expect(preDeleteUserResponse.users).toHaveLength(2);

    const deleteUserResponse = await userController.deleteUser(uuidParam, admin);
    if (deleteUserResponse.user != undefined) {
      deleteUserResponse.user.stars = Number(deleteUserResponse.user.stars);
    }
    const getUsersResponse = await userController.getUsers(admin);
    expect(getUsersResponse.users).toHaveLength(1);
  });

  test('delete users - user that is not an admin tries to delete another user', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    try {
      await userController.deleteUser({id: user2.id}, user1);
    } catch (error) {
      expect(error.message).toBe('User does not have permission to delete other users');
    }
  });

  test('get blocked users by id - no blocked users', async () => {
    const user = UserFactory.fake();

    await new DataFactory()
      .createUsers(user)
      .write();

    const userUuid = {id: user.id};

    const getBlockedUsersResponse = await userController.getBlockedUsersById(userUuid);
    expect(getBlockedUsersResponse.users).toHaveLength(0);
  });

  test('get blocked users by id', async () => {
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    await userController.blockUser({blocked: user2.id}, user1);
    const user1Uuid = {id: user1.id};
    const getBlockedUsersResponse = await userController.getBlockedUsersById(user1Uuid);
    expect(getBlockedUsersResponse.users).toHaveLength(1);
  });
});