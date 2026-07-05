import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { sanitizeNotificationText, sendNotificationToActiveSubscribers } from "@/lib/notifications";

export const dynamic = "force-dynamic";
const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

export async function POST(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const title = sanitizeNotificationText(payload.title, 80);
  const body = sanitizeNotificationText(payload.body, 240);

  console.info(PUSH_DEBUG_PREFIX, "API received notification send request", {
    title,
    body,
    titleLength: title.length,
    bodyLength: body.length
  });

  if (!title || !body) {
    console.warn(PUSH_DEBUG_PREFIX, "API rejected notification send request: missing title/body", {
      hasTitle: Boolean(title),
      hasBody: Boolean(body)
    });
    return NextResponse.json({ message: "عنوان الإشعار ونصه مطلوبان." }, { status: 400 });
  }

  const result = await sendNotificationToActiveSubscribers(title, body);

  console.info(PUSH_DEBUG_PREFIX, "API completed notification send request", {
    total: result.total,
    success: result.success,
    failed: result.failed,
    errorCodes: result.errorCodes,
    firebaseAccepted: result.firebaseAccepted,
    settingsComplete: result.settingsComplete
  });

  if (!result.settingsComplete) {
    return NextResponse.json(
      { ...result, message: "إعدادات الإشعارات غير مكتملة." },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
