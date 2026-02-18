import * as firebaseAdmin from "firebase-admin";
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
const serviceAccount = require(serviceAccountPath);

if (!serviceAccountPath) {
  throw new Error(
    "FIREBASE_SERVICE_ACCOUNT_PATH environment variable is not set.",
  );
}

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export { firebaseAdmin };
