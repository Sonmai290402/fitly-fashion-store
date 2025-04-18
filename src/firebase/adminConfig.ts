import admin from "firebase-admin";
import { getApps } from "firebase-admin/app";

if (!getApps().length) {
  const rawServiceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY!
  );

  // Fix PEM format: replace escaped newlines with real newlines
  rawServiceAccount.private_key = rawServiceAccount.private_key.replace(
    /\\n/g,
    "\n"
  );

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(rawServiceAccount),
    });
  }
}

export const adminAuth = admin.auth();
export const adminFirestore = admin.firestore();
