import * as firebaseAdmin from "firebase-admin";

const authEmulatorHost = process.env.FIREBASE_AUTH_EMULATOR_HOST;
const firestoreEmulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
export const useFirebaseEmulators = Boolean(authEmulatorHost || firestoreEmulatorHost);

if (useFirebaseEmulators) {
  if (
    process.env.NODE_ENV !== "development" ||
    process.env.IS_PROD?.trim().toLowerCase() === "true" ||
    process.env.VERCEL ||
    process.env.VERCEL_ENV
  ) {
    throw new Error("Firebase emulators are only supported in local development.");
  }

  if (
    authEmulatorHost !== "127.0.0.1:9099" ||
    firestoreEmulatorHost !== "127.0.0.1:8080"
  ) {
    throw new Error(
      "Local testing requires both Firebase emulators. Use FIREBASE_AUTH_EMULATOR_HOST=127.0.0.1:9099 and FIRESTORE_EMULATOR_HOST=127.0.0.1:8080.",
    );
  }
}

function parseServiceAccount(raw: string): firebaseAdmin.ServiceAccount {
  try {
    return JSON.parse(raw) as firebaseAdmin.ServiceAccount;
  } catch {
    // Vercel multiline JSON is often pasted mangled; allow base64 instead.
    try {
      const decoded = Buffer.from(raw, "base64").toString("utf8");
      return JSON.parse(decoded) as firebaseAdmin.ServiceAccount;
    } catch {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON is set but is not valid JSON (or base64 JSON). " +
          `Value length=${raw.length}. Re-paste as a single-line JSON string, or base64-encode the file.`,
      );
    }
  }
}

function loadServiceAccount(): firebaseAdmin.ServiceAccount {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json && json.trim()) {
    return parseServiceAccount(json.trim());
  }

  const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
  if (!serviceAccountPath) {
    throw new Error(
      "Missing Firebase credentials for this environment. " +
        "Set FIREBASE_SERVICE_ACCOUNT_JSON on Vercel for Production AND Preview, " +
        "or FIREBASE_SERVICE_ACCOUNT_PATH locally.",
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(serviceAccountPath) as firebaseAdmin.ServiceAccount;
}

if (!firebaseAdmin.apps.length) {
  if (useFirebaseEmulators) {
    firebaseAdmin.initializeApp({ projectId: "demo-resell-local" });
  } else {
    firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(loadServiceAccount()),
    });
  }
}

export { firebaseAdmin };
