import { Connection } from 'typeorm';

import { PostAndUserUuidParam, UuidParam } from '../api/validators/GenericRequests';
import { PostModel } from '../models/PostModel';
import { ControllerFactory } from './controllers';
import { DatabaseConnection, DataFactory, PostFactory, UserFactory } from './data';

let uuidParam: UuidParam;
let expectedPost: PostModel;
let conn: Connection;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  
  uuidParam = new UuidParam();
  uuidParam.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

  expectedPost = new PostModel();
  expectedPost.id = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
  expectedPost.title = 'Mateo\'s Kombucha';
  expectedPost.description = 'Fermented since o-week';
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
    const postController = ControllerFactory.post(conn);

    const getPostsResponse = await postController.getPosts();

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('get all posts - one post', async () => {
    const postController = ControllerFactory.post(conn);
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
    const postController = ControllerFactory.post(conn);
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
    const postController = ControllerFactory.post(conn);
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();
      
    expectedPost.user = post.user;

    const getPostResponse = await postController.getPostById(uuidParam);
    getPostResponse.post.price = Number(getPostResponse.post.price);

    expect(getPostResponse.post).toEqual(expectedPost);
  });

  test('get post by user id', async () => {
    const postController = ControllerFactory.post(conn);
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    const getPostsResponse = await postController.getPostsByUserId(uuidParam);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('create post', async () => {
    const postController = ControllerFactory.post(conn);
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
      userId: user.id,
    };
    
    const getPostResponse = await postController.createPost(newPost);
    const getPostsResponse = await postController.getPosts();

    expect(getPostResponse.post.title).toEqual('Mateo\'s Kombucha');
    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test('delete post by id', async () => {
    const postController = ControllerFactory.post(conn);
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();
      
    expectedPost.user = post.user;

    let getPostsResponse = await postController.getPosts();
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(post.user, uuidParam);
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts();
    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('search posts - direct string match', async () => {
    const postController = ControllerFactory.post(conn);
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

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - substring', async () => {
    const postController = ControllerFactory.post(conn);
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
    
    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - case mismatch', async () => {
    const postController = ControllerFactory.post(conn);
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
    
    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('search posts - no matches', async () => {
    const postController = ControllerFactory.post(conn);
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
    const postController = ControllerFactory.post(conn);
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

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      category: 'OTHER',
    }

    getPostsResponse = await postController.filterPosts(filter);
    getPostsResponse.posts[0].price = Number(getPostsResponse.posts[0].price);

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      category: 'SCHOOL',
    }

    getPostsResponse = await postController.filterPosts(filter);
    
    expect(getPostsResponse.posts).toEqual([]);
  });

  test('save/unsave posts', async () => {
    const postController = ControllerFactory.post(conn);
    const userController = ControllerFactory.user(conn);
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    const postAndUserUuidParam = new PostAndUserUuidParam();
    postAndUserUuidParam.postId = '81e6896c-a549-41bf-8851-604e7fbd4f1f';
    postAndUserUuidParam.userId = '81e6896c-a549-41bf-8851-604e7fbd4f1f';

    let userResponse = (await userController.getUserByGoogleId('shungoGoogleID')).user;
    expect(userResponse).not.toBeUndefined();
    expect(userResponse?.saved).toEqual([]);

    let getPostResponse = await postController.savePost(postAndUserUuidParam);
    userResponse = (await userController.getUserByGoogleId('shungoGoogleID')).user;
    if (userResponse) {
      userResponse.saved[0].price = Number(userResponse.saved[0].price);
    }
    expect(userResponse?.saved).toEqual([expectedPost]);

    getPostResponse = await postController.unsavePost(postAndUserUuidParam);
    userResponse = (await userController.getUserByGoogleId('shungoGoogleID')).user;
    expect(userResponse?.saved).toEqual([]);
  });
});