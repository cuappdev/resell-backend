import "reflect-metadata";
import {
  readFileSync,
  readdirSync,
  mkdirSync,
  writeFileSync,
  openSync,
  closeSync,
  fsyncSync,
  renameSync,
} from "fs";
import { homedir } from "os";
import { dirname, join, resolve } from "path";
import { createConnection, QueryRunner } from "typeorm";
import { Migration } from "typeorm/migration/Migration";
import { MigrationExecutor } from "typeorm/migration/MigrationExecutor";
import { AlignActiveDatabaseIntegrity1793574441324 } from "../src/migrations/1793574441324-AlignActiveDatabaseIntegrity";
import { MarkKnownLegacySaveDatesUnknown1793574441325 } from "../src/migrations/1793574441325-MarkKnownLegacySaveDatesUnknown";

const projectId = "fragrant-flower-02125519";
const activeBranches = {
  "br-wispy-forest-audpsdxp": "dev",
  "br-crimson-sound-auy345bq": "staging",
  "br-weathered-wave-au5ygpff": "production",
};
const cleanup = [
  new AlignActiveDatabaseIntegrity1793574441324(),
  new MarkKnownLegacySaveDatesUnknown1793574441325(),
];
const knownLegacyDate = "2026-10-25 18:48:35.538726+00";
const legacyDuplicates = new Set([
  "init1709163288115",
  "softdelete1713139721037",
  "makenetidnullable1713218553306",
]);

interface Branch {
  id: string;
  project_id: string;
  name: string;
  parent_id?: string;
}
interface Snapshot {
  tables: Record<string, { count: number; fingerprint: string }>;
  dates: Array<{ key: string; value: string | null }>;
  protectedSchema: unknown;
}

export function assertTarget(
  branch: Branch,
  host: string,
  rawUrl: string,
): void {
  const activeName = activeBranches[branch.id as keyof typeof activeBranches];
  const rehearsalLabel =
    branch.name === "migration-review-prod"
      ? "production"
      : branch.name.match(
          /^cleanup-review-(dev|staging|production)-[a-z0-9-]+$/,
        )?.[1];
  const rehearsal =
    !activeName &&
    !!rehearsalLabel &&
    activeBranches[branch.parent_id as keyof typeof activeBranches] ===
      rehearsalLabel;
  if (
    branch.project_id !== projectId ||
    (!rehearsal && (!activeName || branch.name !== activeName))
  ) {
    throw new Error("Target is not an approved active branch or rehearsal.");
  }
  const url = new URL(rawUrl);
  if (
    !["postgres:", "postgresql:"].includes(url.protocol) ||
    url.hostname !== host ||
    !host.endsWith(".neon.tech") ||
    host.includes("-pooler") ||
    (url.port && url.port !== "5432") ||
    url.pathname !== "/neondb" ||
    url.hash ||
    url.searchParams.getAll("sslmode").length !== 1 ||
    url.searchParams.getAll("channel_binding").length > 1 ||
    [...url.searchParams.keys()].some(
      (key) => !["sslmode", "channel_binding"].includes(key),
    ) ||
    !["require", "verify-full"].includes(url.searchParams.get("sslmode") || "")
  ) {
    throw new Error("Expected the verified direct Neon endpoint and neondb.");
  }
}

export function pendingCleanup(
  history: string[],
  sourceNames: string[],
): string[] {
  if (new Set(sourceNames).size !== sourceNames.length) {
    throw new Error("Duplicate migration names in source.");
  }
  const counts = new Map<string, number>();
  for (const name of history) counts.set(name, (counts.get(name) || 0) + 1);
  for (const [name, count] of counts) {
    if (count > 1 && (!legacyDuplicates.has(name) || count !== 2)) {
      throw new Error(`Unexpected duplicate migration record: ${name}`);
    }
  }
  const expected = cleanup.map((migration) => migration.name);
  const pending = sourceNames.filter((name) => !counts.has(name));
  if (
    pending.length !== 0 &&
    (pending.length !== expected.length ||
      expected.some((name) => !pending.includes(name)))
  ) {
    throw new Error(`Unexpected pending migrations: ${pending.join(", ")}`);
  }
  if (!expected.every((name) => sourceNames.includes(name))) {
    throw new Error("The approved cleanup migrations are missing from source.");
  }
  return pending.length ? expected : [];
}

async function snapshot(runner: QueryRunner): Promise<Snapshot> {
  const tables: Snapshot["tables"] = {};
  const names: Array<{ tablename: string }> = await runner.query(`
    SELECT tablename FROM pg_tables WHERE schemaname = 'public'
      AND tablename NOT IN ('migrations', 'typeorm_metadata') ORDER BY 1
  `);
  for (const { tablename } of names) {
    const quoted = `public."${tablename.replace(/"/g, '""')}"`;
    const value =
      tablename === "userSavedPosts"
        ? "to_jsonb(t) - 'savedAt'"
        : "to_jsonb(t)";
    [tables[tablename]] = await runner.query(`
      SELECT count(*)::int AS count,
        md5(coalesce(string_agg(md5((${value})::text), ''
          ORDER BY md5((${value})::text)), '')) AS fingerprint
      FROM ${quoted} t
    `);
  }
  const dates: Snapshot["dates"] = await runner.query(`
    SELECT md5(jsonb_build_array(saved, savers)::text) AS key,
      "savedAt"::text AS value FROM public."userSavedPosts" ORDER BY 1
  `);
  const columns = await runner.query(`
    SELECT t.relname, a.attname, format_type(a.atttypid,a.atttypmod) AS type,
      a.attnotnull, pg_get_expr(d.adbin,d.adrelid) AS default_value
    FROM pg_attribute a JOIN pg_class t ON t.oid = a.attrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    LEFT JOIN pg_attrdef d ON d.adrelid = a.attrelid AND d.adnum = a.attnum
    WHERE n.nspname = 'public' AND a.attnum > 0 AND NOT a.attisdropped
      AND ((t.relname = 'Post' AND a.attname IN ('embedding','similarPostIds'))
        OR (t.relname = 'Request' AND a.attname = 'embedding')
        OR (t.relname = 'searches' AND a.attname = 'searchVector'))
    ORDER BY 1,2
  `);
  const indexes = await runner.query(`
    SELECT tablename,indexname,indexdef FROM pg_indexes
    WHERE schemaname = 'public' AND tablename IN ('Post','Request','searches')
    ORDER BY 1,2
  `);
  const extensions = await runner.query(
    "SELECT extname,extversion FROM pg_extension ORDER BY 1",
  );
  return { tables, dates, protectedSchema: { columns, indexes, extensions } };
}

export function assertPreserved(before: Snapshot, after: Snapshot): void {
  if (
    JSON.stringify(before.tables) !== JSON.stringify(after.tables) ||
    JSON.stringify(before.protectedSchema) !==
      JSON.stringify(after.protectedSchema)
  ) {
    throw new Error(
      "Business data or excluded storage/schema changed; rolling back.",
    );
  }
  const expectedDates = before.dates.map(({ key, value }) => ({
    key,
    value: value === knownLegacyDate ? null : value,
  }));
  if (JSON.stringify(expectedDates) !== JSON.stringify(after.dates)) {
    throw new Error(
      "Save-date changes differ from the reviewed repair; rolling back.",
    );
  }
}

async function assertPostconditions(runner: QueryRunner): Promise<void> {
  const columns: Array<{
    table_name: string;
    column_name: string;
    is_nullable: string;
    column_default: string | null;
    udt_name: string;
  }> = await runner.query(`
    SELECT table_name,column_name,is_nullable,column_default,udt_name
    FROM information_schema.columns WHERE table_schema = 'public'
  `);
  for (const [table, name] of [
    ["notifications", "userId"],
    ["userSavedPosts", "savers"],
    ["userBlockingUsers", "blockers"],
    ["userBlockingUsers", "blocking"],
    ["Post", "condition"],
  ]) {
    const column = columns.find(
      (item) => item.table_name === table && item.column_name === name,
    );
    if (!column || column.is_nullable !== "NO") {
      throw new Error(`Required column verification failed: ${table}.${name}`);
    }
  }
  const condition = columns.find(
    (item) => item.table_name === "Post" && item.column_name === "condition",
  );
  const savedAt = columns.find(
    (item) =>
      item.table_name === "userSavedPosts" && item.column_name === "savedAt",
  );
  if (
    !condition ||
    condition.column_default !== null ||
    !savedAt ||
    savedAt.udt_name !== "timestamptz" ||
    savedAt.is_nullable !== "YES" ||
    savedAt.column_default !== "now()"
  ) {
    throw new Error("Condition or savedAt verification failed.");
  }
  const keys: Array<{ table_name: string; definition: string }> =
    await runner.query(`
    SELECT t.relname AS table_name,pg_get_constraintdef(c.oid) AS definition
    FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname = 'public' AND c.contype = 'p' AND c.convalidated AND NOT c.condeferrable
      AND t.relname IN ('User','Post','userSavedPosts','userBlockingUsers') ORDER BY 1
  `);
  if (
    keys.length !== 4 ||
    !keys.some(
      (key) =>
        key.table_name === "User" &&
        key.definition === 'PRIMARY KEY ("firebaseUid")',
    ) ||
    !keys.some(
      (key) =>
        key.table_name === "Post" && key.definition === "PRIMARY KEY (id)",
    ) ||
    !keys.some(
      (key) =>
        key.table_name === "userSavedPosts" &&
        key.definition === "PRIMARY KEY (saved, savers)",
    ) ||
    !keys.some(
      (key) =>
        key.table_name === "userBlockingUsers" &&
        key.definition === "PRIMARY KEY (blockers, blocking)",
    )
  ) {
    throw new Error("Relationship primary-key verification failed.");
  }
  const references: Array<{
    table_name: string;
    column_name: string;
    target_schema: string;
    target_table: string;
    target_column: string;
    columns: number;
    target_columns: number;
    actions: string;
    validated: boolean;
    deferrable: boolean;
    match_type: string;
  }> = await runner.query(`
    SELECT t.relname AS table_name,a.attname AS column_name,
      rn.nspname AS target_schema,r.relname AS target_table,ra.attname AS target_column,
      cardinality(c.conkey) AS columns,cardinality(c.confkey) AS target_columns,
      c.confdeltype::text || c.confupdtype::text AS actions,c.convalidated AS validated,
      c.condeferrable AS deferrable,c.confmatchtype AS match_type
    FROM pg_constraint c JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = c.conkey[1]
    JOIN pg_class r ON r.oid = c.confrelid
    JOIN pg_namespace rn ON rn.oid = r.relnamespace
    JOIN pg_attribute ra ON ra.attrelid = r.oid AND ra.attnum = c.confkey[1]
    WHERE n.nspname = 'public' AND c.contype = 'f'
  `);
  for (const [table, column, targetTable, targetColumn, actions] of [
    ["Post", "userId", "User", "firebaseUid", "ca"],
    ["Request", "userId", "User", "firebaseUid", "ca"],
    ["Feedback", "userId", "User", "firebaseUid", "ca"],
    ["userBlockingUsers", "blockers", "User", "firebaseUid", "cc"],
    ["userBlockingUsers", "blocking", "User", "firebaseUid", "aa"],
    ["notifications", "userId", "User", "firebaseUid", "aa"],
    ["userSavedPosts", "savers", "User", "firebaseUid", "aa"],
    ["userSavedPosts", "saved", "Post", "id", "cc"],
  ]) {
    const found = references.filter(
      (item) => item.table_name === table && item.column_name === column,
    );
    if (
      !found.length ||
      (column !== "saved" && found.length !== 1) ||
      found.some(
        (item) =>
          item.target_schema !== "public" ||
          item.target_table !== targetTable ||
          item.target_column !== targetColumn ||
          item.columns !== 1 ||
          item.target_columns !== 1 ||
          item.actions !== actions ||
          !item.validated ||
          item.deferrable ||
          item.match_type !== "s",
      )
    )
      throw new Error(`Foreign-key verification failed: ${table}.${column}`);
  }
}

// READ COMMITTED ensures a preceding runner's committed ledger is visible after
// waiting for table locks. REPEATABLE READ would retain the pre-lock snapshot.
export async function beginCleanupTransaction(
  runner: QueryRunner,
  apply: boolean,
): Promise<void> {
  await runner.startTransaction(apply ? "READ COMMITTED" : "REPEATABLE READ");
  if (!apply) await runner.query("SET TRANSACTION READ ONLY");
  await runner.query("SET LOCAL lock_timeout = '5s'");
  await runner.query("SET LOCAL statement_timeout = '30s'");
  await runner.query("SET LOCAL TIME ZONE 'UTC'");
  if (apply) {
    const [lock] = await runner.query(
      "SELECT pg_try_advisory_xact_lock(hashtext('resell-active-db-cleanup')) AS acquired",
    );
    if (!lock.acquired)
      throw new Error("Another cleanup runner holds the lock.");
    await runner.query(`LOCK TABLE public.migrations, public."User", public."Post",
      public."Request", public."Feedback", public.notifications,
      public."userSavedPosts", public."userBlockingUsers" IN SHARE ROW EXCLUSIVE MODE`);
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const flag = (name: string): boolean => args.includes(name);
  const option = (name: string): string | undefined => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  for (let index = 0; index < args.length; index++) {
    const name = args[index];
    if (["--branch-id", "--report"].includes(name)) {
      if (!args[index + 1] || args[index + 1].startsWith("--")) {
        throw new Error(`Missing value for ${name}`);
      }
      index++;
    } else if (!["--apply", "--writes-paused"].includes(name)) {
      throw new Error(`Unknown option: ${name}`);
    }
  }
  const branchId = option("--branch-id");
  if (!flag("--branch-id") || !branchId || branchId.startsWith("--")) {
    throw new Error(
      "Specify --branch-id explicitly; inventory is the default.",
    );
  }
  const token =
    process.env.NEON_API_KEY ||
    JSON.parse(
      readFileSync(join(homedir(), ".config/neon/credentials.json"), "utf8"),
    ).access_token;
  async function neon<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(
        `https://console.neon.tech/api/v2/projects/${projectId}${path}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        },
      );
      if (!response.ok)
        throw new Error(`Neon metadata lookup failed: HTTP ${response.status}`);
      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
  const { branch } = await neon<{ branch: Branch }>(
    `/branches/${encodeURIComponent(branchId)}`,
  );
  if (branch.id !== branchId)
    throw new Error("Neon returned a different branch identity.");
  const { endpoints } = await neon<{
    endpoints: Array<{ host: string; type: string; branch_id: string }>;
  }>(`/branches/${encodeURIComponent(branchId)}/endpoints`);
  const direct = endpoints.filter(
    (endpoint) =>
      endpoint.type === "read_write" && endpoint.branch_id === branchId,
  );
  if (direct.length !== 1)
    throw new Error("Expected exactly one existing read/write endpoint.");
  const { uri } = await neon<{ uri: string }>(
    `/connection_uri?${new URLSearchParams({
      branch_id: branchId,
      database_name: "neondb",
      role_name: "neondb_owner",
      pooled: "false",
    })}`,
  );
  assertTarget(branch, direct[0].host, uri);
  if (
    flag("--apply") &&
    branch.name === "production" &&
    !flag("--writes-paused")
  ) {
    throw new Error(
      "Production apply requires an established write pause and --writes-paused.",
    );
  }
  const reportPath = resolve(
    option("--report") ||
      join(
        __dirname,
        "../secrets/cleanup-reports",
        `${branch.name}-${Date.now()}.json`,
      ),
  );
  mkdirSync(dirname(reportPath), { recursive: true, mode: 0o700 });
  const branchIdentity = {
    id: branch.id,
    name: branch.name,
    project_id: branch.project_id,
    parent_id: branch.parent_id,
  };
  const identityReport = {
    branch: branchIdentity,
    host: direct[0].host,
    database: "neondb",
  };
  // Reserve the report before connecting; never overwrite an earlier run.
  writeFileSync(
    reportPath,
    JSON.stringify({ ...identityReport, state: "initializing" }, null, 2),
    { flag: "wx", mode: 0o600 },
  );
  const persist = (state: string, body: Record<string, unknown>): void => {
    const temporary = `${reportPath}.${process.pid}.tmp`;
    writeFileSync(temporary, JSON.stringify({ ...body, state }, null, 2), {
      flag: "wx",
      mode: 0o600,
    });
    const descriptor = openSync(temporary, "r");
    try {
      fsyncSync(descriptor);
    } finally {
      closeSync(descriptor);
    }
    renameSync(temporary, reportPath);
  };
  const url = new URL(uri);
  url.searchParams.set("sslmode", "verify-full");
  const connection = await createConnection({
    name: `guarded-cleanup-${Date.now()}`,
    type: "postgres",
    url: url.toString(),
    schema: "public",
    entities: [],
    synchronize: false,
    migrationsRun: false,
    logging: false,
    extra: { max: 1, connectionTimeoutMillis: 12000 },
  });
  const runner = connection.createQueryRunner();
  let report: Record<string, unknown> = identityReport;
  let commitAttempted = false;
  let commitConfirmed = false;
  let failure: Error | undefined;
  try {
    await beginCleanupTransaction(runner, flag("--apply"));
    const [identity] = await runner.query(
      "SELECT current_database() AS database",
    );
    const [ledger] = await runner.query(
      "SELECT to_regclass('public.migrations') IS NOT NULL AS present",
    );
    if (identity.database !== "neondb" || !ledger.present)
      throw new Error("Unexpected database or missing migration ledger.");
    const history: Array<{ id: number; timestamp: string; name: string }> =
      await runner.query(
        "SELECT id,timestamp,name FROM public.migrations ORDER BY id",
      );
    const directory = resolve(__dirname, "../src/migrations");
    const files = readdirSync(directory).filter((file) => file.endsWith(".ts"));
    if (files.some((file) => file.includes("SyncProdSchema")))
      throw new Error(
        "Retire the unsafe legacy SyncProdSchema from the executable inventory first.",
      );
    const sourceNames = files.map((file) => {
      const source = readFileSync(join(directory, file), "utf8");
      const name =
        source.match(/\bname\s*=\s*["']([^"']+)/) ||
        source.match(/export class\s+(\w+)/);
      if (!name) throw new Error(`Cannot identify migration ${file}`);
      return name[1];
    });
    const pending = pendingCleanup(
      history.map((row) => row.name),
      sourceNames,
    );
    const before = await snapshot(runner);
    if (flag("--apply")) {
      const executor = new MigrationExecutor(connection, runner);
      for (const migration of cleanup.filter((item) =>
        pending.includes(item.name),
      )) {
        await executor.executeMigration(
          new Migration(
            undefined,
            Number(migration.name.slice(-13)),
            migration.name,
            migration,
          ),
        );
      }
      await assertPostconditions(runner);
      const after = await snapshot(runner);
      assertPreserved(before, after);
      const applied: Array<{ id: number; timestamp: string; name: string }> =
        await runner.query(
          "SELECT id,timestamp,name FROM public.migrations ORDER BY id",
        );
      if (
        pendingCleanup(
          applied.map((row) => row.name),
          sourceNames,
        ).length
      )
        throw new Error("Cleanup migration ledger verification failed.");
      const originalHistory = applied.filter(
        (row) => !cleanup.some((migration) => migration.name === row.name),
      );
      const expectedHistory = history.filter(
        (row) => !cleanup.some((migration) => migration.name === row.name),
      );
      if (JSON.stringify(originalHistory) !== JSON.stringify(expectedHistory))
        throw new Error("Historical migration records changed; rolling back.");
      report = {
        branch: branchIdentity,
        host: direct[0].host,
        database: "neondb",
        applied: pending,
        historyBefore: history,
        historyAfter: applied,
        before,
        after,
        verified: true,
      };
    } else {
      report = {
        branch: branchIdentity,
        host: direct[0].host,
        database: "neondb",
        pending,
        history,
        snapshot: before,
        readOnly: true,
      };
    }
    persist("verified-pending-commit", report);
    commitAttempted = true;
    await runner.commitTransaction();
    commitConfirmed = true;
    persist("committed", report);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    let outcome = commitConfirmed
      ? "committed"
      : commitAttempted
        ? "outcome-unknown"
        : "not-committed";
    if (!commitConfirmed && runner.isTransactionActive) {
      try {
        await runner.rollbackTransaction();
        if (!commitAttempted) outcome = "rolled-back";
      } catch {
        outcome = "outcome-unknown";
      }
    }
    try {
      persist(outcome, { ...report, error: message });
    } catch {
      /* Retain prior evidence. */
    }
    failure = new Error(
      `${outcome}: ${message}. Inspect report ${reportPath} and the ledger read-only before retrying.`,
    );
  } finally {
    for (const close of [() => runner.release(), () => connection.close()]) {
      try {
        await close();
      } catch (error) {
        if (!failure)
          failure = new Error(
            `${commitConfirmed ? "committed" : "outcome-unknown"}: connection cleanup failed; inspect ${reportPath} before retrying.`,
          );
      }
    }
  }
  if (failure) throw failure;
  console.log(
    JSON.stringify({
      branch: branch.name,
      branchId,
      apply: flag("--apply"),
      report: reportPath,
      pendingOrApplied: report.pending || report.applied,
      verified: report.verified || false,
    }),
  );
}

if (require.main === module) {
  main().catch((error: Error) => {
    console.error(
      error.message.replace(
        /postgres(?:ql)?:\/\/\S+/g,
        "[redacted connection]",
      ),
    );
    process.exitCode = 1;
  });
}
