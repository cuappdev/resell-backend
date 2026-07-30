import { AbstractRepository, EntityRepository } from "typeorm";

import { SubCategoryModel } from "../models/SubCategoryModel";

@EntityRepository(SubCategoryModel)
export class SubCategoryRepository extends AbstractRepository<SubCategoryModel> {
  public async findByIds(ids: string[]): Promise<SubCategoryModel[]> {
    if (ids.length === 0) return [];
    return await this.repository
      .createQueryBuilder("subcategory")
      .leftJoinAndSelect("subcategory.category", "category")
      .where("subcategory.id IN (:...ids)", { ids })
      .getMany();
  }

  /**
   * Looks up existing subcategories by name within a specific category.
   * Subcategories are predefined (seeded) — this does not create new ones.
   */
  public async findByNamesForCategory(
    names: string[],
    categoryId: string,
  ): Promise<SubCategoryModel[]> {
    if (names.length === 0) return [];
    return await this.repository
      .createQueryBuilder("subcategory")
      .where("subcategory.name IN (:...names)", { names })
      .andWhere("subcategory.categoryId = :categoryId", { categoryId })
      .getMany();
  }

  public async findByCategoryId(categoryId: string): Promise<SubCategoryModel[]> {
    return await this.repository
      .createQueryBuilder("subcategory")
      .where("subcategory.categoryId = :categoryId", { categoryId })
      .getMany();
  }
}
