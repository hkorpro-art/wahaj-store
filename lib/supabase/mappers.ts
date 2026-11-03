import type {
  HeroAnimationSettings,
  HeroSlide,
  ManagedCollection,
  ManagedProduct,
  SiteContent
} from "@/lib/admin-local";
import { collectionToRow, rowToManagedCollection } from "@/lib/collection-record";
import type { MenuIconsRecord } from "@/lib/imagekit";
import { parseStoredImage } from "@/lib/imagekit";
import { productToRow, rowToManagedProduct } from "@/lib/product-record";
import { repairDeepText } from "@/lib/text-repair";
import type { Coupon, Order } from "@/lib/types";
import type { NotificationCampaign } from "@/lib/notifications";
import type { Json, Tables, TablesInsert, TablesUpdate } from "./database.types";

type ProductRow = Tables<"production_products">;
type CollectionRow = Tables<"collections">;
type CategoryRow = Tables<"categories">;
type HeroSlideRow = Tables<"hero_slides">;

function json(value: unknown): Json {
  return JSON.parse(JSON.stringify(value)) as Json;
}

function iso(value: string | null | undefined) {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.valueOf()) ? value : parsed.toISOString();
}

function dateOnly(value: string | null | undefined) {
  return value ? value.slice(0, 10) : undefined;
}

export function productFromSupabase(row: ProductRow): ManagedProduct {
  const product = rowToManagedProduct(row as unknown as Record<string, unknown>);
  if (!product) throw new Error(`Supabase returned an invalid product row: ${row.id}`);
  return {
    ...product,
    discountEndsAt: dateOnly(row.discount_ends_at),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export function productToSupabase(
  product: ManagedProduct,
  sortOrder = 0
): TablesInsert<"production_products"> {
  const row = productToRow(product);
  return {
    ...row,
    images: json(row.images),
    trust_messages: json(row.trust_messages),
    videos: json(row.videos),
    sort_order: sortOrder,
  };
}

export function productUpdateToSupabase(product: ManagedProduct): TablesUpdate<"production_products"> {
  const { id: _id, created_at: _createdAt, sort_order: _sortOrder, ...update } = productToSupabase(product);
  return update;
}

export function collectionFromSupabase(row: CollectionRow | CategoryRow): ManagedCollection {
  const collection = rowToManagedCollection(row as unknown as Record<string, unknown>);
  if (!collection) throw new Error(`Supabase returned an invalid collection row: ${row.id}`);
  return { ...collection, createdAt: iso(row.created_at), updatedAt: iso(row.updated_at) };
}

export function collectionToSupabase(
  collection: ManagedCollection,
  sortOrder = collection.sortOrder
): TablesInsert<"collections"> {
  const row = collectionToRow(collection);
  return {
    ...row,
    image: json(row.image),
    sort_order: sortOrder,
  };
}

export function categoryToSupabase(
  category: ManagedCollection,
  sortOrder = category.sortOrder
): TablesInsert<"categories"> {
  return collectionToSupabase(category, sortOrder);
}

export function heroSlideFromSupabase(row: HeroSlideRow): HeroSlide {
  const image = parseStoredImage(row.image);
  if (!image) throw new Error(`Supabase returned an invalid hero image: ${row.id}`);
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    image,
    mobileImage: parseStoredImage(row.mobile_image) ?? undefined,
    focusX: row.focus_x,
    focusY: row.focus_y,
    autoContrast: row.auto_contrast,
    ctaText: row.cta_text,
    destinationType: row.destination_type as HeroSlide["destinationType"],
    destinationValue: row.destination_value,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    startDate: dateOnly(row.start_date),
    endDate: dateOnly(row.end_date),
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export function heroSlideToSupabase(slide: HeroSlide): TablesInsert<"hero_slides"> {
  return {
    id: slide.id,
    title: slide.title,
    subtitle: slide.subtitle,
    image: json(slide.image),
    mobile_image: slide.mobileImage ? json(slide.mobileImage) : null,
    focus_x: slide.focusX,
    focus_y: slide.focusY,
    auto_contrast: slide.autoContrast,
    cta_text: slide.ctaText,
    destination_type: slide.destinationType,
    destination_value: slide.destinationValue,
    sort_order: slide.sortOrder,
    is_active: slide.isActive,
    start_date: slide.startDate ?? null,
    end_date: slide.endDate ?? null,
    created_at: slide.createdAt,
    updated_at: slide.updatedAt
  };
}

export function siteContentFromSupabase(row: Tables<"site_content">): SiteContent {
  return repairDeepText({
    heroBadge: row.hero_badge,
    heroTitle: row.hero_title,
    heroDescription: row.hero_description,
    primaryCta: row.primary_cta,
    secondaryCta: row.secondary_cta,
    offerMessages: row.offer_messages,
    showActiveCoupons: row.show_active_coupons,
    accordionDetails: row.accordion_details,
    accordionCare: row.accordion_care,
    accordionShipping: row.accordion_shipping,
    accordionReturns: row.accordion_returns
  });
}

export function siteContentToSupabase(content: SiteContent): TablesInsert<"site_content"> {
  const repaired = repairDeepText(content);
  return {
    id: "site_content",
    hero_badge: repaired.heroBadge,
    hero_title: repaired.heroTitle,
    hero_description: repaired.heroDescription,
    primary_cta: repaired.primaryCta,
    secondary_cta: repaired.secondaryCta,
    offer_messages: repaired.offerMessages,
    show_active_coupons: repaired.showActiveCoupons,
    accordion_details: repaired.accordionDetails,
    accordion_care: repaired.accordionCare,
    accordion_shipping: repaired.accordionShipping,
    accordion_returns: repaired.accordionReturns
  };
}

export function heroSettingsFromSupabase(row: Tables<"hero_settings">): HeroAnimationSettings {
  return {
    transitionSpeed: row.transition_speed,
    autoPlay: row.auto_play,
    autoPlayInterval: row.auto_play_interval,
    floatingEffect: row.floating_effect,
    backgroundBlur: row.background_blur,
    sideScale: row.side_scale,
    showHero: row.show_hero
  };
}

export function heroSettingsToSupabase(settings: HeroAnimationSettings): TablesInsert<"hero_settings"> {
  return {
    id: "hero_settings",
    transition_speed: settings.transitionSpeed,
    auto_play: settings.autoPlay,
    auto_play_interval: settings.autoPlayInterval,
    floating_effect: settings.floatingEffect,
    background_blur: settings.backgroundBlur,
    side_scale: settings.sideScale,
    show_hero: settings.showHero
  };
}

export function menuIconsFromSupabase(row: Tables<"menu_icons">): MenuIconsRecord {
  const icons: MenuIconsRecord = {};
  const candidates = {
    new: row.new_icon,
    offers: row.offers_icon,
    trend: row.trend_icon,
    sets: row.sets_icon
  } as const;
  for (const [key, value] of Object.entries(candidates)) {
    const parsed = parseStoredImage(value);
    if (parsed) icons[key as keyof MenuIconsRecord] = parsed;
  }
  return icons;
}

export function menuIconsToSupabase(icons: MenuIconsRecord): TablesInsert<"menu_icons"> {
  return {
    id: "menu_icons",
    new_icon: icons.new ? json(icons.new) : null,
    offers_icon: icons.offers ? json(icons.offers) : null,
    trend_icon: icons.trend ? json(icons.trend) : null,
    sets_icon: icons.sets ? json(icons.sets) : null
  };
}

export function couponFromSupabase(row: Tables<"coupons">): Coupon {
  return {
    id: row.id,
    code: row.code,
    type: row.type as Coupon["type"],
    value: row.value,
    minOrder: row.min_order,
    expiresAt: dateOnly(row.expires_at) ?? "",
    usageLimit: row.usage_limit,
    usageCount: row.usage_count,
    active: row.active,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at)
  };
}

export function couponToSupabase(coupon: Coupon, sortOrder: number): TablesInsert<"coupons"> {
  return {
    id: coupon.id,
    code: coupon.code.toUpperCase(),
    type: coupon.type,
    value: coupon.value,
    min_order: coupon.minOrder,
    expires_at: coupon.expiresAt,
    usage_limit: coupon.usageLimit,
    usage_count: coupon.usageCount,
    active: coupon.active,
    sort_order: sortOrder,
    created_at: coupon.createdAt,
    updated_at: coupon.updatedAt
  };
}

export function orderFromSupabase(row: Tables<"production_orders">): Order {
  return {
    id: row.id,
    customer: row.customer,
    phone: row.phone,
    products: row.products,
    total: row.total,
    notes: row.notes,
    status: row.status as Order["status"],
    createdAt: iso(row.created_at),
    isGift: row.is_gift,
    giftMessage: row.gift_message
  };
}

export function orderToSupabase(order: Order): TablesInsert<"production_orders"> {
  return {
    id: order.id,
    customer: order.customer,
    phone: order.phone,
    products: order.products,
    total: order.total,
    notes: order.notes,
    status: order.status,
    created_at: order.createdAt || null,
    is_gift: order.isGift ?? false,
    gift_message: order.giftMessage ?? ""
  };
}

export function campaignFromSupabase(row: Tables<"notification_campaigns">): NotificationCampaign {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    total: row.total,
    success: row.success,
    failed: row.failed,
    errorCodes: row.error_codes as Record<string, number>,
    firebaseAccepted: row.firebase_accepted,
    createdAt: iso(row.created_at),
    ...(row.sent_by ? { sentBy: row.sent_by } : {}),
    target: row.target === "latest" ? "latest" : "all"
  };
}

export function analyticsRowsToResponse(rows: Tables<"analytics_counters">[]) {
  const productViews: Record<string, { count: number; name: string }> = {};
  const whatsappClicks: Record<string, { count: number; name: string }> = {};
  const collectionVisits: Record<string, { count: number; name: string }> = {};
  const whatsappDaily: Record<string, number> = {};
  let whatsappTotal = 0;

  for (const row of rows) {
    if (row.kind === "product_view" && row.entity_id) productViews[row.entity_id] = { count: row.count, name: row.name };
    if (row.kind === "whatsapp_click" && row.entity_id) {
      whatsappClicks[row.entity_id] = { count: row.count, name: row.name };
      whatsappTotal += row.count;
    }
    if (row.kind === "collection_visit" && row.entity_id) collectionVisits[row.entity_id] = { count: row.count, name: row.name };
    if (row.kind === "whatsapp_daily" && row.event_date) whatsappDaily[row.event_date] = row.count;
  }

  return { productViews, whatsappClicks, collectionVisits, whatsappTotal, whatsappDaily };
}
