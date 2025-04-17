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

  
  public async findOrCreateByNames(names: string[]): Promise<CategoryModel[]> {
    const existing = await this.repository
      .createQueryBuilder("category")
      .where("category.name IN (:...names)", { names })
      .getMany();
  
    const existingNames = new Set(existing.map((c) => c.name));
  
    const newCategories = names
      .filter((name) => !existingNames.has(name))
      .map((name) => this.repository.create({ name }));
  
    if (newCategories.length > 0) {
      await this.repository.save(newCategories);
    }
  
    return [...existing, ...newCategories];
  }

  public async createCategory(name: string): Promise<CategoryModel> {
    const category = this.repository.create({ name });
    return await this.repository.save(category);
  }
}