import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { orderInputSchema } from "@/lib/validation";
import { deleteOrderFromFirestore, getManagedOrders, saveOrder } from "@/lib/orders";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const ordersList = await getManagedOrders();
  return NextResponse.json({ orders: ordersList });
}

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
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
  if (!checkRateLimit(`order:${ip}`, 20, 60000)) {
    return NextResponse.json({ message: "طلبات كثيرة جداً. حاولي بعد دقيقة." }, { status: 429 });
  }

  const json = await request.json();
  const payload = orderInputSchema.safeParse(json);

  if (!payload.success) {
    return NextResponse.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  const orderData = payload.data;
  const timestamp = Date.now();
  const id = orderData.id || `WH-${String(timestamp).slice(-6)}`;
  const status = orderData.status || "جديد";
  const createdAt = orderData.createdAt || new Date().toISOString().slice(0, 10);

  const order = {
    id,
    customer: orderData.customer,
    phone: orderData.phone,
    products: orderData.products,
    total: orderData.total,
    notes: orderData.notes || "بدون ملاحظات",
    status: status as OrderStatus,
    createdAt,
    isGift: orderData.isGift ?? false,
    giftMessage: orderData.giftMessage ?? ""
  };

  const saved = await saveOrder(order);

  return NextResponse.json(
    {
      message: saved.saved ? "تم تسجيل الطلب في قاعدة البيانات." : "تم تسجيل الطلب في السيرفر مؤقتاً.",
      order,
      saved: saved.saved
    },
    { status: 201 }
  );
}

export async function DELETE(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ message: "يجب تحديد معرف الطلب." }, { status: 400 });
  }

  const deleted = await deleteOrderFromFirestore(id);
  return NextResponse.json({ message: "تم حذف الطلب.", deleted: deleted.deleted });
}
