import { MigrationInterface, QueryRunner } from "typeorm";

export class MarkKnownLegacySaveDatesUnknown1793574441325 implements MigrationInterface {
  name = "MarkKnownLegacySaveDatesUnknown1793574441325";

  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!queryRunner.isTransactionActive) {
      throw new Error("Run this migration inside a transaction.");
    }

    const columns: Array<{ udt_name: string }> = await queryRunner.query(`
      SELECT udt_name
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'userSavedPosts'
        AND column_name = 'savedAt'
    `);
    if (columns.length !== 1 || columns[0].udt_name !== "timestamptz") {
      throw new Error(
        "Expected public.userSavedPosts.savedAt to be timestamptz.",
      );
    }

    await queryRunner.query(`
      ALTER TABLE public."userSavedPosts"
        ALTER COLUMN "savedAt" DROP NOT NULL,
        ALTER COLUMN "savedAt" SET DEFAULT now()
    `);
    // Preserve PostgreSQL microseconds: a JavaScript Date would truncate them.
    await queryRunner.query(
      `UPDATE public."userSavedPosts" SET "savedAt" = NULL
       WHERE "savedAt" = $1::timestamptz`,
      ["2026-10-25 18:48:35.538726+00"],
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      "Unknown historical save dates cannot be reconstructed. Use a reviewed forward repair.",
    );
  }
}
