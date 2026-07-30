import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category, Uuid } from "../types";
import { PostModel } from "./PostModel";
import { SubCategoryGroupModel } from "./SubCategoryGroupModel";

@Entity("Category")
export class CategoryModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  name: string;

  @ManyToMany(() => PostModel, (post) => post.categories)
  posts: PostModel[];

  @OneToMany(() => SubCategoryGroupModel, (group) => group.category)
  subcategoryGroups: SubCategoryGroupModel[];

  public getCategoryInfo(): Category {
    return {
      id: this.id,
      name: this.name,
      posts: this.posts,
      subcategoryGroups: this.subcategoryGroups?.map((group) => ({
        id: group.id,
        name: group.name,
        subcategories: group.subcategories?.map((s) => ({ id: s.id, name: s.name })),
      })),
    };
  }
}
