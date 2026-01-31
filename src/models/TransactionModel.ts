import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { PostModel } from "./PostModel";
import { UserModel } from "./UserModel";

@Entity("Transaction")
export class TransactionModel {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  location: string; // Transaction location

  @Column("numeric", { scale: 2 })
  amount: number; // Transaction amount

  @Column({ type: "timestamptz", nullable: true })
  transactionDate: Date; // Date and time of the transaction

  @Column({ default: false })
  completed: boolean; // Whether the transaction is completed

  @Column({ default: false })
  confirmationSent: boolean; // Whether we've sent a confirmation notification

  @ManyToOne(() => PostModel, { cascade: false })
  @JoinColumn({ name: "post_id" })
  post: PostModel; // The item/listing itself

  @ManyToOne(() => UserModel, { cascade: false })
  @JoinColumn({ name: "buyer_id" })
  buyer: UserModel; // The buyer

  @ManyToOne(() => UserModel, { cascade: false })
  @JoinColumn({ name: "seller_id" })
  seller: UserModel; // The seller

  @CreateDateColumn({ type: "timestamptz" })
  createdAt: Date; // Automatically store when the transaction record was created
}