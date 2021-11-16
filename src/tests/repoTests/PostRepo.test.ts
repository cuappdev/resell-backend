import resellConnection from "../../utils/db";
import Post from "../../models/PostModel";
import User from "../../models/UserModel";

import PostRepo from "../../repos/PostRepo";
import UserRepo from "../../repos/UserRepo";
import { Connection } from "typeorm";

let post1: Post;
let user1: User
let conn: Connection;

beforeAll(async () => {

  conn = await resellConnection().catch(e => {
    throw Error(JSON.stringify(
      {
        message: "Error connecting to database in PostRepo test. Exiting.",
        error: e
      }
    ));
    process.exit();
  });
  user1 = await UserRepo.createUser('google-1', 'name-1', 'display-1', 'email-1');
});



beforeEach(async () => {
  post1 = await PostRepo.createPost('title-1', 'description-1', 'location-1', user1, []);
});


test('Posts Created Correctly', async () => {
  expect(post1.id).toBe('id-1');
  expect(post1.title).toBe('tile-1');
  expect(post1.description).toBe('description-1');
  expect(post1.user).toBe(user1);
});

test('Get Post By Id', async () => {
  const gotPost = await PostRepo.getPostById(post1.id);
  expect(gotPost).toBeTruthy();
  expect(gotPost?.id).toBe(post1.id);
  expect(gotPost?.title).toBe(post1.title);
  expect(gotPost?.description).toBe(post1.description);
  expect(gotPost?.user).toBe(post1.user);
});

test('Delete Post', async () => {
  await PostRepo.deletePost(post1);
  expect(await PostRepo.getPostById(post1.id)).toBeUndefined();
});

afterEach(async () => {
  try {
    await PostRepo.deletePost(post1);
  } catch (e) { console.log('Post 1 cannot be deleted'); }
});

afterAll(async () => {
  await UserRepo.deleteUser(user1);
  await conn.close();
  console.log('Passed all PostRepo tests!');
});