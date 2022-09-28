import { UuidParam } from '../api/validators/GenericRequests';
import { UserModel } from '../models/UserModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedUser: UserModel;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedUser = new UserModel();
  expectedUser.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedUser.givenName = 'Shungo';
  expectedUser.familyName = 'Najima';
  expectedUser.username = 'snajima';
  expectedUser.netid = 'sn685';
  expectedUser.photoUrl = 'https://media-exp1.licdn.com/dms/image/C5603AQGmvQtdub6nAQ/profile-displayphoto-shrink_400_400/0/1635358826496?e=1668643200&v=beta&t=ncqjrFUqgqipctcmaSwPzSPrkj0RIQHiCINup_55NNs';
  expectedUser.email = expectedUser.netid + '@cornell.edu';
  expectedUser.googleId = 'shungoGoogleID';
  expectedUser.bio = "";
  expectedUser.saved = [];
  expectedUser.venmoHandle = "@Shungo-Najima";
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('user tests', () => {
  test('get all users - no users', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);

    const getUsersResponse = await userController.getUsers();

    expect(getUsersResponse.users).toHaveLength(0);
  });

  test('get all users - one user', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
    const user = UserFactory.fake();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUsersResponse = await userController.getUsers();

    expect(getUsersResponse.users).toHaveLength(1);
  });

  test('get all users - multiple users', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
    const [user1, user2] = UserFactory.create(2);

    await new DataFactory()
      .createUsers(user1, user2)
      .write();

    const getUsersResponse = await userController.getUsers();

    expect(getUsersResponse.users).toHaveLength(2);
  });

  test('get user by id', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserById(uuidParam);

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by email', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByEmail({email: 'sn685@cornell.edu'});

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('get user by google id', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const getUserResponse = await userController.getUserByGoogleId('shungoGoogleID');

    expect(getUserResponse.user).toEqual(expectedUser);
  });

  test('edit profile', async () => {
    const conn = await DatabaseConnection.connect();
    const userController = ControllerFactory.user(conn);
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
});