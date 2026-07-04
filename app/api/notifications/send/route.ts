import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { sanitizeNotificationText, sendNotificationToActiveSubscribers } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = sanitizeNotificationText(payload.title, 80);
  const body = sanitizeNotificationText(payload.body, 240);

  if (!title || !body) {
    return NextResponse.json({ message: "عنوان الإشعار ونصه مطلوبان." }, { status: 400 });
  }

  const result = await sendNotificationToActiveSubscribers(title, body);

  if (!result.settingsComplete) {
    return NextResponse.json(
      { ...result, message: "إعدادات الإشعارات غير مكتملة." },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
