import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { invalidateCollectionsCache } from "@/lib/catalog-cache";
import { collectionRepository } from "@/lib/collection-repository";
import { collectionCommandSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json().catch(() => null);
  const commandPayload = collectionCommandSchema.safeParse(json);

  if (!commandPayload.success || commandPayload.data.action !== "update") {
    return NextResponse.json({ message: "بيانات المجموعة غير صالحة." }, { status: 400 });
  }

  if (commandPayload.data.collection.id !== id) {
    return NextResponse.json({ message: "معرف المجموعة غير متطابق." }, { status: 400 });
  }

  try {
    const saved = await collectionRepository.update(commandPayload.data.collection);
    invalidateCollectionsCache();

    return NextResponse.json({
      message: "تم تحديث المجموعة بنجاح.",
      collection: commandPayload.data.collection,
      saved: saved.saved
    });
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات المجموعات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
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
  const commandPayload = collectionCommandSchema.safeParse(json);

  if (!commandPayload.success || commandPayload.data.action !== "delete" || commandPayload.data.id !== id) {
    return NextResponse.json({ message: "بيانات المجموعة غير صالحة." }, { status: 400 });
  }

  try {
    const deleted = await collectionRepository.delete(id);
    invalidateCollectionsCache();

    return NextResponse.json({
      message: "تم حذف المجموعة بنجاح.",
      deleted: deleted.deleted,
      saved: true
    });
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات المجموعات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}
