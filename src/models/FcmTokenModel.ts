import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity('FCMToken')
export class FcmTokenModel {    

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  fcmToken: string;

  @Column()
  notificationsEnabled: boolean;

  @Column()
  timestamp: Date;

  @ManyToOne(() => UserModel, user => user.tokens)
  @JoinColumn({ name: 'userId' })
  user: UserModel

}
