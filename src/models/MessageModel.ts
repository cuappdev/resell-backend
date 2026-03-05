import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  PrimaryColumn,
} from "typeorm";
import { Uuid } from "../types";
import { UserModel } from "./UserModel";
import { ReportModel } from "./ReportModel";

@Entity("Message")
export class MessageModel {
  @PrimaryColumn("uuid")
  id: Uuid;

  @OneToMany(() => ReportModel, (report) => report.message)
  reports: ReportModel[];
}
