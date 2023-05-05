import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Post, Uuid } from '../types';
import { RequestModel } from './RequestModel';
import { UserModel } from './UserModel';

@Entity('Post')
export class PostModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("text", { array: true })
  categories: string[];

  @Column("numeric", { scale: 2 })
  original_price: number;

  @Column("numeric", { scale: 2, default: -1 })
  altered_price: number;

  @Column("text", { array: true })
  images: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;

  @Column(({ nullable: true }))
  location: string;

  @Column({ default: false })
  archive: boolean;

  @ManyToOne(() => UserModel, user => user.posts)
  @JoinColumn({ name: 'user' })
  user: UserModel;

  @ManyToMany(() => UserModel, user => user.saved)
  @JoinTable({
    name: "user_saved_posts",
    joinColumn: {
      name: "saved",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "savers",
      referencedColumnName: "id"
    }
  })
  savers: UserModel[];

  @ManyToMany(() => RequestModel, request => request.matches)
  @JoinTable({
    name: "request_matches_posts",
    joinColumn: {
      name: "matches",
      referencedColumnName: "id"
    },
    inverseJoinColumn: {
      name: "matched",
      referencedColumnName: "id"
    }
  })
  matched: RequestModel[];

  public getPostInfo(): Post {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      categories: this.categories,
      original_price: this.original_price,
      altered_price: this.altered_price,
      images: this.images,
      created: this.created,
      location: this.location,
      archive: this.archive,
      user: this.user.getUserProfile(),
      savers: this.savers?.map(user => user.getUserProfile()),
      matched: this.matched?.map(request => request.getRequestInfo()),
    };
  }
}
