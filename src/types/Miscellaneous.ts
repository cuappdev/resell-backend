export enum Condition {
  GENTLY_USED,
  USED,
  NEVER_USED,
}

// Availability types for Firestore

/** A single time slot within a day */
export interface AvailabilitySlot {
  startDate: Date;
  endDate: Date;
}

/** Day-keyed schedule: { "2026-01-23": [slots], "2026-01-24": [slots] } */
export type DaySchedule = Record<string, AvailabilitySlot[]>;

/** Full availability document structure */
export interface UserAvailability {
  id: string;                        // Firestore document ID
  userId: string;                    // Reference to User's firebaseUid
  schedule: DaySchedule;             // Day-keyed availability slots
  updatedAt: Date;
}
