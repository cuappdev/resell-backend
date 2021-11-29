import { APIUserSession } from '../routers/APITypes';
import crypto from 'crypto';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './UserModel';

@Entity()
export default class UserSession {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  refreshToken: string;

  @ManyToOne(() => User, user => user.sessions, { cascade: true, onDelete: "CASCADE" })
  user: User;

  update = (accessToken?: string, refreshToken?: string): UserSession => {
    this.accessToken = accessToken || crypto.randomBytes(64).toString('hex');
    this.refreshToken = refreshToken || crypto.randomBytes(64).toString('hex');
    this.expiresAt = new Date(Math.floor(new Date().getTime()) + 1000 * 60 * 60 * 24);
    return this;
  };

  serialize = (): APIUserSession => {
    return {
      accessToken: this.accessToken,
      active: this.expiresAt.getTime() > Date.now(),
      expiresAt: this.expiresAt.getTime(),
      refreshToken: this.refreshToken,
    };
  };

}