import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { getFirebaseFirestoreAdmin } from "@/lib/firebase-admin";
import { verifyAdminToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

const COLL = "analytics";

export async function POST(request: Request) {
  const db = getFirebaseFirestoreAdmin();
  if (!db) return NextResponse.json({ ok: false, message: "No Firestore." });

  const body = await request.json().catch(() => ({})) as Record<string, unknown>;
  const { type, productId, productName, collectionId, collectionName } = body;
  const now = new Date().toISOString();

  try {
    if (type === "product_view" && typeof productId === "string") {
      await db.collection(COLL).doc(`pv_${productId}`).set(
        { count: FieldValue.increment(1), name: productName || "", updatedAt: now },
        { merge: true }
      );
    }

    if (type === "whatsapp_click" && typeof productId === "string") {
      await db.collection(COLL).doc(`wc_${productId}`).set(
        { count: FieldValue.increment(1), name: productName || "", updatedAt: now },
        { merge: true }
      );

      const today = now.slice(0, 10);
      await db.collection(COLL).doc(`wd_${today}`).set(
        { count: FieldValue.increment(1), date: today },
        { merge: true }
      );
    }

    if (type === "collection_visit" && typeof collectionId === "string") {
      await db.collection(COLL).doc(`cv_${collectionId}`).set(
        { count: FieldValue.increment(1), name: collectionName || "", updatedAt: now },
        { merge: true }
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Analytics POST error:", err);
    return NextResponse.json({ ok: false, message: "Failed." }, { status: 500 });
  }
}

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const db = getFirebaseFirestoreAdmin();
  if (!db) return NextResponse.json({ productViews: {}, whatsappClicks: {}, collectionVisits: {}, whatsappTotal: 0, whatsappDaily: {} });

  try {
    const snapshot = await db.collection(COLL).get();

    const productViews: Record<string, { count: number; name: string }> = {};
    const whatsappClicks: Record<string, { count: number; name: string }> = {};
    const collectionVisits: Record<string, { count: number; name: string }> = {};
    let whatsappTotal = 0;
    const whatsappDaily: Record<string, number> = {};

    for (const doc of snapshot.docs) {
      const data = doc.data() as Record<string, unknown>;
      const id = doc.id;
      const count = (data.count as number) || 0;

      if (id.startsWith("pv_")) {
        productViews[id.slice(3)] = { count, name: (data.name as string) || "" };
      } else if (id.startsWith("wc_")) {
        whatsappClicks[id.slice(3)] = { count, name: (data.name as string) || "" };
        whatsappTotal += count;
      } else if (id.startsWith("cv_")) {
        collectionVisits[id.slice(3)] = { count, name: (data.name as string) || "" };
      } else if (id.startsWith("wd_")) {
        whatsappDaily[id.slice(3)] = count;
      }
    }

    return NextResponse.json({ productViews, whatsappClicks, collectionVisits, whatsappTotal, whatsappDaily });
  } catch (err) {
    console.error("Analytics GET error:", err);
    return NextResponse.json({ productViews: {}, whatsappClicks: {}, collectionVisits: {}, whatsappTotal: 0, whatsappDaily: {} });
  }
}
