import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Uuid } from "../types";
import { UserModel } from "./UserModel";
import { PostModel } from "./PostModel";
import { MessageModel } from "./MessageModel";

@Entity("Report")
export class ReportModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @ManyToOne(() => UserModel, (user) => user.reports)
  public reporter: UserModel;

  @ManyToOne(() => UserModel, (user) => user.reportedBy)
  public reported: UserModel;

  @ManyToOne(() => PostModel, (post) => post.reports, { nullable: true })
  public post?: PostModel;

  @ManyToOne(() => MessageModel, (message) => message.reports, {
    nullable: true,
  })
  public message?: MessageModel;

  @Column()
  reason: string;

  @Column()
  type: "post" | "profile" | "message";

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  public getReportInfo(): any {
    return {
      id: this.id,
      reporter: this.reporter,
      reported: this.reported,
      post: this.post,
      message: this.message,
      reason: this.reason,
      type: this.type,
      created: this.created,
    };
  }
}
