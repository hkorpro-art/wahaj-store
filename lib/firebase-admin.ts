import "server-only";
import { applicationDefault, cert, getApps, initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";

function readEnv(...names: string[]) {
  for (const name of names) {
    const value = normalizeEnvValue(process.env[name]);
    if (value) return value;
  }
  return "";
}

function normalizeEnvValue(value: string | undefined) {
  if (!value) return "";
  return value.trim().replace(/^['"]|['"]$/g, "");
}

function parsePrivateKey(value: string) {
  if (!value) return "";
  return normalizeEnvValue(value).replace(/\\n/g, "\n");
}

function createFirebaseApp() {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = readEnv("FIREBASE_PROJECT_ID", "GOOGLE_CLOUD_PROJECT", "GCLOUD_PROJECT");
  const clientEmail = readEnv("FIREBASE_CLIENT_EMAIL");
  const privateKey = parsePrivateKey(readEnv("FIREBASE_PRIVATE_KEY"));

  if (projectId && clientEmail && privateKey) {
    return initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey
      })
    });
  }

  if (readEnv("GOOGLE_APPLICATION_CREDENTIALS")) {
    try {
      return initializeApp({
        credential: applicationDefault(),
        projectId: projectId || undefined
      });
    } catch {
      return null;
    }
  }

  return null;
}

export function getFirebaseAdminApp() {
  return createFirebaseApp();
}

export function getFirebaseFirestoreAdmin() {
  const app = createFirebaseApp();

  if (!app) {
    return null;
  }

  return getFirestore(app);
}

export function getFirebaseMessagingAdmin() {
  const app = createFirebaseApp();

  if (!app) {
    return null;
  }

  return getMessaging(app);
}
