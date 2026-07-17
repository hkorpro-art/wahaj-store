import "server-only";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import type { Coupon } from "./types";

const COUPONS_COLLECTION = "coupons";

function isCouponActive(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (new Date(coupon.expiresAt) < new Date()) return false;
  if (coupon.usageCount >= coupon.usageLimit) return false;
  return true;
}

export async function getCoupons(): Promise<{ coupons: Coupon[]; source: "firebase" | "empty" }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore.collection(COUPONS_COLLECTION).get();
      const coupons = snapshot.docs.map((doc) => doc.data() as Coupon);
      if (coupons.length > 0) {
        return { coupons, source: "firebase" };
      }
    } catch (error) {
      console.error("Unable to load coupons from Firebase:", error);
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
  const firestore = getFirebaseFirestoreAdmin();
  const normalizedCode = code.toUpperCase();

  if (!firestore) {
    return null;
  }

  try {
    const snapshot = await firestore
      .collection(COUPONS_COLLECTION)
      .where("code", "==", normalizedCode)
      .limit(1)
      .get();

    if (!snapshot.empty) {
      return snapshot.docs[0].data() as Coupon;
    }
  } catch (error) {
    console.error("Unable to query coupon by code from Firebase:", error);
  }

  // Preserve the existing case-insensitive behavior for legacy mixed-case coupon records.
  const { coupons } = await getCoupons();
  return coupons.find((coupon) => coupon.code.toUpperCase() === normalizedCode) ?? null;
}

export async function saveCoupons(coupons: Coupon[]) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  const batch = firestore.batch();
  const collection = firestore.collection(COUPONS_COLLECTION);
  const nextIds = new Set(coupons.map((c) => c.id));
  const now = new Date().toISOString();

  coupons.forEach((coupon, index) => {
    const ref = collection.doc(coupon.id);
    batch.set(ref, { ...coupon, sortOrder: index, updatedAt: now });
  });

  const snapshot = await collection.select().get();
  snapshot.docs.forEach((doc) => {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  return { saved: true as const };
}

export async function incrementCouponUsage(code: string): Promise<{ ok: true; usageCount: number; usageLimit: number } | { ok: false; reason: string }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    return { ok: false, reason: "no_firestore" };
  }

  try {
    const couponQuery = firestore.collection(COUPONS_COLLECTION).where("code", "==", code).limit(1);
    const result = await firestore.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(couponQuery);

      if (snapshot.empty) {
        return { ok: false as const, reason: "not_found" as const };
      }

      const doc = snapshot.docs[0];
      const coupon = doc.data() as Coupon;

      if (!coupon.active) {
        return { ok: false as const, reason: "inactive" as const };
      }

      if (new Date(coupon.expiresAt) < new Date()) {
        return { ok: false as const, reason: "expired" as const };
      }

      if (coupon.usageCount >= coupon.usageLimit) {
        return { ok: false as const, reason: "quota_exhausted" as const };
      }

      const newCount = coupon.usageCount + 1;
      transaction.update(doc.ref, { usageCount: newCount, updatedAt: new Date().toISOString() });

      return { ok: true as const, usageCount: newCount, usageLimit: coupon.usageLimit };
    });

    return result;
  } catch (error) {
    console.error("incrementCouponUsage error:", error);
    return { ok: false, reason: "server_error" };
  }
}
