import crypto from 'crypto';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { APIUserSession, Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity()
export default class UserSession {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  accessToken: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  refreshToken: string;

  @ManyToOne(() => UserModel, user => user.sessions, { cascade: true, onDelete: "CASCADE" })
  user: UserModel;

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