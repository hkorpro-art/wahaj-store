import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { orderInputSchema } from "@/lib/validation";
import { deleteOrderFromFirestore, getManagedOrders, saveOrder } from "@/lib/orders";

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

export async function POST(request: Request) {
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
    status: status as any,
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
