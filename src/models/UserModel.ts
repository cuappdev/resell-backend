import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

import { PrivateProfile, Uuid } from '../types';
import { PostModel } from './PostModel';
import { UserSessionModel } from './UserSessionModel';

@Entity()
export class UserModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  username: string;

  @Column()
  netid: string;

  @Column()
  givenName: string;

  @Column()
  familyName: string;

  @Column({ nullable: true })
  photoUrl: string;

  @Column({ unique: true, nullable: true })
  venmoHandle: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  googleId: string;

  @Column({ type: "text", default: "" })
  bio: string;

  @OneToMany(() => PostModel, post => post.user, { cascade: true })
  posts: PostModel[];

  @OneToMany(() => PostModel, post => post.user, { cascade: true })
  saved: PostModel[];

  @OneToMany(() => UserSessionModel, session => session.user, { cascade: true })
  sessions: UserSessionModel;

  public getUserProfile(): PrivateProfile {
    return {
      id: this.id,
      username: this.username,
      netid: this.netid,
      givenName: this.givenName,
      familyName: this.familyName,
      photoUrl: this.photoUrl,
      venmoHandle: this.venmoHandle,
      email: this.email,
      googleId: this.googleId,
      bio: this.bio,
      posts: this.posts,
      saved: this.saved,
    };
  }
}