import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

const TABLE_NAME = 'user_blocking';

export class AddBlockersAndBlockingForUser1697151876181 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME,
                columns: [
                    {
                        name: 'id',
                        type: 'int',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'increment',
                    },
                    {
                        name: 'blockingUserId',
                        type: 'Uuid',
                    },
                    {
                        name: 'blockedUserId',
                        type: 'Uuid',
                    }
                ]
            })
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
