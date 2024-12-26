import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTransactionReviewTable1732975238671 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE "TransactionReview" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "stars" integer NOT NULL,
            "comments" character varying,
            "had_issues" boolean NOT NULL DEFAULT false,
            "issue_category" character varying,
            "issue_details" character varying,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "transaction_id" uuid,
            CONSTRAINT "PK_TransactionReview" PRIMARY KEY ("id")
          )
        `);
    
        await queryRunner.query(`
          ALTER TABLE "TransactionReview" 
          ADD CONSTRAINT "FK_transaction" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE NO ACTION
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "TransactionReview" DROP CONSTRAINT "FK_transaction"`);
        await queryRunner.query(`DROP TABLE "TransactionReview"`);
      }

}
