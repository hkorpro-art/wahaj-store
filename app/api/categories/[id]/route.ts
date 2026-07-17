import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { invalidateCategoriesCache } from "@/lib/catalog-cache";
import { getManagedCategories, saveManagedCategories } from "@/lib/category-management";
import { categoryInputSchema } from "@/lib/validation";
// Note: categoryInputSchema is deprecated, kept for backward compat

export const dynamic = "force-dynamic";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json();
  const categoryPayload = categoryInputSchema.safeParse(json);

  if (!categoryPayload.success) {
    return NextResponse.json({ message: "بيانات التصنيف غير صالحة." }, { status: 400 });
  }

  const current = await getManagedCategories();
  const nextCategory = categoryPayload.data;
  
  if (nextCategory.id !== id) {
    return NextResponse.json({ message: "معرف التصنيف غير متطابق." }, { status: 400 });
  }

  const categories = current.categories.map((cat) => (cat.id === id ? nextCategory : cat));
  const saved = await saveManagedCategories(categories);
  invalidateCategoriesCache();

  return NextResponse.json({
    message: saved.saved ? "تم تحديث التصنيف بنجاح." : "فشل في التحديث.",
    category: nextCategory,
    saved: saved.saved
  });
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const id = params.id;
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const current = await getManagedCategories();
  const categories = current.categories.filter((cat) => cat.id !== id);
  const saved = await saveManagedCategories(categories);
  invalidateCategoriesCache();

  return NextResponse.json({
    message: saved.saved ? "تم حذف التصنيف بنجاح." : "فشل في الحذف.",
    saved: saved.saved
  });
}
