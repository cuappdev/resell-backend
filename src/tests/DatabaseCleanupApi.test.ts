import "reflect-metadata";
import { Server } from "http";
import fetch from "node-fetch";
import { createExpressServer, useContainer } from "routing-controllers";
import { Connection, createConnection } from "typeorm";
import { PostController } from "../api/controllers/PostController";
import { UserController } from "../api/controllers/UserController";
import { ReportController } from "../api/controllers/ReportController";
import { ErrorHandler } from "../api/middlewares/ErrorHandler";
import { models } from "../models";
import { UserModel } from "../models/UserModel";
import { PostService } from "../services/PostService";
import { UserService } from "../services/UserService";
import { ReportService } from "../services/ReportService";
import { NotifService } from "../services/NotifService";
import { uploadImage } from "../utils/Requests";
import { embedText } from "../utils/EmbeddingService";

// Never import app.ts, credentials, shared test bootstrap, or historical migrations.
jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({ collection: jest.fn(() => ({})) })),
}));
jest.mock("../utils/Requests", () => ({ uploadImage: jest.fn() }));
jest.mock("../services/NotifService", () => ({
  NotifService: jest.fn(() => ({
    sendNotifs: jest.fn().mockResolvedValue([]),
  })),
}));
jest.mock("../services/SearchService", () => ({ SearchService: jest.fn() }));
jest.mock("../utils/EmbeddingService", () => ({ embedText: jest.fn() }));

const testUrl = process.env.MIGRATION_TEST_DATABASE_URL;
const apiTests = testUrl ? describe : describe.skip;
const postId = "00000000-0000-4000-8000-000000000001";
// A private schema also isolates the repository's unqualified savedAt UPDATE.
const schema = `cleanup_api_${process.pid}_${Date.now()}`;

function assertDedicatedLocalDatabase(rawUrl: string): void {
  const url = new URL(rawUrl);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    !["localhost", "127.0.0.1", "[::1]"].includes(url.hostname) ||
    url.pathname !== "/resell_migration_cleanup_test" ||
    url.search ||
    url.hash
  ) {
    throw new Error(
      "API smoke tests require the dedicated loopback resell_migration_cleanup_test database without URL options.",
    );
  }
}

apiTests(
  "database cleanup API smoke checks (local SQL, mocked identity/external services)",
  () => {
    let connection: Connection;
    let server: Server | undefined;
    let baseUrl: string;
    let authenticatedUser: UserModel;
    let logSpy: jest.SpyInstance;
    let errorSpy: jest.SpyInstance;

    beforeAll(async () => {
      if (!testUrl) throw new Error("MIGRATION_TEST_DATABASE_URL is required.");
      assertDedicatedLocalDatabase(testUrl);
      connection = await createConnection({
        name: "database-cleanup-api-tests",
        type: "postgres",
        url: testUrl,
        schema,
        entities: models,
        synchronize: false,
        migrationsRun: false,
        installExtensions: false,
        logging: false,
        extra: {
          max: 1,
          options: `-c search_path=${schema},pg_catalog -c timezone=UTC -c statement_timeout=5000`,
        },
      });
      const [identity] = await connection.query(
        `SELECT current_database() AS name, inet_server_addr()::text AS address`,
      );
      if (
        identity.name !== "resell_migration_cleanup_test" ||
        !["127.0.0.1/32", "::1/128", "127.0.0.1", "::1"].includes(
          identity.address,
        )
      ) {
        await connection.close();
        throw new Error(
          "Connected database is not the dedicated loopback API test database.",
        );
      }
      await connection.query(`CREATE SCHEMA "${schema}"`);
      const [namespace] = await connection.query(
        `SELECT current_schema() AS name`,
      );
      expect(namespace.name).toBe(schema);
      // Only columns/tables used by these routes; no entity synchronization or vector extension.
      await connection.query(`
      CREATE TABLE "User" (
        "firebaseUid" varchar PRIMARY KEY, username varchar NOT NULL UNIQUE,
        netid varchar, "givenName" varchar, "familyName" varchar,
        admin boolean NOT NULL DEFAULT false, "isActive" boolean NOT NULL DEFAULT true,
        stars numeric NOT NULL DEFAULT 0, "numReviews" integer NOT NULL DEFAULT 0,
        "soldPosts" integer NOT NULL DEFAULT 0, "photoUrl" varchar, "venmoHandle" varchar,
        email varchar NOT NULL UNIQUE, "googleId" varchar, bio text NOT NULL DEFAULT '', "availabilityId" varchar
      );
      CREATE TABLE "Post" (
        id uuid PRIMARY KEY, title varchar NOT NULL, description varchar NOT NULL,
        condition varchar NOT NULL, "originalPrice" numeric NOT NULL, "alteredPrice" numeric NOT NULL,
        images text[] NOT NULL, created timestamptz NOT NULL DEFAULT now(), location varchar,
        archive boolean NOT NULL DEFAULT false, embedding float8[], "similarPostIds" uuid[],
        "userId" varchar REFERENCES "User"("firebaseUid") ON DELETE CASCADE,
        sold boolean NOT NULL DEFAULT false
      );
      CREATE TABLE "userSavedPosts" (
        saved uuid NOT NULL REFERENCES "Post"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        savers varchar NOT NULL REFERENCES "User"("firebaseUid"),
        "savedAt" timestamptz DEFAULT now(), PRIMARY KEY(saved, savers)
      );
      CREATE TABLE "userBlockingUsers" (
        blockers varchar NOT NULL REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE,
        blocking varchar NOT NULL REFERENCES "User"("firebaseUid"), PRIMARY KEY(blockers, blocking)
      );
      CREATE TABLE user_following_users (
        follower_id varchar NOT NULL REFERENCES "User"("firebaseUid"),
        following_id varchar NOT NULL REFERENCES "User"("firebaseUid"), PRIMARY KEY(follower_id, following_id)
      );
      CREATE TABLE "Category" (id uuid PRIMARY KEY, name varchar NOT NULL);
      CREATE TABLE "EventTag" (id uuid PRIMARY KEY, name varchar NOT NULL);
      CREATE TABLE "postCategories" (posts uuid REFERENCES "Post"(id), categories uuid REFERENCES "Category"(id), PRIMARY KEY(posts, categories));
      CREATE TABLE "postEventTags" (posts uuid REFERENCES "Post"(id), "eventTags" uuid REFERENCES "EventTag"(id), PRIMARY KEY(posts, "eventTags"));
      CREATE TABLE "Message" (id uuid PRIMARY KEY);
      CREATE TABLE "Report" (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "reporterFirebaseUid" varchar REFERENCES "User"("firebaseUid"),
        "reportedFirebaseUid" varchar REFERENCES "User"("firebaseUid"),
        "postId" uuid REFERENCES "Post"(id), "messageId" uuid REFERENCES "Message"(id),
        reason varchar NOT NULL, type varchar NOT NULL, resolved boolean NOT NULL,
        created timestamptz NOT NULL DEFAULT now()
      );
    `);

      const instances = new Map<unknown, unknown>([
        [
          PostController,
          new PostController(new PostService(connection.manager)),
        ],
        [
          UserController,
          new UserController(new UserService(connection.manager)),
        ],
        [
          ReportController,
          new ReportController(new ReportService(connection.manager)),
        ],
      ]);
      useContainer(
        { get: <T>(target: unknown): T => instances.get(target) as T },
        { fallback: true },
      );
      const app = createExpressServer({
        routePrefix: "/api/",
        controllers: [PostController, UserController, ReportController],
        middlewares: [ErrorHandler],
        currentUserChecker: () => authenticatedUser,
        defaults: { paramOptions: { required: true } },
        validation: {
          whitelist: true,
          skipMissingProperties: true,
          forbidUnknownValues: true,
        },
        defaultErrorHandler: false,
      });
      server = await new Promise<Server>((resolve, reject) => {
        const localServer = app.listen(0, "127.0.0.1", () =>
          resolve(localServer),
        );
        localServer.once("error", reject);
      });
      const address = server.address();
      if (!address || typeof address === "string")
        throw new Error("Expected a loopback HTTP listener.");
      baseUrl = `http://127.0.0.1:${address.port}/api`;
      logSpy = jest.spyOn(console, "log").mockImplementation(() => undefined);
      errorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => undefined);
    });

    afterAll(async () => {
      if (server)
        await new Promise<void>((resolve, reject) =>
          server?.close((error) => (error ? reject(error) : resolve())),
        );
      if (connection?.isConnected) {
        await connection.query(`DROP SCHEMA IF EXISTS "${schema}" CASCADE`);
        await connection.close();
      }
      logSpy?.mockRestore();
      errorSpy?.mockRestore();
    });

    beforeEach(async () => {
      jest.clearAllMocks();
      await connection.query(
        `TRUNCATE "Report", "Message", "postCategories", "postEventTags", "userSavedPosts", "userBlockingUsers", user_following_users, "Post", "User"`,
      );
      await connection.query(`
      INSERT INTO "User" ("firebaseUid", username, email) VALUES
        ('viewer', 'viewer', 'viewer@example.test'), ('owner', 'owner', 'owner@example.test'), ('other', 'other', 'other@example.test');
      INSERT INTO "Post" (id, title, description, condition, "originalPrice", "alteredPrice", images, "userId")
        VALUES ('${postId}', 'Fixture listing', 'Only local test data', 'Never Used', 10, 10, '{}', 'owner');
    `);
      authenticatedUser = await connection
        .getRepository(UserModel)
        .findOneOrFail("viewer");
    });

    afterEach(() => {
      expect(uploadImage).not.toHaveBeenCalled();
      expect(embedText).not.toHaveBeenCalled();
    });

    async function request(path: string, body: unknown = {}, method = "POST") {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: { "Content-Type": "application/json" },
        body: method === "GET" ? undefined : JSON.stringify(body),
        timeout: 3000,
      });
      return { status: response.status, body: await response.json() };
    }

    test("save, repeated save, unsave and resave preserve one pair and a genuine timestamp", async () => {
      expect(
        (await request(`/post/isSaved/postId/${postId}/`, {}, "GET")).body,
      ).toEqual({ isSaved: false });
      expect((await request(`/post/save/postId/${postId}/`)).status).toBe(200);
      const [first] = await connection.query(
        `SELECT saved, savers, "savedAt" FROM "userSavedPosts"`,
      );
      expect(first).toMatchObject({ saved: postId, savers: "viewer" });
      expect(first.savedAt).toBeInstanceOf(Date);
      expect(NotifService).toHaveBeenCalledTimes(1);
      const firstNotification = (
        NotifService as jest.MockedClass<typeof NotifService>
      ).mock.results[0].value;
      expect(firstNotification.sendNotifs).toHaveBeenCalledTimes(1);
      expect(
        (await request(`/post/isSaved/postId/${postId}/`, {}, "GET")).body,
      ).toEqual({ isSaved: true });
      const saved = await request("/post/save/", {}, "GET");
      expect(saved.status).toBe(200);
      expect(saved.body.posts).toHaveLength(1);
      expect(saved.body.posts[0].id).toBe(postId);
      expect((await request(`/post/save/postId/${postId}/`)).status).toBe(200);
      const [duplicate] = await connection.query(
        `SELECT count(*)::integer AS count, min("savedAt") AS date FROM "userSavedPosts"`,
      );
      expect(duplicate.count).toBe(1);
      expect(duplicate.date.getTime()).toBeGreaterThanOrEqual(
        first.savedAt.getTime(),
      );
      expect((await request(`/post/unsave/postId/${postId}/`)).status).toBe(
        200,
      );
      expect(await connection.query(`SELECT * FROM "userSavedPosts"`)).toEqual(
        [],
      );
      expect(
        (await request(`/post/isSaved/postId/${postId}/`, {}, "GET")).body,
      ).toEqual({ isSaved: false });
      expect((await request("/post/save/", {}, "GET")).body).toEqual({
        posts: [],
      });
      expect((await request(`/post/unsave/postId/${postId}/`)).status).toBe(
        200,
      );
      expect((await request(`/post/save/postId/${postId}/`)).status).toBe(200);
      const [resaved] = await connection.query(
        `SELECT "savedAt" FROM "userSavedPosts"`,
      );
      expect(resaved.savedAt.getTime()).toBeGreaterThanOrEqual(
        first.savedAt.getTime(),
      );
    });

    test("unknown historical savedAt remains readable and a new save records a date", async () => {
      await connection.query(
        `INSERT INTO "userSavedPosts" (saved, savers, "savedAt") VALUES ($1, 'viewer', NULL)`,
        [postId],
      );
      const saved = await request("/post/save/", {}, "GET");
      expect(saved.status).toBe(200);
      expect(saved.body.posts.map((post: { id: string }) => post.id)).toEqual([
        postId,
      ]);
      expect(
        (await request(`/post/isSaved/postId/${postId}/`, {}, "GET")).body,
      ).toEqual({ isSaved: true });
      expect((await request(`/post/save/postId/${postId}/`)).status).toBe(200);
      const [row] = await connection.query(
        `SELECT "savedAt" FROM "userSavedPosts"`,
      );
      expect(row.savedAt).toBeInstanceOf(Date);
    });

    test("saving an unknown post returns 404 without inserting a relationship or sending messaging", async () => {
      expect(
        (
          await request(
            "/post/save/postId/00000000-0000-4000-8000-000000000099/",
          )
        ).status,
      ).toBe(404);
      expect(await connection.query(`SELECT * FROM "userSavedPosts"`)).toEqual(
        [],
      );
      expect(NotifService).not.toHaveBeenCalled();
    });

    test("block rejects repeats, unblock removes only the caller's pair, and reblock succeeds", async () => {
      await connection.query(
        `INSERT INTO "userBlockingUsers" VALUES ('other', 'owner')`,
      );
      expect((await request("/user/block/", { blocked: "owner" })).status).toBe(
        200,
      );
      expect((await request("/user/block/", { blocked: "owner" })).status).toBe(
        401,
      );
      expect(
        await connection.query(
          `SELECT * FROM "userBlockingUsers" WHERE blockers = 'viewer'`,
        ),
      ).toEqual([{ blockers: "viewer", blocking: "owner" }]);
      expect(
        (await request("/user/unblock/", { unblocked: "owner" })).status,
      ).toBe(200);
      expect(
        await connection.query(`SELECT * FROM "userBlockingUsers"`),
      ).toEqual([{ blockers: "other", blocking: "owner" }]);
      expect(
        (await request("/user/unblock/", { unblocked: "owner" })).status,
      ).toBe(401);
      expect((await request("/user/block/", { blocked: "owner" })).status).toBe(
        200,
      );
    });

    test("block rejects self and missing targets without leaving invalid relationships", async () => {
      expect(
        (await request("/user/block/", { blocked: "viewer" })).status,
      ).toBe(401);
      expect(
        (await request("/user/block/", { blocked: "missing" })).status,
      ).toBe(404);
      expect(
        await connection.query(`SELECT * FROM "userBlockingUsers"`),
      ).toEqual([]);
    });

    test("post and profile reports persist the current Firebase UID column names", async () => {
      const post = await request("/report/post/", {
        reported: "owner",
        post: postId,
        reason: "Fixture post report",
      });
      expect(post.status).toBe(200);
      expect(post.body).toMatchObject({
        type: "post",
        resolved: false,
        reporter: { firebaseUid: "viewer" },
        reported: { firebaseUid: "owner" },
      });
      expect(
        (
          await request("/report/profile/", {
            reported: "other",
            reason: "Fixture profile report",
          })
        ).status,
      ).toBe(200);
      const rows = await connection.query(
        `SELECT "reporterFirebaseUid", "reportedFirebaseUid", "postId", type FROM "Report" ORDER BY type`,
      );
      expect(rows).toEqual([
        {
          reporterFirebaseUid: "viewer",
          reportedFirebaseUid: "owner",
          postId,
          type: "post",
        },
        {
          reporterFirebaseUid: "viewer",
          reportedFirebaseUid: "other",
          postId: null,
          type: "profile",
        },
      ]);
    });

    test("invalid report ownership and missing target return errors without storing reports", async () => {
      expect(
        (
          await request("/report/post/", {
            reported: "other",
            post: postId,
            reason: "Wrong author",
          })
        ).status,
      ).toBe(403);
      expect(
        (
          await request("/report/profile/", {
            reported: "missing",
            reason: "Missing target",
          })
        ).status,
      ).toBe(404);
      expect(await connection.query(`SELECT * FROM "Report"`)).toEqual([]);
    });

    test.each([undefined, null, "", "   ", 123])(
      "invalid post condition %p produces the application's HTTP 400 body before writes",
      async (condition) => {
        const result = await request("/post/", {
          title: "Invalid fixture",
          condition,
        });
        expect(result).toEqual({
          status: 400,
          body: { error: "A post condition is required.", httpCode: 400 },
        });
        const [count] = await connection.query(
          `SELECT count(*)::integer AS count FROM "Post"`,
        );
        expect(count.count).toBe(1);
        expect(NotifService).not.toHaveBeenCalled();
      },
    );
  },
);
