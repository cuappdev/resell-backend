import { Service } from 'typedi';
import { getFirestore } from 'firebase-admin/firestore';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import Repositories, { TransactionsManager } from '../repositories';
import { UserAvailability, AvailabilitySlot } from '../types';

const db = getFirestore();
const availabilityRef = db.collection('availability');

@Service()
export class AvailabilityService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    /**
     * Create a new availability document in Firestore and link it to the user
     */
    public async createAvailability(
        userId: string,
        schedule: AvailabilitySlot[]
    ): Promise<UserAvailability> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            
            // Check if user already has availability
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            if (user.availabilityId) {
                throw new Error('User already has availability. Use update instead.');
            }

            const now = new Date();
            
            // Create the Firestore document
            const docRef = await availabilityRef.add({
                userId: userId,
                schedule: schedule.map(slot => ({
                    startDate: slot.startDate,
                    endDate: slot.endDate
                })),
                updatedAt: now
            });

            // Update the user with the availability reference
            await userRepository.updateAvailabilityId(userId, docRef.id);

            return {
                id: docRef.id,
                userId: userId,
                schedule: schedule,
                updatedAt: now
            };
        });
    }

    /**
     * Get availability for a user by their userId (firebaseUid)
     */
    public async getAvailabilityByUserId(userId: string): Promise<UserAvailability | null> {
        return this.transactions.readOnly(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            
            const user = await userRepository.getUserById(userId);
            if (!user || !user.availabilityId) {
                return null;
            }

            return this.getAvailabilityById(user.availabilityId);
        });
    }

    /**
     * Get availability document directly by its Firestore ID
     */
    public async getAvailabilityById(availabilityId: string): Promise<UserAvailability | null> {
        const doc = await availabilityRef.doc(availabilityId).get();
        
        if (!doc.exists) {
            return null;
        }

        const data = doc.data();
        return {
            id: doc.id,
            userId: data?.userId,
            schedule: data?.schedule?.map((slot: any) => ({
                startDate: slot.startDate?.toDate ? slot.startDate.toDate() : new Date(slot.startDate),
                endDate: slot.endDate?.toDate ? slot.endDate.toDate() : new Date(slot.endDate)
            })) || [],
            updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data?.updatedAt)
        };
    }

    /**
     * Update availability schedule for a user
     */
    public async updateAvailability(
        userId: string,
        schedule: AvailabilitySlot[]
    ): Promise<UserAvailability> {
        return this.transactions.readOnly(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            if (!user.availabilityId) {
                throw new Error('User does not have availability. Create one first.');
            }

            const now = new Date();

            // Update the Firestore document
            await availabilityRef.doc(user.availabilityId).update({
                schedule: schedule.map(slot => ({
                    startDate: slot.startDate,
                    endDate: slot.endDate
                })),
                updatedAt: now
            });

            return {
                id: user.availabilityId,
                userId: userId,
                schedule: schedule,
                updatedAt: now
            };
        });
    }

    /**
     * Delete availability for a user
     */
    public async deleteAvailability(userId: string): Promise<void> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);
            
            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }
            
            if (!user.availabilityId) {
                throw new Error('User does not have availability to delete.');
            }

            // Delete the Firestore document
            await availabilityRef.doc(user.availabilityId).delete();

            // Remove the reference from the user
            await userRepository.updateAvailabilityId(userId, null);
        });
    }
}
