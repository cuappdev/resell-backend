import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PrivateProfile, PublicProfile, Uuid } from '../types'
import Post from './PostModel';
import UserSession from './UserSessionModel';

@Entity()
export default class UserModel {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  profilePictureUrl: string;

  @Column({ type: "text" })
  bio = "User has not entered a bio.";

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  googleId: string;

  @OneToMany(() => Post, post => post.user, { onDelete: "CASCADE" })
  posts: Post[];

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];

  public getUserProfile(): PrivateProfile {
    return {
      id: this.id,
      name: this.name,
      profilePictureUrl: this.profilePictureUrl,
      bio: this.bio,
      email: this.email,
      googleId: this.googleId,
    };
  }
}