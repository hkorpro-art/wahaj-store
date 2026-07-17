import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { z } from "zod";
import { verifyAdminToken } from "@/lib/auth";
import { getSiteContent, saveSiteContent } from "@/lib/site-content";
import { getCachedSiteContent, invalidateSiteContentCache } from "@/lib/site-content-cache";

export const dynamic = "force-dynamic";

const siteContentSchema = z.object({
  heroBadge: z.string(),
  heroTitle: z.string(),
  heroDescription: z.string(),
  primaryCta: z.string(),
  secondaryCta: z.string(),
  offerMessages: z.array(z.string()),
  showActiveCoupons: z.boolean(),
  accordionDetails: z.string(),
  accordionCare: z.string(),
  accordionShipping: z.string(),
  accordionReturns: z.string()
});

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  const result = admin ? await getSiteContent() : await getCachedSiteContent();

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store" }
  });
}

function revalidateSiteContentPages() {
  invalidateSiteContentCache();
  revalidatePath("/", "page");
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
    revalidateSiteContentPages();
    return NextResponse.json({
      message: "تم حفظ محتوى الموقع.",
      content: parsed.data,
      saved: saved.saved
    });
  } catch {
    return NextResponse.json({ message: "فشل حفظ المحتوى في قاعدة البيانات." }, { status: 502 });
  }
}
