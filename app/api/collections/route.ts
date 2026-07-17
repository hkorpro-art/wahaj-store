import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getCachedCollections, invalidateCollectionsCache } from "@/lib/catalog-cache";
import { getManagedCollections, saveManagedCollections } from "@/lib/collection-management";
import { managedCollectionsInputSchema, collectionInputSchema } from "@/lib/validation";

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
  const collectionPayload = managedCollectionsInputSchema.safeParse(json);

  if (collectionPayload.success) {
    const saved = await saveManagedCollections(collectionPayload.data.collections);
    invalidateCollectionsCache();

    return NextResponse.json({
      message: saved.saved ? "تم حفظ المجموعات." : "فشل في حفظ المجموعات.",
      collections: collectionPayload.data.collections,
      saved: saved.saved
    });
  }

  const singlePayload = collectionInputSchema.safeParse(json);

  if (!singlePayload.success) {
    return NextResponse.json({ message: "بيانات المجموعة غير صالحة." }, { status: 400 });
  }

  const current = await getManagedCollections();
  const nextCollection = singlePayload.data;
  const collections = current.collections.some((cat) => cat.id === nextCollection.id)
    ? current.collections.map((cat) => (cat.id === nextCollection.id ? nextCollection : cat))
    : [...current.collections, nextCollection];

  const saved = await saveManagedCollections(collections);
  invalidateCollectionsCache();

  return NextResponse.json(
    {
      message: saved.saved ? "تم حفظ المجموعة بنجاح." : "فشل في حفظ المجموعة.",
      collection: nextCollection,
      collections,
      saved: saved.saved
    },
    { status: 201 }
  );
}
