import {MigrationInterface, QueryRunner} from "typeorm";

export class AddArchiveToRequest1730852627961 implements MigrationInterface {
    name = 'AddArchiveToRequest1730852627961'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`);
        await queryRunner.query(`ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`);
    }

}
