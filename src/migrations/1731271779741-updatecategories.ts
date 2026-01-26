import { MigrationInterface, QueryRunner } from "typeorm";

export class updatecategories1731271779741 implements MigrationInterface {
  name = "updatecategories1731271779741";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "Post"
            ADD COLUMN "category" character varying
        `);

    // 2. Copy first element from 'categories' array into 'category'
    await queryRunner.query(`
            UPDATE "Post"
            SET "category" = COALESCE("categories"[1], 'Other')
        `);

    // 3. Drop the old 'categories' array column
    await queryRunner.query(`
            ALTER TABLE "Post"
            DROP COLUMN "categories"
        `);

    // 4. Set 'category' as NOT NULL
    await queryRunner.query(`
            ALTER TABLE "Post"
            ALTER COLUMN "category" SET NOT NULL
        `);
    await queryRunner.query(
      `ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "Post" ALTER COLUMN "altered_price" TYPE numeric`,
    );
    await queryRunner.query(
      `ALTER TABLE "Post" ALTER COLUMN "original_price" TYPE numeric`,
    );
    // 1. Re-add the 'categories' array field
    await queryRunner.query(`
            ALTER TABLE "Post"
            ADD COLUMN "categories" text[] NOT NULL DEFAULT '{}'
        `);

    // 2. Copy 'category' string into the first element of 'categories' array
    await queryRunner.query(`
            UPDATE "Post"
            SET "categories" = ARRAY["category"]
        `);

    // 3. Drop the 'category' field
    await queryRunner.query(`
            ALTER TABLE "Post"
            DROP COLUMN "category"
        `);
    // await queryRunner.query(`ALTER TABLE "Post" DROP COLUMN "category"`);
    // await queryRunner.query(`ALTER TABLE "Post" ADD "category" text array NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "Post" RENAME COLUMN "category" TO "categories"`);
  }
}
