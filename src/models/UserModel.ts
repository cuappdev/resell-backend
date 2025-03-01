import {
  Column,
  Entity,
  ManyToMany,
  OneToMany,
  JoinTable,
  PrimaryColumn,
} from "typeorm";

import { PrivateProfile, Uuid } from "../types";
import { FeedbackModel } from "./FeedbackModel";
import { PostModel } from "./PostModel";
import { RequestModel } from "./RequestModel";
import { UserReviewModel } from "./UserReviewModel";
import { ReportModel } from "./ReportModel";
import { FcmTokenModel } from "./FcmTokenModel";

@Entity("User")
export class UserModel {
  @PrimaryColumn({ name: "firebaseUid" })
  firebaseUid: string;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true, nullable: true })
  netid: string;

  isNewUser?: boolean; // Not stored in DB, used only for auth flow

  @Column({ nullable: true })
  givenName: string;

  @Column({ nullable: true })
  familyName: string;

  @Column()
  admin: boolean;

  @Column({ default: true, name: "isActive" })
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

  @Column({ unique: true, nullable: true })
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
  reports: ReportModel[];

  @OneToMany(() => ReportModel, (report) => report.reported)
  reportedBy: ReportModel[];

  @OneToMany(() => PostModel, (post) => post.user, { cascade: true })
  posts: PostModel[];

  @ManyToMany(() => PostModel, (post) => post.savers)
  saved: PostModel[];

  @OneToMany(() => FcmTokenModel, (token) => token.user, {
    cascade: true,
  })
  tokens: FcmTokenModel[];

  @OneToMany(() => FeedbackModel, (feedback) => feedback.user)
  feedbacks: FeedbackModel[];

  @OneToMany(() => RequestModel, (request) => request.user)
  requests: RequestModel[];

  @OneToMany(() => UserReviewModel, (review) => review.buyer)
  reviewsWritten: UserReviewModel[];

  @OneToMany(() => UserReviewModel, (review) => review.seller)
  reviewsReceived: UserReviewModel[];

  public getUserProfile(): PrivateProfile {
    return {
      firebaseUid: this.firebaseUid,
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
      // sentMessages: this.sentMessages,
      // receivedMessages: this.receivedMessages,
    };
  }
}
