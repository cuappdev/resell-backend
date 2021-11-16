import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import User from "./UserModel";
import Image from "./ImageModel";

@Entity()
export default class Post extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column(({ nullable: true }))
  location: string;

  @ManyToOne(() => User, user => user.posts)
  user: User;

  @OneToMany(() => Image, image => image.post, { onDelete: "CASCADE" })
  images: Image[];
}