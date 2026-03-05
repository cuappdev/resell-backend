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
import { EventTagModel } from "./EventTagModel";

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
  originalPrice: number;

  @Column("numeric", { scale: 2, default: -1 })
  alteredPrice: number;

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
  @JoinColumn({ name: "userId" })
  user: UserModel;

  @ManyToMany(() => UserModel, (user) => user.saved)
  @JoinTable({
    name: "userSavedPosts",
    joinColumn: { name: "saved", referencedColumnName: "id" },
    inverseJoinColumn: { name: "savers", referencedColumnName: "firebaseUid" },
  })
  savers: UserModel[];

  @ManyToMany(() => RequestModel, (request) => request.matches)
  @JoinTable({
    name: "requestMatchesPosts",
    joinColumn: { name: "matches", referencedColumnName: "id" },
    inverseJoinColumn: { name: "matched", referencedColumnName: "id" },
  })
  matched: RequestModel[];

  @ManyToMany(() => CategoryModel, (category) => category.posts, {
    cascade: true,
  })
  @JoinTable({
    name: "postCategories",
    joinColumn: { name: "posts", referencedColumnName: "id" },
    inverseJoinColumn: { name: "categories", referencedColumnName: "id" },
  })
  categories: CategoryModel[];

  @ManyToMany(() => EventTagModel, (eventTag) => eventTag.posts)
  @JoinTable({
    name: "postEventTags",
    joinColumn: { name: "posts", referencedColumnName: "id" },
    inverseJoinColumn: { name: "eventTags", referencedColumnName: "id" },
  })
  eventTags: EventTagModel[];

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
      originalPrice: this.originalPrice,
      alteredPrice: this.alteredPrice,
      images: this.images,
      created: this.created,
      location: this.location,
      archive: this.archive,
      embedding: this.embedding,
      user: this.user.getUserProfile(),
      savers: this.savers?.map((user) => user.getUserProfile()),
      matched: this.matched?.map((request) => request.getRequestInfo()),
      categories: this.categories?.map((category) => category.getCategoryInfo()),
      eventTags: this.eventTags?.map((eventTag) => eventTag.getEventTagInfo()),
      sold: this.sold,
    };
  }
}
