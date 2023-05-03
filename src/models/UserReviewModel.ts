import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, OneToOne } from 'typeorm';

import { Uuid, UserReview } from '../types';
import { UserModel } from './UserModel';

@Entity('UserReview')
export class UserReviewModel{

    @PrimaryGeneratedColumn('uuid')
    id: Uuid;

    @Column()
    fulfilled: boolean;

    @Column()
    stars: number;

    @Column()
    comments: string;

    @CreateDateColumn({ type: 'timestamptz' })
    date: Date;

    @ManyToOne(() => UserModel, buyer => buyer.reviewsWritten)
    @JoinColumn({ name: 'buyer' })
    buyer: UserModel;

    @ManyToOne(() => UserModel, seller => seller.reviewsReceived)
    @JoinColumn({ name: 'seller' })
    seller: UserModel;

    public getReviewInfo(): UserReview {
        return {
            id: this.id,
            fulfilled: this.fulfilled,
            stars: this.stars,
            comments: this.comments,
            date: this.date,
            buyer: this.buyer.getUserProfile(),
            seller: this.seller.getUserProfile(),
        };
    }
}