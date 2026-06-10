import type { Coupon, Product, Story, Collection } from "./types";
import type { StoredImage } from "./imagekit";

export const adminStorageKeys = {
  products: "wahaj_admin_products",
  orders: "wahaj_admin_orders",
  coupons: "wahaj_admin_coupons",
  content: "wahaj_admin_content",
  stories: "wahaj_admin_stories",
  notifications: "wahaj_admin_notifications",
  vipPhones: "wahaj_admin_vip_phones",
  heroSlides: "wahaj_admin_hero_slides",
  heroSettings: "wahaj_admin_hero_settings",
  collections: "wahaj_admin_collections"
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

export type ManagedCollection = Collection;

/** @deprecated Use ManagedCollection instead */
export type ManagedCategory = ManagedCollection;

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

export type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  image: StoredImage;
  mobileImage?: StoredImage;
  focusX: number;
  focusY: number;
  autoContrast: boolean;
  ctaText: string;
  destinationType: "product" | "category" | "url";
  destinationValue: string;
  sortOrder: number;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
};

export type HeroAnimationSettings = {
  transitionSpeed: number;
  autoPlay: boolean;
  autoPlayInterval: number;
  floatingEffect: boolean;
  backgroundBlur: number;
  sideScale: number;
  showHero: boolean;
};

export const defaultHeroAnimationSettings: HeroAnimationSettings = {
  transitionSpeed: 700,
  autoPlay: true,
  autoPlayInterval: 5000,
  floatingEffect: true,
  backgroundBlur: 4,
  sideScale: 0.7,
  showHero: true
};

export function createEmptyHeroSlide(): HeroSlide {
  return {
    id: `hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    title: "",
    subtitle: "",
    image: { url: "", fileId: "" },
    mobileImage: undefined,
    focusX: 50,
    focusY: 40,
    autoContrast: true,
    ctaText: "اكتشفي",
    destinationType: "url",
    destinationValue: "/",
    sortOrder: 0,
    isActive: true,
    startDate: undefined,
    endDate: undefined,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}
