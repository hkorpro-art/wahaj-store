import { NextResponse } from "next/server";
import { saveNotificationSubscription } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => ({}))) as Record<string, unknown>;
  const token = typeof payload.token === "string" ? payload.token.trim() : "";

  if (!token) {
    return NextResponse.json({ ok: false, message: "Token is required." }, { status: 400 });
  }

  const result = await saveNotificationSubscription({
    token,
    userAgent: typeof payload.userAgent === "string" ? payload.userAgent : request.headers.get("user-agent") || ""
  });

  if (!result.settingsComplete) {
    return NextResponse.json(
      { ok: false, settingsComplete: false, message: "إعدادات الإشعارات غير مكتملة." },
      { status: 503 }
    );
  }

  return NextResponse.json({ ok: result.ok, settingsComplete: true });
}
