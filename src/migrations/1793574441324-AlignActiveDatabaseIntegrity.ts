import { MigrationInterface, QueryRunner } from "typeorm";

interface ColumnState {
  table_name: string;
  column_name: string;
  udt_name: string;
  is_nullable: "YES" | "NO";
  column_default: string | null;
}

interface ConstraintState {
  table_name: string;
  constraint_name: string;
  constraint_type: "p" | "f";
  column_names: string[];
  referenced_schema: string | null;
  referenced_table: string | null;
  referenced_columns: string[];
  delete_action: string;
  update_action: string;
  match_type: string;
  validated: boolean;
  deferrable: boolean;
}

const quote = (identifier: string): string =>
  `"${identifier.replace(/"/g, '""')}"`;

export class AlignActiveDatabaseIntegrity1793574441324 implements MigrationInterface {
  name = "AlignActiveDatabaseIntegrity1793574441324";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!queryRunner.isTransactionActive) {
      throw new Error("Run this migration inside a transaction.");
    }

    const columns: ColumnState[] = await queryRunner.query(`
      SELECT table_name, column_name, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name IN (
          'User', 'Post', 'Request', 'Feedback', 'notifications',
          'userSavedPosts', 'userBlockingUsers'
        )
    `);

    const column = (table: string, name: string): ColumnState => {
      const found = columns.find(
        (item) => item.table_name === table && item.column_name === name,
      );
      if (!found) throw new Error(`Expected public.${table}.${name} to exist.`);
      return found;
    };

    const expectedColumns: Array<[string, string, string, boolean]> = [
      ["User", "firebaseUid", "varchar", true],
      ["Post", "id", "uuid", true],
      ["Post", "userId", "varchar", false],
      ["Post", "condition", "varchar", true],
      ["Request", "userId", "varchar", false],
      ["Feedback", "userId", "varchar", false],
      ["notifications", "userId", "varchar", false],
      ["userSavedPosts", "saved", "uuid", true],
      ["userSavedPosts", "savers", "varchar", false],
      ["userBlockingUsers", "blockers", "varchar", false],
      ["userBlockingUsers", "blocking", "varchar", false],
    ];
    for (const [table, name, type, mustBeRequired] of expectedColumns) {
      const found = column(table, name);
      if (
        found.udt_name !== type ||
        (mustBeRequired && found.is_nullable !== "NO")
      ) {
        throw new Error(`Unexpected definition for public.${table}.${name}.`);
      }
    }
    const conditionDefault = column("Post", "condition").column_default;
    if (
      conditionDefault !== null &&
      conditionDefault !== "'Good'::character varying"
    ) {
      throw new Error("Unexpected Post.condition default; review it first.");
    }

    const constraints: ConstraintState[] = await queryRunner.query(`
      SELECT
        t.relname AS table_name, c.conname AS constraint_name,
        c.contype AS constraint_type,
        ARRAY(
          SELECT a.attname::text
          FROM unnest(c.conkey) WITH ORDINALITY AS k(attnum, position)
          JOIN pg_attribute a ON a.attrelid = c.conrelid AND a.attnum = k.attnum
          ORDER BY k.position
        ) AS column_names,
        rn.nspname AS referenced_schema, rt.relname AS referenced_table,
        ARRAY(
          SELECT a.attname::text
          FROM unnest(c.confkey) WITH ORDINALITY AS k(attnum, position)
          JOIN pg_attribute a ON a.attrelid = c.confrelid AND a.attnum = k.attnum
          ORDER BY k.position
        ) AS referenced_columns,
        c.confdeltype AS delete_action, c.confupdtype AS update_action,
        c.confmatchtype AS match_type, c.convalidated AS validated,
        c.condeferrable AS deferrable
      FROM pg_constraint c
      JOIN pg_class t ON t.oid = c.conrelid
      JOIN pg_namespace n ON n.oid = t.relnamespace
      LEFT JOIN pg_class rt ON rt.oid = c.confrelid
      LEFT JOIN pg_namespace rn ON rn.oid = rt.relnamespace
      WHERE n.nspname = 'public' AND c.contype IN ('p', 'f')
        AND t.relname IN (
          'User', 'Post', 'Request', 'Feedback', 'notifications',
          'userSavedPosts', 'userBlockingUsers'
        )
    `);

    const sameColumns = (actual: string[], expected: string[]): boolean =>
      actual.length === expected.length &&
      expected.every((name, index) => actual[index] === name);
    const primaryKey = (
      table: string,
      names: string[],
      required: boolean,
    ): ConstraintState | undefined => {
      const found = constraints.filter(
        (item) => item.table_name === table && item.constraint_type === "p",
      );
      if (
        found.length > 1 ||
        (required && found.length !== 1) ||
        found.some(
          (item) =>
            !sameColumns(item.column_names, names) ||
            !item.validated ||
            item.deferrable,
        )
      ) {
        throw new Error(`Unexpected primary key on public.${table}.`);
      }
      return found[0];
    };
    primaryKey("User", ["firebaseUid"], true);
    primaryKey("Post", ["id"], true);
    const savedPrimaryKey = primaryKey(
      "userSavedPosts",
      ["saved", "savers"],
      false,
    );
    const blockingPrimaryKey = primaryKey(
      "userBlockingUsers",
      ["blockers", "blocking"],
      false,
    );

    // Production has two equivalent post FKs here; retain both without weakening either.
    const savedPostForeignKeys = constraints.filter(
      (item) =>
        item.table_name === "userSavedPosts" &&
        item.constraint_type === "f" &&
        item.column_names.includes("saved"),
    );
    if (
      savedPostForeignKeys.length === 0 ||
      savedPostForeignKeys.some(
        (fk) =>
          !sameColumns(fk.column_names, ["saved"]) ||
          fk.referenced_schema !== "public" ||
          fk.referenced_table !== "Post" ||
          !sameColumns(fk.referenced_columns, ["id"]) ||
          !fk.validated ||
          fk.deferrable ||
          fk.match_type !== "s" ||
          fk.delete_action !== "c" ||
          fk.update_action !== "c",
      )
    ) {
      throw new Error(
        "Unexpected foreign key for public.userSavedPosts.saved.",
      );
    }

    const foreignKeys: Array<{
      table: string;
      field: string;
      allowedActions: string[];
      targetActions: string;
    }> = [
      {
        table: "Post",
        field: "userId",
        allowedActions: ["aa", "ca"],
        targetActions: "ca",
      },
      {
        table: "Request",
        field: "userId",
        allowedActions: ["aa", "ca"],
        targetActions: "ca",
      },
      {
        table: "Feedback",
        field: "userId",
        allowedActions: ["aa", "ca"],
        targetActions: "ca",
      },
      {
        table: "userBlockingUsers",
        field: "blockers",
        allowedActions: ["aa", "cc"],
        targetActions: "cc",
      },
      {
        table: "userBlockingUsers",
        field: "blocking",
        allowedActions: ["aa"],
        targetActions: "aa",
      },
      {
        table: "notifications",
        field: "userId",
        allowedActions: ["aa"],
        targetActions: "aa",
      },
      {
        table: "userSavedPosts",
        field: "savers",
        allowedActions: ["aa"],
        targetActions: "aa",
      },
    ];
    const foreignKeyRepairs: string[] = [];
    for (const expected of foreignKeys) {
      const found = constraints.filter(
        (item) =>
          item.table_name === expected.table &&
          item.constraint_type === "f" &&
          item.column_names.includes(expected.field),
      );
      const fk = found[0];
      if (
        found.length !== 1 ||
        !sameColumns(fk.column_names, [expected.field]) ||
        fk.referenced_schema !== "public" ||
        fk.referenced_table !== "User" ||
        !sameColumns(fk.referenced_columns, ["firebaseUid"]) ||
        !fk.validated ||
        fk.deferrable ||
        fk.match_type !== "s" ||
        !expected.allowedActions.includes(fk.delete_action + fk.update_action)
      ) {
        throw new Error(
          `Unexpected foreign key for public.${expected.table}.${expected.field}.`,
        );
      }
      if (fk.delete_action + fk.update_action !== expected.targetActions) {
        const onDelete =
          expected.targetActions[0] === "c" ? "CASCADE" : "NO ACTION";
        const onUpdate =
          expected.targetActions[1] === "c" ? "CASCADE" : "NO ACTION";
        foreignKeyRepairs.push(
          `ALTER TABLE public.${quote(expected.table)} DROP CONSTRAINT ${quote(fk.constraint_name)}`,
          `ALTER TABLE public.${quote(expected.table)} ADD CONSTRAINT ${quote(fk.constraint_name)}
           FOREIGN KEY (${quote(expected.field)}) REFERENCES public."User" ("firebaseUid")
           ON DELETE ${onDelete} ON UPDATE ${onUpdate}`,
        );
      }
    }

    // Reject invalid records instead of deleting, deduplicating, or inventing users.
    const invalidChecks: string[] = foreignKeys.map(({ table, field }) => {
      const required = [
        "notifications",
        "userSavedPosts",
        "userBlockingUsers",
      ].includes(table);
      return `SELECT '${table}.${field}' AS issue, count(*)::int AS count
        FROM public.${quote(table)} source
        LEFT JOIN public."User" target ON target."firebaseUid" = source.${quote(field)}
        WHERE ${required ? "" : `source.${quote(field)} IS NOT NULL AND `}target."firebaseUid" IS NULL`;
    });
    invalidChecks.push(
      `SELECT 'userSavedPosts.saved' AS issue, count(*)::int AS count
       FROM public."userSavedPosts" source
       LEFT JOIN public."Post" target ON target.id = source.saved
       WHERE target.id IS NULL`,
      `SELECT 'duplicate saves' AS issue, count(*)::int AS count FROM (
        SELECT saved, savers FROM public."userSavedPosts"
        GROUP BY saved, savers HAVING count(*) > 1
      ) duplicates`,
      `SELECT 'duplicate blocks' AS issue, count(*)::int AS count FROM (
        SELECT blockers, blocking FROM public."userBlockingUsers"
        GROUP BY blockers, blocking HAVING count(*) > 1
      ) duplicates`,
    );
    const invalid: Array<{ issue: string; count: number }> =
      await queryRunner.query(invalidChecks.join("\nUNION ALL\n"));
    const problems = invalid.filter((item) => item.count > 0);
    if (problems.length > 0) {
      throw new Error(
        `Integrity preflight failed: ${problems.map((item) => `${item.issue}: ${item.count}`).join(", ")}.`,
      );
    }

    // All supported schema states and affected records have passed preflight.
    for (const [table, field] of [
      ["notifications", "userId"],
      ["userSavedPosts", "savers"],
      ["userBlockingUsers", "blockers"],
      ["userBlockingUsers", "blocking"],
    ]) {
      if (column(table, field).is_nullable === "YES") {
        await queryRunner.query(
          `ALTER TABLE public.${quote(table)} ALTER COLUMN ${quote(field)} SET NOT NULL`,
        );
      }
    }
    if (!savedPrimaryKey) {
      await queryRunner.query(
        `ALTER TABLE public."userSavedPosts" ADD PRIMARY KEY ("saved", "savers")`,
      );
    }
    if (!blockingPrimaryKey) {
      await queryRunner.query(
        `ALTER TABLE public."userBlockingUsers" ADD PRIMARY KEY ("blockers", "blocking")`,
      );
    }
    for (const sql of foreignKeyRepairs) await queryRunner.query(sql);
    if (conditionDefault !== null) {
      await queryRunner.query(
        `ALTER TABLE public."Post" ALTER COLUMN "condition" DROP DEFAULT`,
      );
    }
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Automatic reversal is unsupported. Use a reviewed forward repair.",
    );
  }
}
