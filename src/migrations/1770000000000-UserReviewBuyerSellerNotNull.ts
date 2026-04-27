import { MigrationInterface, QueryRunner } from "typeorm";

export class UserReviewBuyerSellerNotNull1770000000000
  implements MigrationInterface
{
  name = "UserReviewBuyerSellerNotNull1770000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const orphans: Array<{ id: string }> = await queryRunner.query(
      `SELECT "id" FROM "UserReview" WHERE "buyerId" IS NULL OR "sellerId" IS NULL`,
    );
    if (orphans.length > 0) {
      console.log(
        `UserReviewBuyerSellerNotNull: removing ${orphans.length} UserReview rows missing buyer or seller before tightening constraints.`,
      );
      await queryRunner.query(
        `DELETE FROM "UserReview" WHERE "buyerId" IS NULL OR "sellerId" IS NULL`,
      );
    }

    await queryRunner.query(
      `ALTER TABLE "UserReview" ALTER COLUMN "buyerId" SET NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserReview" ALTER COLUMN "sellerId" SET NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "UserReview" ALTER COLUMN "sellerId" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "UserReview" ALTER COLUMN "buyerId" DROP NOT NULL`,
    );
  }
}
