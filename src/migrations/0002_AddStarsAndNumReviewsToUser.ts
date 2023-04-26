import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

const TABLE_NAME = "User";

export class AddStarsAndNumReviewsToUser1682530989678 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "stars",
                type: "numeric",
                default: 0,
            })
        )
        await queryRunner.addColumn(
            TABLE_NAME,
            new TableColumn({
                name: "numReviews",
                type: "integer",
                default: 0,
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropColumn(TABLE_NAME, "stars");
        await queryRunner.dropColumn(TABLE_NAME, "numReviews");
    }

}
