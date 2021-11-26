import resellConnection from "../../utils/db";
import User from "../../models/UserModel";
import UserRepo from "../../repos/UserRepo";
import { Connection } from "typeorm";

let user1: User;
let conn: Connection;

beforeAll(async () => {
  conn = await resellConnection().catch(e => {
    throw Error(JSON.stringify(
      {
        message: "Error connecting to database in UserRepo test. Exiting.",
        error: e
      }
    ));
    process.exit();
  });
});

beforeEach(async () => {
  user1 = await UserRepo.createUser('google-1', 'name-1', 'display-1', 'email-1');
});

test('Users Created Correctly', async () => {
  expect(user1.googleId).toBe('google-1');
  expect(user1.fullName).toBe('name-1');
  expect(user1.displayName).toBe('display-1');
  expect(user1.email).toBe('email-1');
});

test('Get User By Id', async () => {
  const gotUser = await UserRepo.getUserById(user1.id);
  expect(gotUser).toBeTruthy();
  expect(gotUser?.id).toBe(user1.id);
  expect(gotUser?.googleId).toBe(user1.googleId);
  expect(gotUser?.fullName).toBe(user1.fullName);
  expect(gotUser?.displayName).toBe(user1.displayName);
  expect(gotUser?.email).toBe(user1.email);
});

test('Get User By GoogleId', async () => {
  const gotUser = await UserRepo.getUserByGoogleId(user1.googleId);
  expect(gotUser).toBeTruthy();
  expect(gotUser?.id).toBe(user1.id);
  expect(gotUser?.googleId).toBe(user1.googleId);
  expect(gotUser?.fullName).toBe(user1.fullName);
  expect(gotUser?.displayName).toBe(user1.displayName);
  expect(gotUser?.email).toBe(user1.email);
});

test('Get User by Email', async () => {
  const gotUser = await UserRepo.getUserByEmail(user1.email);
  expect(gotUser).toBeTruthy();
  expect(gotUser?.id).toBe(user1.id);
  expect(gotUser?.googleId).toBe(user1.googleId);
  expect(gotUser?.fullName).toBe(user1.fullName);
  expect(gotUser?.displayName).toBe(user1.displayName);
  expect(gotUser?.email).toBe(user1.email);
});

test('Delete User', async () => {
  await UserRepo.deleteUser(user1);
  expect(await UserRepo.getUserById(user1.id)).toBeUndefined();
});

afterEach(async () => {
  try {
    await UserRepo.deleteUser(user1);
  } catch (e) { console.log('User 1 cannot be deleted'); }
});

afterAll(async () => {
  await conn.close();
});