import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import User from "./UserModel";

@Entity()
export default class Post extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column("text", { array: true })
  images: string[];

  @Column(({ nullable: true }))
  location: string;

  @ManyToOne(() => User, user => user.posts)
  user: User;

}
