import { Column, Entity, ManyToMany, OneToMany, JoinTable, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';

import { PrivateProfile, Uuid } from '../types';
import { FeedbackModel } from './FeedbackModel';
import { PostModel } from './PostModel';
import { RequestModel } from './RequestModel';
import { UserSessionModel } from './UserSessionModel';
import { UserReviewModel } from './UserReviewModel'

@Entity('User')
export class UserModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column({ unique: true })
  username: string;

  @Column({ unique: true })
  netid: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column()
  admin: boolean;

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
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "blocking",
      referencedColumnName: "id"
    }
  })
  blocking: UserModel[] | undefined;

  @ManyToMany(() => UserModel, (user) => user.blocking)
  blockers: UserModel[] | undefined;

  @OneToMany(() => PostModel, post => post.user, { cascade: true })
  posts: PostModel[];

  @ManyToMany(() => PostModel, post => post.savers)
  saved: PostModel[];

  @OneToMany(() => UserSessionModel, session => session.user, { cascade: true })
  sessions: UserSessionModel[];

  @OneToMany(() => FeedbackModel, feedback => feedback.user)
  feedbacks: FeedbackModel[];

  @OneToMany(() => RequestModel, request => request.user)
  requests: RequestModel[];

  @OneToMany(() => UserReviewModel, review => review.buyer)
  reviewsWritten: UserReviewModel[];

  @OneToMany(() => UserReviewModel, review => review.seller)
  reviewsReceived: UserReviewModel[];

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
      blocking: this.blocking,
      blockers: this.blockers,
      posts: this.posts,
      feedbacks: this.feedbacks,
    };
  }
}