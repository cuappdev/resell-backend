import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';
import { Uuid } from '../types';
import { TransactionModel } from './TransactionModel';

@Entity('TransactionReview')
export class TransactionReviewModel {
  @PrimaryGeneratedColumn('uuid')
  id: Uuid;

  @Column()
  stars: number; // Mandatory field for star ratings

  @Column({ type : 'text', nullable: true })
  comments: string | null; // Optional field for review comments

  @Column({ default: false, name: 'hadIssues' })
  hadIssues: boolean; // Boolean flag indicating if there were issues

  @Column({ type : 'text', nullable: true, name: 'issueCategory' })
  issueCategory: string | null; // Category of the issue (optional)

  @Column({ type : 'text', nullable: true, name: 'issueDetails' })
  issueDetails: string | null; // Detailed explanation of the issue (optional)

  @CreateDateColumn({ type: 'timestamptz', name: 'createdAt' })
  createdAt: Date; // Auto-generated timestamp of when the review was created

  @OneToOne(() => TransactionModel, { cascade : false })
  @JoinColumn({ name: 'transaction_id' })
  transaction: TransactionModel; // Link to the related transaction

  public getTransactionReviewInfo() {
    return {
      id: this.id,
      stars: this.stars,
      comments: this.comments,
      hadIssues: this.hadIssues,
      issueCategory: this.issueCategory,
      issueDetails: this.issueDetails,
      createdAt: this.createdAt,
      transaction: this.transaction ? this.transaction.id : null, // Expose only the transaction ID
    };
  }
}
