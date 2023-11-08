import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

const TABLE_NAME = 'UserBlocking';

export class ChangeIDToUuid1699403942507 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            TABLE_NAME,
            "id_wow",
            new TableColumn({
                name: 'id_wow',
                type: 'uuid',
                isPrimary: true,
                generationStrategy: 'uuid',
                default: 'uuid_generate_v4()',
            }))
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.changeColumn(
            TABLE_NAME,
            "id_wow",
            new TableColumn({
                name: 'id',
                type: 'int',
                isPrimary: true,
                isGenerated: true,
                generationStrategy: 'increment',
            })
        );
    }

}
