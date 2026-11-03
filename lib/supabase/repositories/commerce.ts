import "server-only";

import type { Coupon, Order } from "@/lib/types";
import type { Json, Tables } from "../database.types";
import { couponFromSupabase, couponToSupabase, orderFromSupabase, orderToSupabase } from "../mappers";
import { readAllPages } from "../pagination";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "../server";

type ConsumeCouponResult =
  | { ok: true; usageCount: number; usageLimit: number }
  | { ok: false; reason: string };

function parseConsumeCouponResult(value: Json): ConsumeCouponResult {
  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error("consume_coupon returned an invalid payload.");
  }
  if (value.ok === true && typeof value.usageCount === "number" && typeof value.usageLimit === "number") {
    return { ok: true, usageCount: value.usageCount, usageLimit: value.usageLimit };
  }
  if (value.ok === false && typeof value.reason === "string") return { ok: false, reason: value.reason };
  throw new Error("consume_coupon returned an invalid payload.");
}

export class SupabaseCouponRepository {
  isConfigured = isSupabaseServerConfigured;

  async getAll() {
    const client = getSupabaseServerClient();
    const rows = await readAllPages<Tables<"coupons">>((from, to) =>
      client.from("coupons").select("*").order("sort_order").order("id").range(from, to).throwOnError()
    );
    return rows.map(couponFromSupabase);
  }

  async getByCode(code: string) {
    const { data } = await getSupabaseServerClient()
      .from("coupons")
      .select("*")
      .eq("code", code.trim().toUpperCase())
      .limit(1)
      .maybeSingle()
      .throwOnError();
    return data ? couponFromSupabase(data) : null;
  }

  async replace(coupons: Coupon[]) {
    const updatedAt = new Date().toISOString();
    const rows = coupons.map((coupon, index) => couponToSupabase({ ...coupon, updatedAt }, index)) as unknown as Json;
    await getSupabaseServerClient().rpc("replace_coupons", { p_rows: rows }).throwOnError();
    return { saved: true as const };
  }

  async consume(code: string) {
    const { data } = await getSupabaseServerClient().rpc("consume_coupon", { p_code: code }).throwOnError();
    return parseConsumeCouponResult(data);
  }
}

export class SupabaseOrderRepository {
  isConfigured = isSupabaseServerConfigured;

  async getAll() {
    const client = getSupabaseServerClient();
    const rows = await readAllPages<Tables<"production_orders">>((from, to) =>
      client
        .from("production_orders")
        .select("*")
        .order("created_at", { ascending: false, nullsFirst: false })
        .order("id", { ascending: false })
        .range(from, to)
        .throwOnError()
    );
    return rows.map(orderFromSupabase);
  }

  async create(order: Order) {
    await getSupabaseServerClient().from("production_orders").upsert(orderToSupabase(order)).throwOnError();
    return { saved: true as const };
  }

  async update(order: Order) {
    const { id: _id, ...update } = orderToSupabase(order);
    await getSupabaseServerClient()
      .from("production_orders")
      .update(update)
      .eq("id", order.id)
      .select("id")
      .single()
      .throwOnError();
    return { saved: true as const };
  }

  async delete(id: string) {
    await getSupabaseServerClient().from("production_orders").delete().eq("id", id).throwOnError();
    return { deleted: true as const };
  }
}
