// import resellConnection from "../utils/db";
// import UserModel from "../models/UserModel";
// import 
// { UserService } from "../services/UserService";
// import { Connection } from "typeorm";
// import { GetUserResponse, PostUserRequest, Uuid } from '../types'
// import { ControllerFactory } from './controllers'
// import { UserController } from '../api/controllers/UserController'

// let conn: Connection;
// let user1: PostUserRequest;
// let userController: UserController;
// let postUserResponse: GetUserResponse;

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

//   userController = ControllerFactory.user(conn);
// });

// beforeEach(async () => {
//   user1 = {
//     name: 'name-1',
//     profilePictureUrl: 'pfp-1',
//     bio: 'bio-1',
//     email: 'email-1',
//     googleId: 'google-1'
//   };

//   postUserResponse = await userController.postUser(user1);
// });

// test('User Created Correctly', async () => {
//   expect(postUserResponse.user).toBeTruthy();
//   expect(postUserResponse.user?.googleId).toBe('google-1');
//   expect(postUserResponse.user?.name).toBe('name-1');
//   expect(postUserResponse.user?.email).toBe('email-1');
//   expect(postUserResponse.user?.bio).toBe('bio-1');
// });

// test('Get User By Id', async () => {
//   let id: Uuid;
//   const getUserResponse = await userController.getUserById({id: id});
//   expect(getUserResponse).toBeTruthy();
//   expect(getUserResponse.user?.id).toBe(postUserResponse.user?.id);
//   expect(getUserResponse.user?.googleId).toBe(postUserResponse.user?.googleId);
//   expect(getUserResponse.user?.name).toBe(postUserResponse.user?.name);
//   expect(getUserResponse.user?.bio).toBe(postUserResponse.user?.bio);
//   expect(getUserResponse.user?.email).toBe(postUserResponse.user?.email);
// });

// test('Get User By GoogleId', async () => {
//   const gotUser = await userService.getUserByGoogleId(user1Response.googleId);
//   expect(gotUser).toBeTruthy();
//   expect(gotUser?.id).toBe(user1Response.id);
//   expect(gotUser?.googleId).toBe(user1Response.googleId);
//   expect(gotUser?.name).toBe(user1Response.name);
//   expect(gotUser?.bio).toBe(user1Response.bio);
//   expect(gotUser?.email).toBe(user1Response.email);
// });

// test('Get User by Email', async () => {
//   const gotUser = await userService.getUserByEmail(user1Response.email);
//   expect(gotUser).toBeTruthy();
//   expect(gotUser?.id).toBe(user1Response.id);
//   expect(gotUser?.googleId).toBe(user1Response.googleId);
//   expect(gotUser?.name).toBe(user1Response.name);
//   expect(gotUser?.bio).toBe(user1Response.bio);
//   expect(gotUser?.email).toBe(user1Response.email);
// });

// test('Delete User', async () => {
//   await userService.deleteUserById(user1Response.id);
//   expect(await userService.getUserById(user1Response.id)).toBeUndefined();
// });

// afterEach(async () => {
//   try {
//     await userService.deleteUserById(user1Response.id);
//   } catch (e) { console.log(`Users cannot be deleted: ${e}`); }
// });

// afterAll(async () => {
//   await conn.close();
// });