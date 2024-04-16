import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Uuid } from "../types";
import { UserModel } from "./UserModel";
import { ReportModel } from "./ReportModel";

@Entity("Message")
export class MessageModel {
  @PrimaryGeneratedColumn("uuid")
  id: Uuid;

  @ManyToOne(() => UserModel, (user) => user.sentMessages)
  @JoinColumn({ name: "sender" })
  sender: UserModel;

  @ManyToOne(() => UserModel, (user) => user.receivedMessages)
  @JoinColumn({ name: "receiver" })
  receiver: UserModel;

  @Column()
  content: string;

  @CreateDateColumn({ type: "timestamptz" })
  timestamp: Date;

  @OneToMany(() => ReportModel, (report) => report.message)
  public reports: ReportModel[];
}
