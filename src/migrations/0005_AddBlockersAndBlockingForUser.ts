import { MigrationInterface, QueryRunner, Table, TableForeignKey } from "typeorm";

export class AddBlockersAndBlockingForUser1697151876181 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'user_blocking',
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
            'user_blocking',
            new TableForeignKey({
                columnNames: ['blockingUserId'],
                referencedTableName: 'User',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        )

        await queryRunner.createForeignKey(
            'user_blocking',
            new TableForeignKey({
                columnNames: ['blockedUserId'],
                referencedTableName: 'User',
                referencedColumnNames: ['id'],
                onDelete: 'CASCADE',
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('user_blocking', 'blockingUserId');
        await queryRunner.dropForeignKey('user_blocking', 'blockedUserId');
        await queryRunner.dropTable('user_blocking');
    }

}
