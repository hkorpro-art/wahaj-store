"use client";

import { motion } from "framer-motion";
import { Bell, BellRing, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { firebaseApp } from "@/lib/firebase";

const STORAGE_KEY = "wahaj_notifications_status";
const TOKEN_RETRY_DELAY_MS = 750;

type OptInState = "checking" | "hidden" | "ready" | "loading" | "success" | "error";

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function getTokenWithRetry(
  getToken: (options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration }) => Promise<string>,
  options: { vapidKey: string; serviceWorkerRegistration: ServiceWorkerRegistration }
) {
  try {
    const token = await getToken(options);
    if (token) return token;
  } catch {
    // Retry once after the service worker has had a moment to settle.
  }

  await delay(TOKEN_RETRY_DELAY_MS);
  return getToken(options);
}

export default function NotificationOptIn() {
  const [state, setState] = useState<OptInState>("checking");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function checkAvailability() {
      if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
        setState("hidden");
        return;
      }

      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored === "subscribed" || stored === "denied" || Notification.permission === "denied") {
        setState("hidden");
        return;
      }

      try {
        const { isSupported } = await import("firebase/messaging");
        const supported = await isSupported();
        if (!supported || !firebaseApp) {
          setState("hidden");
          return;
        }

        const response = await fetch("/api/notifications/config", { cache: "no-store" });
        const config = await response.json().catch(() => null);
        setState(config?.settingsComplete ? "ready" : "hidden");
      } catch {
        setState("hidden");
      }
    }

    void checkAvailability();
  }, []);

  async function subscribe() {
    if (!firebaseApp || state === "loading") return;

    setState("loading");
    setMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        window.localStorage.setItem(STORAGE_KEY, "denied");
        setState("hidden");
        return;
      }

      const [messagingModule, configResponse] = await Promise.all([
        import("firebase/messaging"),
        fetch("/api/notifications/config", { cache: "no-store" })
      ]);
      const config = await configResponse.json();

      if (!config?.settingsComplete || !config?.vapidKey) {
        throw new Error("Notifications settings are incomplete.");
      }

      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const registration = await navigator.serviceWorker.ready;
      const messaging = messagingModule.getMessaging(firebaseApp);
      const token = await getTokenWithRetry(
        (options) => messagingModule.getToken(messaging, options),
        {
          vapidKey: config.vapidKey,
          serviceWorkerRegistration: registration
        }
      );

      if (!token) {
        throw new Error("Unable to create FCM token.");
      }

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          userAgent: navigator.userAgent
        })
      });

      if (!response.ok) {
        throw new Error("Unable to save notification subscription.");
      }

      window.localStorage.setItem(STORAGE_KEY, "subscribed");
      setState("success");
      setMessage("تم تفعيل إشعارات وهاج.");
      window.setTimeout(() => setState("hidden"), 2500);
    } catch (error) {
      console.error("Notification subscription failed:", error);
      setState("error");
      setMessage("تعذر تفعيل الإشعارات الآن.");
    }
  }

  if (state === "checking" || state === "hidden") {
    return null;
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-[8px] border border-wahaj-border/70 bg-white/75 p-4 shadow-[0_8px_30px_rgba(69,0,6,0.06)] backdrop-blur-xl"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-wahaj-soft text-wahaj-rose">
            <BellRing className="h-5 w-5" />
          </span>
          <div>
            <p className="font-thmanyah-display text-lg font-medium text-wahaj-ink">إشعارات وهاج</p>
            <p className="mt-1 text-sm leading-7 text-wahaj-text/70">
              فعّلي إشعارات وهاج لتصلكِ أحدث القطع والعروض الراقية.
            </p>
            {message ? <p className="mt-1 text-xs font-bold text-wahaj-rose">{message}</p> : null}
          </div>
        </div>

        <button
          type="button"
          onClick={subscribe}
          disabled={state === "loading" || state === "success"}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full bg-wahaj-ink px-5 text-sm font-bold text-white transition hover:bg-wahaj-rose disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
          {state === "success" ? "تم التفعيل" : "تفعيل الإشعارات"}
        </button>
      </div>
    </motion.section>
  );
}
