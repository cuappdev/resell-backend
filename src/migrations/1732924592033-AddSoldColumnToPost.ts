import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSoldColumnToPost1732924592033 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Post" ADD COLUMN IF NOT EXISTS "sold" boolean NOT NULL DEFAULT false`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN IF EXISTS "sold"`);
  }
}
