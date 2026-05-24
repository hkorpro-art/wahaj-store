import type { Coupon, Product, Story } from "./types";

export const adminStorageKeys = {
  products: "wahaj_admin_products",
  orders: "wahaj_admin_orders",
  coupons: "wahaj_admin_coupons",
  content: "wahaj_admin_content",
  stories: "wahaj_admin_stories",
  notifications: "wahaj_admin_notifications",
  vipPhones: "wahaj_admin_vip_phones"
} as const;

export type SiteContent = {
  heroBadge: string;
  heroTitle: string;
  heroDescription: string;
  primaryCta: string;
  secondaryCta: string;
  offerMessages: string[];
};

export type ManagedProduct = Product & {
  visible?: boolean;
  discountEndsAt?: string;
};

export type StoryTarget = "new" | "offers" | "trend" | "sets" | "clients" | "all";

export type ManagedStory = Story & {
  visible?: boolean;
  target?: StoryTarget;
};

export type ManagedCoupon = Coupon & {
  used?: number;
  active?: boolean;
  createdAt?: string;
};

export type ManagedNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  audience: string;
  status: "draft" | "sent";
  createdAt: string;
};

export const defaultSiteContent: SiteContent = {
  heroBadge: "زركون فاخر بتفاصيل Rose Gold",
  heroTitle: "تألقي بكل تفاصيلك",
  heroDescription:
    "لأنك تستحقين التألق، اختاري لمسات تصنع الفرق بلمعة ناعمة وتجربة طلب سريعة عبر واتساب.",
  primaryCta: "تسوقي الآن",
  secondaryCta: "اكتشفي المجموعة",
  offerMessages: [
    "خصم 10% على القطع الجديدة",
    "كوبون WAHAJ10",
    "وصل حديثًا: أطقم زركون ناعمة",
    "تغليف هدية فاخر لكل طلب"
  ]
};
