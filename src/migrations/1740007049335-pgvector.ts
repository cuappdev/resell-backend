import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertEmbeddingToVector1631740007049335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Store embeddings as float[] — similarity ranking is done in application code
    await queryRunner.query(`
      ALTER TABLE "Post"
        ADD COLUMN embedding FLOAT []
    `);
    await queryRunner.query(`
      ALTER TABLE "Request"
        ADD COLUMN embedding FLOAT []
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Post"   DROP COLUMN IF EXISTS embedding;`,
    );
    await queryRunner.query(
      `ALTER TABLE "Request" DROP COLUMN IF EXISTS embedding;`,
    );
  }
}
