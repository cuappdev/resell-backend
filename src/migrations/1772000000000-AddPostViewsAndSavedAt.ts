import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPostViewsAndSavedAt1772000000000 implements MigrationInterface {
  name = "AddPostViewsAndSavedAt1772000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "postViews" (
        "postId" uuid NOT NULL,
        "viewerUid" character varying NOT NULL,
        "viewDate" date NOT NULL,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_postViews" PRIMARY KEY ("postId", "viewerUid", "viewDate"),
        CONSTRAINT "FK_postViews_postId" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE NO ACTION,
        CONSTRAINT "FK_postViews_viewerUid" FOREIGN KEY ("viewerUid") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_postViews_postId_createdAt" ON "postViews" ("postId", "createdAt")`,
    );

    await queryRunner.query(
      `ALTER TABLE "userSavedPosts" ADD COLUMN IF NOT EXISTS "savedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "userSavedPosts" DROP COLUMN IF EXISTS "savedAt"`,
    );
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_postViews_postId_createdAt"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "postViews"`);
  }
}
