import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";

import { Feedback, Uuid } from "../types";
import { UserModel } from "./UserModel";

@Entity("Feedback")
export class FeedbackModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column()
  description: string;

  @Column("text", { array: true })
  images: string[];

  @ManyToOne(() => UserModel, (user) => user.feedbacks, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: UserModel;

  public getFeedbackInfo(): Feedback {
    return {
      id: this.id,
      description: this.description,
      images: this.images,
      user: this.user,
    };
  }
}
