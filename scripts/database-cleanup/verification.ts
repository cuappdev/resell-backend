import { QueryRunner } from "typeorm";

const knownLegacyDate = "2026-10-25 18:48:35.538726+00";

export interface Snapshot {
  tables: Record<string, { count: number; fingerprint: string }>;
  dates: Array<{ key: string; value: string | null }>;
  protectedSchema: unknown;
}

export async function snapshot(runner: QueryRunner): Promise<Snapshot> {
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

export async function assertPostconditions(runner: QueryRunner): Promise<void> {
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
