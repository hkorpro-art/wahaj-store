import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";

export const dynamic = "force-dynamic";

const siteContentSchema = z.object({
  heroBadge: z.string(),
  heroTitle: z.string(),
  heroDescription: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  offerMessages: z.array(z.string()),
  showActiveCoupons: z.boolean()
});

export async function GET() {
  const result = await getSiteContent();
  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" }
  });
}

export async function PUT(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const parsed = siteContentSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ message: "بيانات المحتوى غير صالحة." }, { status: 400 });
  }

  try {
    const saved = await saveSiteContent(parsed.data);
    return NextResponse.json({
      message: "تم حفظ محتوى الموقع.",
      content: parsed.data,
      saved: saved.saved
    });
  } catch {
    return NextResponse.json({ message: "فشل حفظ المحتوى في قاعدة البيانات." }, { status: 502 });
  }
}
