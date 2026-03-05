import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserModel } from "./UserModel";

@Entity("searches")
export class SearchModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  searchText: string;

  @Column()
  searchVector: string;

  @Column()
  firebaseUid: string;

  @ManyToOne(() => UserModel, { onDelete: "CASCADE" })
  @JoinColumn({ name: "firebaseUid", referencedColumnName: "firebaseUid" })
  user: UserModel;

  @CreateDateColumn()
  createdAt: Date;
}
