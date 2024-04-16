import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

import { Report, Uuid } from '../types';
import { UserModel } from './UserModel';

@Entity('Report')
export class ReportModel {

  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @ManyToOne(() => UserModel, (user) => user.reports)
  public reporter: UserModel;

  @ManyToOne(() => UserModel, (user) => user.reportedby)
  public reported: UserModel;

  @Column()
  message: string;

  @Column("text", { array: true })
  categories: string[];

  @CreateDateColumn({ type: 'timestamptz' })
  created: Date;



  public getReportInfo(): Report {
    return {
      id: this.id,
      reporter: this.reporter,
      reported: this.reported,
      message: this.message,
      categories: this.categories,
      created: this.created,
    };
  }
}
