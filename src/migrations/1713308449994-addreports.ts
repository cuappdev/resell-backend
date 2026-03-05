import { MigrationInterface, QueryRunner } from "typeorm";

export class addreports1713308449994 implements MigrationInterface {
  name = "addreports1713308449994";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "Message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" character varying NOT NULL, "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "sender" uuid, "receiver" uuid, CONSTRAINT "PK_7dd6398f0d1dcaf73df342fa325" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "Report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying NOT NULL, "type" character varying NOT NULL, "resolved" boolean NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reporter_id" uuid, "reported_id" uuid, "post_id" uuid, "message_id" uuid, CONSTRAINT "PK_9dbb4c593be9832c28a5793e258" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "Message" ADD CONSTRAINT "FK_e2dae4735204f29947d6c42a615" FOREIGN KEY ("sender") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Message" ADD CONSTRAINT "FK_8cc2e2f4ee9cdf7e5d9c70c5809" FOREIGN KEY ("receiver") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" ADD CONSTRAINT "FK_6c3af08f1d45614f3b2f7e1b407" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" ADD CONSTRAINT "FK_0dd9a57f65a4b09cdae63735b13" FOREIGN KEY ("reported_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" ADD CONSTRAINT "FK_244bde34d749985aa27e551c110" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" ADD CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Report" DROP CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" DROP CONSTRAINT "FK_244bde34d749985aa27e551c110"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" DROP CONSTRAINT "FK_0dd9a57f65a4b09cdae63735b13"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Report" DROP CONSTRAINT "FK_6c3af08f1d45614f3b2f7e1b407"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Message" DROP CONSTRAINT "FK_8cc2e2f4ee9cdf7e5d9c70c5809"`,
    );
    await queryRunner.query(
      `ALTER TABLE "Message" DROP CONSTRAINT "FK_e2dae4735204f29947d6c42a615"`,
    );
    await queryRunner.query(`DROP TABLE "Report"`);
    await queryRunner.query(`DROP TABLE "Message"`);
  }
}
