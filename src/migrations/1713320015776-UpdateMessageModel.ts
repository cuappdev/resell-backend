import {MigrationInterface, QueryRunner} from "typeorm";

export class UpdateMessageModel1713320015776 implements MigrationInterface {
    name = 'UpdateMessageModel1713320015776'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Message" DROP CONSTRAINT "FK_e2dae4735204f29947d6c42a615"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP CONSTRAINT "FK_8cc2e2f4ee9cdf7e5d9c70c5809"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP COLUMN "timestamp"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP COLUMN "sender"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP COLUMN "receiver"`);
        await queryRunner.query(`ALTER TABLE "Message" DROP COLUMN "content"`);
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c"`);
        await queryRunner.query(`ALTER TABLE "Message" ALTER COLUMN "id" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c"`);
        await queryRunner.query(`ALTER TABLE "Message" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Message" ADD "content" character varying NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Message" ADD "receiver" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Message" ADD "sender" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "Message" ADD "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "Message" ADD CONSTRAINT "FK_8cc2e2f4ee9cdf7e5d9c70c5809" FOREIGN KEY ("receiver") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Message" ADD CONSTRAINT "FK_e2dae4735204f29947d6c42a615" FOREIGN KEY ("sender") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}