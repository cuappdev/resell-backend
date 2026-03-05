import {MigrationInterface, QueryRunner} from "typeorm";

export class AddUserStats1767386999887 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS "user_following_users" ("follower_id" character varying NOT NULL, "following_id" character varying NOT NULL, CONSTRAINT "PK_user_following_users" PRIMARY KEY ("follower_id", "following_id"))`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_following_users_follower_id" ON "user_following_users" ("follower_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_user_following_users_following_id" ON "user_following_users" ("following_id")`);
        
        // Add fks only if they don't exist
        const fk1Exists = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_following_users_follower_id'`);
        if (!fk1Exists || fk1Exists.length === 0) {
            await queryRunner.query(`ALTER TABLE "user_following_users" ADD CONSTRAINT "FK_user_following_users_follower_id" FOREIGN KEY ("follower_id") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE`);
        }
        
        const fk2Exists = await queryRunner.query(`SELECT 1 FROM pg_constraint WHERE conname = 'FK_user_following_users_following_id'`);
        if (!fk2Exists || fk2Exists.length === 0) {
            await queryRunner.query(`ALTER TABLE "user_following_users" ADD CONSTRAINT "FK_user_following_users_following_id" FOREIGN KEY ("following_id") REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE CASCADE`);
        }
        
        await queryRunner.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "soldPosts" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN IF EXISTS "soldPosts"`);
        await queryRunner.query(`DROP INDEX "IDX_user_following_users_following_id"`);
        await queryRunner.query(`DROP INDEX "IDX_user_following_users_follower_id"`);
        await queryRunner.query(`DROP TABLE "user_following_users"`);
    }

}
