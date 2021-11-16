import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import Post from "./PostModel"

@Entity()
export default class User extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  googleId: string;

  @Column()
  fullName: string;

  @Column()
  displayName: string;

  @Column({ unique: true })
  email: string;

  @OneToMany(() => Post, post => post.user, { onDelete: "CASCADE" })
  posts: Post[];


}