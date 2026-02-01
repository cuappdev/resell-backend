import { Action } from "routing-controllers";
import { firebaseAdmin } from "../../firebase";

export const FirebaseCurrentUserChecker = async (
  action: Action,
): Promise<any> => {
  console.log("AUTH MIDDLEWARE CALLED for path:", action.request.path);
  const authHeader = action.request.headers["authorization"];
  if (!authHeader) {
    throw new Error("No authorization token provided");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new Error("Invalid authorization token format");
  }
  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    // Check if the email is a Cornell email
    const email = decodedToken.email;
    const userId = decodedToken.uid;
    action.request.email = email;
    action.request.userId = userId;
    if (!email.endsWith("@cornell.edu")) {
      throw new Error("Unauthorized: Email is not a Cornell email");
    }
    // Optionally fetch and return the user from the database
    const manager = getManager();
    const user = await manager.findOne(UserModel, {
      firebaseUid: userId,
    });
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error in FirebaseCurrentUserChecker:", error);
    throw new Error("Unauthorized: Invalid token");
  }
};

// async (action: any) => {
//       console.log("AUTH MIDDLEWARE CALLED for path:", action.request.path);
//       const authHeader = action.request.headers["authorization"];
//       if (!authHeader) {
//         throw new ForbiddenError("No authorization token provided");
//       }
//       const token = authHeader.split(" ")[1];
//       if (!token) {
//         throw new ForbiddenError("Invalid authorization token format");
//       }
//       try {
//         // Verify the token using Firebase Admin SDK
//         const decodedToken = await admin.auth().verifyIdToken(token);
//         // Check if the email is a Cornell email
//         const email = decodedToken.email;
//         const userId = decodedToken.uid;
//         action.request.email = email;
//         console.log("uid");
//         action.request.firebaseUid = userId;
//         console.log("here");
//         if (!email || !email.endsWith("@cornell.edu")) {
//           throw new ForbiddenError("Only Cornell email addresses are allowed");
//         }
//         // Find or create user in your database using Firebase UID
//         const manager = getManager();
//         const user = await manager.findOne(
//           UserModel,
//           { firebaseUid: userId },
//           { relations: ["posts", "saved", "feedbacks", "requests"] },
//         );
//         if (!user) {
//           // Check if this is the user creation route or authorization route
//           const isUserCreateRoute =
//             action.request.path === "/api/user/create/" ||
//             action.request.path === "/api/user/create" ||
//             action.request.path === "/api/authorize" ||
//             action.request.path === "api/authorize";
//           console.log(
//             `User not found for path: ${action.request.path}, isUserCreateRoute: ${isUserCreateRoute}`,
//           );
//           if (!isUserCreateRoute) {
//             throw new ForbiddenError(
//               "User not found. Please create an account first.",
//             );
//           }
//           // For user creation routes, return a minimal UserModel
//           const tempUser = new UserModel();
//           tempUser.googleId = email;
//           tempUser.firebaseUid = decodedToken.uid;
//           tempUser.email = email;
//           tempUser.username = `temp_${decodedToken.uid}`;
//           tempUser.isActive = true;
//           tempUser.admin = false;
//           tempUser.isNewUser = true;
//           return tempUser;
//         }
//         if (!user) {
//           throw new ForbiddenError("User authentication failed");
//         }
//         return user;
//       } catch (error) {
//         if (error instanceof ForbiddenError) {
//           throw error;
//         }
//         if (error.code == "auth/argument-error") {
//           throw new HttpError(
//             408,
//             "Request timed out while waiting for response",
//           );
//         }
//         if (error.code === "auth/id-token-expired") {
//           throw new UnauthorizedError("Token has expired");
//         }
//         throw new UnauthorizedError("Invalid authorization token");
//       }
//     },
