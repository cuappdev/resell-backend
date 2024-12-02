import { PostController } from 'src/api/controllers/PostController';
import { Connection, Not } from 'typeorm';

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
  expectedPost.category = 'HANDMADE';
  expectedPost.condition = 'NEW';
  expectedPost.original_price = 500.15;
  expectedPost.altered_price = -1;
  expectedPost.images = ['https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg', 'https://images.heb.com/is/image/HEBGrocery/001017916'];
  expectedPost.location = 'The Dorm Hotel';
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe('post tests', () => {
  test('get all posts - no posts', async () => {
    const getPostsResponse = await postController.getPosts(UserFactory.fake());

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test('get all posts - one post', async () => {
    const post = PostFactory.fake();
    post.user = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    const getPostsResponse = await postController.getPosts(post.user);

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

    const getPostsResponse = await postController.getPosts(user1);

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

    const getPostResponse = await postController.getPostById(post.user, uuidParam);
    getPostResponse.post.original_price = Number(getPostResponse.post.original_price);
    getPostResponse.post.altered_price = Number(getPostResponse.post.altered_price);
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

    const getPostsResponse = await postController.getPostsByUserId(post.user, {id: post.user.id});
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    expect(getPostsResponse.posts).toEqual([post]);
  });

  test('create post', async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createUsers(user)
      .write();

    const newPost = {
      title: 'Mateo\'s Kombucha',
      description: 'Fermented since o-week',
      category: 'HANDMADE',
      condition: 'NEW',
      original_price: 500.15,
      imagesBase64: [],
      created: 1667192023,
      userId: user.id,
    };

    const getPostResponse = await postController.createPost(newPost);
    const getPostsResponse = await postController.getPosts(user);

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

    let getPostsResponse = await postController.getPosts(post.user);
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(post.user, uuidParam);
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts(post.user);
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

    let getPostsResponse = await postController.getPosts(adminUser);
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(user, uuidParam);
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts(adminUser);
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

    const getPostsResponse = await postController.searchPosts(post.user, search);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
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

    const getPostsResponse = await postController.searchPosts(post.user, search);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
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

    const getPostsResponse = await postController.searchPosts(post.user, search);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
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

    const getPostsResponse = await postController.searchPosts(post.user, search);

    expect(getPostsResponse.posts).toEqual([]);
  });

  test('filter posts by category/categories', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    let filter = {
      categories: ['HANDMADE'],
    }

    let getPostsResponse = await postController.filterPosts(post.user, filter);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      categories: ['OTHER', 'HANDMADE'],
    }

    getPostsResponse = await postController.filterPosts(post.user, filter);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);

    filter = {
      categories: ['SCHOOL'],
    }

    getPostsResponse = await postController.filterPosts(post.user, filter);

    expect(getPostsResponse.posts).toEqual([]);
  });

  test('filter posts by price, where price is strictly within price range', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    let filter = {
      lowerBound: 1.0,
      upperBound: 1000.0,
    };

    let getPostsResponse = await postController.filterPostsByPrice(post.user, filter);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('filter posts by price, where price is lower bound', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();
    const user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;
    let filter = {
      lowerBound: 500.15,
      upperBound: 1000.0,
    };

    let getPostsResponse = await postController.filterPostsByPrice(user, filter);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('filter posts by price, where price is upper bound', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;
    let filter = {
      lowerBound: 1.0,
      upperBound: 500.15,
    };

    let getPostsResponse = await postController.filterPostsByPrice(post.user, filter);
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
    expectedPost.created = getPostsResponse.posts[0].created;

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test('filter posts by price, where price is not in price range', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    let filter = {
      lowerBound: 1.0,
      upperBound: 2.0,
    };

    let getPostsResponse = await postController.filterPostsByPrice(post.user, filter);

    expect(getPostsResponse.posts).toEqual([])
  });

  test('filter posts by price high to low - multiple posts', async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();
    
    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();
    
    post1.original_price = 1000.15;
    post2.original_price = 500.15;
    post3.original_price = 100.15;

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const getPostsResponse = await postController.filterPriceHighToLow(post1.user);
    
    // Convert prices for comparison
    getPostsResponse.posts.forEach(post => {
      post.original_price = Number(post.original_price);
      post.altered_price = Number(post.altered_price);
    });

    expect(getPostsResponse.posts).toHaveLength(3);
    expect(getPostsResponse.posts[0].original_price).toEqual(post1.original_price);
    expect(getPostsResponse.posts[1].original_price).toEqual(post2.original_price);
    expect(getPostsResponse.posts[2].original_price).toEqual(post3.original_price);
  });

  test('filter posts by price low to high - multiple posts', async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();
    
    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();
    
    post1.original_price = 1000.15;
    post2.original_price = 500.15;
    post3.original_price = 100.15;

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const getPostsResponse = await postController.filterPriceLowToHigh(post1.user);
    
    // Convert prices for comparison
    getPostsResponse.posts.forEach(post => {
      post.original_price = Number(post.original_price);
      post.altered_price = Number(post.altered_price);
    });

    expect(getPostsResponse.posts).toHaveLength(3);
    expect(getPostsResponse.posts[0].original_price).toEqual(post3.original_price);
    expect(getPostsResponse.posts[1].original_price).toEqual(post2.original_price);
    expect(getPostsResponse.posts[2].original_price).toEqual(post1.original_price);
  });

  test('filter posts by newly listed - multiple posts', async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();
    
    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();

    const now = new Date();
    post1.created = new Date(now.setDate(now.getDate() - 2));  // 2 days ago
    post2.created = new Date(now.setDate(now.getDate() + 1));  // 1 day ago
    post3.created = new Date(now.setDate(now.getDate() + 1));  // today

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const getPostsResponse = await postController.filterNewlyListed(post1.user);

    expect(getPostsResponse.posts).toHaveLength(3);
    expect(new Date(getPostsResponse.posts[0].created)).toEqual(post3.created);
    expect(new Date(getPostsResponse.posts[1].created)).toEqual(post2.created);
    expect(new Date(getPostsResponse.posts[2].created)).toEqual(post1.created);
  });

  test('filter posts by multiple conditions', async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();
    
    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();
    
    post1.condition = "Gently Used";
    post2.condition = "Never Used";
    post3.condition = "Used";

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const filter = {
      condition: ["Gently Used", "Never Used"]
    };

    const getPostsResponse = await postController.filterByCondition(post1.user, filter);
    expect(getPostsResponse.posts).toHaveLength(2);
    expect(getPostsResponse.posts.map(post => post.condition)).toContain(post1.condition);
    expect(getPostsResponse.posts.map(post => post.condition)).toContain(post2.condition);
  });

  test('successfully saves a post', async () => {
    // Set up fake post and user
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.saved = [];
    post.user = user;

    // Create initial data in the database
    await new DataFactory()
      .createPosts(post)
      .createUsers(user)
      .write();

    // Verify initially there are no saved posts
    let savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts).not.toBeUndefined();
    expect(savedPosts.posts).toEqual([]);

    // Save the post for the user
    await postController.savePost(user, { id: post.id });

    // Verify the post is now in saved posts
    savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts).not.toBeUndefined();
    expect(savedPosts.posts).toHaveLength(1);
    expect(savedPosts.posts[0].id).toEqual(post.id);
  });

  test('unsave posts - multiple scenarios', async () => {
    // Set up fake post and user
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.saved = [];
    post.user = user;

    // Initialize data in the database
    await new DataFactory()
      .createPosts(post)
      .createUsers(user)
      .write();

    // Case 1: Unsave a post that is saved
    await postController.savePost(user, { id: post.id });
    await postController.unsavePost(user, { id: post.id });
    
    let savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts.posts).toEqual([]);

    // Case 2: Attempt to unsave a post that is not saved (should throw error)
    try {
      await postController.unsavePost(user, { id: post.id });
      let postsResponse = await postController.getSavedPostsByUserId(user);
      expect(postsResponse.posts).toEqual([]);
    } catch (error) {
      expect(error.message).toEqual('Post not found in saved posts.');
    }

    // Case 3: Attempt to unsave a post for a different user (should throw error)
    const secondUser = UserFactory.fakeTemplate();
    try{
      await postController.unsavePost(secondUser, { id: post.id })
      fail('Should have thrown an error')
    } catch {
      expect(true).toBe(true);
    }
  });

  test('unsave a middle post', async () => {
    // Set up fake posts and user
    const [post1, post2, post3] = [PostFactory.fake(), PostFactory.fake(), PostFactory.fake()];
    const user = UserFactory.fakeTemplate();
    user.saved = []

    // Associate posts with the user
    post1.user = user;
    post2.user = user;
    post3.user = user;

    // Create initial data in the database
    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(user)
      .write();

    // Save all posts for the user
    await postController.savePost(user, { id: post1.id });
    await postController.savePost(user, { id: post2.id });
    await postController.savePost(user, { id: post3.id });

    // Verify all posts are saved
    let savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts).not.toBeUndefined();
    expect(savedPosts.posts).toHaveLength(3);
    expect(savedPosts.posts.map(post => post.id)).toEqual([post1.id, post2.id, post3.id]);

    // Unsave the middle post
    await postController.unsavePost(user, { id: post2.id });
    
    // Verify only the middle post is removed
    savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts).not.toBeUndefined();
    expect(savedPosts.posts).toHaveLength(2);
    expect(savedPosts.posts.map(post => post.id)).toEqual([post1.id, post3.id]);
  });

  test('get all archived posts - no posts', async () => {
    const postController = ControllerFactory.post(conn);
    const user = UserFactory.fakeTemplate();

    const getPostsResponse = await postController.getArchivedPosts(user);

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

    const getPostsResponse = await postController.getArchivedPosts(post.user);

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

    const getPostsResponse = await postController.getArchivedPosts(user1);

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
    getPostsResponse.posts[0].original_price = Number(getPostsResponse.posts[0].original_price);
    getPostsResponse.posts[0].altered_price = Number(getPostsResponse.posts[0].altered_price);
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
    getPostResponse.post.original_price = Number(getPostResponse.post.original_price);
    getPostResponse.post.altered_price = Number(getPostResponse.post.altered_price);
    expectedPost.created = getPostResponse.post.created;

    expect(getPostResponse.post).toEqual(expectedPost);
  });

  test.skip('edit post price', async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user)
      .write();

    expectedPost.user = post.user;

    let edit = {
      new_price: 20
    };

    let getPostsResponse = await postController.editPrice(edit, post.user, uuidParam);
    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!')
    console.log(getPostsResponse)
    console.log(post.altered_price)
    expect(Number(post.altered_price)).toEqual(Number(getPostsResponse.new_price));
  })

  test('get all posts/post by id with a user who is soft deleted', async () => {
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.isActive = false;
    post.user = user;

    await new DataFactory()
      .createPosts(post)
      .createUsers(user)
      .write();

    const getPostsResponse = await postController.getPosts(UserFactory.fake());

    expect(getPostsResponse.posts).toHaveLength(0);

    try {
      await postController.getPostById(UserFactory.fake(), uuidParam);
    } catch (error) {
      expect(error.message).toEqual('User is not active!');
    }
  });
});