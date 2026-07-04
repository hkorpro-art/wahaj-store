import { NextResponse } from "next/server";
import { getNotificationPublicConfig } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(getNotificationPublicConfig(), {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}
