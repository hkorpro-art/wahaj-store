export const STORE_ANALYTICS_EVENT_NAMES = [
  "session_started",
  "product_impression",
  "product_viewed",
  "cart_item_added",
  "cart_item_removed",
  "cart_viewed",
  "checkout_started",
  "whatsapp_product_clicked",
  "whatsapp_cart_clicked",
  "whatsapp_support_clicked"
] as const;

export type StoreAnalyticsEventName = (typeof STORE_ANALYTICS_EVENT_NAMES)[number];
export type AnalyticsSourceChannel = "direct" | "search" | "social" | "referral" | "campaign" | "unknown";
export type AnalyticsDeviceType = "mobile" | "tablet" | "desktop" | "unknown";

export type StoreAnalyticsItem = {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
};

export type StoreAnalyticsEvent = {
  version: 1;
  eventId: string;
  name: StoreAnalyticsEventName;
  sessionId: string;
  cartId?: string;
  productId?: string;
  productName?: string;
  sourceChannel: AnalyticsSourceChannel;
  referrerDomain?: string;
  landingPath: string;
  pagePath: string;
  entryPoint?: string;
  deviceType: AnalyticsDeviceType;
  quantity?: number;
  unitPrice?: number;
  cartValue?: number;
  itemCount?: number;
  items?: StoreAnalyticsItem[];
  metadata?: Record<string, string | number | boolean | null>;
};

export type StoreAnalyticsDashboard = {
  asOf: string;
  range: { from: string; to: string };
  overview: {
    sessions: number;
    productViews: number;
    cartAdditions: number;
    whatsappIntent: number;
  };
  funnel: {
    sessions: number;
    productViewedSessions: number;
    cartStartedSessions: number;
    whatsappProductSessions: number;
    whatsappCartSessions: number;
  };
  products: Array<{
    productId: string;
    productName: string;
    impressions: number;
    views: number;
    cartAdditions: number;
    cartRemovals: number;
    whatsappProductIntents: number;
    whatsappCartIntents: number;
  }>;
  cart: {
    cartsStarted: number;
    cartViews: number;
    checkoutStarts: number;
    whatsappHandoffs: number;
    cartToWhatsappRate: number;
    abandonedCarts: number;
    removals: number;
    averageHandoffValue: number;
    averageHandoffItems: number;
  };
  sources: Array<{
    source: AnalyticsSourceChannel;
    sessions: number;
    productViews: number;
    cartAdditions: number;
    whatsappIntents: number;
  }>;
};

export function emptyStoreAnalyticsDashboard(from = "", to = ""): StoreAnalyticsDashboard {
  return {
    asOf: new Date(0).toISOString(),
    range: { from, to },
    overview: { sessions: 0, productViews: 0, cartAdditions: 0, whatsappIntent: 0 },
    funnel: {
      sessions: 0,
      productViewedSessions: 0,
      cartStartedSessions: 0,
      whatsappProductSessions: 0,
      whatsappCartSessions: 0
    },
    products: [],
    cart: {
      cartsStarted: 0,
      cartViews: 0,
      checkoutStarts: 0,
      whatsappHandoffs: 0,
      cartToWhatsappRate: 0,
      abandonedCarts: 0,
      removals: 0,
      averageHandoffValue: 0,
      averageHandoffItems: 0
    },
    sources: []
  };
}
