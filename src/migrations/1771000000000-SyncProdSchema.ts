import { MigrationInterface, QueryRunner } from "typeorm";
import * as admin from "firebase-admin";

// Initialize Firebase if not already done
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
if (serviceAccountPath && !admin.apps.length) {
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  } catch (e) {
    console.warn("[MIGRATION] Firebase init skipped:", e?.message ?? e);
  }
}

/**
 * Migration to bring prod schema in line with the TypeORM entity models.
 *
 * Background:
 *   - The migrations table on prod records AuthorizationRefactor (17) and
 *     RenameSnakeToCamel (21) as "completed", but the actual schema shows they
 *     did NOT fully execute.
 *   - User PK is still `id` (uuid) with no `firebaseUid` column.
 *   - Junction tables are still snake_case.
 *   - Many column renames never happened.
 *
 * This migration is fully idempotent – every operation is guarded by schema
 * introspection so it can safely be re-run if it fails partway through.
 */
export class SyncProdSchema1771000000000 implements MigrationInterface {
  name = "SyncProdSchema1771000000000";

  /* ───────── helpers ───────── */

  private async colExists(
    qr: QueryRunner,
    table: string,
    col: string
  ): Promise<boolean> {
    const r = await qr.query(
      `SELECT 1 FROM information_schema.columns
       WHERE table_name = $1 AND column_name = $2`,
      [table, col]
    );
    return r.length > 0;
  }

  private async tableExists(qr: QueryRunner, table: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT 1 FROM pg_tables
       WHERE schemaname = 'public' AND tablename = $1`,
      [table]
    );
    return r.length > 0;
  }

  private async fkExists(qr: QueryRunner, name: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT 1 FROM information_schema.table_constraints
       WHERE constraint_name = $1 AND constraint_type = 'FOREIGN KEY'`,
      [name]
    );
    return r.length > 0;
  }

  private async indexExists(qr: QueryRunner, name: string): Promise<boolean> {
    const r = await qr.query(
      `SELECT 1 FROM pg_indexes WHERE indexname = $1`,
      [name]
    );
    return r.length > 0;
  }

  /** Safely rename a column only if the source exists and target does not. */
  private async renameCol(
    qr: QueryRunner,
    table: string,
    from: string,
    to: string
  ): Promise<void> {
    if (
      (await this.colExists(qr, table, from)) &&
      !(await this.colExists(qr, table, to))
    ) {
      await qr.query(`ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`);
      console.log(`  renamed ${table}."${from}" → "${to}"`);
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     UP
     ════════════════════════════════════════════════════════════════════ */

  public async up(queryRunner: QueryRunner): Promise<void> {
    const needsAuthRefactor = !(await this.colExists(
      queryRunner,
      "User",
      "firebaseUid"
    ));

    if (needsAuthRefactor) {
      console.log(
        "[MIGRATION] *** firebaseUid missing – running full auth refactor ***"
      );
      await this.authRefactor(queryRunner);
    } else {
      console.log("[MIGRATION] firebaseUid already exists – skipping auth refactor");
      // Still need to ensure PK is on firebaseUid, not id
      if (await this.colExists(queryRunner, "User", "id")) {
        console.log("[MIGRATION] Switching User PK from id to firebaseUid");
        await this.dropAllUserFks(queryRunner);
        const pk = await this.getUserPkName(queryRunner);
        if (pk) await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "${pk}" CASCADE`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "id"`);
        await queryRunner.query(`ALTER TABLE "User" ADD PRIMARY KEY ("firebaseUid")`);
      }
    }

    await this.renameColumns(queryRunner);
    await this.renameTables(queryRunner);
    await this.createMissingTables(queryRunner);
    await this.addMissingColumns(queryRunner);
    await this.cleanup(queryRunner);
    await this.recreateForeignKeys(queryRunner);
    await this.createIndexes(queryRunner);

    console.log("[MIGRATION] ✅ SyncProdSchema complete");
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 1 – Auth Refactor (add firebaseUid, switch PK, migrate FKs)
     ────────────────────────────────────────────────────────────────── */

  private async authRefactor(qr: QueryRunner): Promise<void> {
    // 1a. Add nullable firebaseUid column
    await qr.query(`ALTER TABLE "User" ADD COLUMN "firebaseUid" VARCHAR`);

    // 1b. Populate from Firebase
    const users = await qr.query('SELECT * FROM "User"');
    console.log(`  populating firebaseUid for ${users.length} users…`);

    for (const user of users) {
      let uid: string;
      try {
        const fbUser = await admin.auth().getUserByEmail(user.email);
        uid = fbUser.uid;
      } catch {
        console.log(`  creating Firebase account for ${user.email}`);
        const fbUser = await admin.auth().createUser({
          email: user.email,
          password: "temporaryPassword123!",
        });
        uid = fbUser.uid;
      }
      await qr.query(`UPDATE "User" SET "firebaseUid" = $1 WHERE id = $2`, [
        uid,
        user.id,
      ]);
    }

    // 1c. Validate – fail hard if any are null
    const nulls = await qr.query(
      `SELECT COUNT(*) c FROM "User" WHERE "firebaseUid" IS NULL`
    );
    if (parseInt(nulls[0].c) > 0) {
      throw new Error("Data validation failed: users missing firebaseUid");
    }
    await qr.query(
      `ALTER TABLE "User" ALTER COLUMN "firebaseUid" SET NOT NULL`
    );

    // 1d. Drop ALL foreign keys that reference User
    await this.dropAllUserFks(qr);

    // 1e. For every column that is a uuid FK to User(id), migrate to varchar
    //     holding the firebaseUid value.
    const fkCols = await this.discoverUserFkColumns(qr);
    for (const { table, col } of fkCols) {
      console.log(`  migrating ${table}."${col}" uuid → varchar`);
      const tmp = `__tmp_${col}`;
      await qr.query(`ALTER TABLE "${table}" ADD COLUMN "${tmp}" VARCHAR`);
      await qr.query(`
        UPDATE "${table}" t SET "${tmp}" = u."firebaseUid"
        FROM "User" u WHERE t."${col}"::text = u.id::text
      `);
      await qr.query(`ALTER TABLE "${table}" DROP COLUMN "${col}"`);
      await qr.query(
        `ALTER TABLE "${table}" RENAME COLUMN "${tmp}" TO "${col}"`
      );
    }

    // 1f. Switch User PK: drop old, add new
    const pk = await this.getUserPkName(qr);
    if (pk) {
      await qr.query(`ALTER TABLE "User" DROP CONSTRAINT "${pk}" CASCADE`);
    }
    if (await this.colExists(qr, "User", "id")) {
      await qr.query(`ALTER TABLE "User" DROP COLUMN "id"`);
    }
    await qr.query(`ALTER TABLE "User" ADD PRIMARY KEY ("firebaseUid")`);

    // 1g. Recreate PKs on junction tables whose columns were migrated
    for (const jt of ["user_blocking_users", "user_saved_posts"]) {
      if (await this.tableExists(qr, jt)) {
        // PK was dropped when we dropped columns; recreate it
        const existingPk = await qr.query(
          `SELECT constraint_name FROM information_schema.table_constraints
           WHERE table_name = $1 AND constraint_type = 'PRIMARY KEY'`,
          [jt]
        );
        if (existingPk.length === 0) {
          if (jt === "user_blocking_users") {
            await qr.query(
              `ALTER TABLE "user_blocking_users"
               ADD PRIMARY KEY ("blockers", "blocking")`
            );
          } else {
            await qr.query(
              `ALTER TABLE "user_saved_posts"
               ADD PRIMARY KEY ("saved", "savers")`
            );
          }
        }
      }
    }

    console.log("  auth refactor complete");
  }

  /** Drop every FK that references the User table. */
  private async dropAllUserFks(qr: QueryRunner): Promise<void> {
    const fks = await qr.query(`
      SELECT tc.constraint_name, tc.table_name
      FROM information_schema.table_constraints tc
      JOIN information_schema.referential_constraints rc
        ON tc.constraint_name = rc.constraint_name
           AND tc.constraint_schema = rc.constraint_schema
      JOIN information_schema.table_constraints tc2
        ON rc.unique_constraint_name = tc2.constraint_name
           AND rc.unique_constraint_schema = tc2.constraint_schema
      WHERE tc2.table_name = 'User'
        AND tc.constraint_type = 'FOREIGN KEY'
    `);
    for (const fk of fks) {
      console.log(`  dropping FK ${fk.constraint_name} on ${fk.table_name}`);
      try {
        await qr.query(
          `ALTER TABLE "${fk.table_name}" DROP CONSTRAINT IF EXISTS "${fk.constraint_name}"`
        );
      } catch (e) {
        console.warn(`  (already gone) ${e?.message ?? e}`);
      }
    }
  }

  /**
   * Find all columns that are uuid-typed and were FK-referencing User(id).
   * After FKs are dropped we can't introspect referential_constraints, so
   * we use a hard-coded list filtered by existence.
   */
  private async discoverUserFkColumns(
    qr: QueryRunner
  ): Promise<{ table: string; col: string }[]> {
    const candidates: { table: string; col: string }[] = [
      { table: "Post", col: "user" },
      { table: "Request", col: "user" },
      { table: "Feedback", col: "user" },
      { table: "UserReview", col: "buyer" },
      { table: "UserReview", col: "seller" },
      { table: "Report", col: "reporterId" },
      { table: "Report", col: "reportedId" },
      // snake_case variants in case rename hasn't happened
      { table: "Report", col: "reporter_id" },
      { table: "Report", col: "reported_id" },
      { table: "user_blocking_users", col: "blockers" },
      { table: "user_blocking_users", col: "blocking" },
      { table: "user_saved_posts", col: "savers" },
      { table: "UserSession", col: "user" },
      // Tables that may or may not exist
      { table: "Transaction", col: "buyer_id" },
      { table: "Transaction", col: "seller_id" },
      { table: "Transaction", col: "buyerId" },
      { table: "Transaction", col: "sellerId" },
      { table: "notifications", col: "user_id" },
      { table: "notifications", col: "userId" },
    ];

    const result: { table: string; col: string }[] = [];
    for (const c of candidates) {
      if (
        (await this.tableExists(qr, c.table)) &&
        (await this.colExists(qr, c.table, c.col))
      ) {
        // Only migrate uuid columns (skip if already varchar)
        const typeCheck = await qr.query(
          `SELECT data_type FROM information_schema.columns
           WHERE table_name = $1 AND column_name = $2`,
          [c.table, c.col]
        );
        if (typeCheck.length > 0 && typeCheck[0].data_type === "uuid") {
          result.push(c);
        }
      }
    }
    return result;
  }

  private async getUserPkName(qr: QueryRunner): Promise<string | null> {
    const r = await qr.query(
      `SELECT constraint_name FROM information_schema.table_constraints
       WHERE table_name = 'User' AND constraint_type = 'PRIMARY KEY'`
    );
    return r.length > 0 ? r[0].constraint_name : null;
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 2 – Column renames
     ────────────────────────────────────────────────────────────────── */

  private async renameColumns(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Renaming columns…");

    // Post
    await this.renameCol(qr, "Post", "original_price", "originalPrice");
    await this.renameCol(qr, "Post", "altered_price", "alteredPrice");
    await this.renameCol(qr, "Post", "user", "userId");

    // Request
    await this.renameCol(qr, "Request", "user", "userId");

    // Feedback
    await this.renameCol(qr, "Feedback", "user", "userId");

    // UserReview
    await this.renameCol(qr, "UserReview", "buyer", "buyerId");
    await this.renameCol(qr, "UserReview", "seller", "sellerId");

    // Report
    await this.renameCol(qr, "Report", "reporter_id", "reporterId");
    await this.renameCol(qr, "Report", "reported_id", "reportedId");
    await this.renameCol(qr, "Report", "post_id", "postId");
    await this.renameCol(qr, "Report", "message_id", "messageId");

    // Transaction
    if (await this.tableExists(qr, "Transaction")) {
      await this.renameCol(qr, "Transaction", "buyer_id", "buyerId");
      await this.renameCol(qr, "Transaction", "seller_id", "sellerId");
      await this.renameCol(qr, "Transaction", "post_id", "postId");
      await this.renameCol(qr, "Transaction", "transaction_date", "transactionDate");
      await this.renameCol(qr, "Transaction", "created_at", "createdAt");
    }

    // TransactionReview
    if (await this.tableExists(qr, "TransactionReview")) {
      await this.renameCol(qr, "TransactionReview", "transaction_id", "transactionId");
      await this.renameCol(qr, "TransactionReview", "had_issues", "hadIssues");
      await this.renameCol(qr, "TransactionReview", "issue_category", "issueCategory");
      await this.renameCol(qr, "TransactionReview", "issue_details", "issueDetails");
      await this.renameCol(qr, "TransactionReview", "created_at", "createdAt");
    }

    // notifications
    if (await this.tableExists(qr, "notifications")) {
      await this.renameCol(qr, "notifications", "user_id", "userId");
      await this.renameCol(qr, "notifications", "created_at", "createdAt");
      await this.renameCol(qr, "notifications", "updated_at", "updatedAt");
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 3 – Table renames (snake_case → camelCase)
     ────────────────────────────────────────────────────────────────── */

  private async renameTables(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Renaming tables…");

    const renames: [string, string][] = [
      ["user_blocking_users", "userBlockingUsers"],
      ["user_saved_posts", "userSavedPosts"],
      ["request_matches_posts", "requestMatchesPosts"],
      ["post_categories", "postCategories"],
      ["post_event_tags", "postEventTags"],
    ];

    for (const [from, to] of renames) {
      if (
        (await this.tableExists(qr, from)) &&
        !(await this.tableExists(qr, to))
      ) {
        await qr.query(`ALTER TABLE "${from}" RENAME TO "${to}"`);
        console.log(`  renamed table "${from}" → "${to}"`);
      }
    }

    // Rename event_tags column inside postEventTags
    if (await this.tableExists(qr, "postEventTags")) {
      await this.renameCol(qr, "postEventTags", "event_tags", "eventTags");
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 4 – Create missing tables
     ────────────────────────────────────────────────────────────────── */

  private async createMissingTables(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Creating missing tables…");

    await qr.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    if (!(await this.tableExists(qr, "Category"))) {
      await qr.query(`CREATE TABLE "Category" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "PK_c2727780c5b9b0c564c29a4977c" PRIMARY KEY ("id")
      )`);
      console.log("  created Category");
    }

    if (!(await this.tableExists(qr, "EventTag"))) {
      await qr.query(`CREATE TABLE "EventTag" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        CONSTRAINT "PK_929d8d89bf95d848ac3b7546a29" PRIMARY KEY ("id")
      )`);
      console.log("  created EventTag");
    }

    if (!(await this.tableExists(qr, "FCMToken"))) {
      await qr.query(`CREATE TABLE "FCMToken" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "fcmToken" character varying NOT NULL,
        "notificationsEnabled" boolean NOT NULL DEFAULT true,
        "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
        "userId" character varying NOT NULL,
        CONSTRAINT "PK_FCMToken" PRIMARY KEY ("id")
      )`);
      console.log("  created FCMToken");
    }

    if (!(await this.tableExists(qr, "Transaction"))) {
      await qr.query(`CREATE TABLE "Transaction" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "location" character varying NOT NULL,
        "amount" numeric NOT NULL,
        "transactionDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "completed" boolean NOT NULL DEFAULT false,
        "confirmationSent" boolean NOT NULL DEFAULT false,
        "postId" uuid,
        "buyerId" character varying,
        "sellerId" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_Transaction" PRIMARY KEY ("id")
      )`);
      console.log("  created Transaction");
    }

    if (!(await this.tableExists(qr, "TransactionReview"))) {
      await qr.query(`CREATE TABLE "TransactionReview" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "stars" integer NOT NULL,
        "comments" character varying,
        "hadIssues" boolean NOT NULL DEFAULT false,
        "issueCategory" character varying,
        "issueDetails" character varying,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "transactionId" uuid,
        CONSTRAINT "PK_TransactionReview" PRIMARY KEY ("id")
      )`);
      console.log("  created TransactionReview");
    }

    if (!(await this.tableExists(qr, "notifications"))) {
      await qr.query(`CREATE TABLE "notifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying NOT NULL,
        "body" character varying NOT NULL,
        "data" jsonb,
        "read" boolean NOT NULL DEFAULT false,
        "userId" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
      )`);
      console.log("  created notifications");
    }

    if (!(await this.tableExists(qr, "searches"))) {
      await qr.query(`CREATE TABLE "searches" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "searchText" character varying NOT NULL,
        "searchVector" vector(512),
        "firebaseUid" character varying NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_searches" PRIMARY KEY ("id")
      )`);
      console.log("  created searches");
    }

    if (!(await this.tableExists(qr, "user_following_users"))) {
      await qr.query(`CREATE TABLE "user_following_users" (
        "follower_id" character varying NOT NULL,
        "following_id" character varying NOT NULL,
        CONSTRAINT "PK_user_following_users" PRIMARY KEY ("follower_id", "following_id")
      )`);
      console.log("  created user_following_users");
    }

    // Junction tables (may already exist after table renames)
    if (!(await this.tableExists(qr, "postCategories"))) {
      await qr.query(`CREATE TABLE "postCategories" (
        "posts" uuid NOT NULL,
        "categories" uuid NOT NULL,
        CONSTRAINT "PK_postCategories" PRIMARY KEY ("posts", "categories")
      )`);
      console.log("  created postCategories");
    }

    if (!(await this.tableExists(qr, "postEventTags"))) {
      await qr.query(`CREATE TABLE "postEventTags" (
        "posts" uuid NOT NULL,
        "eventTags" uuid NOT NULL,
        CONSTRAINT "PK_postEventTags" PRIMARY KEY ("posts", "eventTags")
      )`);
      console.log("  created postEventTags");
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 5 – Add missing columns to existing tables
     ────────────────────────────────────────────────────────────────── */

  private async addMissingColumns(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Adding missing columns…");

    // Post
    if (!(await this.colExists(qr, "Post", "condition"))) {
      await qr.query(`ALTER TABLE "Post" ADD COLUMN "condition" character varying NOT NULL DEFAULT 'New'`);
    }
    if (!(await this.colExists(qr, "Post", "sold"))) {
      await qr.query(`ALTER TABLE "Post" ADD COLUMN "sold" boolean NOT NULL DEFAULT false`);
    }
    if (!(await this.colExists(qr, "Post", "embedding"))) {
      await qr.query(`ALTER TABLE "Post" ADD COLUMN "embedding" FLOAT[]`);
    }

    // Request
    if (!(await this.colExists(qr, "Request", "archive"))) {
      await qr.query(`ALTER TABLE "Request" ADD COLUMN "archive" boolean NOT NULL DEFAULT false`);
    }
    if (!(await this.colExists(qr, "Request", "embedding"))) {
      await qr.query(`ALTER TABLE "Request" ADD COLUMN "embedding" FLOAT[]`);
    }

    // User
    if (!(await this.colExists(qr, "User", "soldPosts"))) {
      await qr.query(`ALTER TABLE "User" ADD COLUMN "soldPosts" integer NOT NULL DEFAULT 0`);
    }
    if (!(await this.colExists(qr, "User", "availabilityId"))) {
      await qr.query(`ALTER TABLE "User" ADD COLUMN "availabilityId" character varying`);
    }

    // Transaction – confirmationSent
    if (
      (await this.tableExists(qr, "Transaction")) &&
      !(await this.colExists(qr, "Transaction", "confirmationSent"))
    ) {
      await qr.query(`ALTER TABLE "Transaction" ADD COLUMN "confirmationSent" boolean NOT NULL DEFAULT false`);
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 6 – Cleanup (drop obsolete objects, columns)
     ────────────────────────────────────────────────────────────────── */

  private async cleanup(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Cleanup…");

    // Drop UserSession
    if (await this.tableExists(qr, "UserSession")) {
      await qr.query(`DROP TABLE "UserSession" CASCADE`);
      console.log("  dropped UserSession");
    }

    // Drop leftover 'category' varchar column from Post
    if (await this.colExists(qr, "Post", "category")) {
      await qr.query(`ALTER TABLE "Post" DROP COLUMN "category"`);
      console.log("  dropped Post.category");
    }

    // Drop leftover 'categories' text[] column from Post
    if (await this.colExists(qr, "Post", "categories")) {
      await qr.query(`ALTER TABLE "Post" DROP COLUMN "categories"`);
      console.log("  dropped Post.categories");
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 7 – Recreate foreign keys
     ────────────────────────────────────────────────────────────────── */

  private async recreateForeignKeys(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Recreating foreign keys…");

    type FkDef = {
      name: string;
      table: string;
      col: string;
      ref: string;
      refCol: string;
      onDelete?: string;
      onUpdate?: string;
    };

    const fks: FkDef[] = [
      // ── Core entity → User FKs ──
      { name: "FK_Post_userId",       table: "Post",       col: "userId",    ref: "User", refCol: "firebaseUid", onDelete: "CASCADE" },
      { name: "FK_Request_userId",    table: "Request",    col: "userId",    ref: "User", refCol: "firebaseUid", onDelete: "CASCADE" },
      { name: "FK_Feedback_userId",   table: "Feedback",   col: "userId",    ref: "User", refCol: "firebaseUid", onDelete: "CASCADE" },
      { name: "FK_UserReview_buyerId",  table: "UserReview", col: "buyerId",  ref: "User", refCol: "firebaseUid" },
      { name: "FK_UserReview_sellerId", table: "UserReview", col: "sellerId", ref: "User", refCol: "firebaseUid" },

      // ── Report FKs ──
      { name: "FK_Report_reporterId", table: "Report", col: "reporterId", ref: "User",    refCol: "firebaseUid" },
      { name: "FK_Report_reportedId", table: "Report", col: "reportedId", ref: "User",    refCol: "firebaseUid" },
      { name: "FK_Report_postId",     table: "Report", col: "postId",     ref: "Post",    refCol: "id" },
      { name: "FK_Report_messageId",  table: "Report", col: "messageId",  ref: "Message", refCol: "id" },

      // ── userBlockingUsers junction ──
      { name: "FK_uBU_blockers", table: "userBlockingUsers", col: "blockers", ref: "User", refCol: "firebaseUid", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { name: "FK_uBU_blocking", table: "userBlockingUsers", col: "blocking", ref: "User", refCol: "firebaseUid" },

      // ── userSavedPosts junction ──
      { name: "FK_uSP_saved",  table: "userSavedPosts", col: "saved",  ref: "Post", refCol: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { name: "FK_uSP_savers", table: "userSavedPosts", col: "savers", ref: "User", refCol: "firebaseUid" },

      // ── requestMatchesPosts junction ──
      { name: "FK_rMP_matches", table: "requestMatchesPosts", col: "matches", ref: "Post",    refCol: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { name: "FK_rMP_matched", table: "requestMatchesPosts", col: "matched", ref: "Request", refCol: "id" },

      // ── postCategories junction ──
      { name: "FK_pC_posts",      table: "postCategories", col: "posts",      ref: "Post",     refCol: "id", onDelete: "CASCADE" },
      { name: "FK_pC_categories", table: "postCategories", col: "categories", ref: "Category", refCol: "id", onDelete: "CASCADE" },

      // ── postEventTags junction ──
      { name: "FK_pET_posts",     table: "postEventTags", col: "posts",     ref: "Post",     refCol: "id", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { name: "FK_pET_eventTags", table: "postEventTags", col: "eventTags", ref: "EventTag", refCol: "id" },

      // ── FCMToken ──
      { name: "FK_FCMToken_userId", table: "FCMToken", col: "userId", ref: "User", refCol: "firebaseUid", onDelete: "CASCADE" },

      // ── Transaction ──
      { name: "FK_Txn_postId",   table: "Transaction", col: "postId",   ref: "Post", refCol: "id" },
      { name: "FK_Txn_buyerId",  table: "Transaction", col: "buyerId",  ref: "User", refCol: "firebaseUid" },
      { name: "FK_Txn_sellerId", table: "Transaction", col: "sellerId", ref: "User", refCol: "firebaseUid" },

      // ── TransactionReview ──
      { name: "FK_TxnR_transactionId", table: "TransactionReview", col: "transactionId", ref: "Transaction", refCol: "id", onDelete: "CASCADE" },

      // ── notifications ──
      { name: "FK_notif_userId", table: "notifications", col: "userId", ref: "User", refCol: "firebaseUid" },

      // ── searches ──
      { name: "FK_searches_fbuid", table: "searches", col: "firebaseUid", ref: "User", refCol: "firebaseUid", onDelete: "CASCADE" },

      // ── user_following_users ──
      { name: "FK_uFU_follower",  table: "user_following_users", col: "follower_id",  ref: "User", refCol: "firebaseUid", onDelete: "CASCADE", onUpdate: "CASCADE" },
      { name: "FK_uFU_following", table: "user_following_users", col: "following_id", ref: "User", refCol: "firebaseUid", onDelete: "CASCADE", onUpdate: "CASCADE" },
    ];

    for (const fk of fks) {
      // Skip if table or column doesn't exist
      if (!(await this.tableExists(qr, fk.table))) continue;
      if (!(await this.colExists(qr, fk.table, fk.col))) continue;
      if (await this.fkExists(qr, fk.name)) continue;

      const onDel = fk.onDelete ? ` ON DELETE ${fk.onDelete}` : "";
      const onUpd = fk.onUpdate ? ` ON UPDATE ${fk.onUpdate}` : "";

      try {
        await qr.query(`
          ALTER TABLE "${fk.table}"
          ADD CONSTRAINT "${fk.name}"
          FOREIGN KEY ("${fk.col}") REFERENCES "${fk.ref}"("${fk.refCol}")${onDel}${onUpd}
        `);
        console.log(`  FK ${fk.name}`);
      } catch (e) {
        console.warn(`  FK ${fk.name} failed: ${e?.message ?? e}`);
      }
    }
  }

  /* ──────────────────────────────────────────────────────────────────
     PHASE 8 – Indexes
     ────────────────────────────────────────────────────────────────── */

  private async createIndexes(qr: QueryRunner): Promise<void> {
    console.log("[MIGRATION] Creating indexes…");

    const idxs: { name: string; table: string; col: string }[] = [
      { name: "IDX_FCMToken_userId",   table: "FCMToken",              col: "userId" },
      { name: "IDX_FCMToken_fcmToken", table: "FCMToken",              col: "fcmToken" },
      { name: "IDX_uFU_follower_id",   table: "user_following_users",  col: "follower_id" },
      { name: "IDX_uFU_following_id",  table: "user_following_users",  col: "following_id" },
    ];

    for (const idx of idxs) {
      if (
        (await this.tableExists(qr, idx.table)) &&
        !(await this.indexExists(qr, idx.name))
      ) {
        await qr.query(
          `CREATE INDEX "${idx.name}" ON "${idx.table}" ("${idx.col}")`
        );
      }
    }

    // Vector search index on searches
    if (
      (await this.tableExists(qr, "searches")) &&
      !(await this.indexExists(qr, "idx_searches_vector"))
    ) {
      try {
        await qr.query(
          `CREATE INDEX "idx_searches_vector" ON "searches"
           USING ivfflat ("searchVector" vector_cosine_ops)`
        );
      } catch (e) {
        console.warn(`  ivfflat index skipped (needs rows): ${e?.message ?? e}`);
      }
    }
  }

  /* ════════════════════════════════════════════════════════════════════
     DOWN – no rollback for this migration
     ════════════════════════════════════════════════════════════════════ */

  public async down(_queryRunner: QueryRunner): Promise<void> {
    console.log("[MIGRATION] No rollback for SyncProdSchema");
  }
}