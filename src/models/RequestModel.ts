import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { PrivateProfile, Request, Uuid } from '../types';
import { FeedbackModel } from './FeedbackModel';
import { PostModel } from './PostModel';
import { UserModel } from './UserModel';

@Entity('Request')
export class RequestModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @ManyToOne(() => UserModel, user => user.requests)
  @JoinColumn({ name: 'user' })
  user: UserModel

  @ManyToMany(() => PostModel, post => post.matched)
  matches: PostModel[];

  public getRequestInfo(): Request {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      user: this.user,
      matches: this.matches,
    };
  }
}
