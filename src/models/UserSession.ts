import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import User from './UserModel';

@Entity()
export default class UserSession {

  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  accessToken: string;

  @Column()
  active: boolean;

  @Column({ type: 'timestamp' })
  expiresAt: string;

  @Column()
  refreshToken: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

}