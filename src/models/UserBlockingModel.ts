import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Uuid } from 'src/types';
import { UserModel } from './UserModel';
import { Blocking } from 'src/types';

@Entity('UserBlocking')
export class UserBlocking {
  @PrimaryGeneratedColumn('uuid')
  id_wow: Uuid;

  @ManyToOne(() => UserModel, (user) => user.blocking)
  blockingUser: UserModel;

  @ManyToOne(() => UserModel, (user) => user.blockers)
  blockedUser: UserModel;

  public getBlockingInfo(): Blocking {
    return {
      id: this.id_wow,
      blockingUser: this.blockingUser.getUserProfile(),
      blockedUser: this.blockedUser.getUserProfile(),
    }
  }
}