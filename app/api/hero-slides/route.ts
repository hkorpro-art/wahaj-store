import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getHeroSlides, getHeroSettings, saveHeroSettings, saveHeroSlides } from "@/lib/hero-slides";
import { heroSettingsInputSchema, managedHeroSlidesInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const [slidesResult, settings] = await Promise.all([getHeroSlides(), getHeroSettings()]);

  return NextResponse.json(
    { slides: slidesResult.slides, source: slidesResult.source, settings },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=300, stale-while-revalidate=600"
      }
    }
  );
}

export async function PUT(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json();

  if (json.slides && Array.isArray(json.slides)) {
    const payload = managedHeroSlidesInputSchema.safeParse({ slides: json.slides });
    if (!payload.success) {
      return NextResponse.json({ message: "بيانات الشرائح غير صالحة." }, { status: 400 });
    }
    const saved = await saveHeroSlides(payload.data.slides);
    return NextResponse.json({ message: "تم حفظ شرائح الهيرو.", slides: payload.data.slides, saved: saved.saved });
  }

  if (json.transitionSpeed !== undefined) {
    const payload = heroSettingsInputSchema.safeParse(json);
    if (!payload.success) {
      return NextResponse.json({ message: "بيانات الإعدادات غير صالحة." }, { status: 400 });
    }
    const saved = await saveHeroSettings(payload.data);
    return NextResponse.json({ message: "تم حفظ إعدادات الحركة.", settings: payload.data, saved: saved.saved });
  }

  return NextResponse.json({ message: "طلب غير صالح." }, { status: 400 });
}

export async function POST(request: Request) {
  return PUT(request);
}
