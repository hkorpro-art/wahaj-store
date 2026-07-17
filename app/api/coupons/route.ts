import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getFirebaseFirestoreAdmin } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/auth";
import { getCouponByCode, getCoupons, saveCoupons } from "@/lib/coupons";
import type { Coupon } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const coupon = await getCouponByCode(code);

    if (!coupon) {
      return NextResponse.json({ ok: false, reason: "not_found", message: "كود الخصم غير صحيح" });
    }

    if (!coupon.active) {
      return NextResponse.json({ ok: false, reason: "inactive", message: "كود الخصم غير متاح حالياً" });
    }

    if (new Date(coupon.expiresAt) < new Date()) {
      return NextResponse.json({ ok: false, reason: "expired", message: "انتهت صلاحية كود الخصم" });
    }

    if (coupon.usageCount >= coupon.usageLimit) {
      return NextResponse.json({ ok: false, reason: "quota_exhausted", message: "تم استنفاذ الحد الأقصى لاستخدام كود الخصم" });
    }

    return NextResponse.json({ ok: true, coupon });
  }

  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (admin) {
    const { coupons } = await getCoupons();
    return NextResponse.json({ coupons });
  }

  return NextResponse.json({ coupons: [] });
}

export async function POST(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const body = (await request.json()) as { coupons: Coupon[] };

  if (!body.coupons || !Array.isArray(body.coupons)) {
    return NextResponse.json({ ok: false, message: "بيانات غير صالحة." }, { status: 400 });
  }

  try {
    const db = getFirebaseFirestoreAdmin();
    if (!db) {
      return NextResponse.json({ ok: false, message: "Firestore غير مهيأ." }, { status: 500 });
    }

    await saveCoupons(body.coupons);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Coupons POST error:", err);
    return NextResponse.json({ ok: false, message: "فشل الحفظ." }, { status: 500 });
  }
}
