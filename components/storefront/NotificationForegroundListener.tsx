"use client";

import { useEffect } from "react";
import { firebaseApp } from "@/lib/firebase";

let foregroundListenerRegistered = false;

function messageText(value: unknown) {
  return typeof value === "string" ? value : "";
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

        onMessage(messaging, async (payload) => {
          if (Notification.permission !== "granted") return;

          const title =
            messageText(payload.notification?.title) ||
            messageText(payload.data?.title) ||
            "وهاج | Wahaj";
          const body = messageText(payload.notification?.body) || messageText(payload.data?.body);
          const url = messageText(payload.fcmOptions?.link) || messageText(payload.data?.url) || "/";

          const options: NotificationOptions = {
            body,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            tag: "wahaj-notification",
            requireInteraction: false,
            data: { url }
          };

          try {
            const registration = await navigator.serviceWorker.ready;
            await registration.showNotification(title, options);
          } catch {
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
