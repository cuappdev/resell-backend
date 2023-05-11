import crypto from 'crypto';
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { APIUserSession, Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity('UserSession')
export class UserSessionModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  accessToken: string;

  @Column({ type: 'timestamptz' })
  expiresAt: Date;

  @Column()
  refreshToken: string;

  @Column("text", { default: "", nullable: false, })
  deviceToken: string;

  @ManyToOne(() => UserModel, user => user.sessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: 'user' })
  user: UserModel;

  @Column()
  userId: Uuid;

  public update(accessToken?: string, refreshToken?: string): UserSessionModel {
    this.accessToken = accessToken || crypto.randomBytes(64).toString('hex');
    this.refreshToken = refreshToken || crypto.randomBytes(64).toString('hex');
    // expires the next month 
    // (added time is one month in milliseconds)
    this.expiresAt = new Date(Math.floor(new Date().getTime()) + 1000 * 60 * 60 * 24 * 30);

    return this;
  }

  public serializeToken(): APIUserSession {
    return {
      userId: this.userId,
      accessToken: this.accessToken,
      active: this.expiresAt.getTime() > Date.now(),
      expiresAt: this.expiresAt.getTime(),
      refreshToken: this.refreshToken,
      deviceToken: this.deviceToken
    };
  }

}