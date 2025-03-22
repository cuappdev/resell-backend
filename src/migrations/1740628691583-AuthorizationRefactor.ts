import {MigrationInterface, QueryRunner} from "typeorm";
import { populateFirebaseUids, validateFirebaseUids } from "../utils/AuthorizationRefactor";

export class AuthorizationRefactor1740628691583 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add new column as nullable initially
        await queryRunner.query(`ALTER TABLE "User" ADD COLUMN "firebaseUid" VARCHAR`);
        await populateFirebaseUids(queryRunner);
        await validateFirebaseUids(queryRunner);
        // Change firebase uid column to be not null
        await queryRunner.query(`ALTER TABLE "User" ALTER COLUMN "firebaseUid" SET NOT NULL`);
        // drop usersessions table
        await queryRunner.query(`DROP TABLE IF EXISTS "UserSession" CASCADE;`);
        // for each table, need to go to all the columns that refer to a user id and create a temporary column, 
        // drop old fks
        // drop the old column, and rename the new column
        // create new fks

        type TableColumnFKTuple = [string, string, string];
        const userTableColumnFKs: TableColumnFKTuple[] = [
            ["Request", "user", "FK_db281bd2822e1938f5072960173"],
            ["Post", "user", "FK_2067452f95b084577dae22e17e2"],
            ["UserReview", "buyer", "FK_003e3b33806e21e65f3fb0b87e6"],
            ["UserReview", "seller", "FK_1d721b09d28cb397b9b2edf76f7"],
            ["Feedback", "user", "FK_e1ca1a1706e36874b6adfaab662"],
            ["user_saved_posts", "savers", "FK_1da3c41687f5a8934c7808ef24d"],
            ["user_blocking_users", "blockers", "FK_fab66ba7c0e58e67b0d67f1c232"],
            ["user_blocking_users", "blocking", "FK_b5c7223aa162c5ccd1867056f73"],
            ["Message", "sender", "FK_e2dae4735204f29947d6c42a615"],
            ["Message", "receiver", "FK_8cc2e2f4ee9cdf7e5d9c70c5809"],
            ["Report", "reporter_id", "FK_6c3af08f1d45614f3b2f7e1b407"],
            ["Report", "reported_id", "FK_0dd9a57f65a4b09cdae63735b13"],
            ["Transaction", "buyer_id", "FK_buyer"],
            ["Transaction", "seller_id", "FK_seller"],
            ["notifications", "user_id", "FK_notifications_user"]
        ];
        for (const [table, column, fk] of userTableColumnFKs) {
            // check via query if the col exists in the table. if it does not, do not go thorugh with the bottom 3 queries
            const result = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`);
            if (result.length === 0) {
                continue;
            }
            // Drop the old foreign key constraint if it exists
            await queryRunner.query(`
                DO $$ 
                BEGIN
                    IF EXISTS (
                        SELECT 1 
                        FROM information_schema.table_constraints 
                        WHERE constraint_name = '${fk}'
                    ) THEN
                        ALTER TABLE "${table}" DROP CONSTRAINT "${fk}";
                    END IF;
                END $$;
            `);
            await queryRunner.query(`ALTER TABLE "${table}" ADD COLUMN "${column}_firebaseUid" VARCHAR`);
                
            // Update the temporary column with Firebase UID from User table 
            await queryRunner.query(`
                UPDATE "${table}" t
                SET "${column}_firebaseUid" = u."firebaseUid"
                FROM "User" u
                WHERE t.${column} = u.id
            `);
        }

         // Drop the primary key constraint by finding its name first
         await queryRunner.query(`
            DO $$ 
            DECLARE
                constraint_name text;
            BEGIN
                SELECT tc.constraint_name into constraint_name
                FROM information_schema.table_constraints tc
                WHERE tc.table_name = 'User'
                AND tc.constraint_type = 'PRIMARY KEY';
                
                IF constraint_name IS NOT NULL THEN
                    -- Use CASCADE to automatically drop dependent objects
                    EXECUTE 'ALTER TABLE "User" DROP CONSTRAINT "' || constraint_name || '" CASCADE';
                END IF;
            END $$;
         `);

         // 4. Make firebaseUid the new primary key
         await queryRunner.query(`
             ALTER TABLE "User" 
             DROP COLUMN "id",
             ADD PRIMARY KEY ("firebaseUid")
         `);
 
        for (const [table, column, fk] of userTableColumnFKs) {
            const result = await queryRunner.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND column_name = '${column}'`);
            if (result.length === 0) {
                continue;
            }
            //drop old column
            await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "${column}"`);

            //rename temporary column
            await queryRunner.query(`ALTER TABLE "${table}" RENAME COLUMN "${column}_firebaseUid" TO "${column}"`);

            //create new fks
            await queryRunner.query(`ALTER TABLE "${table}" ADD CONSTRAINT "FK_${table}_${column}" FOREIGN KEY ("${column}") REFERENCES "User"("firebaseUid") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        }
        // create new fcm token table
        await queryRunner.query(`
            CREATE TABLE "FCMToken" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "fcmToken" varchar NOT NULL,
                "notificationsEnabled" boolean NOT NULL DEFAULT true,
                "timestamp" TIMESTAMP NOT NULL DEFAULT now(),
                "userId" varchar NOT NULL,
                CONSTRAINT "PK_FCMToken" PRIMARY KEY ("id"),
                CONSTRAINT "FK_FCMToken_userId" FOREIGN KEY ("userId") 
                    REFERENCES "User"("firebaseUid") ON DELETE CASCADE ON UPDATE NO ACTION
            )
        `);
        await queryRunner.query(`CREATE INDEX "IDX_FCMToken_userId" ON "FCMToken"("userId")`);
        await queryRunner.query(`CREATE INDEX "IDX_FCMToken_fcmToken" ON "FCMToken"("fcmToken")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // there is no roll back for this migration
    }
}
