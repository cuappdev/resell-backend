import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

const TABLE_NAME = "Post";

export class AddAlteredPrice1681680434289 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // query runner for editing the name of the column `price` to `original_price`
    await queryRunner.renameColumn(TABLE_NAME, "price", "original_price");
    // query runner for adding a new column `altered_price`, which is a numeric type with a scale of 2
    // default value is the same value as `original_price`
    await queryRunner.addColumn(
      TABLE_NAME,
      new TableColumn({
        name: "altered_price",
        type: "numeric",
        scale: 2,
        default: 0,
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.renameColumn(TABLE_NAME, "original_price", "price");
    await queryRunner.dropColumn(TABLE_NAME, "altered_price");
  }
}
