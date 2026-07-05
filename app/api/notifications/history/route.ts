import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/auth";
import { getNotificationCampaignHistory } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "Unauthorized." }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Number(url.searchParams.get("limit") || 50);
  const result = await getNotificationCampaignHistory(limit);

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
