import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export default class User {

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