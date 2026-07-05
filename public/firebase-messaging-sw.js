importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.13.0/firebase-messaging-compat.js");

const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

function resolveNotificationUrl(event) {
  const data = event.notification && event.notification.data ? event.notification.data : {};
  if (data.url) return data.url;
  if (data.FCM_MSG && data.FCM_MSG.data && data.FCM_MSG.data.url) return data.FCM_MSG.data.url;
  if (data.FCM_MSG && data.FCM_MSG.fcmOptions && data.FCM_MSG.fcmOptions.link) return data.FCM_MSG.fcmOptions.link;
  return "/";
}

function uniqueTag() {
  return "wahaj-" + Date.now() + "-" + Math.random().toString(36).slice(2, 8);
}

self.addEventListener("install", () => {
  console.info(PUSH_DEBUG_PREFIX, "Service worker installed");
  self.skipWaiting();
});

self.addEventListener("activate", () => {
  console.info(PUSH_DEBUG_PREFIX, "Service worker activated");
  self.clients.claim();
});

self.addEventListener("push", (event) => {
  event.waitUntil(
    (async () => {
      try {
        if (!event.data) {
          console.warn(PUSH_DEBUG_PREFIX, "Push event with no data");
          return;
        }

        const payload = event.data.json();
        const data = payload && payload.data ? payload.data : {};

        console.info(PUSH_DEBUG_PREFIX, "Push handler received payload", {
          dataKeys: Object.keys(data),
          title: data.title || "(missing)",
          bodyLength: (data.body || "").length,
          url: data.url || "/",
          tag: data.tag || "none",
          campaignId: data.campaignId || "none"
        });

        const clients = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
        const hasVisibleClient = clients.some(
          (c) => c.visibilityState === "visible" && !c.url.startsWith("chrome-extension://")
        );

        if (hasVisibleClient) {
          console.info(PUSH_DEBUG_PREFIX, "Push handler: visible client found, skipping (Firebase will relay via onMessage)");
          return;
        }

        const title = data.title || "Wahaj";
        const body = data.body || "";
        const url = data.url || "/";
        const tag = data.tag || (data.campaignId ? "wahaj-" + data.campaignId : uniqueTag());

        console.info(PUSH_DEBUG_PREFIX, "Push handler showing notification", {
          title,
          bodyLength: body.length,
          url,
          tag
        });

        await self.registration.showNotification(title, {
          body,
          icon: "/icon-192.png",
          badge: "/icon-192.png",
          tag,
          renotify: true,
          requireInteraction: false,
          data: { url, campaignId: data.campaignId }
        });
      } catch (error) {
        console.error(PUSH_DEBUG_PREFIX, "Push handler error:", error);
      }
    })()
  );
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = resolveNotificationUrl(event);
  console.info(PUSH_DEBUG_PREFIX, "Notification click event fired", {
    tag: event.notification.tag,
    url: targetUrl
  });
  event.notification.close();

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
