import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserStats1767386999887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_following_users" ("follower_id" character varying NOT NULL, "following_id" character varying NOT NULL, CONSTRAINT "PK_user_following_users" PRIMARY KEY ("follower_id", "following_id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_user_following_users_follower_id" ON "user_following_users" ("follower_id")`);
        await queryRunner.query(`CREATE INDEX "IDX_user_following_users_following_id" ON "user_following_users" ("following_id")`);
        await queryRunner.query(`ALTER TABLE "user_following_users" ADD CONSTRAINT "FK_user_following_users_follower_id" FOREIGN KEY ("follower_id") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_following_users" ADD CONSTRAINT "FK_user_following_users_following_id" FOREIGN KEY ("following_id") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE`);
        
        await queryRunner.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "soldPosts" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN IF EXISTS "soldPosts"`);
        await queryRunner.query(`DROP INDEX "IDX_user_following_users_following_id"`);
        await queryRunner.query(`DROP INDEX "IDX_user_following_users_follower_id"`);
        await queryRunner.query(`DROP TABLE "user_following_users"`);
    }

}
