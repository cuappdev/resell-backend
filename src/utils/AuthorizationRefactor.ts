import * as admin from 'firebase-admin';
import { getManager } from 'typeorm';
import { UserModel } from '../models/UserModel';
import { QueryRunner } from 'typeorm';

// function initializeFirebaseAdmin() {
//     if (!admin.apps.length) {
//         admin.initializeApp({
//             credential: admin.credential.applicationDefault(),
//         });
//     }
// }

// Generate a random string that matches Firebase UID format
function generateMockFirebaseUid(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const length = 28;
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('');
}

export async function populateFirebaseUids(queryRunner: QueryRunner) {
    // Get all users directly with SQL query
    const users = await queryRunner.query('SELECT * FROM "User"');
    console.log(`Populating Firebase UIDs for ${users.length} users`);
    
    for (const user of users) {
        try {
            // Get user by email from Firebase

            try{
                const firebaseUser = await admin.auth().getUserByEmail(user.email);
                // Update the firebaseUid using the query runner, not the manager
            await queryRunner.query(
                `UPDATE "User" SET "firebaseUid" = $1 WHERE id = $2`,
                [firebaseUser.uid, user.id]
            ); 
            }
            catch (error: any){
            
                console.log('user did not exist');
            
        

            }
            // // Update the firebaseUid using the query runner, not the manager
            // await queryRunner.query(
            //     `UPDATE "User" SET "firebaseUid" = $1 WHERE id = $2`,
            //     [firebaseUser.uid, user.id]
            // ); 
            // // Update firebaseUid for all users with random values (for testing)
            // DO NOT RUN/UNCOMMENT THIS IF RUNNING ON PROD
            // await queryRunner.query(
            //     `UPDATE "User" SET "firebaseUid" = $1 WHERE id = $2 AND "firebaseUid" IS NULL`,
            //     [generateMockFirebaseUid(), user.id]
            // );
            // console.log(`Updated user ${user.email} with mock Firebase UID`);
        } catch (error) {
            console.error(`Failed to update user ${user.email}:`, error);
        }
    }
    // Log total number of users updated
    const updatedUsers = await queryRunner.query('SELECT COUNT(*) FROM "User" WHERE "firebaseUid" IS NOT NULL');
    console.log(`Total users with Firebase UIDs: ${updatedUsers[0].count}`);
}

export async function validateFirebaseUids(queryRunner: QueryRunner) {
    const result = await queryRunner.query('SELECT COUNT (*) FROM "User" WHERE "firebaseUid" IS NULL');
    const count = result[0]['count'];
    if (count > 0) {
        console.error('Users missing Firebase UID:');
        throw new Error('Data validation failed');
    }
}