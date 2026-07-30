import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Precomputed similar-post IDs for fast GET /similar reads.
 * Neighbor ranking is done in TypeScript (exact cosine KNN), not pgvector.
 */
export class AddSimilarPostIds1772200000000 implements MigrationInterface {
  name = "AddSimilarPostIds1772200000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "similarPostIds" uuid[]`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Post" DROP COLUMN IF EXISTS "similarPostIds"`,
    );
  }
}
