import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Clear Universal Sentence Encoder vectors so they are not mixed with
 * OpenAI text-embedding-3-small vectors (incompatible embedding spaces).
 * New creates re-embed via OpenAI; optional backfill can run later.
 */
export class ClearUseEmbeddings1772100000000 implements MigrationInterface {
  name = "ClearUseEmbeddings1772100000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE "Post" SET embedding = NULL WHERE embedding IS NOT NULL`);
    await queryRunner.query(
      `UPDATE "Request" SET embedding = NULL WHERE embedding IS NOT NULL`,
    );
    await queryRunner.query(
      `UPDATE "searches" SET "searchVector" = NULL WHERE "searchVector" IS NOT NULL`,
    );
  }

  public async down(_queryRunner: QueryRunner): Promise<void> {
    // Irreversible: prior USE vectors cannot be restored
  }
}
