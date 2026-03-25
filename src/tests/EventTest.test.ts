import { Connection } from "typeorm";

import { EventController } from "src/api/controllers/EventController";
import { PostController } from "src/api/controllers/PostController";
import { EventTagModel } from "../models/EventTagModel";
import { EventPostModel } from "../models/EventPostModel";
import { EventPostService } from "../services/EventPostService";
import { ControllerFactory } from "./controllers";
import { DatabaseConnection, DataFactory, PostFactory, UserFactory } from "./data";

let conn: Connection;
let eventController: EventController;
let postController: PostController;

beforeAll(async () => {
  await DatabaseConnection.connect();
});

beforeEach(async () => {
  await DatabaseConnection.clear();
  conn = await DatabaseConnection.connect();
  eventController = ControllerFactory.event(conn);
  postController = ControllerFactory.post(conn);
});

afterAll(async () => {
  await DatabaseConnection.close();
});

describe("getAvailableEventTags", () => {
  test("returns empty array when no event tags exist", async () => {
    const user = UserFactory.fakeTemplate();
    const result = await eventController.getAvailableEventTags(user);
    expect(result).toEqual([]);
  });

  test("returns all event tags ordered alphabetically", async () => {
    const tag1 = new EventTagModel();
    tag1.name = "SPRING_FAIR";

    const tag2 = new EventTagModel();
    tag2.name = "CLEARANCE";

    const tag3 = new EventTagModel();
    tag3.name = "HOLIDAY_SALE";

    await conn.manager.save([tag1, tag2, tag3]);

    const user = UserFactory.fakeTemplate();
    const result = await eventController.getAvailableEventTags(user);

    expect(result).toHaveLength(3);
    expect(result[0].name).toBe("CLEARANCE");
    expect(result[1].name).toBe("HOLIDAY_SALE");
    expect(result[2].name).toBe("SPRING_FAIR");
  });
});

describe("getEventPosts", () => {
  test("throws NotFoundError when event tag does not exist", async () => {
    const user = UserFactory.fakeTemplate();
    await new DataFactory().createUsers(user).write();

    await expect(
      eventController.getEventPosts(
        user,
        "00000000-0000-0000-0000-000000000000",
      ),
    ).rejects.toThrow("Event not found!");
  });

  test("returns empty posts when no relationships exist", async () => {
    const user = UserFactory.fakeTemplate();
    await new DataFactory().createUsers(user).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const result = await eventController.getEventPosts(user, tag.id);

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(10);
  });

  test("returns user-tagged posts for an event", async () => {
    const user = UserFactory.fakeTemplate();
    const post = PostFactory.fakeTemplate();
    post.user = user;

    await new DataFactory().createUsers(user).createPosts(post).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const relationship = new EventPostModel();
    relationship.postId = post.id;
    relationship.eventTagId = tag.id;
    relationship.source = "user";
    relationship.relevanceScore = null;
    await conn.manager.save(relationship);

    const result = await eventController.getEventPosts(user, tag.id);

    expect(result.posts).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(result.posts[0].id).toBe(post.id);
    expect(result.posts[0].source).toBe("user");
  });

  test("filters out posts from inactive users", async () => {
    const activeUser = UserFactory.fakeTemplate();

    const inactiveUser = UserFactory.fakeTemplate2();
    inactiveUser.isActive = false;

    const activePost = PostFactory.fakeTemplate();
    activePost.user = activeUser;

    const inactivePost = PostFactory.fake();
    inactivePost.user = inactiveUser;

    await new DataFactory()
      .createUsers(activeUser, inactiveUser)
      .createPosts(activePost, inactivePost)
      .write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const rel1 = new EventPostModel();
    rel1.postId = activePost.id;
    rel1.eventTagId = tag.id;
    rel1.source = "user";
    rel1.relevanceScore = null;

    const rel2 = new EventPostModel();
    rel2.postId = inactivePost.id;
    rel2.eventTagId = tag.id;
    rel2.source = "user";
    rel2.relevanceScore = null;

    await conn.manager.save([rel1, rel2]);

    const result = await eventController.getEventPosts(activeUser, tag.id);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(activePost.id);
  });

  test("filters out posts from blocked users", async () => {
    const currentUser = UserFactory.fakeTemplate();

    const blockedUser = UserFactory.fakeTemplate2();
    currentUser.blocking = [blockedUser];

    const normalPost = PostFactory.fakeTemplate();
    normalPost.user = currentUser;

    const blockedPost = PostFactory.fake();
    blockedPost.user = blockedUser;

    await new DataFactory()
      .createUsers(currentUser, blockedUser)
      .createPosts(normalPost, blockedPost)
      .write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const rel1 = new EventPostModel();
    rel1.postId = normalPost.id;
    rel1.eventTagId = tag.id;
    rel1.source = "user";
    rel1.relevanceScore = null;

    const rel2 = new EventPostModel();
    rel2.postId = blockedPost.id;
    rel2.eventTagId = tag.id;
    rel2.source = "user";
    rel2.relevanceScore = null;

    await conn.manager.save([rel1, rel2]);

    const result = await eventController.getEventPosts(currentUser, tag.id);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(normalPost.id);
  });

  test("paginates results correctly", async () => {
    const user = UserFactory.fakeTemplate();
    await new DataFactory().createUsers(user).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    // Create 3 posts and relationships
    const posts = PostFactory.create(3);
    for (const post of posts) {
      post.user = user;
    }
    await conn.manager.save(posts);

    const relationships = posts.map((post) => {
      const rel = new EventPostModel();
      rel.postId = post.id;
      rel.eventTagId = tag.id;
      rel.source = "user";
      rel.relevanceScore = null;
      return rel;
    });
    await conn.manager.save(relationships);

    const page1 = await eventController.getEventPosts(user, tag.id, 1, 2);
    expect(page1.posts).toHaveLength(2);
    expect(page1.total).toBe(3);
    expect(page1.page).toBe(1);
    expect(page1.limit).toBe(2);

    const page2 = await eventController.getEventPosts(user, tag.id, 2, 2);
    expect(page2.posts).toHaveLength(1);
    expect(page2.total).toBe(3);
    expect(page2.page).toBe(2);
  });

  test("filters by source when provided", async () => {
    const user = UserFactory.fakeTemplate();
    const post1 = PostFactory.fakeTemplate();
    post1.user = user;
    const post2 = PostFactory.fake();
    post2.user = user;

    await new DataFactory().createUsers(user).createPosts(post1, post2).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const userRel = new EventPostModel();
    userRel.postId = post1.id;
    userRel.eventTagId = tag.id;
    userRel.source = "user";
    userRel.relevanceScore = null;

    const simRel = new EventPostModel();
    simRel.postId = post2.id;
    simRel.eventTagId = tag.id;
    simRel.source = "similarity";
    simRel.relevanceScore = 0.85;

    await conn.manager.save([userRel, simRel]);

    const userOnly = await eventController.getEventPosts(user, tag.id, 1, 10, "user");
    expect(userOnly.posts).toHaveLength(1);
    expect(userOnly.posts[0].source).toBe("user");

    const simOnly = await eventController.getEventPosts(user, tag.id, 1, 10, "similarity");
    expect(simOnly.posts).toHaveLength(1);
    expect(simOnly.posts[0].source).toBe("similarity");
    expect(simOnly.posts[0].relevanceScore).toBeCloseTo(0.85);

    const all = await eventController.getEventPosts(user, tag.id);
    expect(all.posts).toHaveLength(2);
  });
});

describe("eventPosts integration", () => {
  test("createPost with event tags populates event feed", async () => {
    const user = UserFactory.fakeTemplate();
    await new DataFactory().createUsers(user).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const createResp = await postController.createPost(user, {
      title: "Spring Item",
      description: "For the spring fair",
      categories: [],
      eventTags: ["SPRING_FAIR"],
      condition: "NEW",
      originalPrice: 25.0,
      imagesBase64: [],
      userId: user.firebaseUid,
    });

    const result = await eventController.getEventPosts(user, tag.id);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(createResp.post.id);
    expect(result.posts[0].source).toBe("user");
    expect(result.posts[0].relevanceScore).toBeNull();
  });

  test("addEventTagsToPost populates event feed", async () => {
    const user = UserFactory.fakeTemplate();
    const post = PostFactory.fakeTemplate();
    post.user = user;

    await new DataFactory().createUsers(user).createPosts(post).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    await postController.addEventTagsToPost(
      user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );

    const result = await eventController.getEventPosts(user, tag.id);

    expect(result.posts).toHaveLength(1);
    expect(result.posts[0].id).toBe(post.id);
    expect(result.posts[0].source).toBe("user");
    expect(result.posts[0].relevanceScore).toBeNull();
  });

  test("removeEventTagsFromPost removes post from event feed", async () => {
    const user = UserFactory.fakeTemplate();
    const post = PostFactory.fakeTemplate();
    post.user = user;

    await new DataFactory().createUsers(user).createPosts(post).write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    await postController.addEventTagsToPost(
      user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );

    await postController.removeEventTagsFromPost(
      user,
      { id: post.id } as any,
      { eventTags: ["SPRING_FAIR"] },
    );

    const result = await eventController.getEventPosts(user, tag.id);

    expect(result.posts).toHaveLength(0);
    expect(result.total).toBe(0);
  });
});

describe("processEventSimilarity", () => {
  function withEnvOverride(fn: () => Promise<void>): Promise<void> {
    const orig = process.env.NODE_ENV;
    process.env.NODE_ENV = "integration";
    return fn().finally(() => { process.env.NODE_ENV = orig; });
  }

  test("creates similarity rows for matching posts and skips dissimilar ones", async () => {
    const user1 = UserFactory.fakeTemplate();
    const user2 = UserFactory.fake();

    // Anchor: first 256 dims active
    const anchorPost = PostFactory.fakeTemplate();
    anchorPost.user = user1;
    anchorPost.embedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) anchorPost.embedding[i] = 0.8;

    // Similar to anchor: same direction, different magnitude → cosine ≈ 1.0
    const similarPost = PostFactory.fake();
    similarPost.user = user2;
    similarPost.embedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) similarPost.embedding[i] = 0.75;

    // Orthogonal to anchor: last 256 dims active → cosine = 0
    const differentPost = PostFactory.fake();
    differentPost.user = user2;
    differentPost.embedding = new Array(512).fill(0);
    for (let i = 256; i < 512; i++) differentPost.embedding[i] = 0.8;

    await new DataFactory()
      .createUsers(user1, user2)
      .createPosts(anchorPost, similarPost, differentPost)
      .write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const userRel = new EventPostModel();
    userRel.postId = anchorPost.id;
    userRel.eventTagId = tag.id;
    userRel.source = "user";
    userRel.relevanceScore = null;
    await conn.manager.save(userRel);

    await withEnvOverride(async () => {
      const svc = new EventPostService(conn.manager);
      await svc.processEventSimilarity(tag.id);
    });

    const rows = await conn.manager.find(EventPostModel, {
      where: { eventTagId: tag.id },
    });

    // Anchor should still be user-tagged
    const anchorRow = rows.find(r => r.postId === anchorPost.id);
    expect(anchorRow).toBeDefined();
    expect(anchorRow!.source).toBe("user");

    // Similar post should have a similarity row with high score
    const simRow = rows.find(r => r.postId === similarPost.id);
    expect(simRow).toBeDefined();
    expect(simRow!.source).toBe("similarity");
    expect(simRow!.relevanceScore).toBeGreaterThan(0.7);

    // Orthogonal post should have no row (score ≈ 0, below threshold)
    const diffRow = rows.find(r => r.postId === differentPost.id);
    expect(diffRow).toBeUndefined();
  });

  test("does nothing when no user-tagged posts exist", async () => {
    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    await withEnvOverride(async () => {
      const svc = new EventPostService(conn.manager);
      await svc.processEventSimilarity(tag.id);
    });

    const count = await conn.manager.count(EventPostModel, {
      where: { eventTagId: tag.id },
    });
    expect(count).toBe(0);
  });

  test("is idempotent — re-running does not duplicate similarity rows", async () => {
    const user1 = UserFactory.fakeTemplate();
    const user2 = UserFactory.fake();

    const anchorPost = PostFactory.fakeTemplate();
    anchorPost.user = user1;
    anchorPost.embedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) anchorPost.embedding[i] = 0.8;

    const similarPost = PostFactory.fake();
    similarPost.user = user2;
    similarPost.embedding = new Array(512).fill(0);
    for (let i = 0; i < 256; i++) similarPost.embedding[i] = 0.75;

    await new DataFactory()
      .createUsers(user1, user2)
      .createPosts(anchorPost, similarPost)
      .write();

    const tag = new EventTagModel();
    tag.name = "SPRING_FAIR";
    await conn.manager.save(tag);

    const userRel = new EventPostModel();
    userRel.postId = anchorPost.id;
    userRel.eventTagId = tag.id;
    userRel.source = "user";
    userRel.relevanceScore = null;
    await conn.manager.save(userRel);

    await withEnvOverride(async () => {
      const svc = new EventPostService(conn.manager);
      await svc.processEventSimilarity(tag.id);
      await svc.processEventSimilarity(tag.id);
    });

    const simRows = await conn.manager.find(EventPostModel, {
      where: { eventTagId: tag.id, source: "similarity" as any },
    });
    expect(simRows).toHaveLength(1);
    expect(simRows[0].postId).toBe(similarPost.id);
  });
});
