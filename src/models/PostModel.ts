import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, } from 'typeorm';
import { UserModel } from "./UserModel";
import { Uuid, Post } from '../types'

@Entity()
export class PostModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("numeric", { scale: 2 } )
  price: number;

  @Column("text", { array: true })
  images: string[];

  @Column(({ nullable: true }))
  location: string;

  @ManyToOne(() => UserModel, user => user.posts)
  user: UserModel;

  public getPostInfo(): Post {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      price: this.price,
      images: this.images,
      location: this.location,
      user: this.user,
    };
  }
}
