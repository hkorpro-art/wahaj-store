import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getCachedCategories, invalidateCategoriesCache } from "@/lib/catalog-cache";
import { getManagedCategories, saveManagedCategories } from "@/lib/category-management";
import { managedCategoriesInputSchema, categoryInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  const result = admin ? await getManagedCategories() : await getCachedCategories();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  return saveCategoriesRequest(request);
}

export async function PUT(request: Request) {
  return saveCategoriesRequest(request);
}

async function saveCategoriesRequest(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json();
  const collectionPayload = managedCategoriesInputSchema.safeParse(json);

  if (collectionPayload.success) {
    const saved = await saveManagedCategories(collectionPayload.data.categories);
    invalidateCategoriesCache();

    return NextResponse.json({
      message: saved.saved ? "تم حفظ التصنيفات." : "فشل في حفظ التصنيفات.",
      categories: collectionPayload.data.categories,
      saved: saved.saved
    });
  }

  const categoryPayload = categoryInputSchema.safeParse(json);

  if (!categoryPayload.success) {
    return NextResponse.json({ message: "بيانات التصنيف غير صالحة." }, { status: 400 });
  }

  const current = await getManagedCategories();
  const nextCategory = categoryPayload.data;
  const categories = current.categories.some((cat) => cat.id === nextCategory.id)
    ? current.categories.map((cat) => (cat.id === nextCategory.id ? nextCategory : cat))
    : [...current.categories, nextCategory];

  const saved = await saveManagedCategories(categories);
  invalidateCategoriesCache();

  return NextResponse.json(
    {
      message: saved.saved ? "تم حفظ التصنيف بنجاح." : "فشل في حفظ التصنيف.",
      category: nextCategory,
      categories,
      saved: saved.saved
    },
    { status: 201 }
  );
}
