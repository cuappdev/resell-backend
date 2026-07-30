import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryColumn,
} from "typeorm";
import { PostModel } from "./PostModel";
import { UserModel } from "./UserModel";
import { Uuid } from "../types";

@Entity("postViews")
export class PostViewModel {
  @PrimaryColumn({ type: "uuid" })
  postId: Uuid;

  @PrimaryColumn()
  viewerUid: string;

  @PrimaryColumn({ type: "date" })
  viewDate: string;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @ManyToOne(() => PostModel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId", referencedColumnName: "id" })
  post: PostModel;

  @ManyToOne(() => UserModel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "viewerUid", referencedColumnName: "firebaseUid" })
  viewer: UserModel;
}
