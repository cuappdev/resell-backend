import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import UserSession from './UserSessionModel';

@Entity()
export default class User {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: "text" })
  bio = "User has not entered a bio.";

  @Column({ unique: true })
  email: string;

  @Column({ unique: true })
  googleId: string;

  @Column()
  name: string;

  @Column()
  profilePictureUrl: string;

  @OneToMany(() => UserSession, session => session.user)
  sessions: UserSession[];
}