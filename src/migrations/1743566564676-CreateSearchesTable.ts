import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateSearchesTable1743566564676 implements MigrationInterface {
    name = 'CreateSearchesTable1743566564676'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create the pgvector extension if it doesn't exist
        await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS vector`);
        
        // Create the searches table
        await queryRunner.query(`CREATE TABLE "searches" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "searchText" character varying NOT NULL,
            "searchVector" vector(512),
            "firebaseUid" character varying NOT NULL,
            "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_searches" PRIMARY KEY ("id")
        )`);
        
        // Add foreign key constraint to link to User table
        await queryRunner.query(`ALTER TABLE "searches" 
            ADD CONSTRAINT "FK_searches_user" 
            FOREIGN KEY ("firebaseUid") 
            REFERENCES "User"("firebaseUid") 
            ON DELETE CASCADE`);
            
        // Create an index for vector similarity search
        await queryRunner.query(`CREATE INDEX "idx_searches_vector" ON "searches" USING ivfflat (searchVector vector_cosine_ops)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the index
        await queryRunner.query(`DROP INDEX "idx_searches_vector"`);
        
        // Drop the foreign key constraint
        await queryRunner.query(`ALTER TABLE "searches" DROP CONSTRAINT "FK_searches_user"`);
        
        // Drop the table
        await queryRunner.query(`DROP TABLE "searches"`);
        
        // We don't drop the vector extension as it might be used by other tables
    }
}
