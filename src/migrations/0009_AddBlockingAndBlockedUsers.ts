import { MigrationInterface, QueryRunner, Table, TableColumn } from "typeorm";

const TABLE_NAME = "UserBlocking"

export class AddBlockingAndBlockedUsers1699409776717 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "blockingUser",
                type: "uuid"
            })
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
