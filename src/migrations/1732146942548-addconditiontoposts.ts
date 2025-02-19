import {MigrationInterface, QueryRunner} from "typeorm";

export class addconditiontoposts1732146942548 implements MigrationInterface {
    name = 'addconditiontoposts1732146942548'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ADD "condition" character varying`);
        await queryRunner.query(`UPDATE "Post" SET "condition" = 'NEW' WHERE "condition" IS NULL`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "condition" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN "condition"`);
    }

}