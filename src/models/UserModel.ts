import { BaseEntity, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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
}