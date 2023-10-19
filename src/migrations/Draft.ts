// import { MigrationInterface, QueryRunner, TableColumn } from "typeorm";

// const TABLE_NAME = "User";

// export class AddIsBlockedAndBeingBlockedByForUser1697063426930 implements MigrationInterface {

//     public async up(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.addColumn(
//             TABLE_NAME,
//             new TableColumn({
//                 name: "isBlocking",
//                 type: "UserModel[]",
//                 default: "array[]::UserModel[]",
//             })
//         )
//         await queryRunner.addColumn(
//             TABLE_NAME,
//             new TableColumn({
//                 name: "beingBlockedBy",
//                 type: "UserModel[]",
//                 default: "array[]::UserModel[]",
//             })
//         )
//     }

//     public async down(queryRunner: QueryRunner): Promise<void> {
//         await queryRunner.dropColumn(TABLE_NAME, "isBlocking");
//         await queryRunner.dropColumn(TABLE_NAME, "beingBlockedBy");
//     }
// }
