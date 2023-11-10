import { Entity, ManyToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { Uuid } from 'src/types';
import { UserModel } from './UserModel';
import { Blocking } from 'src/types';

@Entity('UserBlockingTest')
export class UserBlockingModel {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @ManyToOne(() => UserModel, (user) => user.blocking)
  blockingUser: UserModel;

  @ManyToOne(() => UserModel, (user) => user.blockers)
  blockedUser: UserModel;

  public getBlockingInfo(): Blocking {
    return {
      id: this.id,
      blockingUser: this.blockingUser.getUserProfile(),
      blockedUser: this.blockedUser.getUserProfile(),
    }
  }
}