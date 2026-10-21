import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSearchesTable1743566564676 implements MigrationInterface {
  name = "CreateSearchesTable1743566564676";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // searchVector stores a JSON array of floats (OpenAI embedding).
    // Similarity search is exact KNN in TypeScript — no pgvector required.
    await queryRunner.query(`CREATE TABLE "searches" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "searchText" character varying NOT NULL,
            "searchVector" text,
            "firebaseUid" character varying NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_searches" PRIMARY KEY ("id")
        )`);

    await queryRunner.query(`ALTER TABLE "searches" 
            ADD CONSTRAINT "FK_searches_user" 
            FOREIGN KEY ("firebaseUid") 
            REFERENCES "User"("firebaseUid") 
            ON DELETE CASCADE`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "searches" DROP CONSTRAINT "FK_searches_user"`,
    );
    await queryRunner.query(`DROP TABLE "searches"`);
  }
}
