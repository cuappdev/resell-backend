import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

const TABLE_NAME = "UserBlockingTest"

export class TestMigrateBlocking1699484459964 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const table = new Table({
            name: TABLE_NAME,
            columns: [
                {
                    name: 'id',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'increment',
                },
                {
                    name: 'blockingUserId',
                    type: 'uuid',
                },
                {
                    name: 'blockedUserId',
                    type: 'uuid',
                }
            ]
        })
        console.log(table.primaryColumns)
        await queryRunner.createTable(
            table
        );
        await queryRunner.createForeignKey(
            TABLE_NAME,
            new TableForeignKey({
                columnNames: ['blockingUserId'],
                referencedTableName: 'User',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        )

        await queryRunner.createForeignKey(
            TABLE_NAME,
            new TableForeignKey({
                columnNames: ['blockedUserId'],
                referencedTableName: 'User',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey(TABLE_NAME, 'blockingUserId');
        await queryRunner.dropForeignKey(TABLE_NAME, 'blockedUserId');
        await queryRunner.dropTable(TABLE_NAME);
    }

}
