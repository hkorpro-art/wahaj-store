import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { resetAllNotificationSubscriptions } from "@/lib/notifications";

export const dynamic = "force-dynamic";
const PUSH_DEBUG_PREFIX = "[WAHAJ_PUSH_DEBUG]";

export async function POST() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const result = await resetAllNotificationSubscriptions();

  console.info(PUSH_DEBUG_PREFIX, "Reset notification subscriptions", result);

  if (!result.settingsComplete) {
    return NextResponse.json(
      { ...result, message: "إعدادات الإشعارات غير مكتملة." },
      { status: 503 }
    );
  }

  return NextResponse.json(result);
}
