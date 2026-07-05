import "server-only";
import { createHash } from "node:crypto";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseFirestoreAdmin, getFirebaseMessagingAdmin } from "@/lib/firebase-admin";
import { SITE_URL } from "@/lib/site-config";

const COLLECTION = "notification_subscriptions";
const CAMPAIGNS_COLLECTION = "notification_campaigns";
const MAX_MULTICAST_TOKENS = 500;
const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

export type NotificationSendResult = {
  total: number;
  success: number;
  failed: number;
  settingsComplete: boolean;
  errorCodes: Record<string, number>;
  firebaseAccepted: boolean;
};

export type NotificationCampaign = {
  id: string;
  title: string;
  body: string;
  total: number;
  success: number;
  failed: number;
  errorCodes: Record<string, number>;
  firebaseAccepted: boolean;
  createdAt: string;
  sentBy?: string;
  target?: "all" | "latest";
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

function incrementErrorCode(errorCodes: Record<string, number>, code: string) {
  errorCodes[code] = (errorCodes[code] || 0) + 1;
}

async function sendNotificationToSubscriptions({
  title,
  body,
  latestOnly = false
}: {
  title: string;
  body: string;
  latestOnly?: boolean;
}): Promise<NotificationSendResult> {
  const db = getFirebaseFirestoreAdmin();
  const messaging = getFirebaseMessagingAdmin();

  if (!db || !messaging) {
    console.warn(PUSH_DEBUG_PREFIX, "Firebase Admin Messaging is not configured", {
      hasFirestore: Boolean(db),
      hasMessaging: Boolean(messaging)
    });
    return { total: 0, success: 0, failed: 0, settingsComplete: false, errorCodes: {}, firebaseAccepted: false };
  }

  const query = latestOnly
    ? db.collection(COLLECTION).where("active", "==", true).orderBy("updatedAt", "desc").limit(1)
    : db.collection(COLLECTION).where("active", "==", true);
  const snapshot = await query.get();
  const subscriptions = snapshot.docs
    .map((doc) => ({ ref: doc.ref, token: String(doc.data().token || "") }))
    .filter((item) => item.token);

  console.info(PUSH_DEBUG_PREFIX, "Loaded active notification subscriptions", {
    total: subscriptions.length,
    latestOnly
  });

  let success = 0;
  let failed = 0;
  const errorCodes: Record<string, number> = {};

  for (let index = 0; index < subscriptions.length; index += MAX_MULTICAST_TOKENS) {
    const chunk = subscriptions.slice(index, index + MAX_MULTICAST_TOKENS);
    const url = SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "https://wahaj0.vercel.app";
    const response = await messaging.sendEachForMulticast({
      tokens: chunk.map((item) => item.token),
      notification: { title, body },
      data: {
        title,
        body,
        url
      },
      webpush: {
        notification: {
          title,
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "wahaj-notification"
        },
        fcmOptions: {
          link: url
        }
      }
    });

    success += response.successCount;
    failed += response.failureCount;

    const batch = db.batch();
    let hasInvalidTokens = false;

    response.responses.forEach((item, responseIndex) => {
      if (!item.success) {
        incrementErrorCode(errorCodes, item.error?.code || "unknown");
      }

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

    console.info(PUSH_DEBUG_PREFIX, "FCM multicast send response", {
      chunkStart: index,
      chunkSize: chunk.length,
      total: subscriptions.length,
      success: response.successCount,
      failed: response.failureCount,
      errorCodes
    });

    if (hasInvalidTokens) {
      await batch.commit();
    }
  }

  return {
    total: subscriptions.length,
    success,
    failed,
    settingsComplete: true,
    errorCodes,
    firebaseAccepted: success > 0
  };
}

export function sendNotificationToActiveSubscribers(title: string, body: string) {
  return sendNotificationToSubscriptions({ title, body });
}

export function sendNotificationToLatestActiveSubscriber(title: string, body: string) {
  return sendNotificationToSubscriptions({ title, body, latestOnly: true });
}

export async function saveNotificationCampaign({
  title,
  body,
  result,
  sentBy,
  target = "all"
}: {
  title: string;
  body: string;
  result: NotificationSendResult;
  sentBy?: string;
  target?: "all" | "latest";
}) {
  const db = getFirebaseFirestoreAdmin();
  if (!db) {
    return { ok: false, settingsComplete: false };
  }

  const payload = {
    title,
    body,
    total: result.total,
    success: result.success,
    failed: result.failed,
    errorCodes: result.errorCodes,
    firebaseAccepted: result.firebaseAccepted,
    settingsComplete: result.settingsComplete,
    target,
    ...(sentBy ? { sentBy } : {}),
    createdAt: FieldValue.serverTimestamp()
  };

  const doc = await db.collection(CAMPAIGNS_COLLECTION).add(payload);
  return { ok: true, settingsComplete: true, id: doc.id };
}

function serializeDate(value: unknown) {
  if (value && typeof value === "object" && "toDate" in value && typeof value.toDate === "function") {
    return value.toDate().toISOString();
  }
  return typeof value === "string" ? value : new Date().toISOString();
}

export async function getNotificationCampaignHistory(limit = 50) {
  const db = getFirebaseFirestoreAdmin();
  if (!db) {
    return { campaigns: [] as NotificationCampaign[], settingsComplete: false };
  }

  const snapshot = await db
    .collection(CAMPAIGNS_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(Math.max(1, Math.min(limit, 100)))
    .get();

  const campaigns = snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: String(data.title || ""),
      body: String(data.body || ""),
      total: Number(data.total || 0),
      success: Number(data.success || 0),
      failed: Number(data.failed || 0),
      errorCodes: typeof data.errorCodes === "object" && data.errorCodes ? (data.errorCodes as Record<string, number>) : {},
      firebaseAccepted: Boolean(data.firebaseAccepted),
      createdAt: serializeDate(data.createdAt),
      ...(typeof data.sentBy === "string" ? { sentBy: data.sentBy } : {}),
      target: data.target === "latest" ? "latest" : "all"
    } satisfies NotificationCampaign;
  });

  return { campaigns, settingsComplete: true };
}
