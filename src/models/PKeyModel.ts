import { Entity, ManyToOne, PrimaryGeneratedColumn, PrimaryColumn } from 'typeorm';
import { Uuid } from 'src/types';
import { UserModel } from './UserModel';
import { Blocking } from 'src/types';

@Entity('PKeyTest')
export class PKeyTest {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

}