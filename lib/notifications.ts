import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseFirestoreAdmin, getFirebaseMessagingAdmin } from "@/lib/firebase-admin";

const COLLECTION = "notification_subscriptions";
const MAX_MULTICAST_TOKENS = 500;

export type NotificationSendResult = {
  total: number;
  success: number;
  failed: number;
  settingsComplete: boolean;
};

export function hasFirebaseClientMessagingConfig() {
  return [
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
  ].every((value) => typeof value === "string" && value.trim().length > 0);
}

export function hasFirebaseAdminMessagingConfig() {
  return Boolean(getFirebaseFirestoreAdmin() && getFirebaseMessagingAdmin());
}

export function sanitizeNotificationText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export function getNotificationPublicConfig() {
  return {
    firebaseConfig: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
    },
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY ?? "",
    settingsComplete: hasFirebaseClientMessagingConfig()
  };
}

function subscriptionId(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function saveNotificationSubscription({
  token,
  userAgent
}: {
  token: string;
  userAgent?: string;
}) {
  const db = getFirebaseFirestoreAdmin();
  if (!db) {
    return { ok: false, settingsComplete: false };
  }

  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { ok: false, settingsComplete: true };
  }

  await db
    .collection(COLLECTION)
    .doc(subscriptionId(normalizedToken))
    .set(
      {
        token: normalizedToken,
        active: true,
        userAgent: typeof userAgent === "string" ? userAgent.slice(0, 240) : "",
        createdAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

  return { ok: true, settingsComplete: true };
}

export async function getActiveNotificationSubscriptionCount() {
  const db = getFirebaseFirestoreAdmin();
  if (!db) {
    return { count: 0, settingsComplete: false };
  }

  const snapshot = await db.collection(COLLECTION).where("active", "==", true).count().get();
  return {
    count: snapshot.data().count,
    settingsComplete: hasFirebaseClientMessagingConfig() && Boolean(getFirebaseMessagingAdmin())
  };
}

function isInvalidTokenError(code?: string) {
  return code === "messaging/registration-token-not-registered" || code === "messaging/invalid-registration-token";
}

export async function sendNotificationToActiveSubscribers(title: string, body: string): Promise<NotificationSendResult> {
  const db = getFirebaseFirestoreAdmin();
  const messaging = getFirebaseMessagingAdmin();

  if (!db || !messaging) {
    return { total: 0, success: 0, failed: 0, settingsComplete: false };
  }

  const snapshot = await db.collection(COLLECTION).where("active", "==", true).get();
  const subscriptions = snapshot.docs
    .map((doc) => ({ ref: doc.ref, token: String(doc.data().token || "") }))
    .filter((item) => item.token);

  let success = 0;
  let failed = 0;

  for (let index = 0; index < subscriptions.length; index += MAX_MULTICAST_TOKENS) {
    const chunk = subscriptions.slice(index, index + MAX_MULTICAST_TOKENS);
    const response = await messaging.sendEachForMulticast({
      tokens: chunk.map((item) => item.token),
      notification: { title, body },
      webpush: {
        notification: {
          title,
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png"
        },
        fcmOptions: {
          link: process.env.NEXT_PUBLIC_SITE_URL || "https://wahaj0.vercel.app"
        }
      }
    });

    success += response.successCount;
    failed += response.failureCount;

    const batch = db.batch();
    let hasInvalidTokens = false;

    response.responses.forEach((item, responseIndex) => {
      if (!item.success && isInvalidTokenError(item.error?.code)) {
        hasInvalidTokens = true;
        batch.set(
          chunk[responseIndex].ref,
          {
            active: false,
            deactivatedAt: FieldValue.serverTimestamp(),
            deactivationReason: item.error?.code,
            updatedAt: FieldValue.serverTimestamp()
          },
          { merge: true }
        );
      }
    });

    if (hasInvalidTokens) {
      await batch.commit();
    }
  }

  return {
    total: subscriptions.length,
    success,
    failed,
    settingsComplete: true
  };
}
