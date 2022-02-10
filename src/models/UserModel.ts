import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PrivateProfile, PublicProfile, Uuid } from '../types'
import { PostModel } from './PostModel';
import UserSession from './UserSessionModel';

@Entity()
export class UserModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  profilePictureUrl: string;

  @Column({ unique: true })
  venmoHandle: string;

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  googleId: string;

  @Column({ type: "text" })
  bio = "User has not entered a bio.";

  @OneToMany(() => PostModel, post => post.user, { onDelete: "CASCADE" })
  posts: PostModel[];

  @OneToMany(() => PostModel, post => post.user)
  saved: PostModel[];

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  public getUserProfile(): PrivateProfile {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      profilePictureUrl: this.profilePictureUrl,
      venmoHandle: this.venmoHandle,
      email: this.email,
      googleId: this.googleId,
      bio: this.bio,
      posts: this.posts,
      saved: this.saved,
    };
  }
}