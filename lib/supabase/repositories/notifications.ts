import "server-only";

import type { Tables, TablesInsert } from "../database.types";
import { campaignFromSupabase } from "../mappers";
import { readAllPages } from "../pagination";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "../server";

export class SupabaseNotificationRepository {
  isConfigured = isSupabaseServerConfigured;

  async upsertSubscription(row: TablesInsert<"notification_subscriptions">) {
    await getSupabaseServerClient().from("notification_subscriptions").upsert(row).throwOnError();
    return { saved: true as const };
  }

  async countActiveSubscriptions() {
    const { count } = await getSupabaseServerClient()
      .from("notification_subscriptions")
      .select("id", { count: "exact", head: true })
      .eq("active", true)
      .throwOnError();
    return count ?? 0;
  }

  async getActiveSubscriptions(latestOnly = false) {
    const client = getSupabaseServerClient();
    if (latestOnly) {
      const { data } = await client
        .from("notification_subscriptions")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .limit(1)
        .throwOnError();
      return data ?? [];
    }
    return readAllPages<Tables<"notification_subscriptions">>((from, to) =>
      client
        .from("notification_subscriptions")
        .select("*")
        .eq("active", true)
        .order("updated_at", { ascending: false })
        .order("id")
        .range(from, to)
        .throwOnError()
    );
  }

  async deactivateSubscriptions(ids: string[], reason: string) {
    if (ids.length === 0) return { disabled: 0 };
    const { data } = await getSupabaseServerClient()
      .from("notification_subscriptions")
      .update({
        active: false,
        deactivated_at: new Date().toISOString(),
        deactivation_reason: reason
      })
      .in("id", ids)
      .select("id")
      .throwOnError();
    return { disabled: data?.length ?? 0 };
  }

  async resetAllSubscriptions() {
    const { data } = await getSupabaseServerClient().rpc("reset_notification_subscriptions").throwOnError();
    return { disabled: data };
  }

  async saveCampaign(row: TablesInsert<"notification_campaigns">) {
    await getSupabaseServerClient().from("notification_campaigns").upsert(row).throwOnError();
    return { saved: true as const, id: row.id };
  }

  async getCampaignHistory(limit = 50) {
    const { data } = await getSupabaseServerClient()
      .from("notification_campaigns")
      .select("*")
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(Math.max(1, Math.min(limit, 100)))
      .throwOnError();
    return (data ?? []).map(campaignFromSupabase);
  }
}
