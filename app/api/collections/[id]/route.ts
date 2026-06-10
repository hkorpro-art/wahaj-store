import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getManagedCollections, saveManagedCollections } from "@/lib/collection-management";
import { collectionInputSchema } from "@/lib/validation";

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
  const payload = collectionInputSchema.safeParse(json);

  if (!payload.success) {
    return NextResponse.json({ message: "بيانات المجموعة غير صالحة." }, { status: 400 });
  }

  const current = await getManagedCollections();
  const nextCollection = payload.data;

  if (nextCollection.id !== id) {
    return NextResponse.json({ message: "معرف المجموعة غير متطابق." }, { status: 400 });
  }

  const collections = current.collections.map((cat) => (cat.id === id ? nextCollection : cat));
  const saved = await saveManagedCollections(collections);

  return NextResponse.json({
    message: saved.saved ? "تم تحديث المجموعة بنجاح." : "فشل في التحديث.",
    collection: nextCollection,
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

  const current = await getManagedCollections();
  const collections = current.collections.filter((cat) => cat.id !== id);
  const saved = await saveManagedCollections(collections);

  return NextResponse.json({
    message: saved.saved ? "تم حذف المجموعة بنجاح." : "فشل في الحذف.",
    saved: saved.saved
  });
}
