import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity('FcmToken')
export class FcmTokenModel {    

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  fcmToken: string;

  @Column()
  notificationsEnabled: boolean;

  @Column()
  timestamp: Date;

  @ManyToOne(() => UserModel, user => user.firebaseUid)
  @JoinColumn({ name: 'user' })
  user: UserModel

}
