import { MigrationInterface, QueryRunner, Table } from "typeorm";

const TABLE_NAME1 = "PKey"
const TABLE_NAME2 = "UserBlocking"

export class CleanUpTesting1699486155178 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable(TABLE_NAME1);
        await queryRunner.dropTable(TABLE_NAME2);
        await queryRunner.query('ALTER TABLE "UserBlockingTest" RENAME TO "UserBlocking"');
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query('ALTER TABLE "UserBlocking" RENAME TO "UserBlockingTest"');
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME2,
                columns: [{
                    name: 'userId_1',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                },
                {
                    name: 'userId_2',
                    type: 'uuid',
                    isPrimary: true,
                    isGenerated: true,
                    generationStrategy: 'uuid'
                }
                ]
            })
        )
        await queryRunner.createTable(
            new Table({
                name: TABLE_NAME1,
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: 'uuid',
                    }
                ]
            })
        );
    }

}
