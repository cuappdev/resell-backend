import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserModel } from './UserModel';

@Entity('notifications')
export class NotifModel {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => UserModel)
    @JoinColumn({ name: 'userId' })
    user: UserModel;

    @Column('uuid')
    userId: string;

    @Column()
    title: string;

    @Column()
    body: string;

    @Column('jsonb', { nullable: true })
    data: Record<string, any>;

    @Column({ default: false })
    read: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    public getNotifInfo() {
        return {
            id: this.id,
            userId: this.userId,
            title: this.title,
            body: this.body,
            data: this.data,
            read: this.read,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}