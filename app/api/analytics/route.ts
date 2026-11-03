import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { STORE_ANALYTICS_EVENT_NAMES } from "@/lib/analytics";
import { supabaseAnalyticsRepository } from "@/lib/supabase/repositories";

export const dynamic = "force-dynamic";

const analyticsItemSchema = z.object({
  productId: z.string().trim().min(1).max(200),
  productName: z.string().trim().max(300),
  quantity: z.number().int().positive().max(999),
  unitPrice: z.number().nonnegative().max(1_000_000_000)
});

const metadataValueSchema = z.union([z.string().max(200), z.number(), z.boolean(), z.null()]);

const storeEventSchema = z.object({
  version: z.literal(1),
  eventId: z.string().trim().min(8).max(120),
  name: z.enum(STORE_ANALYTICS_EVENT_NAMES),
  sessionId: z.string().trim().min(8).max(120),
  cartId: z.string().trim().min(8).max(120).optional(),
  productId: z.string().trim().min(1).max(200).optional(),
  productName: z.string().trim().max(300).optional(),
  sourceChannel: z.enum(["direct", "search", "social", "referral", "campaign", "unknown"]),
  referrerDomain: z.string().trim().max(300).optional(),
  landingPath: z.string().trim().min(1).max(1000),
  pagePath: z.string().trim().min(1).max(1000),
  entryPoint: z.string().trim().max(120).optional(),
  deviceType: z.enum(["mobile", "tablet", "desktop", "unknown"]),
  quantity: z.number().int().positive().max(999).optional(),
  unitPrice: z.number().nonnegative().max(1_000_000_000).optional(),
  cartValue: z.number().nonnegative().max(10_000_000_000).optional(),
  itemCount: z.number().int().nonnegative().max(9_999).optional(),
  items: z.array(analyticsItemSchema).max(100).optional(),
  metadata: z.record(metadataValueSchema).refine((value) => Object.keys(value).length <= 20).optional()
}).strict().superRefine((event, context) => {
  const productEvents = new Set([
    "product_impression", "product_viewed", "cart_item_added",
    "cart_item_removed", "whatsapp_product_clicked"
  ]);
  const cartEvents = new Set([
    "cart_item_added", "cart_item_removed", "cart_viewed",
    "checkout_started", "whatsapp_cart_clicked"
  ]);

  if (productEvents.has(event.name) && !event.productId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "productId is required for this event." });
  }
  if (cartEvents.has(event.name) && !event.cartId) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "cartId is required for this event." });
  }
  if (event.name === "whatsapp_cart_clicked" && !event.items?.length) {
    context.addIssue({ code: z.ZodIssueCode.custom, message: "Cart items are required for WhatsApp attribution." });
  }
});

const ALLOWED_DAYS = new Set([7, 30, 90]);

function yemenDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Aden",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  }).format(date);
}

function isPendingAnalyticsMigration(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const candidate = error as { code?: unknown; message?: unknown };
  return candidate.code === "PGRST202" ||
    (typeof candidate.message === "string" && candidate.message.includes("record_store_analytics_event"));
}

export async function POST(request: Request) {
  if (!supabaseAnalyticsRepository.isConfigured()) {
    return NextResponse.json({ ok: false, message: "خدمة التحليلات غير مهيأة." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;

  try {
    if (body.version === 1) {
      const parsed = storeEventSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ ok: false, message: "Invalid analytics event." }, { status: 400 });
      }
      const result = await supabaseAnalyticsRepository.recordStoreEvent(parsed.data);
      return NextResponse.json({ ok: true, ...result });
    }

    await supabaseAnalyticsRepository.record({
      type: typeof body.type === "string" ? body.type : "",
      ...(typeof body.productId === "string" ? { productId: body.productId } : {}),
      ...(typeof body.productName === "string" ? { productName: body.productName } : {}),
      ...(typeof body.collectionId === "string" ? { collectionId: body.collectionId } : {}),
      ...(typeof body.collectionName === "string" ? { collectionName: body.collectionName } : {})
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    if (body.version === 1 && isPendingAnalyticsMigration(err)) {
      console.warn("Analytics v2 event skipped until its database migration is applied.");
      return NextResponse.json({ ok: false, pendingMigration: true }, { status: 202 });
    }
    console.error("Analytics POST error:", err);
    return NextResponse.json({ ok: false, message: "Failed." }, { status: 500 });
  }
}

export async function DELETE() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  if (!supabaseAnalyticsRepository.isConfigured()) {
    return NextResponse.json({ ok: false, message: "خدمة التحليلات غير مهيأة." }, { status: 503 });
  }

  try {
    const { deletedCount } = await supabaseAnalyticsRepository.reset();
    if (deletedCount === 0) return NextResponse.json({ ok: true, deletedCount: 0 });
    return NextResponse.json({ ok: true, deletedCount, timestamp: new Date().toISOString() });
  } catch (err) {
    console.error("Analytics DELETE error:", err);
    return NextResponse.json({ ok: false, message: "Failed." }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  if (!supabaseAnalyticsRepository.isConfigured()) {
    return NextResponse.json({ message: "خدمة التحليلات غير مهيأة." }, { status: 503 });
  }

  try {
    const requestedDays = Number(new URL(request.url).searchParams.get("days") ?? "30");
    const days = ALLOWED_DAYS.has(requestedDays) ? requestedDays : 30;
    const to = new Date();
    const from = new Date(to.getTime() - (days - 1) * 24 * 60 * 60 * 1000);
    return NextResponse.json(
      await supabaseAnalyticsRepository.getStoreDashboard(yemenDate(from), yemenDate(to)),
      { headers: { "Cache-Control": "private, no-store, max-age=0" } }
    );
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ message: "تعذر تحميل بيانات التحليلات." }, { status: 500 });
  }
}
