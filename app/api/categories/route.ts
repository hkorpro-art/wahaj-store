import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyAdminToken } from "@/lib/auth";
import { getCachedCategories, invalidateCategoriesCache } from "@/lib/catalog-cache";
import { getManagedCategories } from "@/lib/category-management";
import { categoryRepository } from "@/lib/category-repository";
import { categoryCommandSchema } from "@/lib/validation";

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
  const commandPayload = categoryCommandSchema.safeParse(json);

  if (!commandPayload.success) {
    return NextResponse.json({ message: "بيانات التصنيف غير صالحة." }, { status: 400 });
  }

  try {
    switch (commandPayload.data.action) {
      case "update": {
        const saved = await categoryRepository.update(commandPayload.data.category);
        invalidateCategoriesCache();

        return NextResponse.json({
          message: "تم تحديث التصنيف بنجاح.",
          category: commandPayload.data.category,
          saved: saved.saved
        });
      }
      case "create": {
        const saved = await categoryRepository.create(commandPayload.data.category, {
          sortOrder: commandPayload.data.sortOrder
        });
        invalidateCategoriesCache();

        return NextResponse.json(
          {
            message: "تم حفظ التصنيف بنجاح.",
            category: commandPayload.data.category,
            saved: saved.saved
          },
          { status: 201 }
        );
      }
      case "delete": {
        const deleted = await categoryRepository.delete(commandPayload.data.id);
        invalidateCategoriesCache();

        return NextResponse.json({
          message: "تم حذف التصنيف بنجاح.",
          deleted: deleted.deleted,
          saved: true
        });
      }
      case "reorder": {
        const saved = await categoryRepository.reorder({
          categoryId: commandPayload.data.categoryId,
          adjacentCategoryId: commandPayload.data.adjacentCategoryId
        });
        invalidateCategoriesCache();

        return NextResponse.json({
          message: "تم تحديث ترتيب التصنيفات بنجاح.",
          saved: saved.saved
        });
      }
    }
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات التصنيفات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}
