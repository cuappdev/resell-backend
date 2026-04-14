import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from "typeorm";
import { Uuid } from "../types";
import { PostModel } from "./PostModel";
import { EventTagModel } from "./EventTagModel";

export type EventPostSource = "user" | "similarity" | "nlp_context";

@Entity("eventPosts")
// Enforces one row per post per event, so ML layer can't insert another row if event already user-tagged
@Unique(["postId", "eventTagId"]) 
export class EventPostModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  postId: Uuid;

  @ManyToOne(() => PostModel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "postId" })
  post: PostModel;

  @Column()
  eventTagId: Uuid;

  @ManyToOne(() => EventTagModel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "eventTagId" })
  eventTag: EventTagModel;

  @Column({ type: "varchar", length: 20 })
  source: EventPostSource;

  @Column({ type: "float", nullable: true, default: null })
  relevanceScore: number | null;

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date;

  @UpdateDateColumn({ type: "timestamptz" })
  updatedAt: Date;
}
