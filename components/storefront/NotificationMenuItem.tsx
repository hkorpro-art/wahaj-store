"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, Loader2 } from "lucide-react";
import { useState } from "react";
import { firebaseApp } from "@/lib/firebase";

const STORAGE_KEY = "wahaj_notifications_status";
const TOKEN_RETRY_DELAY_MS = 750;

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
  } catch {}
  await delay(TOKEN_RETRY_DELAY_MS);
  return getToken(options);
}

export default function NotificationMenuItem() {
  const [state] = useState<"default" | "granted" | "denied">(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      if (Notification.permission === "granted") return "granted";
      if (Notification.permission === "denied") return "denied";
    }
    return "default";
  });

  const [expanded, setExpanded] = useState(false);
  const [action, setAction] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [actionMessage, setActionMessage] = useState("");

  async function subscribe() {
    if (!firebaseApp || action === "loading") return;
    setAction("loading");
    setActionMessage("");

    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        window.localStorage.setItem(STORAGE_KEY, "denied");
        setAction("idle");
        setActionMessage("");
        return;
      }

      const [messagingModule, configResponse] = await Promise.all([
        import("firebase/messaging"),
        fetch("/api/notifications/config", { cache: "no-store" })
      ]);
      const config = await configResponse.json();

      if (!config?.settingsComplete || !config?.vapidKey) {
        throw new Error("Settings incomplete");
      }

      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const registration = await navigator.serviceWorker.ready;
      const messaging = messagingModule.getMessaging(firebaseApp);
      const token = await getTokenWithRetry(
        (opts) => messagingModule.getToken(messaging, opts),
        { vapidKey: config.vapidKey, serviceWorkerRegistration: registration }
      );

      if (!token) throw new Error("No token");

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userAgent: navigator.userAgent })
      });

      if (!response.ok) throw new Error("Subscribe failed");

      window.localStorage.setItem(STORAGE_KEY, "subscribed");
      setAction("success");
      setActionMessage("تم تفعيل إشعارات وهاج.");
    } catch (error) {
      console.error("Notification subscription failed:", error);
      setAction("error");
      setActionMessage("تعذر تفعيل الإشعارات.");
    }
  }

  async function recheck() {
    if (!firebaseApp) return;
    setAction("loading");
    setActionMessage("");

    try {
      if (Notification.permission !== "granted") {
        setAction("error");
        setActionMessage("صلاحية الإشعارات غير ممنوحة في المتصفح.");
        return;
      }

      const [messagingModule, configResponse] = await Promise.all([
        import("firebase/messaging"),
        fetch("/api/notifications/config", { cache: "no-store" })
      ]);
      const config = await configResponse.json();

      if (!config?.settingsComplete || !config?.vapidKey) {
        throw new Error("Settings incomplete");
      }

      await navigator.serviceWorker.register("/firebase-messaging-sw.js");
      const registration = await navigator.serviceWorker.ready;
      const messaging = messagingModule.getMessaging(firebaseApp);
      const token = await getTokenWithRetry(
        (opts) => messagingModule.getToken(messaging, opts),
        { vapidKey: config.vapidKey, serviceWorkerRegistration: registration }
      );

      if (!token) throw new Error("No token");

      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, userAgent: navigator.userAgent })
      });

      if (!response.ok) throw new Error("Subscribe failed");

      window.localStorage.setItem(STORAGE_KEY, "subscribed");
      setAction("success");
      setActionMessage("تم التحقق. الإشعارات نشطة.");
    } catch (error) {
      console.error("Re-check failed:", error);
      setAction("error");
      setActionMessage("تعذر التحقق. قد تحتاجين لإعادة تفعيل الإشعارات من إعدادات المتصفح.");
    }
  }

  function handleClick() {
    if (state === "default") {
      void subscribe();
    } else {
      setExpanded((prev) => !prev);
    }
  }

  const stored = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;

  return (
    <>
      <button
        onClick={handleClick}
        className="flex w-full items-center justify-between rounded-[8px] border border-wahaj-border bg-white/70 px-4 py-3 font-bold btn-luxury transition-all"
      >
        <span className="flex items-center gap-2">
          {state === "default" && <span>🔔 تفعيل الإشعارات</span>}
          {state === "granted" && <span>✅ الإشعارات مفعلة</span>}
          {state === "denied" && <span>🚫 الإشعارات محظورة</span>}
        </span>
        {(state === "granted" || state === "denied") && (
          <ChevronLeft
            className={`h-4 w-4 text-wahaj-rose transition-transform duration-200 ${
              expanded ? "rotate-90" : ""
            }`}
          />
        )}
      </button>

      <AnimatePresence>
        {expanded && state === "granted" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-[8px] border border-wahaj-border bg-white/50"
          >
            <div className="space-y-2 p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-wahaj-text/60">الحالة</span>
                <span className="font-bold text-green-600">✅ مفعلة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wahaj-text/60">صلاحية المتصفح</span>
                <span className="font-bold text-green-600">✅ ممنوحة</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-wahaj-text/60">الاشتراك</span>
                <span className="font-bold text-wahaj-ink">
                  {stored === "subscribed" ? "نشط" : "غير مؤكد"}
                </span>
              </div>

              {actionMessage ? (
                <p className="text-xs font-bold text-wahaj-rose">{actionMessage}</p>
              ) : null}

              <button
                onClick={recheck}
                disabled={action === "loading"}
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-full bg-wahaj-ink px-4 py-2 text-xs font-bold text-white transition hover:bg-wahaj-rose disabled:opacity-60"
              >
                {action === "loading" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : null}
                {action === "loading" ? "جاري التحقق..." : "إعادة التحقق من الاشتراك"}
              </button>
            </div>
          </motion.div>
        )}

        {expanded && state === "denied" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden rounded-[8px] border border-wahaj-border bg-white/50"
          >
            <div className="space-y-2 p-3 text-sm leading-6 text-wahaj-text/80">
              تم حظر الإشعارات في المتصفح. لتتمكني من تفعيل إشعارات وهاج، يُرجى تغيير
              إعدادات الموقع في متصفحك والسماح بالإشعارات.
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
