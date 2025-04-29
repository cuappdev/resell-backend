import {MigrationInterface, QueryRunner} from "typeorm";

export class Notifications1739899394694 implements MigrationInterface {
    name = 'Notifications1739899394694'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notifications" (
            "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
            "user_id" uuid NOT NULL,
            "title" character varying NOT NULL,
            "body" character varying NOT NULL,
            "data" jsonb,
            "read" boolean NOT NULL DEFAULT false,
            "created_at" TIMESTAMP NOT NULL DEFAULT now(),
            "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
            CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id")
        )`);

        await queryRunner.query(`ALTER TABLE "notifications" 
            ADD CONSTRAINT "FK_notifications_user" 
            FOREIGN KEY ("user_id") 
            REFERENCES "User"("id") 
            ON DELETE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
    }
}