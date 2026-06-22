import { NextResponse } from "next/server";
import { incrementCouponUsage } from "@/lib/coupons";

export const dynamic = "force-dynamic";

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxAttempts) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: Request) {
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (!checkRateLimit(`coupon:${ip}`, 30, 60000)) {
    return NextResponse.json(
      { ok: false, reason: "rate_limited", message: "طلبات كثيرة. حاولي بعد دقيقة." },
      { status: 429 }
    );
  }

  const body = (await request.json()) as { code?: string };

  if (!body.code || typeof body.code !== "string") {
    return NextResponse.json({ ok: false, reason: "missing_code", message: "كود الخصم مطلوب." });
  }

  const result = await incrementCouponUsage(body.code.toUpperCase());

  if (!result.ok) {
    const messages: Record<string, string> = {
      not_found: "كود الخصم غير صحيح",
      inactive: "كود الخصم غير متاح حالياً",
      expired: "انتهت صلاحية كود الخصم",
      quota_exhausted: "تم استنفاذ الحد الأقصى لاستخدام كود الخصم",
      no_firestore: "غير متاح حالياً",
      server_error: "حدث خطأ. حاولي مرة أخرى."
    };

    return NextResponse.json({
      ok: false,
      reason: result.reason,
      message: messages[result.reason] || "خطأ غير متوقع."
    });
  }

  return NextResponse.json({
    ok: true,
    usageCount: result.usageCount,
    usageLimit: result.usageLimit
  });
}
