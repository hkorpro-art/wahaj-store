import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { MENU_ICON_IDS } from "@/lib/imagekit";
import { getMenuIcons, saveMenuIcons } from "@/lib/store-menu-icons";

export const dynamic = "force-dynamic";

const storedImageSchema = z.object({
  url: z.string().url(),
  fileId: z.string()
});

const saveSchema = z.object({
  icons: z.record(storedImageSchema.optional())
});

export async function GET() {
  const result = await getMenuIcons();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function PUT(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = saveSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "بيانات الأيقونات غير صالحة." }, { status: 400 });
  }

  const icons: Record<string, { url: string; fileId: string }> = {};

  for (const id of MENU_ICON_IDS) {
    const icon = parsed.data.icons[id];
    if (icon) {
      icons[id] = icon;
    }
  }

  const saved = await saveMenuIcons(icons);

  return NextResponse.json({
    message: saved.saved ? "تم حفظ أيقونات القوائم." : "لم يتم الربط بـ Firestore.",
    icons,
    saved: saved.saved
  });
}
