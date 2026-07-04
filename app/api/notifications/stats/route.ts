import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getActiveNotificationSubscriptionCount } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const result = await getActiveNotificationSubscriptionCount();

  return NextResponse.json(
    {
      subscribers: result.count,
      settingsComplete: result.settingsComplete
    },
    {
      headers: {
        "Cache-Control": "no-store"
      }
    }
  );
}
