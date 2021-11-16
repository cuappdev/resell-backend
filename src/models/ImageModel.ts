import { BaseEntity, Column, Entity, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import Post from "./PostModel";

@Entity()
export default class Image extends BaseEntity {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  url: string;

  @ManyToOne(() => Post, post => post.images)
  post: Post;
}