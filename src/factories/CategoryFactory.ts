// CategoryFactory.ts
import { define } from 'typeorm-seeding';
import { CategoryModel } from '../models/CategoryModel';

// Define a factory for CategoryModel
define(CategoryModel, (_, context?: { name?: string }) => {
  const category = new CategoryModel();
  
  const categoryName = context?.name ?? 'HANDMADE';
  category.name = categoryName;

  return category;
});
