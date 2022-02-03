// import resellConnection from "../../utils/db";
// import User from "../../models/UserModel";
// import UserRepo from "../../repos/UserRepository";
// import { Connection } from "typeorm";

// let conn: Connection;
// let user1: User;
// let userNoBio: User;

// beforeAll(async () => {
//   conn = await resellConnection().catch(e => {
//     throw Error(JSON.stringify(
//       {
//         message: "Error connecting to database in UserRepo test. Exiting.",
//         error: e
//       }
//     ));
//     process.exit();
//   });
// });

// beforeEach(async () => {
//   user1 = await UserRepo.createUser('email-1', 'google-1', 'name-1', 'pfp-1', 'bio-1');
//   userNoBio = await UserRepo.createUser('email-nobio', 'google-nobio', 'name-nobio', 'pfp-nobio');
// });

// test('Users Created Correctly', async () => {
//   expect(user1.googleId).toBe('google-1');
//   expect(user1.name).toBe('name-1');
//   expect(user1.email).toBe('email-1');
//   expect(user1.bio).toBe('bio-1');
//   expect(userNoBio.bio).toBeTruthy();
// });

// test('Get User By Id', async () => {
//   const gotUser = await UserRepo.getUserById(user1.id);
//   expect(gotUser).toBeTruthy();
//   expect(gotUser?.id).toBe(user1.id);
//   expect(gotUser?.googleId).toBe(user1.googleId);
//   expect(gotUser?.name).toBe(user1.name);
//   expect(gotUser?.bio).toBe(user1.bio);
//   expect(gotUser?.email).toBe(user1.email);
// });

// test('Get User By GoogleId', async () => {
//   const gotUser = await UserRepo.getUserByGoogleId(user1.googleId);
//   expect(gotUser).toBeTruthy();
//   expect(gotUser?.id).toBe(user1.id);
//   expect(gotUser?.googleId).toBe(user1.googleId);
//   expect(gotUser?.name).toBe(user1.name);
//   expect(gotUser?.bio).toBe(user1.bio);
//   expect(gotUser?.email).toBe(user1.email);
// });

// test('Get User by Email', async () => {
//   const gotUser = await UserRepo.getUserByEmail(user1.email);
//   expect(gotUser).toBeTruthy();
//   expect(gotUser?.id).toBe(user1.id);
//   expect(gotUser?.googleId).toBe(user1.googleId);
//   expect(gotUser?.name).toBe(user1.name);
//   expect(gotUser?.bio).toBe(user1.bio);
//   expect(gotUser?.email).toBe(user1.email);
// });

// test('Delete User', async () => {
//   await UserRepo.deleteUserById(user1.id);
//   expect(await UserRepo.getUserById(user1.id)).toBeUndefined();
// });

// afterEach(async () => {
//   try {
//     await UserRepo.deleteUserById(user1.id);
//     await UserRepo.deleteUserById(userNoBio.id);
//   } catch (e) { console.log(`Users cannot be deleted: ${e}`); }
// });

// afterAll(async () => {
//   await conn.close();
// });