import { Column, Entity, JoinColumn, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Request, Uuid } from '../types';
import { PostModel } from './PostModel';
import { UserModel } from './UserModel';
import pgvector from 'pgvector';

@Entity('Request')
export class RequestModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column({ default: false })
  archive: boolean;

  @Column("float", { array: true, nullable: true })
  embedding: number[];

  @ManyToOne(() => UserModel, user => user.requests, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user' })
  user: UserModel

  @ManyToMany(() => PostModel, post => post.matched)
  matches: PostModel[];

  public getRequestInfo(): Request {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      archive: this.archive,
      embedding: this.embedding,
      user: this.user,
      matches: this.matches,
    };
  }
}
