import "server-only";

import { supabaseCouponRepository } from "./supabase/repositories";
import type { Coupon } from "./types";

function isCouponActive(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (new Date(coupon.expiresAt) < new Date()) return false;
  if (coupon.usageCount >= coupon.usageLimit) return false;
  return true;
}

export async function getCoupons(): Promise<{ coupons: Coupon[]; source: "firebase" | "empty" }> {
  if (supabaseCouponRepository.isConfigured()) {
    try {
      const coupons = await supabaseCouponRepository.getAll();
      if (coupons.length > 0) return { coupons, source: "firebase" };
    } catch (error) {
      console.error("Unable to load coupons from the production data store:", error);
    }
  }

  return { coupons: [], source: "empty" };
}

export async function getActiveCoupons(): Promise<Coupon[]> {
  try {
    const { coupons } = await getCoupons();
    return coupons.filter(isCouponActive);
  } catch (error) {
    console.error("Unable to load coupons for offer bar:", error);
    return [];
  }
}

export async function getCouponByCode(code: string): Promise<Coupon | null> {
  if (!supabaseCouponRepository.isConfigured()) return null;

  try {
    return await supabaseCouponRepository.getByCode(code);
  } catch (error) {
    console.error("Unable to query coupon by code from the production data store:", error);
  }

  const { coupons } = await getCoupons();
  const normalizedCode = code.toUpperCase();
  return coupons.find((coupon) => coupon.code.toUpperCase() === normalizedCode) ?? null;
}

export async function saveCoupons(coupons: Coupon[]) {
  if (!supabaseCouponRepository.isConfigured()) {
    throw new Error("Supabase is not configured.");
  }
  return supabaseCouponRepository.replace(coupons);
}

export async function incrementCouponUsage(code: string): Promise<{ ok: true; usageCount: number; usageLimit: number } | { ok: false; reason: string }> {
  if (!supabaseCouponRepository.isConfigured()) return { ok: false, reason: "no_firestore" };

  try {
    return await supabaseCouponRepository.consume(code);
  } catch (error) {
    console.error("incrementCouponUsage error:", error);
    return { ok: false, reason: "server_error" };
  }
}
