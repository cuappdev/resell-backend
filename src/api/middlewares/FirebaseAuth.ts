import {
  Action,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "routing-controllers";
import { firebaseAdmin } from "../../firebase";
import { getManager } from "typeorm";
import { UserModel } from "../../models/UserModel";

export const FirebaseCurrentUserChecker = async (
  action: Action,
): Promise<UserModel> => {
  const authHeader = action.request.headers["authorization"];
  if (!authHeader) {
    throw new UnauthorizedError("No authorization token provided");
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Invalid authorization token format");
  }

  try {
    // Verify the token using Firebase Admin SDK
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    const userId = decodedToken.uid;
    const email = decodedToken.email;
    // Enforce Cornell email domain restriction
    if (email && !email.endsWith("@cornell.edu")) {
      throw new ForbiddenError("Only Cornell email addresses are allowed");
    }
    // Fetch and return the user from the database
    const user = await getManager().findOne(UserModel, {
      firebaseUid: userId,
    });
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  } catch (error) {
    throw new UnauthorizedError("Invalid or expired authorization token");
  }
};
