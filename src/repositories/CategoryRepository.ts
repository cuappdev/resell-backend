import { AbstractRepository, EntityRepository } from "typeorm";

import { CategoryModel } from "../models/CategoryModel";
import { canonicalCategoryName } from "../utils/categoryNames";

@EntityRepository(CategoryModel)
export class CategoryRepository extends AbstractRepository<CategoryModel> {
  public async findByIds(ids: string[]): Promise<CategoryModel[]> {
    return await this.repository
      .createQueryBuilder("category")
      .where("category.id IN (:...ids)", { ids })
      .getMany();
  }

  /**
   * Stores names in canonical form and matches existing rows case-insensitively,
   * so "ELECTRONICS" reuses the stored "Electronics" instead of duplicating it.
   */
  public async findOrCreateByNames(names: string[]): Promise<CategoryModel[]> {
    const namesByLowercase = new Map<string, string>();
    for (const name of names.map(canonicalCategoryName)) {
      if (name.length > 0 && !namesByLowercase.has(name.toLowerCase())) {
        namesByLowercase.set(name.toLowerCase(), name);
      }
    }
    if (namesByLowercase.size === 0) return [];

    const existing = await this.repository
      .createQueryBuilder("category")
      .where("LOWER(category.name) IN (:...names)", {
        names: [...namesByLowercase.keys()],
      })
      .getMany();

    const existingNames = new Set(existing.map((c) => c.name.toLowerCase()));

    const newNames = [...namesByLowercase.entries()]
      .filter(([lowercase]) => !existingNames.has(lowercase))
      .map(([, name]) => name);

    // Create in-memory entities (not saving them)
    const newCategories = newNames.map((name) =>
      this.repository.create({ name }),
    );

    if (newCategories.length > 0) {
      await this.repository.save(newCategories);
    }

    return [...existing, ...newCategories];
  }

  public async createCategory(name: string): Promise<CategoryModel> {
    const category = this.repository.create({
      name: canonicalCategoryName(name),
    });
    return await this.repository.save(category);
  }
}
