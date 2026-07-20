import * as firebaseAdmin from "firebase-admin";

function loadServiceAccount(): firebaseAdmin.ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json) as firebaseAdmin.ServiceAccount;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON.",
      );
    }
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
  if (!serviceAccountPath) {
    throw new Error(
      "Set FIREBASE_SERVICE_ACCOUNT_JSON or FIREBASE_SERVICE_ACCOUNT_PATH.",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(serviceAccountPath) as firebaseAdmin.ServiceAccount;
}

const serviceAccount = loadServiceAccount();

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert(serviceAccount),
  });
}

export { firebaseAdmin };
