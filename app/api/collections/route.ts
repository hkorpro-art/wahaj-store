import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getCachedCollections, invalidateCollectionsCache } from "@/lib/catalog-cache";
import { getManagedCollections } from "@/lib/collection-management";
import { collectionRepository } from "@/lib/collection-repository";
import { collectionCommandSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  const result = admin ? await getManagedCollections() : await getCachedCollections();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  return saveCollectionsRequest(request);
}

export async function PUT(request: Request) {
  return saveCollectionsRequest(request);
}

async function saveCollectionsRequest(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json();
  const commandPayload = collectionCommandSchema.safeParse(json);

  if (!commandPayload.success) {
    return NextResponse.json({ message: "بيانات المجموعة غير صالحة." }, { status: 400 });
  }

  try {
    switch (commandPayload.data.action) {
      case "update": {
        const saved = await collectionRepository.update(commandPayload.data.collection);
        invalidateCollectionsCache();

        return NextResponse.json({
          message: "تم تحديث المجموعة بنجاح.",
          collection: commandPayload.data.collection,
          saved: saved.saved
        });
      }
      case "create": {
        const saved = await collectionRepository.create(commandPayload.data.collection, {
          sortOrder: commandPayload.data.sortOrder
        });
        invalidateCollectionsCache();

        return NextResponse.json(
          {
            message: "تم حفظ المجموعة بنجاح.",
            collection: commandPayload.data.collection,
            saved: saved.saved
          },
          { status: 201 }
        );
      }
      case "delete": {
        const deleted = await collectionRepository.delete(commandPayload.data.id);
        invalidateCollectionsCache();

        return NextResponse.json({
          message: "تم حذف المجموعة بنجاح.",
          deleted: deleted.deleted,
          saved: true
        });
      }
      case "reorder": {
        const saved = await collectionRepository.reorder({
          collectionId: commandPayload.data.collectionId,
          adjacentCollectionId: commandPayload.data.adjacentCollectionId
        });
        invalidateCollectionsCache();

        return NextResponse.json({
          message: "تم تحديث ترتيب المجموعات بنجاح.",
          saved: saved.saved
        });
      }
    }
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات المجموعات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}
