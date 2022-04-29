import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLE_NAME = "post_model";
const COLUMN_NAME = "categories";
const TYPE = "text array";

export class AddCategoryColumn1651185924459 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(TABLE_NAME, new TableColumn({
            name: COLUMN_NAME,
            type: TYPE,
            isNullable: false,
            default: '\'{}\'',
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(TABLE_NAME, COLUMN_NAME);
    }

}
