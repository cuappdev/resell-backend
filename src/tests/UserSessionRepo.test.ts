// import resellConnection from "../../utils/db";
// import UserSession from '../../models/UserSessionModel';
// import UserSessionRepo from "../../repos/UserSessionRepository";
// import { Connection } from "typeorm";
// import User from "../../models/UserModel";
// import UserRepo from "../../repos/UserRepository";
// import { LoginTicket, TokenPayload } from "google-auth-library";

// let session1: UserSession;
// let session2: UserSession;
// let user1: User;
// let user2: User;
// let conn: Connection;

// beforeAll(async () => {
//   conn = await resellConnection().catch(e => {
//     throw Error(JSON.stringify(
//       {
//         message: "Error connecting to database in UserSessionRepo test. Exiting.",
//         error: e
//       }
//     ));
//   });
// });

// beforeEach(async () => {
//   user1 = await UserRepo.createDummyUser('sess-1');
//   user2 = await UserRepo.createDummyUser('sess-2');
//   session1 = await UserSessionRepo.createSession(user1);
//   session2 = await UserSessionRepo.createSession(user1);
// });

// test('Session Created Correctly', async () => {
//   expect(session1.accessToken).toBeTruthy();
//   expect(session1.refreshToken).toBeTruthy();

//   const date = session1.expiresAt;
//   //check date is properly made
//   expect(date.toString).not.toEqual(new Date("invalid date").toString());
//   //check date is at least 22 hours away, to over-account for testing time
//   expect(date.getTime()).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 22);
// });


// test('Get Session By Id', async () => {
//   const gotSession = await UserSessionRepo.getSessionById(session1.id);
//   expect(gotSession).not.toBeUndefined();
//   expect(session1.accessToken).toEqual(gotSession?.accessToken);
//   expect(session1.refreshToken).toEqual(gotSession?.refreshToken);
//   expect(session1.expiresAt.getTime()).toEqual(gotSession?.expiresAt.getTime());
// });

// test('Get Session By Token', async () => {
//   let gotSession = await UserSessionRepo.getSessionByToken(session1.accessToken);
//   expect(gotSession).not.toBeUndefined();
//   expect(session1.accessToken).toEqual(gotSession?.accessToken);
//   expect(session1.refreshToken).toEqual(gotSession?.refreshToken);
//   expect(session1.expiresAt.getTime()).toEqual(gotSession?.expiresAt.getTime());

//   gotSession = await UserSessionRepo.getSessionByToken(session1.refreshToken);
//   expect(gotSession).not.toBeNull();
//   expect(session1.accessToken).toEqual(gotSession?.accessToken);
//   expect(session1.refreshToken).toEqual(gotSession?.refreshToken);
//   expect(session1.expiresAt.getTime()).toEqual(gotSession?.expiresAt.getTime());
// });

// test('Create Session and User / Get User From Token', async () => {
//   const tag = "sess-together";
//   const email = `email-${tag}`;
//   const googleId = `googleId-${tag}`;
//   const name = `name-${tag}`;
//   const pfp = `pfp-${tag}`;
//   const bio = `bio-${tag}`;
//   const sess = await UserSessionRepo.createUserAndSession(email, googleId, name, pfp, bio);
//   expect(sess.accessToken).not.toBeUndefined();
//   expect(sess.refreshToken).not.toBeUndefined();
//   expect(sess.expiresAt.getTime()).toBeGreaterThan(Date.now() + 1000 * 60 * 60 * 22);
//   const user = await UserSessionRepo.getUserFromToken(sess.accessToken);
//   expect(user).not.toBeUndefined();
//   expect(user?.email).toBe(email);
//   expect(user?.googleId).toBe(googleId);
//   expect(user?.name).toBe(name);
//   expect(user?.profilePictureUrl).toBe(pfp);
//   expect(user?.bio).toBe(bio);
//   if (user) {
//     const sessions = await UserSessionRepo.getSessionsByUserId(user.id);
//     expect(sessions.length).toBe(1);
//     await UserRepo.deleteUserById(user.id);
//   }
//   //since we have deleted the user, this call shouldn't work
//   expect(await UserSessionRepo.deleteSessionById(sess.id)).toBe(false);
// });

// test('Delete Session', async () => {
//   await UserSessionRepo.deleteSessionById(session1.id);
//   expect(await UserSessionRepo.getSessionByToken(session1.accessToken)).toBeUndefined();

//   //make sure user has not been deleted
//   const user = UserRepo.getUserById(user1.id);
//   expect(user).not.toBeUndefined();
// });

// test('Update Session', async () => {
//   const updatedSession = await UserSessionRepo.updateSession(session1.refreshToken);
//   expect(updatedSession?.accessToken).not.toBeUndefined();
//   expect(updatedSession?.refreshToken).not.toBeUndefined();
//   expect(updatedSession?.expiresAt).not.toBeUndefined();
//   expect(updatedSession?.expiresAt.toString).not.toEqual(new Date("invalid date").toString());
//   expect(updatedSession?.accessToken).not.toEqual(session1.accessToken);
//   expect(updatedSession?.refreshToken).not.toEqual(session1.refreshToken);
//   expect(updatedSession?.expiresAt.getTime()).toBeGreaterThan(session1.expiresAt.getTime());
// });

// test('Delete Session By User Id', async () => {
//   //user2 has no sessions, so this should essentially be a no-op
//   await UserSessionRepo.deleteSessionByUserId(user2.id);
//   let stillSess = await UserSessionRepo.getSessionById(session1.id);
//   expect(stillSess).not.toBeUndefined();
//   stillSess = await UserSessionRepo.getSessionById(session2.id);
//   expect(stillSess).not.toBeUndefined();

//   //user1 has both sessions, so this should delete everything
//   await UserSessionRepo.deleteSessionByUserId(user1.id);
//   let notSess = await UserSessionRepo.getSessionById(session1.id);
//   expect(notSess).toBeUndefined();
//   notSess = await UserSessionRepo.getSessionById(session2.id);
//   expect(notSess).toBeUndefined();
// });

// test(`Deleting User Deletes Sessions`, async () => {
//   //user2 has no sessions so this should essentially be a no-op
//   await UserRepo.deleteUserById(user2.id);
//   let stillSess = await UserSessionRepo.getSessionById(session1.id);
//   expect(stillSess).not.toBeUndefined();
//   stillSess = await UserSessionRepo.getSessionById(session2.id);
//   expect(stillSess).not.toBeUndefined();

//   //user1 has both sessions, so this should delete everything
//   await UserRepo.deleteUserById(user1.id);
//   stillSess = await UserSessionRepo.getSessionById(session1.id);
//   expect(stillSess).toBeUndefined();
//   stillSess = await UserSessionRepo.getSessionById(session2.id);
//   expect(stillSess).toBeUndefined();
// });

// test('Verify Session', async () => {
//   let verified = await UserSessionRepo.verifySession(session1.accessToken);
//   expect(verified).toBe(true);
//   await UserSessionRepo.expireSession(session1);
//   verified = await UserSessionRepo.verifySession(session1.accessToken);
//   expect(verified).toBe(false);
// });

// afterEach(async () => {
//   try {
//     await UserSessionRepo.deleteSessionById(session1.id);
//     await UserSessionRepo.deleteSessionById(session2.id);
//   } catch (e) { console.log(`Sessions cannot be deleted: ${e}`); }
//   try {
//     await UserRepo.deleteUserById(user1.id);
//     await UserRepo.deleteUserById(user2.id);
//   } catch (e) { console.log(`Users cannot be deleted: ${e}`); }
// });

// afterAll(async () => {
//   conn.close();
// });