import "server-only";

import type { Tables } from "../database.types";
import type { Json } from "../database.types";
import type { StoreAnalyticsDashboard, StoreAnalyticsEvent } from "@/lib/analytics";
import { analyticsRowsToResponse } from "../mappers";
import { readAllPages } from "../pagination";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "../server";

export type SupabaseAnalyticsEvent = {
  type: string;
  productId?: string;
  productName?: string;
  collectionId?: string;
  collectionName?: string;
};

export class SupabaseAnalyticsRepository {
  isConfigured = isSupabaseServerConfigured;

  async record(event: SupabaseAnalyticsEvent) {
    await getSupabaseServerClient()
      .rpc("record_analytics_event", {
        p_type: event.type,
        ...(event.productId !== undefined ? { p_product_id: event.productId } : {}),
        ...(event.productName !== undefined ? { p_product_name: event.productName } : {}),
        ...(event.collectionId !== undefined ? { p_collection_id: event.collectionId } : {}),
        ...(event.collectionName !== undefined ? { p_collection_name: event.collectionName } : {})
      })
      .throwOnError();
  }

  async getDashboardResponse() {
    const client = getSupabaseServerClient();
    const rows = await readAllPages<Tables<"analytics_counters">>((from, to) =>
      client.from("analytics_counters").select("*").order("id").range(from, to).throwOnError()
    );
    return analyticsRowsToResponse(rows);
  }

  async recordStoreEvent(event: StoreAnalyticsEvent) {
    const { data } = await getSupabaseServerClient()
      .rpc("record_store_analytics_event", {
        p_event: event as unknown as Json,
        p_items: (event.items ?? []) as unknown as Json
      })
      .throwOnError();
    return { recorded: data };
  }

  async getStoreDashboard(from: string, to: string) {
    const { data } = await getSupabaseServerClient()
      .rpc("get_store_analytics_dashboard", { p_from: from, p_to: to })
      .throwOnError();
    return data as unknown as StoreAnalyticsDashboard;
  }

  async reset() {
    const { data } = await getSupabaseServerClient().rpc("reset_analytics").throwOnError();
    return { deletedCount: data };
  }
}
