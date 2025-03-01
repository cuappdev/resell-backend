import * as admin from 'firebase-admin';
import { getManager } from 'typeorm';
import { UserModel } from '../models/UserModel';
import { QueryRunner } from 'typeorm';

export async function populateFirebaseUids(queryRunner: QueryRunner) {
    const users = await queryRunner.manager.find(UserModel);
    
    for (const user of users) {
        try {
            // Get user by email from Firebase
            const firebaseUser = await admin.auth().getUserByEmail(user.email);
            
            // Update the firebaseUid using the query runner, not the manager
            await queryRunner.query(
                `UPDATE user SET firebaseUid = $1 WHERE id = $2`,
                [firebaseUser.uid, user.firebaseUid]
            ); 
            console.log(`Updated user ${user.email} with Firebase UID ${firebaseUser.uid}`);
        } catch (error) {
            console.error(`Failed to update user ${user.email}:`, error);
        }
    }
}

export async function validateFirebaseUids(queryRunner: QueryRunner) {
    const result = await queryRunner.query('SELECT COUNT (*) FROM user WHERE firebaseUid IS NULL');
    const count = result[0]['count'];
    if (count > 0) {
        console.error('Users missing Firebase UID:');
        throw new Error('Data validation failed');
    }
}