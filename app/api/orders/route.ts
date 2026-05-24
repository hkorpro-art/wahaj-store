import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { orders } from "@/lib/data";
import { verifyAdminToken } from "@/lib/auth";
import { orderInputSchema } from "@/lib/validation";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  return NextResponse.json({ orders });
}

export async function POST(request: Request) {
  const payload = orderInputSchema.safeParse(await request.json());

  if (!payload.success) {
    return NextResponse.json({ message: "بيانات الطلب غير صالحة." }, { status: 400 });
  }

  return NextResponse.json(
    {
      message: "تم تسجيل الطلب الأولي. قناة الإتمام الأساسية هي واتساب.",
      order: payload.data
    },
    { status: 201 }
  );
}
