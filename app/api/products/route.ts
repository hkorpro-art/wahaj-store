import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminToken } from "@/lib/auth";
import { getCachedProducts, invalidateProductsCache } from "@/lib/catalog-cache";
import { getManagedProducts } from "@/lib/products";
import { productRepository } from "@/lib/product-repository";
import { productCommandSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);
  const result = admin ? await getManagedProducts() : await getCachedProducts();

  return NextResponse.json(result, {
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

export async function POST(request: Request) {
  return saveProductsRequest(request);
}

export async function PUT(request: Request) {
  return saveProductsRequest(request);
}

function revalidateProductPages() {
  invalidateProductsCache();
  revalidatePath("/", "page");
  revalidatePath("/product/[slug]", "page");
  revalidatePath("/collections/[slug]", "page");
  revalidatePath("/category/[slug]", "page");
  revalidatePath("/sitemap.xml");
}

async function saveProductsRequest(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "غير مصرح." }, { status: 401 });
  }

  const json = await request.json();
  const commandPayload = productCommandSchema.safeParse(json);

  if (!commandPayload.success) {
    return NextResponse.json({ message: "بيانات المنتج غير صالحة." }, { status: 400 });
  }

  try {
    switch (commandPayload.data.action) {
      case "update": {
        const saved = await productRepository.updateProduct(commandPayload.data.product);
        revalidateProductPages();

        return NextResponse.json({
          message: "تم حفظ المنتج للعملاء.",
          product: commandPayload.data.product,
          saved: saved.saved
        });
      }
      case "create": {
        const saved = await productRepository.createProduct(commandPayload.data.product, {
          sortOrder: commandPayload.data.sortOrder
        });
        revalidateProductPages();

        return NextResponse.json({
          message: "تم حفظ المنتج للعملاء.",
          product: commandPayload.data.product,
          saved: saved.saved
        });
      }
      case "delete": {
        const deleted = await productRepository.deleteProduct(commandPayload.data.id);
        revalidateProductPages();

        return NextResponse.json({
          message: "تم حذف المنتج من العملاء.",
          deleted: deleted.deleted,
          saved: true
        });
      }
      case "reorder": {
        const saved = await productRepository.reorderProducts({
          productId: commandPayload.data.productId,
          adjacentProductId: commandPayload.data.adjacentProductId
        });
        revalidateProductPages();

        return NextResponse.json({
          message: "تم تحديث ترتيب المنتجات للعملاء.",
          saved: saved.saved
        });
      }
    }
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات المنتجات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}

