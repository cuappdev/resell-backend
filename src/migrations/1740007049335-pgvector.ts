import { MigrationInterface, QueryRunner } from "typeorm";

export class ConvertEmbeddingToVector1631740007049335 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable the pgvector extension
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS vector');

    // Convert the embedding column in "Post" to a vector type.
    // Adjust the dimension (1536) if your embeddings differ.
    await queryRunner.query(`
      ALTER TABLE "Post"
      ALTER COLUMN embedding TYPE vector(512)
      USING embedding::vector(512)
    `);

    // Convert the embedding column in "Request" to a vector type.
    await queryRunner.query(`
      ALTER TABLE "Request"
      ALTER COLUMN embedding TYPE vector(512)
      USING embedding::vector(512)
    `);

    // Create indexes for similarity searches
    await queryRunner.query(
      'CREATE INDEX post_embedding_idx ON "Post" USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
    );
    await queryRunner.query(
      'CREATE INDEX request_embedding_idx ON "Request" USING ivfflat (embedding vector_l2_ops) WITH (lists = 100)'
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP INDEX IF EXISTS post_embedding_idx');
    await queryRunner.query('DROP INDEX IF EXISTS request_embedding_idx');
    // Optionally, you can revert the column type changes if needed.
  }
}
