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
import { Post, Uuid } from "../types";
import { RequestModel } from "./RequestModel";
import { UserModel } from "./UserModel";
import { ReportModel } from "./ReportModel";
import { CategoryModel } from "./CategoryModel";

@Entity("Post")
export class PostModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  condition: string;

  @Column("numeric", { scale: 2 })
  original_price: number;

  @Column("numeric", { scale: 2, default: -1 })
  altered_price: number;

  @Column("text", { array: true })
  images: string[];

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  @Column({ nullable: true })
  location: string;

  @Column({ default: false })
  archive: boolean;

  @Column("float", { array: true, nullable: true })
  embedding: number[];

  @ManyToOne(() => UserModel, (user) => user.posts, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user" })
  user: UserModel;

  @ManyToMany(() => UserModel, (user) => user.saved)
  @JoinTable({
    name: "user_saved_posts",
    joinColumn: { name: "saved", referencedColumnName: "id" },
    inverseJoinColumn: { name: "savers", referencedColumnName: "firebaseUid" },
  })
  savers: UserModel[];

  @ManyToMany(() => RequestModel, (request) => request.matches)
  @JoinTable({
    name: "request_matches_posts",
    joinColumn: { name: "matches", referencedColumnName: "id" },
    inverseJoinColumn: { name: "matched", referencedColumnName: "id" },
  })
  matched: RequestModel[];

  @ManyToMany(() => CategoryModel, (category) => category.posts, {
    cascade: true,
  })
  @JoinTable({
    name: "post_categories",
    joinColumn: { name: "posts", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categories", referencedColumnName: "id" },
  })
  categories: CategoryModel[];

  @Column({ default: false })
  sold: boolean;

  @OneToMany(() => ReportModel, (report) => report.post)
  public reports: ReportModel[];

  public getPostInfo(): Post {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      condition: this.condition,
      original_price: this.original_price,
      altered_price: this.altered_price,
      images: this.images,
      created: this.created,
      location: this.location,
      archive: this.archive,
      embedding: this.embedding,
      user: this.user.getUserProfile(),
      savers: this.savers?.map((user) => user.getUserProfile()),
      matched: this.matched?.map((request) => request.getRequestInfo()),
      categories: this.categories?.map((category) =>
        category.getCategoryInfo(),
      ),
      sold: this.sold,
    };
  }
}
