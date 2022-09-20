import { Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PrivateProfile, Uuid } from '../types';
import { FeedbackModel } from './FeedbackModel';
import { PostModel } from './PostModel';
import { UserSessionModel } from './UserSessionModel';

@Entity()
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

  @OneToMany(() => PostModel, post => post.user, { cascade: true })
  posts: PostModel[];

  @ManyToMany(() => PostModel, post => post.savers)
  saved: PostModel[];

  @OneToMany(() => UserSessionModel, session => session.user, { cascade: true })
  sessions: UserSessionModel[];

  @OneToMany(() => FeedbackModel, feedback => feedback.user)
  feedback: FeedbackModel[];

  public getUserProfile(): PrivateProfile {
    return {
      id: this.id,
      username: this.username,
      netid: this.netid,
      givenName: this.givenName,
      familyName: this.familyName,
      admin: this.admin,
      photoUrl: this.photoUrl,
      venmoHandle: this.venmoHandle,
      email: this.email,
      googleId: this.googleId,
      bio: this.bio,
      posts: this.posts,
      saved: this.saved,
      feedback: this.feedback,
    };
  }
}