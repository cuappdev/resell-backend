import { Service } from 'typedi';
import { getFirestore } from 'firebase-admin/firestore';
import { EntityManager } from 'typeorm';
import { InjectManager } from 'typeorm-typedi-extensions';
import Repositories, { TransactionsManager } from '../repositories';
import { UserAvailability, DaySchedule, AvailabilitySlot } from '../types';

const db = getFirestore();
const availabilityRef = db.collection('availability');

@Service()
export class AvailabilityService {
    private transactions: TransactionsManager;

    constructor(@InjectManager() entityManager: EntityManager) {
        this.transactions = new TransactionsManager(entityManager);
    }

    /**
     * Create empty availability for a new user (called during user registration)
     * This is an internal method - not exposed via API
     */
    public async createEmptyAvailability(userId: string): Promise<string> {
        const now = new Date();

        // Create the Firestore document with empty schedule
        const docRef = await availabilityRef.add({
            userId: userId,
            schedule: {},  // Empty day-keyed object
            updatedAt: now
        });

        return docRef.id;
    }

    /**
     * Get availability for a user by their userId (firebaseUid)
     * If user doesn't have availability yet (existing user), creates empty one automatically
     */
    public async getAvailabilityByUserId(userId: string): Promise<UserAvailability> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);

            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // If user doesn't have availability, create empty one (for existing users)
            if (!user.availabilityId) {
                const availabilityId = await this.createEmptyAvailability(userId);
                await userRepository.updateAvailabilityId(userId, availabilityId);

                return {
                    id: availabilityId,
                    userId: userId,
                    schedule: {},
                    updatedAt: new Date()
                };
            }

            return this.getAvailabilityById(user.availabilityId, userId);
        });
    }

    /**
     * Get availability document directly by its Firestore ID
     */
    private async getAvailabilityById(availabilityId: string, userId: string): Promise<UserAvailability> {
        const doc = await availabilityRef.doc(availabilityId).get();

        if (!doc.exists) {
            // Document was deleted from Firestore but reference exists - recreate it
            const newId = await this.createEmptyAvailability(userId);
            return {
                id: newId,
                userId: userId,
                schedule: {},
                updatedAt: new Date()
            };
        }

        const data = doc.data();
        const rawSchedule = data?.schedule || {};

        // Convert Firestore timestamps to Dates for each day's slots
        const schedule: DaySchedule = {};
        for (const [day, slots] of Object.entries(rawSchedule)) {
            schedule[day] = (slots as any[]).map((slot: any) => ({
                startDate: slot.startDate?.toDate ? slot.startDate.toDate() : new Date(slot.startDate),
                endDate: slot.endDate?.toDate ? slot.endDate.toDate() : new Date(slot.endDate)
            }));
        }

        return {
            id: doc.id,
            userId: data?.userId,
            schedule: schedule,
            updatedAt: data?.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data?.updatedAt)
        };
    }

    /**
     * Update availability schedule for specific days
     * Only the days included in the request are updated - other days remain unchanged
     * Send an empty array for a day to clear that day's availability
     */
    public async updateAvailability(
        userId: string,
        scheduleUpdates: DaySchedule
    ): Promise<UserAvailability> {
        return this.transactions.readWrite(async (transactionalEntityManager) => {
            const userRepository = Repositories.user(transactionalEntityManager);

            const user = await userRepository.getUserById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            const now = new Date();
            let availabilityId = user.availabilityId;

            // If user doesn't have availability, create one first
            if (!availabilityId) {
                availabilityId = await this.createEmptyAvailability(userId);
                await userRepository.updateAvailabilityId(userId, availabilityId);
            }

            // Build the update object with dot notation for each day
            const updateData: Record<string, any> = {
                updatedAt: now
            };

            for (const [day, slots] of Object.entries(scheduleUpdates)) {
                updateData[`schedule.${day}`] = slots.map(slot => ({
                    startDate: slot.startDate,
                    endDate: slot.endDate
                }));
            }

            // Update only the specified days in Firestore
            await availabilityRef.doc(availabilityId).update(updateData);

            // Fetch the full updated document to return
            return this.getAvailabilityById(availabilityId, userId);
        });
    }

    /**
     * Clear availability for specific days
     */
    public async clearDays(userId: string, days: string[]): Promise<UserAvailability> {
        const scheduleUpdates: DaySchedule = {};
        for (const day of days) {
            scheduleUpdates[day] = [];
        }
        return this.updateAvailability(userId, scheduleUpdates);
    }
}
