// import resellConnection from "../../utils/db";
// import Post from "../../models/PostModel";
// import User from "../../models/UserModel";

// import PostRepo from "../../repos/PostRepository";
// import { UserRepository } from "../../repos/UserRepository";
// import { Connection } from "typeorm";

// let post1: Post;
// let user1: User;
// let conn: Connection;

// beforeAll(async () => {
//   conn = await resellConnection().catch(e => {
//     throw Error(JSON.stringify(
//       {
//         message: "Error connecting to database in PostRepo test. Exiting.",
//         error: e
//       }
//     ));
//   });
//   user1 = await UserRepository.createDummyUser("post-test");
// });



// beforeEach(async () => {
//   post1 = await PostRepo.createPost('title-1', 'description-1', [], 'location-1', user1);
// });


// test('Posts Created Correctly', async () => {
//   expect(post1.title).toBe('title-1');
//   expect(post1.description).toBe('description-1');
//   expect(post1.images).toEqual([]);
//   expect(post1.location).toBe('location-1');
// });

// test('Get Post By Id', async () => {
//   const gotPost = await PostRepo.getPostById(post1.id);
//   expect(gotPost).toBeTruthy();
//   expect(gotPost?.id).toBe(post1.id);
//   expect(gotPost?.title).toBe(post1.title);
//   expect(gotPost?.description).toBe(post1.description);
//   expect(gotPost?.images).toEqual(post1.images);
// });

// test('Get Post By User Id', async () => {
//   const posts = await PostRepo.getPostsByUserId(user1.id);
//   expect(posts.length).toBe(1);
//   if (posts.length > 0) expect(posts[0].id).toBe(post1.id);
// });

// test('Get User By Post Id', async () => {
//   const gotUser = await PostRepo.getUserByPostId(post1.id);
//   expect(gotUser).not.toBeUndefined();
//   expect(gotUser?.id).toBe(user1.id);
//   expect(gotUser?.bio).toBe(user1.bio);
//   expect(gotUser?.name).toBe(user1.name);
//   expect(gotUser?.googleId).toBe(user1.googleId);
//   expect(gotUser?.email).toBe(user1.email);
//   expect(gotUser?.profilePictureUrl).toBe(user1.profilePictureUrl);
// });

// test('Delete Post', async () => {
//   await PostRepo.deletePost(post1.id);
//   expect(await PostRepo.getPostById(post1.id)).toBeUndefined();
// });

// afterEach(async () => {
//   try {
//     await PostRepo.deletePost(post1.id);
//   } catch (e) { console.log('Post 1 cannot be deleted'); }
// });

// afterAll(async () => {
//   await UserRepo.deleteUserById(user1.id);
//   await conn.close();
// });