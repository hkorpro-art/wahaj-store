importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

let messagingReady = null;

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
        const notification = payload.notification || {};
        const title = notification.title || "وهاج | Wahaj";
        const options = {
          body: notification.body || "",
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          data: {
            url: payload?.fcmOptions?.link || "/"
          }
        };

        self.registration.showNotification(title, options);
      });

      return messaging;
    })
    .catch(() => null);

  return messagingReady;
}

self.addEventListener("install", (event) => {
  event.waitUntil(initializeMessaging().then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(initializeMessaging().then(() => self.clients.claim()));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification?.data?.url || "/";

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
