import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { invalidateCategoriesCache } from "@/lib/catalog-cache";
import { categoryRepository } from "@/lib/category-repository";
import { categoryCommandSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const commandPayload = categoryCommandSchema.safeParse(json);

  if (!commandPayload.success || commandPayload.data.action !== "update") {
    return NextResponse.json({ message: "بيانات التصنيف غير صالحة." }, { status: 400 });
  }

  if (commandPayload.data.category.id !== id) {
    return NextResponse.json({ message: "معرف التصنيف غير متطابق." }, { status: 400 });
  }

  try {
    const saved = await categoryRepository.update(commandPayload.data.category);
    invalidateCategoriesCache();

    return NextResponse.json({
      message: "تم تحديث التصنيف بنجاح.",
      category: commandPayload.data.category,
      saved: saved.saved
    });
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات التصنيفات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const commandPayload = categoryCommandSchema.safeParse(json);

  if (!commandPayload.success || commandPayload.data.action !== "delete" || commandPayload.data.id !== id) {
    return NextResponse.json({ message: "بيانات التصنيف غير صالحة." }, { status: 400 });
  }

  try {
    const deleted = await categoryRepository.delete(id);
    invalidateCategoriesCache();

    return NextResponse.json({
      message: "تم حذف التصنيف بنجاح.",
      deleted: deleted.deleted,
      saved: true
    });
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات التصنيفات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}
