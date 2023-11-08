import { MigrationInterface, QueryRunner } from "typeorm";

export class ChangeUserBlockingTableName1698357261607 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE user_blocking RENAME TO UserBlocking`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE UserBlocking RENAME TO user_blocking`);
    }

}
