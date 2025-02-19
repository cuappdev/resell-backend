import {MigrationInterface, QueryRunner} from "typeorm";

export class init1739974351025 implements MigrationInterface {
    name = 'init1739974351025'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "Request" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "archive" boolean NOT NULL DEFAULT false, "user" uuid, CONSTRAINT "PK_23de24dc477765bcc099feae8e5" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Message" ("id" uuid NOT NULL, CONSTRAINT "PK_7dd6398f0d1dcaf73df342fa325" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Report" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" character varying NOT NULL, "type" character varying NOT NULL, "resolved" boolean NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "reporter_id" uuid, "reported_id" uuid, "post_id" uuid, "message_id" uuid, CONSTRAINT "PK_9dbb4c593be9832c28a5793e258" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Post" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "description" character varying NOT NULL, "category" character varying NOT NULL, "condition" character varying NOT NULL, "original_price" numeric NOT NULL, "altered_price" numeric NOT NULL DEFAULT '-1', "images" text array NOT NULL, "created" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "location" character varying, "archive" boolean NOT NULL DEFAULT false, "sold" boolean NOT NULL DEFAULT false, "user" uuid, CONSTRAINT "PK_c4d3b3dcd73db0b0129ea829f9f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "UserSession" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "access_token" character varying NOT NULL, "expires_at" TIMESTAMP WITH TIME ZONE NOT NULL, "refresh_token" character varying NOT NULL, "device_token" text NOT NULL DEFAULT '', "user_id" character varying NOT NULL, "user" uuid, CONSTRAINT "PK_44f848faf1dd3898e9de61dc18b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "UserReview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "fulfilled" boolean NOT NULL, "stars" integer NOT NULL, "comments" character varying NOT NULL, "date" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "buyer" uuid, "seller" uuid, CONSTRAINT "PK_91b62f63709469ae812a3519dd1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "User" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "netid" character varying, "given_name" character varying NOT NULL, "family_name" character varying NOT NULL, "admin" boolean NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "stars" numeric NOT NULL DEFAULT '0', "num_reviews" integer NOT NULL DEFAULT '0', "photo_url" character varying, "venmo_handle" character varying, "email" character varying NOT NULL, "google_id" character varying NOT NULL, "bio" text NOT NULL DEFAULT '', CONSTRAINT "UQ_29a05908a0fa0728526d2833657" UNIQUE ("username"), CONSTRAINT "UQ_ec60b02aab67f0f99f6f88797ed" UNIQUE ("netid"), CONSTRAINT "UQ_4a257d2c9837248d70640b3e36e" UNIQUE ("email"), CONSTRAINT "UQ_a4f1fbe21cff2f5860ffa7a3cb6" UNIQUE ("google_id"), CONSTRAINT "PK_9862f679340fb2388436a5ab3e4" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Feedback" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "description" character varying NOT NULL, "images" text array NOT NULL, "user" uuid, CONSTRAINT "PK_7ffea537e9c56670b65c2d62316" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "Transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "location" character varying NOT NULL, "amount" numeric NOT NULL, "transaction_date" TIMESTAMP WITH TIME ZONE NOT NULL, "completed" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "post_id" uuid, "buyer_id" uuid, "seller_id" uuid, CONSTRAINT "PK_21eda4daffd2c60f76b81a270e9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "TransactionReview" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "stars" integer NOT NULL, "comments" text, "had_issues" boolean NOT NULL DEFAULT false, "issue_category" text, "issue_details" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "transaction_id" uuid, CONSTRAINT "REL_aff62b169ebd519d1f5994e781" UNIQUE ("transaction_id"), CONSTRAINT "PK_5dc482cb0eb5291793d2f19b0ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_saved_posts" ("saved" uuid NOT NULL, "savers" uuid NOT NULL, CONSTRAINT "PK_11901fe92c42b2d2a71ca74021a" PRIMARY KEY ("saved", "savers"))`);
        await queryRunner.query(`CREATE INDEX "IDX_ce8de5293eff7bd649291c7445" ON "user_saved_posts" ("saved") `);
        await queryRunner.query(`CREATE INDEX "IDX_1da3c41687f5a8934c7808ef24" ON "user_saved_posts" ("savers") `);
        await queryRunner.query(`CREATE TABLE "request_matches_posts" ("matches" uuid NOT NULL, "matched" uuid NOT NULL, CONSTRAINT "PK_7f4c04956dd4e84a3437b2a8018" PRIMARY KEY ("matches", "matched"))`);
        await queryRunner.query(`CREATE INDEX "IDX_bfa8c41d1cbae1a3faf7916693" ON "request_matches_posts" ("matches") `);
        await queryRunner.query(`CREATE INDEX "IDX_dcf9a982f720a85b68bc354b9f" ON "request_matches_posts" ("matched") `);
        await queryRunner.query(`CREATE TABLE "user_blocking_users" ("blockers" uuid NOT NULL, "blocking" uuid NOT NULL, CONSTRAINT "PK_8db623e58cc4bce5fbcc252c66b" PRIMARY KEY ("blockers", "blocking"))`);
        await queryRunner.query(`CREATE INDEX "IDX_fab66ba7c0e58e67b0d67f1c23" ON "user_blocking_users" ("blockers") `);
        await queryRunner.query(`CREATE INDEX "IDX_b5c7223aa162c5ccd1867056f7" ON "user_blocking_users" ("blocking") `);
        await queryRunner.query(`ALTER TABLE "Request" ADD CONSTRAINT "FK_db281bd2822e1938f5072960173" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_6c3af08f1d45614f3b2f7e1b407" FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_0dd9a57f65a4b09cdae63735b13" FOREIGN KEY ("reported_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_244bde34d749985aa27e551c110" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Report" ADD CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c" FOREIGN KEY ("message_id") REFERENCES "Message"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Post" ADD CONSTRAINT "FK_2067452f95b084577dae22e17e2" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserSession" ADD CONSTRAINT "FK_a93dfba9168e8addd8a53b9a6c4" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserReview" ADD CONSTRAINT "FK_003e3b33806e21e65f3fb0b87e6" FOREIGN KEY ("buyer") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "UserReview" ADD CONSTRAINT "FK_1d721b09d28cb397b9b2edf76f7" FOREIGN KEY ("seller") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Feedback" ADD CONSTRAINT "FK_e1ca1a1706e36874b6adfaab662" FOREIGN KEY ("user") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Transaction" ADD CONSTRAINT "FK_14f61f7bb377f779431b0be6fa8" FOREIGN KEY ("post_id") REFERENCES "Post"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Transaction" ADD CONSTRAINT "FK_a364f08b99819f616ae43f9d6bd" FOREIGN KEY ("buyer_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "Transaction" ADD CONSTRAINT "FK_7c5499049ca89617f3fad055b80" FOREIGN KEY ("seller_id") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "TransactionReview" ADD CONSTRAINT "FK_aff62b169ebd519d1f5994e781a" FOREIGN KEY ("transaction_id") REFERENCES "Transaction"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_saved_posts" ADD CONSTRAINT "FK_ce8de5293eff7bd649291c74452" FOREIGN KEY ("saved") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_saved_posts" ADD CONSTRAINT "FK_1da3c41687f5a8934c7808ef24d" FOREIGN KEY ("savers") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "request_matches_posts" ADD CONSTRAINT "FK_bfa8c41d1cbae1a3faf79166936" FOREIGN KEY ("matches") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "request_matches_posts" ADD CONSTRAINT "FK_dcf9a982f720a85b68bc354b9f8" FOREIGN KEY ("matched") REFERENCES "Request"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" ADD CONSTRAINT "FK_fab66ba7c0e58e67b0d67f1c232" FOREIGN KEY ("blockers") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" ADD CONSTRAINT "FK_b5c7223aa162c5ccd1867056f73" FOREIGN KEY ("blocking") REFERENCES "User"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_blocking_users" DROP CONSTRAINT "FK_b5c7223aa162c5ccd1867056f73"`);
        await queryRunner.query(`ALTER TABLE "user_blocking_users" DROP CONSTRAINT "FK_fab66ba7c0e58e67b0d67f1c232"`);
        await queryRunner.query(`ALTER TABLE "request_matches_posts" DROP CONSTRAINT "FK_dcf9a982f720a85b68bc354b9f8"`);
        await queryRunner.query(`ALTER TABLE "request_matches_posts" DROP CONSTRAINT "FK_bfa8c41d1cbae1a3faf79166936"`);
        await queryRunner.query(`ALTER TABLE "user_saved_posts" DROP CONSTRAINT "FK_1da3c41687f5a8934c7808ef24d"`);
        await queryRunner.query(`ALTER TABLE "user_saved_posts" DROP CONSTRAINT "FK_ce8de5293eff7bd649291c74452"`);
        await queryRunner.query(`ALTER TABLE "TransactionReview" DROP CONSTRAINT "FK_aff62b169ebd519d1f5994e781a"`);
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_7c5499049ca89617f3fad055b80"`);
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_a364f08b99819f616ae43f9d6bd"`);
        await queryRunner.query(`ALTER TABLE "Transaction" DROP CONSTRAINT "FK_14f61f7bb377f779431b0be6fa8"`);
        await queryRunner.query(`ALTER TABLE "Feedback" DROP CONSTRAINT "FK_e1ca1a1706e36874b6adfaab662"`);
        await queryRunner.query(`ALTER TABLE "UserReview" DROP CONSTRAINT "FK_1d721b09d28cb397b9b2edf76f7"`);
        await queryRunner.query(`ALTER TABLE "UserReview" DROP CONSTRAINT "FK_003e3b33806e21e65f3fb0b87e6"`);
        await queryRunner.query(`ALTER TABLE "UserSession" DROP CONSTRAINT "FK_a93dfba9168e8addd8a53b9a6c4"`);
        await queryRunner.query(`ALTER TABLE "Post" DROP CONSTRAINT "FK_2067452f95b084577dae22e17e2"`);
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_b0ecf30cfa1f4908dec8d19547c"`);
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_244bde34d749985aa27e551c110"`);
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_0dd9a57f65a4b09cdae63735b13"`);
        await queryRunner.query(`ALTER TABLE "Report" DROP CONSTRAINT "FK_6c3af08f1d45614f3b2f7e1b407"`);
        await queryRunner.query(`ALTER TABLE "Request" DROP CONSTRAINT "FK_db281bd2822e1938f5072960173"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b5c7223aa162c5ccd1867056f7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_fab66ba7c0e58e67b0d67f1c23"`);
        await queryRunner.query(`DROP TABLE "user_blocking_users"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_dcf9a982f720a85b68bc354b9f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_bfa8c41d1cbae1a3faf7916693"`);
        await queryRunner.query(`DROP TABLE "request_matches_posts"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1da3c41687f5a8934c7808ef24"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ce8de5293eff7bd649291c7445"`);
        await queryRunner.query(`DROP TABLE "user_saved_posts"`);
        await queryRunner.query(`DROP TABLE "TransactionReview"`);
        await queryRunner.query(`DROP TABLE "Transaction"`);
        await queryRunner.query(`DROP TABLE "Feedback"`);
        await queryRunner.query(`DROP TABLE "User"`);
        await queryRunner.query(`DROP TABLE "UserReview"`);
        await queryRunner.query(`DROP TABLE "UserSession"`);
        await queryRunner.query(`DROP TABLE "Post"`);
        await queryRunner.query(`DROP TABLE "Report"`);
        await queryRunner.query(`DROP TABLE "Message"`);
        await queryRunner.query(`DROP TABLE "Request"`);
    }

}
