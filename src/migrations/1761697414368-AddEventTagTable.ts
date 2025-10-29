import {MigrationInterface, QueryRunner} from "typeorm";

export class AddEventTagTable1761697414368 implements MigrationInterface {
    name = 'AddEventTagTable1761697414368'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "EventTag" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, CONSTRAINT "PK_929d8d89bf95d848ac3b7546a29" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "post_event_tags" ("posts" uuid NOT NULL, "event_tags" uuid NOT NULL, CONSTRAINT "PK_cc14f1e77d0b18c8ec995937fd0" PRIMARY KEY ("posts", "event_tags"))`);
        await queryRunner.query(`CREATE INDEX "IDX_aafad96c140ff6ad67db224395" ON "post_event_tags" ("posts") `);
        await queryRunner.query(`CREATE INDEX "IDX_8511a78444d5a8169c87223663" ON "post_event_tags" ("event_tags") `);
        await queryRunner.query(`ALTER TABLE "post_event_tags" ADD CONSTRAINT "FK_aafad96c140ff6ad67db224395b" FOREIGN KEY ("posts") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "post_event_tags" ADD CONSTRAINT "FK_8511a78444d5a8169c872236635" FOREIGN KEY ("event_tags") REFERENCES "EventTag"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "post_event_tags" DROP CONSTRAINT "FK_8511a78444d5a8169c872236635"`);
        await queryRunner.query(`ALTER TABLE "post_event_tags" DROP CONSTRAINT "FK_aafad96c140ff6ad67db224395b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8511a78444d5a8169c87223663"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_aafad96c140ff6ad67db224395"`);
        await queryRunner.query(`DROP TABLE "post_event_tags"`);
        await queryRunner.query(`DROP TABLE "EventTag"`);
    }

}
