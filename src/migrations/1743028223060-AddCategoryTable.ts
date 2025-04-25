import {MigrationInterface, QueryRunner} from "typeorm";

export class AddCategoryTable1743028223060 implements MigrationInterface {
    name = 'AddCategoryTable1743028223060'

    public async up(queryRunner: QueryRunner): Promise<void> {
        
    await queryRunner.query(`
        CREATE TABLE "Category" (
          "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
          "name" character varying NOT NULL,
          CONSTRAINT "PK_c2727780c5b9b0c564c29a4977c" PRIMARY KEY ("id")
        )
      `);
  
   
      await queryRunner.query(`
        CREATE TABLE "post_categories" (
          "posts" uuid NOT NULL,
          "categories" uuid NOT NULL,
          CONSTRAINT "PK_88340cf0b1b8a00578602f4c80b" PRIMARY KEY ("posts", "categories"),
          CONSTRAINT "FK_post" FOREIGN KEY ("posts") REFERENCES "Post"("id") ON DELETE CASCADE,
          CONSTRAINT "FK_category" FOREIGN KEY ("categories") REFERENCES "Category"("id") ON DELETE CASCADE
        )
      `);
  
 
      await queryRunner.query(`
        CREATE INDEX "IDX_623743dadf52f9b1c5ebdb0ff8" ON "post_categories" ("posts")
      `);
      await queryRunner.query(`
        CREATE INDEX "IDX_1860e6d8b1a47e00c8c0ea937b" ON "post_categories" ("categories")
      `);
  
        // Insert unique categories into the new Category table
  await queryRunner.query(`
    INSERT INTO "Category" ("name")
    SELECT "category"
    FROM "Post"
    WHERE "category" IS NOT NULL
  `);

  // Create post-category relations
  await queryRunner.query(`
    INSERT INTO "post_categories" ("posts", "categories")
    SELECT "Post"."id", "Category"."id"
    FROM "Post"
    JOIN "Category" ON "Post"."category" = "Category"."name"
    WHERE "Post"."category" IS NOT NULL
  `);
   
      // await queryRunner.query(`
      //   ALTER TABLE "Post" DROP COLUMN "category"
      // `);

    }

    public async down(queryRunner: QueryRunner): Promise<void> {

    // await queryRunner.query(`
    //     ALTER TABLE "Post" ADD "category" character varying NOT NULL
    //   `);
      await queryRunner.query(`
        UPDATE "Post"
        SET "category" = subquery."name"
        FROM (
          SELECT pc."posts" as post_id, c."name"
          FROM "post_categories" pc
          JOIN "Category" c ON pc."categories" = c."id"
        ) AS subquery
        WHERE "Post"."id" = subquery."post_id"
      `);

      await queryRunner.query(`
        DROP INDEX "IDX_1860e6d8b1a47e00c8c0ea937b"
      `);
      await queryRunner.query(`
        DROP INDEX "IDX_623743dadf52f9b1c5ebdb0ff8"
      `);
  

      await queryRunner.query(`
        DROP TABLE "post_categories"
      `);
  

      await queryRunner.query(`
        DROP TABLE "Category"
      `);
    }

}
