import { Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { Post, Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity()
export class PostModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("text", { array: true })
  categories: string[];

  @Column("numeric", { scale: 2 } )
  price: number;

  @Column("text", { array: true })
  images: string[];

  @Column(({ nullable: true }))
  location: string;

  @ManyToOne(() => UserModel, user => user.posts)
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
     }})
  savers: UserModel[];

  public getPostInfo(): Post {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      categories: this.categories,
      price: this.price,
      images: this.images,
      location: this.location,
      user: this.user.getUserProfile(),
      savers: this.savers.map(user => user.getUserProfile()),
    };
  }
}
