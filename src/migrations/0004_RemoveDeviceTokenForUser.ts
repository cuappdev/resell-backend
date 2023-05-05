import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLE_NAME = "User";

export class RemoveDeviceTokenForUser1683322987029 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(TABLE_NAME, "deviceTokens");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // add device token for user table
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "deviceTokens",
                type: "text[]",
                default: 'array[]::text[]',
            })
        );
    }
}
