import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  JoinTable,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";

import { PrivateProfile, Uuid } from "../types";
import { FeedbackModel } from "./FeedbackModel";
import { PostModel } from "./PostModel";
import { RequestModel } from "./RequestModel";
import { UserSessionModel } from "./UserSessionModel";
import { UserReviewModel } from "./UserReviewModel";
import { ReportModel } from "./ReportModel";
import { MessageModel } from "./MessageModel";

@Entity("User")
export class UserModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  netid: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column()
  admin: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "numeric", default: 0 })
  stars: number;

  @Column({ type: "integer", default: 0 })
  numReviews: number;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ nullable: true })
  venmoHandle: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  googleId: string;

  @Column({ type: "text", default: "" })
  bio: string;

  @ManyToMany(() => UserModel, (user) => user.blockers)
  @JoinTable({
    name: "user_blocking_users",
    joinColumn: {
      name: "blockers",
      referencedColumnName: "id",
    },
    inverseJoinColumn: {
      name: "blocking",
      referencedColumnName: "id",
    },
  })
  blocking: UserModel[] | undefined;

  @ManyToMany(() => UserModel, (user) => user.blocking)
  blockers: UserModel[] | undefined;

  @OneToMany(() => ReportModel, (report) => report.reporter)
  public reports: ReportModel[];

  @OneToMany(() => ReportModel, (report) => report.reported)
  public reportedBy: ReportModel[];

  @OneToMany(() => PostModel, (post) => post.user, { cascade: true })
  posts: PostModel[];

  @ManyToMany(() => PostModel, (post) => post.savers)
  saved: PostModel[];

  @OneToMany(() => UserSessionModel, (session) => session.user, {
    cascade: true,
  })
  sessions: UserSessionModel[];

  @OneToMany(() => FeedbackModel, (feedback) => feedback.user)
  feedbacks: FeedbackModel[];

  @OneToMany(() => RequestModel, (request) => request.user)
  requests: RequestModel[];

  @OneToMany(() => UserReviewModel, (review) => review.buyer)
  reviewsWritten: UserReviewModel[];

  @OneToMany(() => UserReviewModel, (review) => review.seller)
  reviewsReceived: UserReviewModel[];

  @OneToMany(() => MessageModel, (message) => message.sender)
  public sentMessages: MessageModel[];

  @OneToMany(() => MessageModel, (message) => message.receiver)
  public receivedMessages: MessageModel[];

  public getUserProfile(): PrivateProfile {
    return {
      id: this.id,
      username: this.username,
      netid: this.netid,
      givenName: this.givenName,
      familyName: this.familyName,
      admin: this.admin,
      stars: this.stars,
      numReviews: this.numReviews,
      photoUrl: this.photoUrl,
      venmoHandle: this.venmoHandle,
      email: this.email,
      googleId: this.googleId,
      bio: this.bio,
      isActive: this.isActive,
      blocking: this.blocking,
      blockers: this.blockers,
      reports: this.reports,
      reportedBy: this.reportedBy,
      posts: this.posts,
      feedbacks: this.feedbacks,
      sentMessages: this.sentMessages,
      receivedMessages: this.receivedMessages,
    };
  }
}
