import {MigrationInterface, QueryRunner} from "typeorm";

export class AddArchiveToRequest1731186421123 implements MigrationInterface {
    name = 'AddArchiveToRequest1731186421123'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Request" ADD COLUMN IF NOT EXISTS "archive" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Request" DROP COLUMN IF EXISTS "archive"`);
    }
}