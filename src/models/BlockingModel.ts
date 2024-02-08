import { Entity, ManyToOne, PrimaryGeneratedColumn, PrimaryColumn, Column } from 'typeorm';
import { Uuid } from '../types';
import { UserModel } from './UserModel';
import { Blocking } from 'src/types';

@Entity('Blocking')
export class BlockingModel {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @ManyToOne(() => UserModel, user => user.blocking)
  blocker: UserModel;

  @ManyToOne(() => UserModel, user => user.blockers)
  blocked: UserModel;

  public getBlockingInfo(): Blocking {
    return {
      id: this.id,
      blocker: this.blocker.getUserProfile(),
      blocked: this.blocked.getUserProfile(),
    };
  }
}