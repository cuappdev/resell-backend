import {MigrationInterface, QueryRunner} from "typeorm";

export class AddTransactionTable1732906578369 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
          CREATE TABLE "Transaction" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "location" character varying NOT NULL,
            "amount" numeric NOT NULL,
            "transaction_date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            "completed" boolean NOT NULL DEFAULT false,
            "buyer_id" uuid,
            "seller_id" uuid,
            "post_id" uuid,
            "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
            CONSTRAINT "PK_Transaction" PRIMARY KEY ("id")
          )
        `);
    
        await queryRunner.query(`
          ALTER TABLE "Transaction" 
          ADD CONSTRAINT "FK_buyer" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    
        await queryRunner.query(`
          ALTER TABLE "Transaction" 
          ADD CONSTRAINT "FK_seller" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    
        await queryRunner.query(`
          ALTER TABLE "Transaction" 
          ADD CONSTRAINT "FK_post" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
      }
    
      public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_post"`);
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_seller"`);
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_buyer"`);
        await queryRunner.query(`DROP TABLE "Transaction"`);
      }

}