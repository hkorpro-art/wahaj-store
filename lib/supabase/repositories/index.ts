import "server-only";

import { SupabaseAnalyticsRepository } from "./analytics";
import { SupabaseProductRepository, SupabaseCategoryRepository, SupabaseCollectionRepository } from "./catalog";
import { SupabaseCouponRepository, SupabaseOrderRepository } from "./commerce";
import { SupabaseContentRepository } from "./content";
import { SupabaseNotificationRepository } from "./notifications";

export const supabaseProductRepository = new SupabaseProductRepository();
export const supabaseCategoryRepository = new SupabaseCategoryRepository();
export const supabaseCollectionRepository = new SupabaseCollectionRepository();
export const supabaseContentRepository = new SupabaseContentRepository();
export const supabaseCouponRepository = new SupabaseCouponRepository();
export const supabaseOrderRepository = new SupabaseOrderRepository();
export const supabaseNotificationRepository = new SupabaseNotificationRepository();
export const supabaseAnalyticsRepository = new SupabaseAnalyticsRepository();
