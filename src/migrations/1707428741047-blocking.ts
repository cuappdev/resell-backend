import {MigrationInterface, QueryRunner} from "typeorm";

export class blocking1707428741047 implements MigrationInterface {
    name = 'blocking1707428741047'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "user_blocking_users" ("blockers" uuid NOT NULL, "blocking" uuid NOT NULL, CONSTRAINT "PK_8db623e58cc4bce5fbcc252c66b" PRIMARY KEY ("blockers", "blocking"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fab66ba7c0e58e67b0d67f1c23" ON "user_blocking_users" ("blockers") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5c7223aa162c5ccd1867056f7" ON "user_blocking_users" ("blocking") `);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "accessToken"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "expiresAt"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "refreshToken"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "deviceToken"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "givenName"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "familyName"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "numReviews"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "photoUrl"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "venmoHandle"`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_02dec29f4ca814ab6efa2d4f0c4"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "googleId"`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "access_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "refresh_token" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "device_token" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "user_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "given_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "family_name" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "num_reviews" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "User" ADD "photo_url" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD "venmo_handle" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD "google_id" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_a4f1fbe21cff2f5860ffa7a3cb6" UNIQUE ("google_id")`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" ADD CONSTRAINT "FK_fab66ba7c0e58e67b0d67f1c232" FOREIGN KEY ("blockers") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" ADD CONSTRAINT "FK_b5c7223aa162c5ccd1867056f73" FOREIGN KEY ("blocking") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_blocking_users" DROP CONSTRAINT "FK_b5c7223aa162c5ccd1867056f73"`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" DROP CONSTRAINT "FK_fab66ba7c0e58e67b0d67f1c232"`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "User" DROP CONSTRAINT "UQ_a4f1fbe21cff2f5860ffa7a3cb6"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "google_id"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "venmo_handle"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "photo_url"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "num_reviews"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "family_name"`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "given_name"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "device_token"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "refresh_token"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "expires_at"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP COLUMN "access_token"`);
        await queryRunner.query(`ALTER TABLE "User" ADD "googleId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD CONSTRAINT "UQ_02dec29f4ca814ab6efa2d4f0c4" UNIQUE ("googleId")`);
        await queryRunner.query(`ALTER TABLE "User" ADD "venmoHandle" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD "photoUrl" character varying`);
        await queryRunner.query(`ALTER TABLE "User" ADD "numReviews" integer NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "User" ADD "familyName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "User" ADD "givenName" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "userId" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "deviceToken" text NOT NULL DEFAULT ''`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "refreshToken" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "expiresAt" TIMESTAMP WITH TIME ZONE NOT NULL`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD "accessToken" character varying NOT NULL`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5c7223aa162c5ccd1867056f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fab66ba7c0e58e67b0d67f1c23"`);
        await queryRunner.query(`DROP TABLE "user_blocking_users"`);
    }

}
