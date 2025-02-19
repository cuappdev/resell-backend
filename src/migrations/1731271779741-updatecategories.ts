import {MigrationInterface, QueryRunner} from "typeorm";

export class updatecategories1731271779741 implements MigrationInterface {
    name = 'updatecategories1731271779741'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" RENAME COLUMN "categories" TO "category"`);
        await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "Post" ADD "category" character varying`);
        await queryRunner.query(`UPDATE "Post" SET "category" = 'Other' WHERE "category" IS NULL`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "category" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN "category"`);
        await queryRunner.query(`ALTER TABLE "Post" ADD "category" text array NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Post" RENAME COLUMN "category" TO "categories"`);
    }

}