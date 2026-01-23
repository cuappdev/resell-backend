import {MigrationInterface, QueryRunner} from "typeorm";

export class AddAvailabilityToUser1769385600000 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "availabilityId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" DROP COLUMN IF EXISTS "availabilityId"`);
    }

}
