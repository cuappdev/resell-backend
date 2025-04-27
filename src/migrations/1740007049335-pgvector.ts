import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertEmbeddingToVector1631740007049335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure pgvector extension is installed
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);

    // Add embedding back as a 512‑dimensional vector
    await queryRunner.query(`
      ALTER TABLE "Post"
        ADD COLUMN embedding FLOAT []
    `);
    await queryRunner.query(`
      ALTER TABLE "Request"
        ADD COLUMN embedding FLOAT []
    `);

    // Optional: add your ivfflat indexes here if desired
    // await queryRunner.query(
    //   'CREATE INDEX post_embedding_idx ON "Post" USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
    // );
    // await queryRunner.query(
    //   'CREATE INDEX request_embedding_idx ON "Request" USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
    // );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove the vector columns
    await queryRunner.query(`ALTER TABLE "Post"   DROP COLUMN IF EXISTS embedding;`);
    await queryRunner.query(`ALTER TABLE "Request" DROP COLUMN IF EXISTS embedding;`);
  }
}
