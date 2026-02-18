import {MigrationInterface, QueryRunner} from "typeorm";

export class AddConfirmationSentToTransaction1769500000000 implements MigrationInterface {
    name = 'AddConfirmationSentToTransaction1769500000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Transaction" ADD "confirmationSent" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Transaction" DROP COLUMN "confirmationSent"`);
    }
}
