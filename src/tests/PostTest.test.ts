import { PostController } from 'src/api/controllers/PostController';
import { Connection } from 'typeorm';

import { UuidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, PostFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedPost: PostModel;
let conn: Connection;
let postController: PostController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  postController = ControllerFactory.post(conn);

  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedPost = new PostModel();
  expectedPost.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedPost.title = 'Mateo\'s Kombucha';
  expectedPost.description = 'Fermented since o-week';
  expectedPost.archive = false;
  expectedPost.categories = ['HANDMADE', 'OTHER'];
  expectedPost.price = 500.15;
  expectedPost.images = ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg', 'https://images.heb.com/is/image/HEBGrocery/001017916'];
  expectedPost.location = 'The Dorm Hotel';
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('post tests', () => {
  test('get all posts - no posts', async () => {
    const getPostsResponse = await postController.getPosts();

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('get all posts - one post', async () => {
    const post = PostFactory.fake();
    post.user = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    const getPostsResponse = await postController.getPosts();

    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test('get all posts - multiple posts', async () => {
    const [post1, post2] = PostFactory.create(2);
    const [user1, user2] = UserFactory.create(2);
    post1.user = user1;
    post2.user = user2;

    await new DataFactory()
      .createPosts(post1, post2)
      .createUsers(post1.user, post2.user)
      .write();

    const getPostsResponse = await postController.getPosts();

    expect(getPostsResponse.posts).toHaveLength(2);
  });

  test('get post by id', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const getPostResponse = await postController.getPostById(uuidParam);
    getPostResponse.post.price = Number(getPostResponse.post.price);
    expectedPost.created = getPostResponse.post.created;
    expect(getPostResponse.post).toEqual(expectedPost);
  });

  test('get post by user id', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const getPostsResponse = await postController.getPostsByUserId(uuidParam);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('create post', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const newPost = {
      title: 'Mateo\'s Kombucha',
      description: 'Fermented since o-week',
      categories: ['HANDMADE', 'OTHER'],
      price: 500.15,
      imagesBase64: [],
      created: 1667192023,
      userId: user.id,
    };

    const getPostResponse = await postController.createPost(newPost);
    const getPostsResponse = await postController.getPosts();

    expect(getPostResponse.post.title).toEqual('Mateo\'s Kombucha');
    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test('delete post by id', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    let getPostsResponse = await postController.getPosts();
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(post.user, uuidParam);
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts();
    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('delete post by id - by admin', async () => {
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fake();
    const adminUser = UserFactory.fakeTemplate();
    post.user = user;
    adminUser.admin = true;

    await new DataFactory()
      .createUsers(user, adminUser)
      .createPosts(post)
      .write();

    let getPostsResponse = await postController.getPosts();
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(user, uuidParam);
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts();
    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('search posts - direct string match', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const search = {
      keywords: 'Kombucha',
    }

    const getPostsResponse = await postController.searchPosts(search);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - substring', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const search = {
      keywords: 'S KOM',
    }

    const getPostsResponse = await postController.searchPosts(search);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - case mismatch', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const search = {
      keywords: 'FermenteD',
    }

    const getPostsResponse = await postController.searchPosts(search);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - no matches', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const search = {
      keywords: 'Kobucha',
    }

    const getPostsResponse = await postController.searchPosts(search);

    expect(getPostsResponse.posts).toEqual([]);
  });

  test('filter posts', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    let filter = {
      category: 'HANDMADE',
    }

    let getPostsResponse = await postController.filterPosts(filter);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      category: 'OTHER',
    }

    getPostsResponse = await postController.filterPosts(filter);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      category: 'SCHOOL',
    }

    getPostsResponse = await postController.filterPosts(filter);

    expect(getPostsResponse.posts).toEqual([]);
  });

  test('save/unsave posts', async () => {
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.saved = []
    post.user = user;

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    let postsResponse = await postController.getSavedPostsByUserId(user);
    expect(postsResponse).not.toBeUndefined();
    expect(postsResponse.posts).toEqual([]);

    await postController.savePost(user, uuidParam);
    postsResponse = await postController.getSavedPostsByUserId(user);
    expect(postsResponse).not.toBeUndefined();
    postsResponse.posts[0].price = Number(postsResponse.posts[0].price);
    expectedPost.created = postsResponse.posts[0].created;
    expect(postsResponse.posts).toEqual([expectedPost]);

    await postController.unsavePost(user, uuidParam);
    postsResponse = await postController.getSavedPostsByUserId(user);
    expect(postsResponse.posts).toEqual([]);
  });

  test('get all archived posts - no posts', async () => {
    const postController = ControllerFactory.post(conn);

    const getPostsResponse = await postController.getArchivedPosts();

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('get all archived posts - one post', async () => {
    const post = PostFactory.fake();
    post.user = UserFactory.fake();
    post.archive = true;

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    const getPostsResponse = await postController.getArchivedPosts();

    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test('get all archived posts - multiple posts', async () => {
    const [post1, post2] = PostFactory.create(2);
    const [user1, user2] = UserFactory.create(2);
    post1.user = user1;
    post2.user = user2;
    post1.archive = true;
    post2.archive = true;

    await new DataFactory()
      .createPosts(post1, post2)
      .createUsers(post1.user, post2.user)
      .write();

    const getPostsResponse = await postController.getArchivedPosts();

    expect(getPostsResponse.posts).toHaveLength(2);
  });

  test('get archived posts by user id - one post', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();
    post.archive = true;

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;
    expectedPost.archive = true;

    const getPostsResponse = await postController.getArchivedPostsByUserId(uuidParam);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('get archived posts by user id - multiple posts', async () => {
    const [post1, post2] = PostFactory.create(2);
    const user = UserFactory.fakeTemplate();
    post1.user = user
    post2.user = user;
    post1.archive = true;
    post2.archive = true;

    await new DataFactory()
      .createPosts(post1, post2)
      .createUsers(user)
      .write();

    const getPostsResponse = await postController.getArchivedPostsByUserId(uuidParam);

    expect(getPostsResponse.posts).toHaveLength(2);
  });

  test('archive post', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;
    expectedPost.archive = true;

    const getPostResponse = await postController.archivePost(post.user, uuidParam);
    getPostResponse.post.price = Number(getPostResponse.post.price);
    expectedPost.created = getPostResponse.post.created;

    expect(getPostResponse.post).toEqual(expectedPost);
  });
});