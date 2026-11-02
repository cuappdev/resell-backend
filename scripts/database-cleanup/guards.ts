import { QueryRunner } from "typeorm";

export const projectId = "fragrant-flower-02125519";
const activeBranches = {
  "br-wispy-forest-audpsdxp": "dev",
  "br-crimson-sound-auy345bq": "staging",
  "br-weathered-wave-au5ygpff": "production",
};
export const expectedMigrationNames = [
  "AlignActiveDatabaseIntegrity1793574441324",
  "MarkKnownLegacySaveDatesUnknown1793574441325",
] as const;
const legacyDuplicates = new Set([
  "init1709163288115",
  "softdelete1713139721037",
  "makenetidnullable1713218553306",
]);

export interface Branch {
  id: string;
  project_id: string;
  name: string;
  parent_id?: string;
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
  const expected = [...expectedMigrationNames];
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
