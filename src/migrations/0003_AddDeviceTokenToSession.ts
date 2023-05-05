import {MigrationInterface, QueryRunner, TableColumn} from "typeorm";

const TABLE_NAME = "UserSession"

export class AddDeviceTokenToSession1682461409919 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
              name: "deviceToken",
              type: "text",
              default: "''"
            })
          );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(TABLE_NAME, "deviceToken");
    }

}
