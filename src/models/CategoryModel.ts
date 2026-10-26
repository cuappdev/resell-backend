import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category, Uuid } from "../types";
import { PostModel } from "./PostModel";

@Entity("Category")
// Unique on LOWER(name), created by the StandardizeCategoryNames migration
@Index("UQ_Category_name_lower", { synchronize: false })
export class CategoryModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  name: string;

  @ManyToMany(() => PostModel, (post) => post.categories)
  posts: PostModel[];

  public getCategoryInfo(): Category {
    return {
      id: this.id,
      name: this.name,
      posts: this.posts,
    };
  }
}
