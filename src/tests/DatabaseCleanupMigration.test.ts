import { Connection, createConnection } from "typeorm";
import { AlignActiveDatabaseIntegrity1793574441324 } from "../migrations/1793574441324-AlignActiveDatabaseIntegrity";
import { MarkKnownLegacySaveDatesUnknown1793574441325 } from "../migrations/1793574441325-MarkKnownLegacySaveDatesUnknown";
import {
  beginCleanupTransaction,
  pendingCleanup,
} from "../../scripts/run-database-cleanup";

// This suite deliberately never imports the application, entity synchronization,
// historical migrations, or the shared (TRUNCATE-based) API test helper.
const testUrl = process.env.MIGRATION_TEST_DATABASE_URL;
const migrationTests = testUrl ? describe : describe.skip;
const tables = [
  "notifications",
  "userSavedPosts",
  "userBlockingUsers",
  "Feedback",
  "Request",
  "Post",
  "searches",
  "User",
];
const postIds = Array.from(
  { length: 8 },
  (_, index) =>
    `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
);
const artifact = "2026-10-25 18:48:35.538726+00";
const genuineDates = [
  "2026-09-01 01:02:03.123456+00",
  "2026-09-02 02:03:04.234567+00",
  "2026-09-03 03:04:05.345678+00",
  "2026-09-04 04:05:06.456789+00",
  "2026-09-05 05:06:07.567891+00",
  "2026-09-06 06:07:08.678912+00",
];

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
      "Migration tests require the dedicated loopback resell_migration_cleanup_test database without URL options.",
    );
  }
}

migrationTests(
  "active database cleanup migrations (isolated SQL fixtures)",
  () => {
    let connection: Connection;
    const integrity = new AlignActiveDatabaseIntegrity1793574441324();
    const dates = new MarkKnownLegacySaveDatesUnknown1793574441325();

    beforeAll(async () => {
      if (!testUrl) throw new Error("MIGRATION_TEST_DATABASE_URL is required.");
      assertDedicatedLocalDatabase(testUrl);
      connection = await createConnection({
        name: "database-cleanup-migration-tests",
        type: "postgres",
        url: testUrl,
        synchronize: false,
        migrationsRun: false,
        entities: [],
        logging: false,
        extra: { max: 1 },
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
          "Connected database is not the dedicated loopback migration test database.",
        );
      }
      await connection.query(`SET TIME ZONE 'UTC'`);
    });

    afterAll(async () => {
      if (connection?.isConnected) await connection.close();
    });

    async function fixture(strong = false): Promise<void> {
      await connection.query(
        `DROP TABLE IF EXISTS ${[...tables, "migrations"].map((table) => `public."${table}"`).join(", ")} CASCADE`,
      );
      const required = strong ? "NOT NULL" : "";
      const cascade = strong ? "CASCADE" : "NO ACTION";
      await connection.query(`
      CREATE TABLE public."User" ("firebaseUid" varchar PRIMARY KEY);
      CREATE TABLE public."Post" (
        id uuid PRIMARY KEY, "userId" varchar, condition varchar NOT NULL DEFAULT 'Good',
        embedding float8[], "similarPostIds" uuid[],
        CONSTRAINT fixture_post_user FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE ${cascade});
      CREATE TABLE public."Request" (
        id uuid PRIMARY KEY, "userId" varchar, embedding float8[],
        CONSTRAINT fixture_request_user FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE ${cascade});
      CREATE TABLE public."Feedback" (
        id uuid PRIMARY KEY, "userId" varchar,
        CONSTRAINT fixture_feedback_user FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid") ON DELETE ${cascade});
      CREATE TABLE public.notifications (
        id uuid PRIMARY KEY, "userId" varchar ${required},
        CONSTRAINT fixture_notification_user FOREIGN KEY ("userId") REFERENCES public."User"("firebaseUid"));
      CREATE TABLE public."userSavedPosts" (
        saved uuid NOT NULL, savers varchar ${required}, "savedAt" timestamptz NOT NULL DEFAULT now(),
        ${strong ? "PRIMARY KEY (saved, savers)," : ""}
        ${strong ? 'CONSTRAINT fixture_saved_post_duplicate FOREIGN KEY (saved) REFERENCES public."Post"(id) ON DELETE CASCADE ON UPDATE CASCADE,' : ""}
        CONSTRAINT fixture_saved_post FOREIGN KEY (saved) REFERENCES public."Post"(id) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT fixture_saved_user FOREIGN KEY (savers) REFERENCES public."User"("firebaseUid") ON DELETE NO ACTION ON UPDATE NO ACTION);
      CREATE TABLE public."userBlockingUsers" (
        blockers varchar ${required}, blocking varchar ${required},
        ${strong ? "PRIMARY KEY (blockers, blocking)," : ""}
        CONSTRAINT fixture_blockers_user FOREIGN KEY (blockers) REFERENCES public."User"("firebaseUid") ON DELETE ${cascade} ON UPDATE ${cascade},
        CONSTRAINT fixture_blocking_user FOREIGN KEY (blocking) REFERENCES public."User"("firebaseUid") ON DELETE NO ACTION ON UPDATE NO ACTION);
      CREATE TABLE public.searches (id uuid PRIMARY KEY, "searchVector" text, payload bytea);
      INSERT INTO public."User" VALUES ('owner'), ('saver'), ('blocker'), ('target'), ('unrelated');
    `);
      for (const id of postIds) {
        await connection.query(
          `INSERT INTO public."Post" (id,"userId",embedding,"similarPostIds") VALUES ($1,'owner',ARRAY[1.25,2.5]::float8[],ARRAY[$1::uuid])`,
          [id],
        );
      }
      await connection.query(`
      INSERT INTO public."Request" VALUES ('10000000-0000-4000-8000-000000000001','owner',ARRAY[3.25,4.5]::float8[]);
      INSERT INTO public."Feedback" VALUES ('20000000-0000-4000-8000-000000000001','owner');
      INSERT INTO public.notifications VALUES ('30000000-0000-4000-8000-000000000001','saver');
      INSERT INTO public."userBlockingUsers" VALUES ('blocker','target');
      INSERT INTO public.searches VALUES ('40000000-0000-4000-8000-000000000001','[0.125,0.25]',decode('00ff1234','hex'));
    `);
      for (let index = 0; index < genuineDates.length; index += 1) {
        await connection.query(
          `INSERT INTO public."userSavedPosts" VALUES ($1,'saver',$2)`,
          [postIds[index], genuineDates[index]],
        );
      }
      await connection.query(
        `INSERT INTO public."userSavedPosts" VALUES ($1,'saver',$2),($3,'saver','2026-10-25 18:48:35.538727+00')`,
        [postIds[6], artifact, postIds[7]],
      );
    }

    async function migrate(): Promise<void> {
      const runner = connection.createQueryRunner();
      await runner.connect();
      await runner.startTransaction();
      try {
        await integrity.up(runner);
        await dates.up(runner);
        await runner.commitTransaction();
      } catch (error) {
        await runner.rollbackTransaction();
        throw error;
      } finally {
        await runner.release();
      }
    }

    async function rows(table: string): Promise<string> {
      const [result] = await connection.query(
        `SELECT COALESCE(jsonb_agg(to_jsonb(t) ORDER BY to_jsonb(t)::text),'[]'::jsonb)::text AS value FROM public."${table}" t`,
      );
      return result.value;
    }

    async function schema(): Promise<unknown> {
      return connection.query(
        `
      SELECT c.relname, a.attname, a.attnotnull,
             pg_get_expr(d.adbin,d.adrelid) AS default_expression,
             format_type(a.atttypid,a.atttypmod) AS type,
             (SELECT string_agg(pg_get_constraintdef(k.oid),';' ORDER BY pg_get_constraintdef(k.oid))
              FROM pg_constraint k WHERE k.conrelid=c.oid) AS constraints
      FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
      JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum>0 AND NOT a.attisdropped
      LEFT JOIN pg_attrdef d ON d.adrelid=c.oid AND d.adnum=a.attnum
      WHERE n.nspname='public' AND c.relname=ANY($1::text[])
      ORDER BY c.relname,a.attname`,
        [tables],
      );
    }

    async function excludedFingerprint(): Promise<unknown> {
      return Promise.all([
        connection.query(
          `SELECT id,embedding::text,"similarPostIds"::text FROM public."Post" ORDER BY id`,
        ),
        connection.query(
          `SELECT id,embedding::text FROM public."Request" ORDER BY id`,
        ),
        rows("searches"),
      ]);
    }

    beforeEach(async () => fixture());

    test("repairs weak staging constraints while preserving records, exact legitimate dates, and excluded fields", async () => {
      const before = await Promise.all(
        tables.filter((table) => table !== "userSavedPosts").map(rows),
      );
      const excluded = await excludedFingerprint();
      await migrate();
      expect(
        await Promise.all(
          tables.filter((table) => table !== "userSavedPosts").map(rows),
        ),
      ).toEqual(before);
      expect(await excludedFingerprint()).toEqual(excluded);
      const saved = await connection.query(
        `SELECT saved,"savedAt"::text AS date FROM public."userSavedPosts" ORDER BY saved`,
      );
      expect(saved).toHaveLength(8);
      for (let index = 0; index < genuineDates.length; index += 1)
        expect(saved[index].date).toBe(genuineDates[index]);
      expect(saved[6].date).toBeNull();
      expect(saved[7].date).toBe("2026-10-25 18:48:35.538727+00");
      await expect(
        connection.query(
          `INSERT INTO public.notifications VALUES ('30000000-0000-4000-8000-000000000002',NULL)`,
        ),
      ).rejects.toMatchObject({ code: "23502" });
      await expect(
        connection.query(
          `INSERT INTO public."userSavedPosts" (saved,savers) VALUES ($1,NULL)`,
          [postIds[0]],
        ),
      ).rejects.toMatchObject({ code: "23502" });
      await expect(
        connection.query(
          `INSERT INTO public."userSavedPosts" (saved,savers) VALUES ($1,'saver')`,
          [postIds[0]],
        ),
      ).rejects.toMatchObject({ code: "23505" });
      for (const pair of ["NULL,'target'", "'blocker',NULL"]) {
        await expect(
          connection.query(
            `INSERT INTO public."userBlockingUsers" VALUES (${pair})`,
          ),
        ).rejects.toMatchObject({ code: "23502" });
      }
      await expect(
        connection.query(
          `INSERT INTO public."userBlockingUsers" VALUES ('blocker','target')`,
        ),
      ).rejects.toMatchObject({ code: "23505" });
      await expect(
        connection.query(
          `INSERT INTO public."userBlockingUsers" VALUES ('missing','target')`,
        ),
      ).rejects.toMatchObject({ code: "23503" });
    });

    test("retains approved cascade directions and blocking-side NO ACTION", async () => {
      await migrate();
      await expect(
        connection.query(
          `DELETE FROM public."User" WHERE "firebaseUid"='target'`,
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await expect(
        connection.query(
          `UPDATE public."User" SET "firebaseUid"='changed-target' WHERE "firebaseUid"='target'`,
        ),
      ).rejects.toMatchObject({ code: "23503" });
      await connection.query(
        `UPDATE public."User" SET "firebaseUid"='changed-blocker' WHERE "firebaseUid"='blocker'`,
      );
      expect(
        await connection.query(`SELECT * FROM public."userBlockingUsers"`),
      ).toEqual([{ blockers: "changed-blocker", blocking: "target" }]);
      await connection.query(
        `DELETE FROM public."User" WHERE "firebaseUid"='changed-blocker'`,
      );
      expect(
        await connection.query(`SELECT * FROM public."userBlockingUsers"`),
      ).toEqual([]);
      await connection.query(
        `DELETE FROM public."User" WHERE "firebaseUid"='owner'`,
      );
      for (const table of ["Post", "Request", "Feedback", "userSavedPosts"])
        expect(await rows(table)).toBe("[]");
      expect(
        await connection.query(
          `SELECT count(*)::int AS count FROM public."User" WHERE "firebaseUid"='unrelated'`,
        ),
      ).toEqual([{ count: 1 }]);
    });

    test("a fresh save uses now(), and an explicit resave refreshes only its existing relationship", async () => {
      await migrate();
      await connection.query(
        `INSERT INTO public."userSavedPosts" (saved,savers) VALUES ($1,'unrelated')`,
        [postIds[0]],
      );
      expect(
        await connection.query(
          `SELECT "savedAt">=now()-interval '1 minute' AS recent FROM public."userSavedPosts" WHERE savers='unrelated'`,
        ),
      ).toEqual([{ recent: true }]);
      const unaffected = await connection.query(
        `SELECT saved,"savedAt"::text FROM public."userSavedPosts" WHERE saved<>$1 ORDER BY saved,savers`,
        [postIds[6]],
      );
      await connection.query(
        `UPDATE public."userSavedPosts" SET "savedAt"=now() WHERE saved=$1 AND savers='saver'`,
        [postIds[6]],
      );
      expect(
        await connection.query(
          `SELECT count(*)::int AS count,bool_and("savedAt">=now()-interval '1 minute') AS recent FROM public."userSavedPosts" WHERE saved=$1 AND savers='saver'`,
          [postIds[6]],
        ),
      ).toEqual([{ count: 1, recent: true }]);
      expect(
        await connection.query(
          `SELECT saved,"savedAt"::text FROM public."userSavedPosts" WHERE saved<>$1 ORDER BY saved,savers`,
          [postIds[6]],
        ),
      ).toEqual(unaffected);
    });

    test("correct production constraints are retained and a second run is a no-op", async () => {
      await fixture(true);
      const excluded = await excludedFingerprint();
      const constraintIdentities = () =>
        connection.query(
          `
        SELECT k.oid::text, k.conname, pg_get_constraintdef(k.oid) AS definition
        FROM pg_constraint k JOIN pg_class c ON c.oid=k.conrelid
        JOIN pg_namespace n ON n.oid=c.relnamespace
        WHERE n.nspname='public' AND c.relname=ANY($1::text[]) AND k.contype IN ('p','f')
        ORDER BY k.oid`,
          [tables],
        );
      const originalConstraints = await constraintIdentities();
      await migrate();
      expect(await constraintIdentities()).toEqual(originalConstraints);
      const firstSchema = await schema();
      const firstRows = await Promise.all(tables.map(rows));
      await migrate();
      expect(await schema()).toEqual(firstSchema);
      expect(await Promise.all(tables.map(rows))).toEqual(firstRows);
      expect(await excludedFingerprint()).toEqual(excluded);
    });

    test("sees a preceding writer's committed migration ledger after waiting for cleanup locks", async () => {
      if (!testUrl) throw new Error("MIGRATION_TEST_DATABASE_URL is required.");
      assertDedicatedLocalDatabase(testUrl);
      await connection.query(
        `CREATE TABLE public.migrations (name varchar NOT NULL)`,
      );
      const readerConnection = await createConnection({
        name: "database-cleanup-lock-reader",
        type: "postgres",
        url: testUrl,
        synchronize: false,
        migrationsRun: false,
        entities: [],
        logging: false,
        extra: { max: 1 },
      });
      const writer = connection.createQueryRunner();
      const reader = readerConnection.createQueryRunner();
      let readerStarted: Promise<unknown> | undefined;
      try {
        await writer.connect();
        await reader.connect();
        const [identity] = await reader.query(`
          SELECT pg_backend_pid() AS pid, current_database() AS name,
                 inet_server_addr()::text AS address`);
        expect(identity.name).toBe("resell_migration_cleanup_test");
        expect(["127.0.0.1/32", "::1/128", "127.0.0.1", "::1"]).toContain(
          identity.address,
        );
        await writer.startTransaction();
        const approved = [integrity.name, dates.name];
        await writer.query(
          `INSERT INTO public.migrations (name) VALUES ($1),($2)`,
          approved,
        );

        // The helper's advisory SELECT establishes the old REPEATABLE READ
        // snapshot before its table lock waits on this writer's uncommitted rows.
        readerStarted = beginCleanupTransaction(reader, true).then(
          () => null,
          (error: unknown) => error,
        );
        let blocked = false;
        const deadline = Date.now() + 3000;
        while (Date.now() < deadline) {
          await writer.query(`SELECT pg_stat_clear_snapshot()`);
          const [activity] = await writer.query(
            `SELECT wait_event_type FROM pg_stat_activity WHERE pid=$1`,
            [identity.pid],
          );
          if (activity?.wait_event_type === "Lock") {
            blocked = true;
            break;
          }
          await new Promise((resolve) => setTimeout(resolve, 20));
        }
        expect(blocked).toBe(true);
        await writer.commitTransaction();
        const startupError = await readerStarted;
        if (startupError) throw startupError;
        const history: Array<{ name: string }> = await reader.query(
          `SELECT name FROM public.migrations ORDER BY name`,
        );
        expect(history.map(({ name }) => name)).toEqual(approved);
        expect(
          pendingCleanup(
            history.map(({ name }) => name),
            approved,
          ),
        ).toEqual([]);
      } finally {
        // Release the writer first so a still-pending reader can finish and roll back.
        if (writer.isTransactionActive) await writer.rollbackTransaction();
        if (readerStarted) await readerStarted;
        if (reader.isTransactionActive) await reader.rollbackTransaction();
        await reader.release();
        await readerConnection.close();
        await writer.release();
        await connection.query(`DROP TABLE IF EXISTS public.migrations`);
      }
    }, 10000);

    test.each([
      [
        "NULL notification owner",
        `UPDATE public.notifications SET "userId"=NULL`,
      ],
      [
        "NULL save owner",
        `UPDATE public."userSavedPosts" SET savers=NULL WHERE saved='${postIds[0]}'`,
      ],
      ["NULL blocker", `UPDATE public."userBlockingUsers" SET blockers=NULL`],
      [
        "NULL blocked user",
        `UPDATE public."userBlockingUsers" SET blocking=NULL`,
      ],
      [
        "duplicate saves",
        `INSERT INTO public."userSavedPosts" SELECT * FROM public."userSavedPosts" LIMIT 1`,
      ],
      [
        "duplicate blocks",
        `INSERT INTO public."userBlockingUsers" SELECT * FROM public."userBlockingUsers"`,
      ],
      [
        "reversed save primary key",
        `ALTER TABLE public."userSavedPosts" ADD PRIMARY KEY (savers,saved)`,
      ],
      [
        "reversed block primary key",
        `ALTER TABLE public."userBlockingUsers" ADD PRIMARY KEY (blocking,blockers)`,
      ],
      [
        "missing Post primary key",
        `ALTER TABLE public."Post" DROP CONSTRAINT "Post_pkey" CASCADE; ALTER TABLE public."Post" ADD UNIQUE (id); ALTER TABLE public."userSavedPosts" ADD CONSTRAINT fixture_saved_post FOREIGN KEY (saved) REFERENCES public."Post"(id) ON DELETE CASCADE ON UPDATE CASCADE`,
      ],
      [
        "wrong saved-post foreign key target",
        `INSERT INTO public."Request" (id,"userId") SELECT id,'owner' FROM public."Post"; ALTER TABLE public."userSavedPosts" DROP CONSTRAINT fixture_saved_post; ALTER TABLE public."userSavedPosts" ADD CONSTRAINT fixture_saved_post FOREIGN KEY (saved) REFERENCES public."Request"(id) ON DELETE CASCADE ON UPDATE CASCADE`,
      ],
      [
        "wrong saved-post foreign key actions",
        `ALTER TABLE public."userSavedPosts" DROP CONSTRAINT fixture_saved_post; ALTER TABLE public."userSavedPosts" ADD CONSTRAINT fixture_saved_post FOREIGN KEY (saved) REFERENCES public."Post"(id) ON DELETE NO ACTION ON UPDATE CASCADE`,
      ],
      [
        "orphan saved post",
        `ALTER TABLE public."userSavedPosts" DROP CONSTRAINT fixture_saved_post; UPDATE public."userSavedPosts" SET saved='90000000-0000-4000-8000-000000000001' WHERE saved='${postIds[0]}'; ALTER TABLE public."userSavedPosts" ADD CONSTRAINT fixture_saved_post FOREIGN KEY (saved) REFERENCES public."Post"(id) ON DELETE CASCADE ON UPDATE CASCADE NOT VALID`,
      ],
      [
        "wrong condition type",
        `ALTER TABLE public."Post" ALTER COLUMN condition DROP DEFAULT; ALTER TABLE public."Post" ALTER COLUMN condition TYPE text`,
      ],
      [
        "wrong saved date type",
        `ALTER TABLE public."userSavedPosts" ALTER COLUMN "savedAt" DROP DEFAULT; ALTER TABLE public."userSavedPosts" ALTER COLUMN "savedAt" TYPE timestamp USING "savedAt" AT TIME ZONE 'UTC'`,
      ],
      [
        "orphan saves",
        `ALTER TABLE public."userSavedPosts" DROP CONSTRAINT fixture_saved_user; UPDATE public."userSavedPosts" SET savers='missing' WHERE saved='${postIds[0]}'; ALTER TABLE public."userSavedPosts" ADD CONSTRAINT fixture_saved_user FOREIGN KEY (savers) REFERENCES public."User"("firebaseUid") ON DELETE NO ACTION ON UPDATE NO ACTION NOT VALID`,
      ],
    ])(
      "rejects %s and rolls back all migration changes",
      async (_label, invalidate) => {
        await connection.query(invalidate);
        const previousSchema = await schema();
        const previousRows = await Promise.all(tables.map(rows));
        await expect(migrate()).rejects.toThrow();
        expect(await schema()).toEqual(previousSchema);
        expect(await Promise.all(tables.map(rows))).toEqual(previousRows);
      },
    );
  },
);
