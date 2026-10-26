import {
  Column,
  CreateDateColumn,
  Entity,
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
