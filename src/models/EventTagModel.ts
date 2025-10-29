import {
  Column,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { EventTag, Uuid } from "../types";
import { PostModel } from "./PostModel";

@Entity("EventTag")
export class EventTagModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  name: string;

  @ManyToMany(() => PostModel, (post) => post.eventTags)
  posts: PostModel[];

  public getEventTagInfo(): EventTag {
    return {
      id: this.id,
      name: this.name,
      posts: this.posts,
    };
  }
}
