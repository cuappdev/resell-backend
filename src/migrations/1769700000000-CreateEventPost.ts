import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateEventPost1769700000000 implements MigrationInterface {
  name = "CreateEventPost1769700000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "eventPosts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "postId" uuid NOT NULL,
        "eventTagId" uuid NOT NULL,
        "source" character varying(20) NOT NULL,
        "relevanceScore" float DEFAULT NULL,
        "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
        CONSTRAINT "PK_eventPosts" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_eventPost_postId_eventTagId" UNIQUE ("postId", "eventTagId"),
        CONSTRAINT "FK_eventPost_postId" FOREIGN KEY ("postId")
          REFERENCES "Post"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_eventPost_eventTagId" FOREIGN KEY ("eventTagId")
          REFERENCES "EventTag"("id") ON DELETE CASCADE
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eventPost_eventTagId" ON "eventPosts" ("eventTagId")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_eventPost_postId" ON "eventPosts" ("postId")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_eventPost_postId"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_eventPost_eventTagId"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "eventPosts"`);
  }
}
