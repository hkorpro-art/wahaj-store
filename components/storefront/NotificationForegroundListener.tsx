"use client";

import { useEffect } from "react";
import { firebaseApp } from "@/lib/firebase";

let foregroundListenerRegistered = false;
const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

function messageText(value: unknown) {
  return typeof value === "string" ? value : "";
}

function foregroundPayloadSummary(payload: {
  notification?: { title?: string; body?: string };
  data?: Record<string, string>;
  fcmOptions?: { link?: string };
}) {
  return {
    hasNotification: Boolean(payload.notification),
    dataKeys: Object.keys(payload.data || {}),
    titleSource: payload.notification?.title ? "notification" : payload.data?.title ? "data" : "fallback",
    bodySource: payload.notification?.body ? "notification" : payload.data?.body ? "data" : "empty",
    url: payload.fcmOptions?.link || payload.data?.url || "/"
  };
}

export default function NotificationForegroundListener() {
  useEffect(() => {
    async function registerForegroundListener() {
      if (
        foregroundListenerRegistered ||
        typeof window === "undefined" ||
        !("Notification" in window) ||
        !("serviceWorker" in navigator) ||
        !firebaseApp
      ) {
        return;
      }

      try {
        const { getMessaging, isSupported, onMessage } = await import("firebase/messaging");
        const supported = await isSupported();
        if (!supported) return;

        foregroundListenerRegistered = true;
        const messaging = getMessaging(firebaseApp);
        console.info(PUSH_DEBUG_PREFIX, "Foreground listener registered");

        onMessage(messaging, async (payload) => {
          console.info(PUSH_DEBUG_PREFIX, "Foreground onMessage received payload", foregroundPayloadSummary(payload));

          if (Notification.permission !== "granted") return;

          const title =
            messageText(payload.notification?.title) ||
            messageText(payload.data?.title) ||
            "وهاج | Wahaj";
          const body = messageText(payload.notification?.body) || messageText(payload.data?.body);
          const url = messageText(payload.fcmOptions?.link) || messageText(payload.data?.url) || "/";

          const tag = "wahaj-foreground-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
          const options: NotificationOptions & { renotify?: boolean } = {
            body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag,
            renotify: true,
            requireInteraction: false,
            data: { url }
          };

          try {
            const registration = await navigator.serviceWorker.ready;
            console.info(PUSH_DEBUG_PREFIX, "Foreground calling serviceWorkerRegistration.showNotification", {
              title,
              bodyLength: body.length,
              url
            });
            await registration.showNotification(title, options);
          } catch {
            console.info(PUSH_DEBUG_PREFIX, "Foreground calling Notification constructor", {
              title,
              bodyLength: body.length,
              url
            });
            new Notification(title, options);
          }
        });
      } catch (error) {
        foregroundListenerRegistered = false;
        console.error("Unable to register foreground notifications:", error);
      }
    }

    void registerForegroundListener();
  }, []);

  return null;
}
