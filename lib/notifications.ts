import "server-only";
import { createHash, randomUUID } from "node:crypto";
import { getFirebaseMessagingAdmin } from "@/lib/firebase-admin";
import { SITE_URL } from "@/lib/site-config";
import { supabaseNotificationRepository } from "@/lib/supabase/repositories";

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
  return supabaseNotificationRepository.isConfigured() && Boolean(getFirebaseMessagingAdmin());
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
  if (!supabaseNotificationRepository.isConfigured()) {
    return { ok: false, settingsComplete: false };
  }

  const normalizedToken = token.trim();
  if (!normalizedToken) {
    return { ok: false, settingsComplete: true };
  }

  const now = new Date().toISOString();
  await supabaseNotificationRepository.upsertSubscription({
    id: subscriptionId(normalizedToken),
    token: normalizedToken,
    active: true,
    user_agent: typeof userAgent === "string" ? userAgent.slice(0, 240) : "",
    created_at: now,
    updated_at: now
  });

  return { ok: true, settingsComplete: true };
}

export async function getActiveNotificationSubscriptionCount() {
  if (!supabaseNotificationRepository.isConfigured()) {
    return { count: 0, settingsComplete: false };
  }

  return {
    count: await supabaseNotificationRepository.countActiveSubscriptions(),
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
  campaignId,
  latestOnly = false
}: {
  title: string;
  body: string;
  campaignId?: string;
  latestOnly?: boolean;
}): Promise<NotificationSendResult> {
  const messaging = getFirebaseMessagingAdmin();

  if (!supabaseNotificationRepository.isConfigured() || !messaging) {
    console.warn(PUSH_DEBUG_PREFIX, "Firebase Admin Messaging is not configured", {
      hasDataStore: supabaseNotificationRepository.isConfigured(),
      hasMessaging: Boolean(messaging)
    });
    return { total: 0, success: 0, failed: 0, settingsComplete: false, errorCodes: {}, firebaseAccepted: false };
  }

  const subscriptions = (await supabaseNotificationRepository.getActiveSubscriptions(latestOnly))
    .map((row) => ({ id: row.id, token: row.token }))
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
    const tag = campaignId ? `wahaj-${campaignId}` : `wahaj-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const response = await messaging.sendEachForMulticast({
      tokens: chunk.map((item) => item.token),
      data: {
        title,
        body,
        url,
        tag,
        ...(campaignId ? { campaignId } : {})
      },
      webpush: {
        fcmOptions: {
          link: url
        },
        headers: {
          Urgency: "high",
          "TTL": "86400"
        }
      }
    });

    success += response.successCount;
    failed += response.failureCount;

    const invalidTokenIdsByReason = new Map<string, string[]>();

    response.responses.forEach((item, responseIndex) => {
      if (!item.success) {
        incrementErrorCode(errorCodes, item.error?.code || "unknown");
      }

      if (!item.success && isInvalidTokenError(item.error?.code)) {
        const reason = item.error?.code || "unknown";
        invalidTokenIdsByReason.set(reason, [...(invalidTokenIdsByReason.get(reason) ?? []), chunk[responseIndex].id]);
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

    for (const [reason, ids] of invalidTokenIdsByReason) {
      await supabaseNotificationRepository.deactivateSubscriptions(ids, reason);
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

export function sendNotificationToActiveSubscribers(title: string, body: string, campaignId?: string) {
  return sendNotificationToSubscriptions({ title, body, campaignId });
}

export function sendNotificationToLatestActiveSubscriber(title: string, body: string, campaignId?: string) {
  return sendNotificationToSubscriptions({ title, body, campaignId, latestOnly: true });
}

export async function saveNotificationCampaign({
  title,
  body,
  result,
  sentBy,
  campaignId,
  target = "all"
}: {
  title: string;
  body: string;
  result: NotificationSendResult;
  sentBy?: string;
  campaignId?: string;
  target?: "all" | "latest";
}) {
  if (!supabaseNotificationRepository.isConfigured()) {
    return { ok: false, settingsComplete: false };
  }

  const id = campaignId ?? randomUUID();
  await supabaseNotificationRepository.saveCampaign({
    id,
    campaign_id: campaignId ?? null,
    title,
    body,
    total: result.total,
    success: result.success,
    failed: result.failed,
    error_codes: result.errorCodes,
    firebase_accepted: result.firebaseAccepted,
    settings_complete: result.settingsComplete,
    target,
    sent_by: sentBy ?? null,
    created_at: new Date().toISOString()
  });
  return { ok: true, settingsComplete: true, id };
}

export async function getNotificationCampaignHistory(limit = 50) {
  if (!supabaseNotificationRepository.isConfigured()) {
    return { campaigns: [] as NotificationCampaign[], settingsComplete: false };
  }

  return {
    campaigns: await supabaseNotificationRepository.getCampaignHistory(limit),
    settingsComplete: true
  };
}

export async function resetAllNotificationSubscriptions() {
  if (!supabaseNotificationRepository.isConfigured()) {
    return { ok: false, settingsComplete: false, disabled: 0 };
  }

  const result = await supabaseNotificationRepository.resetAllSubscriptions();

  console.info(PUSH_DEBUG_PREFIX, "Reset notification subscriptions", {
    disabled: result.disabled
  });

  return { ok: true, settingsComplete: true, disabled: result.disabled };
}
