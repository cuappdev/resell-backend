import { Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Uuid } from 'src/types';
import { UserModel } from './UserModel';
import { Blocking } from 'src/types';

@Entity()
export class UserBlocking {
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