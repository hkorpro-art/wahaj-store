importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

let messagingReady = null;
const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

function payloadSummary(payload) {
  const notification = payload && payload.notification ? payload.notification : {};
  const data = payload && payload.data ? payload.data : {};
  const fcmOptions = payload && payload.fcmOptions ? payload.fcmOptions : {};

  return {
    hasNotification: Boolean(payload && payload.notification),
    dataKeys: Object.keys(data),
    titleSource: notification.title ? "notification" : data.title ? "data" : "fallback",
    bodySource: notification.body ? "notification" : data.body ? "data" : "empty",
    url: fcmOptions.link || data.url || "/"
  };
}

function initializeMessaging() {
  if (messagingReady) {
    return messagingReady;
  }

  messagingReady = fetch("/api/notifications/config", { cache: "no-store" })
    .then((response) => response.json())
    .then((config) => {
      if (!config || !config.settingsComplete || !config.firebaseConfig) {
        return null;
      }

      if (!firebase.apps.length) {
        firebase.initializeApp(config.firebaseConfig);
      }

      const messaging = firebase.messaging();

      messaging.onBackgroundMessage((payload) => {
        console.info(PUSH_DEBUG_PREFIX, "Service worker received background payload", payloadSummary(payload));

        const notification = payload.notification || {};
        const data = payload.data || {};
        const fcmOptions = payload.fcmOptions || {};
        const title = notification.title || data.title || "Wahaj";
        const body = notification.body || data.body || "";
        const url = fcmOptions.link || data.url || "/";

        console.info(PUSH_DEBUG_PREFIX, "Service worker calling showNotification", {
          title,
          bodyLength: body.length,
          url
        });

        self.registration.showNotification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag: "wahaj-notification",
          requireInteraction: false,
          data: { url }
        });
      });

      return messaging;
    })
    .catch(() => null);

  return messagingReady;
}

self.addEventListener("install", (event) => {
  console.info(PUSH_DEBUG_PREFIX, "Service worker installed");
  event.waitUntil(initializeMessaging().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  console.info(PUSH_DEBUG_PREFIX, "Service worker activated");
  event.waitUntil(initializeMessaging().then(() => self.clients.claim()));
});

self.addEventListener("notificationclick", (event) => {
  console.info(PUSH_DEBUG_PREFIX, "Notification click event fired", {
    tag: event.notification.tag,
    url: event.notification.data && event.notification.data.url ? event.notification.data.url : "/"
  });
  event.notification.close();
  const targetUrl = event.notification.data && event.notification.data.url ? event.notification.data.url : "/";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clients) => {
      for (const client of clients) {
        if ("focus" in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }

      return undefined;
    })
  );
});

initializeMessaging();
