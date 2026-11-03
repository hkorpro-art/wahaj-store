"use client";

import type {
  AnalyticsDeviceType,
  AnalyticsSourceChannel,
  StoreAnalyticsEvent,
  StoreAnalyticsEventName,
  StoreAnalyticsItem
} from "@/lib/analytics";

const SESSION_KEY = "wahaj_analytics_session_v1";
const CART_KEY = "wahaj_analytics_cart_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;
const TRANSIENT_EVENT_DEDUPE_MS = 3_000;

type StoredSession = {
  id: string;
  startedAt: number;
  lastActivityAt: number;
  sourceChannel: AnalyticsSourceChannel;
  referrerDomain: string;
  landingPath: string;
};

type TrackEventInput = {
  productId?: string;
  productName?: string;
  entryPoint?: string;
  quantity?: number;
  unitPrice?: number;
  cartValue?: number;
  itemCount?: number;
  items?: StoreAnalyticsItem[];
  metadata?: Record<string, string | number | boolean | null>;
};

function randomId(prefix: string) {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `${prefix}_${value}`;
}

function safeParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

function classifySource(): { sourceChannel: AnalyticsSourceChannel; referrerDomain: string } {
  const params = new URLSearchParams(window.location.search);
  if (params.has("utm_source") || params.has("utm_campaign")) {
    return { sourceChannel: "campaign", referrerDomain: "" };
  }

  if (!document.referrer) return { sourceChannel: "direct", referrerDomain: "" };

  try {
    const referrer = new URL(document.referrer);
    if (referrer.hostname === window.location.hostname) {
      return { sourceChannel: "direct", referrerDomain: "" };
    }
    const hostname = referrer.hostname.replace(/^www\./, "");
    if (/google\.|bing\.|yahoo\.|duckduckgo\./i.test(hostname)) {
      return { sourceChannel: "search", referrerDomain: hostname };
    }
    if (/instagram\.|facebook\.|tiktok\.|snapchat\.|x\.com$|twitter\./i.test(hostname)) {
      return { sourceChannel: "social", referrerDomain: hostname };
    }
    return { sourceChannel: "referral", referrerDomain: hostname };
  } catch {
    return { sourceChannel: "unknown", referrerDomain: "" };
  }
}

function deviceType(): AnalyticsDeviceType {
  const width = window.innerWidth;
  if (width <= 767) return "mobile";
  if (width <= 1024) return "tablet";
  return "desktop";
}

function getSession() {
  const now = Date.now();
  const stored = safeParse<StoredSession>(localStorage.getItem(SESSION_KEY));
  if (stored && now - stored.lastActivityAt <= SESSION_TIMEOUT_MS) {
    const refreshed = { ...stored, lastActivityAt: now };
    localStorage.setItem(SESSION_KEY, JSON.stringify(refreshed));
    return { session: refreshed, isNew: false };
  }

  const source = classifySource();
  const session: StoredSession = {
    id: randomId("ses"),
    startedAt: now,
    lastActivityAt: now,
    sourceChannel: source.sourceChannel,
    referrerDomain: source.referrerDomain,
    landingPath: `${window.location.pathname}${window.location.search}`.slice(0, 1000)
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return { session, isNew: true };
}

export function getAnalyticsCartId() {
  const stored = localStorage.getItem(CART_KEY);
  if (stored) return stored;
  const id = randomId("cart");
  localStorage.setItem(CART_KEY, id);
  return id;
}

export function resetAnalyticsCartId() {
  localStorage.removeItem(CART_KEY);
}

function send(event: StoreAnalyticsEvent) {
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
    keepalive: true
  }).catch(() => undefined);
}

function transientEventKey(
  name: StoreAnalyticsEventName,
  sessionId: string,
  pagePath: string,
  productId?: string,
  cartId?: string
) {
  if (name === "session_started") return `${name}:${sessionId}`;
  if (name === "product_impression" || name === "product_viewed") {
    return `${name}:${sessionId}:${pagePath}:${productId ?? ""}`;
  }
  if (name === "cart_viewed") return `${name}:${sessionId}:${cartId ?? ""}`;
  return "";
}

function wasRecentlyTracked(key: string) {
  if (!key) return false;
  const storageKey = `wahaj_analytics_recent:${key}`;
  const now = Date.now();
  const previous = Number(sessionStorage.getItem(storageKey) ?? 0);
  if (previous > 0 && now - previous < TRANSIENT_EVENT_DEDUPE_MS) return true;
  sessionStorage.setItem(storageKey, String(now));
  return false;
}

export function trackStoreEvent(name: StoreAnalyticsEventName, input: TrackEventInput = {}) {
  if (typeof window === "undefined") return;

  try {
    const { session, isNew } = getSession();
    const common = {
      version: 1 as const,
      sessionId: session.id,
      sourceChannel: session.sourceChannel,
      referrerDomain: session.referrerDomain,
      landingPath: session.landingPath,
      pagePath: `${window.location.pathname}${window.location.search}`.slice(0, 1000),
      deviceType: deviceType()
    };

    if (isNew && name !== "session_started") {
      wasRecentlyTracked(transientEventKey("session_started", session.id, common.pagePath));
      send({ ...common, eventId: randomId("evt"), name: "session_started" });
    }

    const usesCart = name.startsWith("cart_") || name === "checkout_started" || name === "whatsapp_cart_clicked";
    const cartId = usesCart ? getAnalyticsCartId() : undefined;
    if (wasRecentlyTracked(transientEventKey(name, session.id, common.pagePath, input.productId, cartId))) return;

    send({
      ...common,
      ...input,
      eventId: randomId("evt"),
      name,
      ...(cartId ? { cartId } : {})
    });
  } catch {
    // Analytics must never interrupt shopping when storage or networking is unavailable.
  }
}
