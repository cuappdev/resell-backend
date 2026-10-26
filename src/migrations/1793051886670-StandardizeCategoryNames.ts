import { MigrationInterface, QueryRunner } from "typeorm";

/** Listing categories as the iOS app titles them, as of this migration. */
const CATEGORY_NAMES = [
  "Clothing",
  "Books",
  "School",
  "Electronics",
  "Household",
  "Handmade",
  "Active",
  "Other",
];

/**
 * Keep one row per category, named as the app titles it ("Electronics").
 * Seeds and older listings created uppercase rows ("ELECTRONICS", "CLOTHING"),
 * some alongside the title-case row. Rows whose names differ only in case are
 * merged into one, keeping every post, and a unique index on LOWER(name) stops
 * a differently cased duplicate from being created again.
 */
export class StandardizeCategoryNames1793051886670 implements MigrationInterface {
  name = "StandardizeCategoryNames1793051886670";

  public async up(queryRunner: QueryRunner): Promise<void> {
    const titleByLowercase = new Map(
      CATEGORY_NAMES.map((name) => [name.toLowerCase(), name]),
    );
    const categories: { id: string; name: string; key: string }[] =
      await queryRunner.query(
        `SELECT id, name, LOWER(name) AS key FROM "Category" ORDER BY name`,
      );

    const categoriesByKey = new Map<string, typeof categories>();
    for (const category of categories) {
      categoriesByKey.set(category.key, [
        ...(categoriesByKey.get(category.key) ?? []),
        category,
      ]);
    }

    for (const [key, group] of categoriesByKey) {
      // Unknown categories keep a non-uppercase spelling when one exists
      const name =
        titleByLowercase.get(key) ??
        (group.find((c) => c.name !== c.name.toUpperCase()) ?? group[0]).name;
      const keeper = group.find((c) => c.name === name) ?? group[0];

      for (const duplicate of group.filter((c) => c.id !== keeper.id)) {
        await queryRunner.query(
          `INSERT INTO "postCategories" ("posts", "categories")
           SELECT pc."posts", $1
           FROM "postCategories" pc
           WHERE pc."categories" = $2
             AND NOT EXISTS (
               SELECT 1 FROM "postCategories" kept
               WHERE kept."posts" = pc."posts" AND kept."categories" = $1
             )`,
          [keeper.id, duplicate.id],
        );
        await queryRunner.query(
          `DELETE FROM "postCategories" WHERE "categories" = $1`,
          [duplicate.id],
        );
        await queryRunner.query(`DELETE FROM "Category" WHERE id = $1`, [
          duplicate.id,
        ]);
      }

      if (keeper.name !== name) {
        await queryRunner.query(
          `UPDATE "Category" SET name = $1 WHERE id = $2`,
          [name, keeper.id],
        );
      }
    }

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_Category_name_lower" ON "Category" (LOWER(name))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Merged categories are not split apart again
    await queryRunner.query(`DROP INDEX IF EXISTS "UQ_Category_name_lower"`);
  }
}
