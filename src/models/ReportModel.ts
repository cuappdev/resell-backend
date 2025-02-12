import {Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Uuid } from "../types";
import { UserModel } from "./UserModel";
import { PostModel } from "./PostModel";
import { MessageModel } from "./MessageModel";
import { Report } from "../types";

@Entity("Report")
export class ReportModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @ManyToOne(() => UserModel, (user) => user.reports)
  @JoinColumn({ name: "reporterId" })
  reporter: UserModel;

  @ManyToOne(() => UserModel, (user) => user.reportedBy)
  @JoinColumn({ name: "reportedId" })
  reported: UserModel;

  @ManyToOne(() => PostModel, (post) => post.reports, { nullable: true })
  @JoinColumn({ name: "postId" })
  post?: PostModel;

  @ManyToOne(() => MessageModel, (message) => message.reports, {
    nullable: true,
  })
  @JoinColumn({ name: "messageId" })
  message?: MessageModel;

  @Column({nullable: false})
  reason: string;

  @Column({nullable: false})
  type: "post" | "profile" | "message";

  @Column()
  resolved: boolean;

  @CreateDateColumn({ type: "timestamptz" })
  created: Date;

  public getReportInfo(): Report {
    return {
      id: this.id,
      reporter: this.reporter,
      reported: this.reported,
      post: this.post,
      message: this.message,
      reason: this.reason,
      type: this.type,
      resolved: this.resolved,
      created: this.created,
    };
  }
}
