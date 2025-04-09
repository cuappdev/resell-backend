import { AbstractRepository, EntityRepository } from 'typeorm';

import { CategoryModel } from '../models/CategoryModel';

@EntityRepository(CategoryModel)
export class CategoryRepository extends AbstractRepository<CategoryModel> {
  public async findByIds(ids: string[]): Promise<CategoryModel[]> {
    return await this.repository
      .createQueryBuilder("category")
      .where("category.id IN (:...ids)", { ids })
      .getMany();
  }
}