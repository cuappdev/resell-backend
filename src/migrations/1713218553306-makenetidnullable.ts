import {MigrationInterface, QueryRunner} from "typeorm";

export class makenetidnullable1713218553306 implements MigrationInterface {
    name = 'makenetidnullable1713218553306'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "netid" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "netid" SET NOT NULL`);
    }

}