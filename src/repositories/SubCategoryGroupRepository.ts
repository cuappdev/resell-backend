import { AbstractRepository, EntityRepository } from "typeorm";

import { SubCategoryGroupModel } from "../models/SubCategoryGroupModel";
import { CategoryModel } from "../models/CategoryModel";

@EntityRepository(SubCategoryGroupModel)
export class SubCategoryGroupRepository extends AbstractRepository<SubCategoryGroupModel> {
  public async findByCategoryId(categoryId: string): Promise<SubCategoryGroupModel[]> {
    return await this.repository
      .createQueryBuilder("group")
      .leftJoinAndSelect("group.subcategories", "subcategory")
      .where("group.categoryId = :categoryId", { categoryId })
      .getMany();
  }

  public async createGroup(
    name: string,
    category: CategoryModel,
  ): Promise<SubCategoryGroupModel> {
    const group = this.repository.create({ name });
    group.category = category;
    return await this.repository.save(group);
  }
}
