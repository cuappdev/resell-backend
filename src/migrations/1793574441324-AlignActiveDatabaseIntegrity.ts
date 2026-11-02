import { MigrationInterface, QueryRunner } from "typeorm";

import {
  inspectIntegritySchema,
  quote,
  sameColumns,
} from "../database-cleanup/1793574441324-integrity-preflight";

export class AlignActiveDatabaseIntegrity1793574441324 implements MigrationInterface {
  name = "AlignActiveDatabaseIntegrity1793574441324";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!queryRunner.isTransactionActive) {
      throw new Error("Run this migration inside a transaction.");
    }

    const {
      column,
      conditionDefault,
      constraints,
      savedPrimaryKey,
      blockingPrimaryKey,
    } = await inspectIntegritySchema(queryRunner);

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
