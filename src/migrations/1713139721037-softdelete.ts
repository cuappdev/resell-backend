import {MigrationInterface, QueryRunner} from "typeorm";

export class softdelete1713139721037 implements MigrationInterface {
    name = 'softdelete1713139721037'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ADD "isActive" boolean NOT NULL DEFAULT true`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN "isActive"`);
    }

}