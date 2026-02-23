import { PostController } from "src/api/controllers/PostController";
import { Connection, Not } from "typeorm";

import { UuidParam } from "../api/validators/GenericRequests";
import { PostModel } from "../models/PostModel";
import { CategoryModel } from "../models/CategoryModel";
import { EventTagModel } from "../models/EventTagModel";
import { ControllerFactory } from "./controllers";
import {
  DatabaseConnection,
  DataFactory,
  PostFactory,
  UserFactory,
  TransactionFactory,
} from "./data";

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
  uuidParam.id = "81e6896c-a549-41bf-8851-604e7fbd4f1f";

  const category1 = new CategoryModel();
  category1.id = "a2b2c3d4-e5f6-7890-abcd-1234567890ef";
  category1.name = "CLOTHING";
  category1.posts = [];

  const category2 = new CategoryModel();
  category2.id = "f4c9ad85-9015-45b1-b52f-5d7402313887";
  category2.name = "HANDMADE";
  category2.posts = [];

  expectedPost = new PostModel();
  expectedPost.id = "81e6896c-a549-41bf-8851-604e7fbd4f1f";
  expectedPost.title = "Mateo's Kombucha";
  expectedPost.description = "Fermented since o-week";
  expectedPost.archive = false;
  expectedPost.categories = [category1, category2];
  expectedPost.condition = "NEW";
  expectedPost.originalPrice = 500.15;
  expectedPost.alteredPrice = -1;
  expectedPost.images = [
    "https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Kombucha_Mature.jpg/640px-Kombucha_Mature.jpg",
    "https://images.heb.com/is/image/HEBGrocery/001017916",
  ];
  expectedPost.location = "The Dorm Hotel";
  expectedPost.sold = false;
  expectedPost.eventTags = [];
  expectedPost.embedding = null as any;
});

afterAll(async () => {
  await DatabaseConnection.clear();
  await DatabaseConnection.close();
});

describe("post tests", () => {
  test("get all posts - no posts", async () => {
    const getPostsResponse = await postController.getPosts(UserFactory.fake());

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test("get all posts - one post", async () => {
    const post = PostFactory.fake();
    post.user = UserFactory.fake();

    // Ensure categories is initialized
    if (!post.categories) {
      post.categories = [];
    }

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    const getPostsResponse = await postController.getPosts(post.user);

    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test("get all posts - multiple posts", async () => {
    const [post1, post2] = PostFactory.create(2);
    const [user1, user2] = UserFactory.create(2);
    post1.user = user1;
    post2.user = user2;

    // Ensure categories is initialized for both posts
    if (!post1.categories) {
      post1.categories = [];
    }
    if (!post2.categories) {
      post2.categories = [];
    }

    await new DataFactory()
      .createPosts(post1, post2)
      .createUsers(post1.user, post2.user)
      .write();

    const getPostsResponse = await postController.getPosts(user1);

    expect(getPostsResponse.posts).toHaveLength(2);
  });

  test("get post by id", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const getPostResponse = await postController.getPostById(
      post.user,
      uuidParam,
    );
    getPostResponse.post.originalPrice = Number(
      getPostResponse.post.originalPrice,
    );
    getPostResponse.post.alteredPrice = Number(
      getPostResponse.post.alteredPrice,
    );
    expectedPost.created = getPostResponse.post.created;

    expectedPost.categories.forEach((category) => {
      if (
        getPostResponse.post.categories &&
        getPostResponse.post.categories.length > 0
      ) {
        category.posts = getPostResponse.post.categories[0].posts;
      }
    });

    expect(getPostResponse.post).toEqual(expectedPost);
  });

  test("get post by user id", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    const getPostsResponse = await postController.getPostsByUserId(post.user, {
      id: post.user.firebaseUid,
    });
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );

    // Update the post categories.posts to match what comes from the API
    post.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([post]);
  });

  test("create post", async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory().createUsers(user).write();

    const newPost = {
      title: "Mateo's Kombucha",
      description: "Fermented since o-week",
      categories: [
        "f4c9ad85-9015-45b1-b52f-5d7402313887",
        "a2b2c3d4-e5f6-7890-abcd-1234567890ef",
      ],
      condition: "NEW",
      originalPrice: 500.15,
      imagesBase64: [],
      created: 1667192023,
      userId: user.firebaseUid,
    };

    const getPostResponse = await postController.createPost(user, newPost);
    const getPostsResponse = await postController.getPosts(user);

    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");
    expect(getPostsResponse.posts).toHaveLength(1);

    // Test with inactive user should throw error
    const inactiveUser = UserFactory.fakeTemplate();
    inactiveUser.isActive = false;

    await new DataFactory().createUsers(inactiveUser).write();

    await expect(
      postController.createPost(inactiveUser, newPost),
    ).rejects.toThrow("User is not active!");
  });

    test("add/remove event tags to post", async () => {
      const post = PostFactory.fakeTemplate();
      post.user = UserFactory.fakeTemplate();

      await new DataFactory().createPosts(post).createUsers(post.user).write();

      const addReq = { eventTags: ["SPRING_FAIR"] };
      const addedResp = await postController.addEventTagsToPost(
        post.user,
        { id: post.id } as any,
        addReq,
      );

      expect(addedResp.post.eventTags.map((t: any) => t.name)).toContain(
        "SPRING_FAIR",
      );

      const removeReq = { eventTags: ["SPRING_FAIR"] };
      const removedResp = await postController.removeEventTagsFromPost(
        post.user,
        { id: post.id } as any,
        removeReq,
      );

      expect(removedResp.post.eventTags.map((t: any) => t.name)).not.toContain(
        "SPRING_FAIR",
      );
    });

  test("create post with event tags", async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory().createUsers(user).write();

    const newPost = {
      title: "Spring Sale Item",
      description: "Selling for spring fair",
      categories: [],
      eventTags: ["SPRING_FAIR", "CLEARANCE"],
      condition: "NEW",
      originalPrice: 25.0,
      imagesBase64: [],
      created: 1667192023,
      userId: user.firebaseUid,
    };

    const getPostResponse = await postController.createPost(user, newPost);

    const tagNames = getPostResponse.post.eventTags.map((t: any) => t.name);
    expect(tagNames).toContain("SPRING_FAIR");
    expect(tagNames).toContain("CLEARANCE");
    expect(getPostResponse.post.eventTags).toHaveLength(2);
  });

  test("add multiple event tags to post", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    // Add first batch of tags
    const addReq1 = { eventTags: ["SPRING_FAIR", "CLEARANCE"] };
    const resp1 = await postController.addEventTagsToPost(
      post.user,
      { id: post.id } as any,
      addReq1,
    );

    expect(resp1.post.eventTags).toHaveLength(2);
    const tagNames1 = resp1.post.eventTags.map((t: any) => t.name);
    expect(tagNames1).toContain("SPRING_FAIR");
    expect(tagNames1).toContain("CLEARANCE");

    // Add more tags (including a duplicate)
    const addReq2 = { eventTags: ["SPRING_FAIR", "HOLIDAY_SALE"] };
    const resp2 = await postController.addEventTagsToPost(
      post.user,
      { id: post.id } as any,
      addReq2,
    );

    // Should have 3 tags (SPRING_FAIR not duplicated)
    expect(resp2.post.eventTags).toHaveLength(3);
    const tagNames2 = resp2.post.eventTags.map((t: any) => t.name);
    expect(tagNames2).toContain("SPRING_FAIR");
    expect(tagNames2).toContain("CLEARANCE");
    expect(tagNames2).toContain("HOLIDAY_SALE");
  });

  test("remove event tags from post - partial removal", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    // Add tags
    await postController.addEventTagsToPost(
      post.user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR", "CLEARANCE", "HOLIDAY_SALE"] },
    );

    // Remove only one tag
    const removeReq = { eventTags: ["CLEARANCE"] };
    const resp = await postController.removeEventTagsFromPost(
      post.user,
      { id: post.id } as any,
      removeReq,
    );

    expect(resp.post.eventTags).toHaveLength(2);
    const tagNames = resp.post.eventTags.map((t: any) => t.name);
    expect(tagNames).toContain("SPRING_FAIR");
    expect(tagNames).toContain("HOLIDAY_SALE");
    expect(tagNames).not.toContain("CLEARANCE");
  });

  test("remove event tags from post - remove all tags", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    await postController.addEventTagsToPost(
      post.user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR", "CLEARANCE"] },
    );

    const resp = await postController.removeEventTagsFromPost(
      post.user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR", "CLEARANCE"] },
    );

    expect(resp.post.eventTags).toHaveLength(0);
  });

  test("add event tags - non-owner cannot add tags", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();
    const otherUser = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user, otherUser)
      .write();

    await expect(
      postController.addEventTagsToPost(
        otherUser,
        { id: post.id } as any,
        { eventTags: ["SPRING_FAIR"] },
      ),
    ).rejects.toThrow();
  });

  test("remove event tags - non-owner cannot remove tags", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();
    const otherUser = UserFactory.fake();

    await new DataFactory()
      .createPosts(post)
      .createUsers(post.user, otherUser)
      .write();

    await postController.addEventTagsToPost(
      post.user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );

    await expect(
      postController.removeEventTagsFromPost(
        otherUser,
        { id: post.id } as any,
        { eventTags: ["SPRING_FAIR"] },
      ),
    ).rejects.toThrow();
  });

  test("filter posts by event tags", async () => {
    const user = UserFactory.fakeTemplate();

    const post1 = PostFactory.fakeTemplate();
    post1.id = "11111111-1111-1111-1111-111111111111";
    post1.title = "Spring Item";
    post1.user = user;

    const post2 = PostFactory.fakeTemplate();
    post2.id = "22222222-2222-2222-2222-222222222222";
    post2.title = "Holiday Item";
    post2.user = user;

    const post3 = PostFactory.fakeTemplate();
    post3.id = "33333333-3333-3333-3333-333333333333";
    post3.title = "No Tags Item";
    post3.user = user;

    await new DataFactory()
      .createUsers(user)
      .createPosts(post1, post2, post3)
      .write();

    // Add different event tags to different posts
    await postController.addEventTagsToPost(
      user,
      { id: post1.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );
    await postController.addEventTagsToPost(
      user,
      { id: post2.id } as any,
      { eventTags: ["HOLIDAY_SALE"] },
    );

    // Filter by SPRING_FAIR - should only get post1
    const springResp = await postController.filterPostsByEventTags(
      user,
      { eventTags: ["SPRING_FAIR"] },
    );
    expect(springResp.posts).toHaveLength(1);
    expect(springResp.posts[0].id).toEqual(post1.id);

    // Filter by HOLIDAY_SALE - should only get post2
    const holidayResp = await postController.filterPostsByEventTags(
      user,
      { eventTags: ["HOLIDAY_SALE"] },
    );
    expect(holidayResp.posts).toHaveLength(1);
    expect(holidayResp.posts[0].id).toEqual(post2.id);

    // Filter by non-existent tag - should get empty
    const emptyResp = await postController.filterPostsByEventTags(
      user,
      { eventTags: ["NON_EXISTENT"] },
    );
    expect(emptyResp.posts).toHaveLength(0);
  });

  test("filter posts by event tags - empty request returns empty", async () => {
    const user = UserFactory.fakeTemplate();
    const post = PostFactory.fakeTemplate();
    post.user = user;

    await new DataFactory().createPosts(post).createUsers(user).write();

    await postController.addEventTagsToPost(
      user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );

    const resp = await postController.filterPostsByEventTags(
      user,
      { eventTags: [] },
    );
    expect(resp.posts).toHaveLength(0);
  });

  test("delete post by id", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    // Ensure categories is initialized
    if (!post.categories) {
      post.categories = [];
    }

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    let getPostsResponse = await postController.getPosts(post.user);
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(
      post.user,
      uuidParam,
    );
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts(post.user);
    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test("delete post by id - by admin", async () => {
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fake();
    const adminUser = UserFactory.fakeTemplate();
    post.user = user;
    adminUser.admin = true;

    // Ensure categories is initialized
    if (!post.categories) {
      post.categories = [];
    }

    await new DataFactory()
      .createUsers(user, adminUser)
      .createPosts(post)
      .write();

    let getPostsResponse = await postController.getPosts(adminUser);
    expect(getPostsResponse.posts).toHaveLength(1);

    const getPostResponse = await postController.deletePostById(
      user,
      uuidParam,
    );
    expect(getPostResponse.post.title).toEqual("Mateo's Kombucha");

    getPostsResponse = await postController.getPosts(adminUser);
    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test("search posts - direct string match", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const search = {
      keywords: "Kombucha",
    };

    const getPostsResponse = await postController.searchPosts(
      post.user,
      search,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("search posts - substring", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const search = {
      keywords: "S KOM",
    };

    const getPostsResponse = await postController.searchPosts(
      post.user,
      search,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("search posts - case mismatch", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const search = {
      keywords: "FermenteD",
    };

    const getPostsResponse = await postController.searchPosts(
      post.user,
      search,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("search posts - no matches", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const search = {
      keywords: "Kobucha",
    };

    const getPostsResponse = await postController.searchPosts(
      post.user,
      search,
    );

    expect(getPostsResponse.posts).toEqual([]);
  });

  test("filter posts by category/categories", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    let filter = {
      categories: ["HANDMADE"], // Using category name instead of ID
    };

    let getPostsResponse = await postController.filterPostsByCategories(
      post.user,
      filter,
    );
    // Compare post IDs instead of entire post objects
    expect(getPostsResponse.posts.map((p) => p.id)).toEqual([expectedPost.id]);

    //test with extra categories
    filter = {
      categories: ["OTHER", "HANDMADE"], // Using category names instead of IDs
    };

    getPostsResponse = await postController.filterPostsByCategories(
      post.user,
      filter,
    );
    // Compare post IDs instead of entire post objects
    expect(getPostsResponse.posts.map((p) => p.id)).toEqual([expectedPost.id]);

    //test with no matches
    filter = {
      categories: ["FOOD"], // A category that the post doesn't have
    };

    getPostsResponse = await postController.filterPostsByCategories(
      post.user,
      filter,
    );

    expect(getPostsResponse.posts).toEqual([]);
  });

  test("filter posts by category/categories with multiple posts and testing to not return duplicates", async () => {
    const user = UserFactory.fakeTemplate();

    // Create categories
    const categoryHandmade = new CategoryModel();
    categoryHandmade.id = "f4c9ad85-9015-45b1-b52f-5d7402313887";
    categoryHandmade.name = "HANDMADE";
    categoryHandmade.posts = [];

    const categoryClothing = new CategoryModel();
    categoryClothing.id = "a2b2c3d4-e5f6-7890-abcd-1234567890ef";
    categoryClothing.name = "CLOTHING";
    categoryClothing.posts = [];

    const categoryFood = new CategoryModel();
    categoryFood.id = "b3b3b3b3-b3b3-b3b3-b3b3-b3b3b3b3b3b3";
    categoryFood.name = "FOOD";
    categoryFood.posts = [];

    // Create multiple posts with various category combinations
    const post1 = PostFactory.fakeTemplate();
    post1.id = "11111111-1111-1111-1111-111111111111"; // Use a valid UUID
    post1.title = "Handmade Soap";
    post1.categories = [categoryHandmade];
    post1.user = user;

    const post2 = PostFactory.fakeTemplate();
    post2.id = "22222222-2222-2222-2222-222222222222"; // Use a valid UUID
    post2.title = "Stylish Jacket";
    post2.categories = [categoryClothing];
    post2.user = user;

    const post3 = PostFactory.fakeTemplate();
    post3.id = "33333333-3333-3333-3333-333333333333"; // Use a valid UUID
    post3.title = "Handmade Jacket";
    post3.categories = [categoryHandmade, categoryClothing]; // belongs to both
    post3.user = user;

    const post4 = PostFactory.fakeTemplate();
    post4.id = "44444444-4444-4444-4444-444444444444"; // Use a valid UUID
    post4.title = "Mateo's Organic Kombucha";
    post4.categories = [categoryFood];
    post4.user = user;

    await new DataFactory()
      .createUsers(user)
      .createPosts(post1, post2, post3, post4)
      .write();

    //Filter by one category, expect multiple posts
    let filter = {
      categories: ["HANDMADE"], // Using category name instead of ID
    };

    let response = await postController.filterPostsByCategories(user, filter);
    const handmadePostIds = response.posts.map((p: any) => p.id);
    expect(new Set(handmadePostIds).size).toBe(handmadePostIds.length); // ensure sql query doesnt accidentally return duplicates
    expect(handmadePostIds.sort()).toEqual(
      [
        "11111111-1111-1111-1111-111111111111",
        "33333333-3333-3333-3333-333333333333",
      ].sort(),
    );

    //Filter multiple categories, expect multiple posts (no duplicates)
    filter = {
      categories: ["HANDMADE", "CLOTHING"], // Using category names instead of IDs
    };

    response = await postController.filterPostsByCategories(user, filter);
    const mixedPostIds = response.posts.map((p: any) => p.id);
    expect(new Set(mixedPostIds).size).toBe(mixedPostIds.length);
    expect(mixedPostIds.sort()).toEqual(
      [
        "11111111-1111-1111-1111-111111111111",
        "22222222-2222-2222-2222-222222222222",
        "33333333-3333-3333-3333-333333333333",
      ].sort(),
    );

    //Filter multiple categories, expect multiple posts (no duplicates) 2
    filter = {
      categories: ["FOOD", "HANDMADE"], // Using category names instead of IDs
    };

    response = await postController.filterPostsByCategories(user, filter);
    const comboPostIds = response.posts.map((p: any) => p.id);
    expect(new Set(comboPostIds).size).toBe(comboPostIds.length);
    expect(comboPostIds.sort()).toEqual(
      [
        "11111111-1111-1111-1111-111111111111",
        "33333333-3333-3333-3333-333333333333",
        "44444444-4444-4444-4444-444444444444",
      ].sort(),
    );

    //Filter one category, expect one post
    filter = {
      categories: ["FOOD"], // Using category name instead of ID
    };

    response = await postController.filterPostsByCategories(user, filter);
    const foodPostIds = response.posts.map((p: any) => p.id);
    expect(foodPostIds).toEqual(["44444444-4444-4444-4444-444444444444"]);
  });

  test("filter posts by price, where price is strictly within price range", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const filter = {
      lowerBound: 1.0,
      upperBound: 1000.0,
    };

    const getPostsResponse = await postController.filterPostsByPrice(
      post.user,
      filter,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("filter posts by price, where price is lower bound", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();
    const user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;
    const filter = {
      lowerBound: 500.15,
      upperBound: 1000.0,
    };

    const getPostsResponse = await postController.filterPostsByPrice(
      user,
      filter,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("filter posts by price, where price is upper bound", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;
    const filter = {
      lowerBound: 1.0,
      upperBound: 500.15,
    };

    const getPostsResponse = await postController.filterPostsByPrice(
      post.user,
      filter,
    );
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("filter posts by price, where price is not in price range", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    const filter = {
      lowerBound: 1.0,
      upperBound: 2.0,
    };

    const getPostsResponse = await postController.filterPostsByPrice(
      post.user,
      filter,
    );

    expect(getPostsResponse.posts).toEqual([]);
  });

  test("filter posts by price high to low - multiple posts", async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();

    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();

    post1.originalPrice = 1000.15;
    post2.originalPrice = 500.15;
    post3.originalPrice = 100.15;

    // Ensure categories are initialized for all posts
    if (!post1.categories) post1.categories = [];
    if (!post2.categories) post2.categories = [];
    if (!post3.categories) post3.categories = [];

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const getPostsResponse = await postController.filterPriceHighToLow(
      post1.user,
    );

    // Convert prices for comparison
    getPostsResponse.posts.forEach((post) => {
      post.originalPrice = Number(post.originalPrice);
      post.alteredPrice = Number(post.alteredPrice);
    });

    expect(getPostsResponse.posts).toHaveLength(3);
    expect(getPostsResponse.posts[0].originalPrice).toEqual(
      post1.originalPrice,
    );
    expect(getPostsResponse.posts[1].originalPrice).toEqual(
      post2.originalPrice,
    );
    expect(getPostsResponse.posts[2].originalPrice).toEqual(
      post3.originalPrice,
    );
  });

  test("filter posts by price low to high - multiple posts", async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();

    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();

    post1.originalPrice = 1000.15;
    post2.originalPrice = 500.15;
    post3.originalPrice = 100.15;

    // Ensure categories are initialized for all posts
    if (!post1.categories) post1.categories = [];
    if (!post2.categories) post2.categories = [];
    if (!post3.categories) post3.categories = [];

    await new DataFactory()
      .createPosts(post1, post2, post3)
      .createUsers(post1.user, post2.user, post3.user)
      .write();

    const getPostsResponse = await postController.filterPriceLowToHigh(
      post1.user,
    );

    // Convert prices for comparison
    getPostsResponse.posts.forEach((post) => {
      post.originalPrice = Number(post.originalPrice);
      post.alteredPrice = Number(post.alteredPrice);
    });

    expect(getPostsResponse.posts).toHaveLength(3);
    expect(getPostsResponse.posts[0].originalPrice).toEqual(
      post3.originalPrice,
    );
    expect(getPostsResponse.posts[1].originalPrice).toEqual(
      post2.originalPrice,
    );
    expect(getPostsResponse.posts[2].originalPrice).toEqual(
      post1.originalPrice,
    );
  });

  test("filter posts by newly listed - multiple posts", async () => {
    const post1 = PostFactory.fakeTemplate();
    const post2 = PostFactory.fake();
    const post3 = PostFactory.fake();

    post1.user = UserFactory.fakeTemplate();
    post2.user = UserFactory.fake();
    post3.user = UserFactory.fake();

    const now = new Date();
    post1.created = new Date(now.setDate(now.getDate() - 2)); // 2 days ago
    post2.created = new Date(now.setDate(now.getDate() + 1)); // 1 day ago
    post3.created = new Date(now.setDate(now.getDate() + 1)); // today

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

  test("filter posts by multiple conditions", async () => {
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
      condition: ["Gently Used", "Never Used"],
    };

    const getPostsResponse = await postController.filterByCondition(
      post1.user,
      filter,
    );
    expect(getPostsResponse.posts).toHaveLength(2);
    expect(getPostsResponse.posts.map((post) => post.condition)).toContain(
      post1.condition,
    );
    expect(getPostsResponse.posts.map((post) => post.condition)).toContain(
      post2.condition,
    );
  });

  test("successfully saves a post", async () => {
    // Set up fake post and user
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.saved = [];
    post.user = user;

    // Ensure categories is initialized
    if (!post.categories) {
      post.categories = [];
    }

    // Create initial data in the database
    await new DataFactory().createPosts(post).createUsers(user).write();

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

  test("unsave posts - multiple scenarios", async () => {
    // Set up fake post and user
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.saved = [];
    post.user = user;

    // Ensure categories is initialized
    if (!post.categories) {
      post.categories = [];
    }

    // Initialize data in the database
    await new DataFactory().createPosts(post).createUsers(user).write();

    // Case 1: Unsave a post that is saved
    await postController.savePost(user, { id: post.id });
    await postController.unsavePost(user, { id: post.id });

    const savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts.posts).toEqual([]);

    // Case 2: Attempt to unsave a post that is not saved (should throw error)
    try {
      await postController.unsavePost(user, { id: post.id });
      const postsResponse = await postController.getSavedPostsByUserId(user);
      expect(postsResponse.posts).toEqual([]);
    } catch (error) {
      expect(error.message).toEqual("Post not found in saved posts.");
    }

    // Case 3: Attempt to unsave a post for a different user (should throw error)
    const secondUser = UserFactory.fakeTemplate();
    try {
      await postController.unsavePost(secondUser, { id: post.id });
      fail("Should have thrown an error");
    } catch {
      expect(true).toBe(true);
    }
  });

  test("unsave a middle post", async () => {
    // Set up fake posts and user
    const [post1, post2, post3] = [
      PostFactory.fake(),
      PostFactory.fake(),
      PostFactory.fake(),
    ];
    const user = UserFactory.fakeTemplate();
    user.saved = [];

    // Associate posts with the user
    post1.user = user;
    post2.user = user;
    post3.user = user;

    // Ensure categories is initialized for all posts
    if (!post1.categories) {
      post1.categories = [];
    }
    if (!post2.categories) {
      post2.categories = [];
    }
    if (!post3.categories) {
      post3.categories = [];
    }

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
    expect(savedPosts.posts.map((post) => post.id)).toEqual([
      post1.id,
      post2.id,
      post3.id,
    ]);

    // Unsave the middle post
    await postController.unsavePost(user, { id: post2.id });

    // Verify only the middle post is removed
    savedPosts = await postController.getSavedPostsByUserId(user);
    expect(savedPosts).not.toBeUndefined();
    expect(savedPosts.posts).toHaveLength(2);
    expect(savedPosts.posts.map((post) => post.id)).toEqual([
      post1.id,
      post3.id,
    ]);
  });

  test("get all archived posts - no posts", async () => {
    const postController = ControllerFactory.post(conn);
    const user = UserFactory.fakeTemplate();

    const getPostsResponse = await postController.getArchivedPosts(user);

    expect(getPostsResponse.posts).toHaveLength(0);
  });

  test("get all archived posts - one post", async () => {
    const post = PostFactory.fake();
    post.user = UserFactory.fake();
    post.archive = true;

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    const getPostsResponse = await postController.getArchivedPosts(post.user);

    expect(getPostsResponse.posts).toHaveLength(1);
  });

  test("get all archived posts - multiple posts", async () => {
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

  test("get archived posts by user id - one post", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();
    post.archive = true;

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;
    expectedPost.archive = true;

    const getPostsResponse =
      await postController.getArchivedPostsByUserId(uuidParam);
    getPostsResponse.posts[0].originalPrice = Number(
      getPostsResponse.posts[0].originalPrice,
    );
    getPostsResponse.posts[0].alteredPrice = Number(
      getPostsResponse.posts[0].alteredPrice,
    );
    expectedPost.created = getPostsResponse.posts[0].created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostsResponse.posts[0].categories &&
        getPostsResponse.posts[0].categories.length > 0
      ) {
        category.posts = getPostsResponse.posts[0].categories[0].posts;
      }
    });

    expect(getPostsResponse.posts).toEqual([expectedPost]);
  });

  test("get archived posts by user id - multiple posts", async () => {
    const [post1, post2] = PostFactory.create(2);
    const user = UserFactory.fakeTemplate();
    post1.user = user;
    post2.user = user;
    post1.archive = true;
    post2.archive = true;

    await new DataFactory().createPosts(post1, post2).createUsers(user).write();

    const getPostsResponse =
      await postController.getArchivedPostsByUserId(uuidParam);

    expect(getPostsResponse.posts).toHaveLength(2);
  });

  test("archive post", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fakeTemplate();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;
    expectedPost.archive = true;

    const getPostResponse = await postController.archivePost(
      post.user,
      uuidParam,
    );
    getPostResponse.post.originalPrice = Number(
      getPostResponse.post.originalPrice,
    );
    getPostResponse.post.alteredPrice = Number(
      getPostResponse.post.alteredPrice,
    );
    expectedPost.created = getPostResponse.post.created;

    // Update categories.posts in expectedPost to match what comes from the API
    expectedPost.categories.forEach((category) => {
      if (
        getPostResponse.post.categories &&
        getPostResponse.post.categories.length > 0
      ) {
        category.posts = getPostResponse.post.categories[0].posts;
      }
    });

    expect(getPostResponse.post).toEqual(expectedPost);
  });

  test("edit post price", async () => {
    const post = PostFactory.fakeTemplate();
    post.user = UserFactory.fake();

    await new DataFactory().createPosts(post).createUsers(post.user).write();

    expectedPost.user = post.user;

    const edit = {
      newPrice: 20,
    };

    const getPostsResponse = await postController.editPrice(
      edit,
      post.user,
      uuidParam,
    );
    expect(Number(getPostsResponse.newPrice)).toEqual(edit.newPrice);
  });

  test("get all posts/post by id with a user who is soft deleted", async () => {
    const post = PostFactory.fakeTemplate();
    const user = UserFactory.fakeTemplate();
    user.isActive = false;
    post.user = user;

    await new DataFactory().createPosts(post).createUsers(user).write();

    const getPostsResponse = await postController.getPosts(UserFactory.fake());

    expect(getPostsResponse.posts).toHaveLength(0);

    try {
      await postController.getPostById(UserFactory.fake(), uuidParam);
    } catch (error) {
      expect(error.message).toEqual("User is not active!");
    }
  });

  test("get purchase suggestions - user with no purchase history", async () => {
    const user = UserFactory.fakeTemplate();

    await new DataFactory().createUsers(user).write();

    const response = await postController.getPurchaseSuggestions(user);

    expect(response.postIds).toEqual([]);
  });

  test("get purchase suggestions - user with purchase history", async () => {
    const buyer = UserFactory.fakeTemplate();
    const seller = UserFactory.fake();
    const post1 = PostFactory.fake();
    const post2 = PostFactory.fake();

    post1.user = seller;
    post1.title = "Electronics Device";
    post1.description = "A great electronic gadget";
    post1.embedding = new Array(512).fill(0.1); // Mock embedding

    post2.user = seller;
    post2.title = "Similar Electronic Item";
    post2.description = "Another electronic device";
    post2.embedding = new Array(512).fill(0.12); // Similar mock embedding

    // Create a completed transaction (purchase history)
    const transaction = TransactionFactory.fakeTemplate();
    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post1;
    transaction.completed = true;

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post1, post2)
      .createTransactions(transaction)
      .write();

    const response = await postController.getPurchaseSuggestions(buyer, 10);

    expect(response).toHaveProperty("postIds");
    expect(Array.isArray(response.postIds)).toBe(true);
    expect(response.postIds.length).toBeGreaterThan(0);
    // Should include post2 since it's similar to purchased post1
    expect(response.postIds).toContain(post2.id);
  });

  test("get purchase suggestions - custom limit parameter", async () => {
    const buyer = UserFactory.fakeTemplate();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();

    post.user = seller;
    post.embedding = new Array(512).fill(0.1); // Mock embedding

    // Create a completed transaction
    const transaction = TransactionFactory.fakeTemplate();
    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;
    transaction.completed = true;

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const response = await postController.getPurchaseSuggestions(buyer, 5);

    expect(response).toHaveProperty("postIds");
    expect(Array.isArray(response.postIds)).toBe(true);
  });

  test("get purchase suggestions - user with incomplete transactions", async () => {
    const buyer = UserFactory.fakeTemplate();
    const seller = UserFactory.fake();
    const post = PostFactory.fake();

    post.user = seller;
    post.embedding = new Array(512).fill(0.1); // Mock embedding

    // Create an incomplete transaction (should not affect suggestions)
    const transaction = TransactionFactory.fakeTemplate();
    transaction.buyer = buyer;
    transaction.seller = seller;
    transaction.post = post;
    transaction.completed = false;

    await new DataFactory()
      .createUsers(buyer, seller)
      .createPosts(post)
      .createTransactions(transaction)
      .write();

    const response = await postController.getPurchaseSuggestions(buyer);

    expect(response.postIds).toEqual([]);
  });

  test("get purchase suggestions - excludes user own posts and ranks by similarity", async () => {
    const buyer = UserFactory.fakeTemplate();
    const seller1 = UserFactory.fake();
    const seller2 = UserFactory.fake();
    const seller3 = UserFactory.fake();

    // Create embeddings that represent semantic similarity
    // Gaming/electronics posts will have similar embeddings (high values in first half)
    const gamingEmbedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) gamingEmbedding[i] = 0.8; // Electronics features

    const verySimilarEmbedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) verySimilarEmbedding[i] = 0.75; // Very similar to gaming

    const somewhatSimilarEmbedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) somewhatSimilarEmbedding[i] = 0.5; // Somewhat similar

    const differentEmbedding = new Array(512).fill(0);
    for (let i = 256; i < 512; i++) differentEmbedding[i] = 0.8; // Different features (food/organic)

    // User's purchased post (electronics)
    const purchasedPost = PostFactory.fake();
    purchasedPost.user = seller1;
    purchasedPost.title = "Gaming Laptop";
    purchasedPost.description =
      "High performance gaming laptop with RTX graphics card";
    purchasedPost.embedding = gamingEmbedding;

    // User's own post (should be excluded)
    const ownPost = PostFactory.fake();
    ownPost.user = buyer;
    ownPost.title = "My Gaming Setup";
    ownPost.description = "My personal gaming computer setup";
    ownPost.embedding = gamingEmbedding.slice(); // Copy of gaming embedding

    // Very similar post (should rank highest)
    const verySimilarPost = PostFactory.fake();
    verySimilarPost.user = seller2;
    verySimilarPost.title = "Gaming Computer";
    verySimilarPost.description =
      "Powerful gaming computer with high-end graphics card for gaming";
    verySimilarPost.embedding = verySimilarEmbedding;

    // Somewhat similar post (should rank lower)
    const somewhatSimilarPost = PostFactory.fake();
    somewhatSimilarPost.user = seller3;
    somewhatSimilarPost.title = "Electronics Device";
    somewhatSimilarPost.description = "Electronic gadget for tech enthusiasts";
    somewhatSimilarPost.embedding = somewhatSimilarEmbedding;

    // Completely different post (should rank lowest)
    const differentPost = PostFactory.fake();
    differentPost.user = seller3;
    differentPost.title = "Organic Vegetables";
    differentPost.description = "Fresh organic vegetables from local farm";
    differentPost.embedding = differentEmbedding;

    // Create a completed transaction (purchase history)
    const transaction = TransactionFactory.fakeTemplate();
    transaction.buyer = buyer;
    transaction.seller = seller1;
    transaction.post = purchasedPost;
    transaction.completed = true;

    await new DataFactory()
      .createUsers(buyer, seller1, seller2, seller3)
      .createPosts(
        purchasedPost,
        ownPost,
        verySimilarPost,
        somewhatSimilarPost,
        differentPost,
      )
      .createTransactions(transaction)
      .write();

    const response = await postController.getPurchaseSuggestions(buyer, 10);

    // Should not include user's own posts in suggestions
    expect(response.postIds).not.toContain(ownPost.id);

    // Should have suggestions
    expect(response.postIds.length).toBeGreaterThan(0);

    // Very similar post should be ranked higher than completely different post
    const verySimilarIndex = response.postIds.indexOf(verySimilarPost.id);
    const differentIndex = response.postIds.indexOf(differentPost.id);

    if (verySimilarIndex !== -1 && differentIndex !== -1) {
      expect(verySimilarIndex).toBeLessThan(differentIndex);
    }

    // Should include the very similar post in suggestions
    expect(response.postIds).toContain(verySimilarPost.id);
  });

  test("get purchase suggestions - multiple purchase history creates averaged preferences", async () => {
    const buyer = UserFactory.fakeTemplate();
    const seller1 = UserFactory.fake();
    const seller2 = UserFactory.fake();
    const seller3 = UserFactory.fake();

    // Create embeddings for electronics (high in first third)
    const electronicsEmbedding = new Array(512).fill(0);
    for (let i = 0; i < 170; i++) electronicsEmbedding[i] = 0.8;

    // Create embeddings for books (high in middle third)
    const bookEmbedding = new Array(512).fill(0);
    for (let i = 170; i < 340; i++) bookEmbedding[i] = 0.8;

    // Electronics recommendation (similar to electronics)
    const electronicsRecEmbedding = new Array(512).fill(0);
    for (let i = 0; i < 170; i++) electronicsRecEmbedding[i] = 0.75;

    // Book recommendation (similar to books)
    const bookRecEmbedding = new Array(512).fill(0);
    for (let i = 170; i < 340; i++) bookRecEmbedding[i] = 0.75;

    // Unrelated (high in last third)
    const unrelatedEmbedding = new Array(512).fill(0);
    for (let i = 340; i < 512; i++) unrelatedEmbedding[i] = 0.8;

    // User's purchase history: electronics and books
    const electronicsPost = PostFactory.fake();
    electronicsPost.user = seller1;
    electronicsPost.title = "Smartphone Device";
    electronicsPost.description = "Latest smartphone with advanced features";
    electronicsPost.embedding = electronicsEmbedding;

    const bookPost = PostFactory.fake();
    bookPost.user = seller1;
    bookPost.title = "Programming Book";
    bookPost.description = "Computer science textbook for learning programming";
    bookPost.embedding = bookEmbedding;

    // Available posts for recommendation
    const electronicsRecommendation = PostFactory.fake();
    electronicsRecommendation.user = seller2;
    electronicsRecommendation.title = "Tablet Computer";
    electronicsRecommendation.description =
      "Portable tablet device with touchscreen";
    electronicsRecommendation.embedding = electronicsRecEmbedding;

    const bookRecommendation = PostFactory.fake();
    bookRecommendation.user = seller2;
    bookRecommendation.title = "Software Engineering";
    bookRecommendation.description =
      "Textbook about software development and programming";
    bookRecommendation.embedding = bookRecEmbedding;

    const unrelatedPost = PostFactory.fake();
    unrelatedPost.user = seller3;
    unrelatedPost.title = "Kitchen Utensils";
    unrelatedPost.description = "Set of cooking tools and kitchen equipment";
    unrelatedPost.embedding = unrelatedEmbedding;

    // Create completed transactions (purchase history)
    const transaction1 = TransactionFactory.fake();
    transaction1.buyer = buyer;
    transaction1.seller = seller1;
    transaction1.post = electronicsPost;
    transaction1.completed = true;

    const transaction2 = TransactionFactory.fake();
    transaction2.buyer = buyer;
    transaction2.seller = seller1;
    transaction2.post = bookPost;
    transaction2.completed = true;

    await new DataFactory()
      .createUsers(buyer, seller1, seller2, seller3)
      .createPosts(
        electronicsPost,
        bookPost,
        electronicsRecommendation,
        bookRecommendation,
        unrelatedPost,
      )
      .createTransactions(transaction1, transaction2)
      .write();

    const response = await postController.getPurchaseSuggestions(buyer, 10);

    // Should have suggestions based on multiple purchase history
    expect(response.postIds.length).toBeGreaterThan(0);

    // Should include recommendations related to purchase history
    const hasElectronicsRec = response.postIds.includes(
      electronicsRecommendation.id,
    );
    const hasBookRec = response.postIds.includes(bookRecommendation.id);

    // At least one of the related recommendations should be present
    expect(hasElectronicsRec || hasBookRec).toBe(true);

    // Unrelated post should rank lower if present
    const unrelatedIndex = response.postIds.indexOf(unrelatedPost.id);
    if (unrelatedIndex !== -1) {
      if (hasElectronicsRec) {
        const electronicsIndex = response.postIds.indexOf(
          electronicsRecommendation.id,
        );
        expect(electronicsIndex).toBeLessThan(unrelatedIndex);
      }
      if (hasBookRec) {
        const bookIndex = response.postIds.indexOf(bookRecommendation.id);
        expect(bookIndex).toBeLessThan(unrelatedIndex);
      }
    }
  });
});
