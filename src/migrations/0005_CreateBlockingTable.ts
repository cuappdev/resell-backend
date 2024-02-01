import {MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey} from "typeorm";

const TABLE_NAME = 'Blocking';

export class CreateBlockingTable1706826372468 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: TABLE_NAME,
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid',
                },
                {
                    name: 'blockingId',
                    type: 'uuid',
                },
                {
                    name: 'blockedId',
                    type: 'uuid',
                },
            ]
        })
        await queryRunner.createTable(table);
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "blockingId",
                type: "uuid",
                
            })
        )
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "numReviews",
                type: "uuid",
            })
        )
        await queryRunner.createForeignKey(
            TABLE_NAME,
            new TableForeignKey({
                columnNames: ['blockingId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'User',
                onDelete: 'CASCADE',
            })
        )
        await queryRunner.createForeignKey(
            TABLE_NAME,
            new TableForeignKey({
                columnNames: ['blockedId'],
                referencedColumnNames: ['id'],
                referencedTableName: 'User',
                onDelete: 'CASCADE',
            })
        )
        
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('User', 'blockingId');
        await queryRunner.dropForeignKey('User', 'blockedId');
        await queryRunner.dropColumn('User', 'blockingId');
        await queryRunner.dropTable(TABLE_NAME);
    }

}
