  export enum Condition {
    GENTLY_USED,
    USED,
    NEVER_USED
}

// Availability types for Firestore
export interface AvailabilitySlot {
  startDate: Date;
  endDate: Date;
}

export interface UserAvailability {
  id: string;                        // Firestore document ID
  userId: string;                    // Reference to User's firebaseUid
  schedule: AvailabilitySlot[];      // Array of availability time slots
  updatedAt: Date;
}