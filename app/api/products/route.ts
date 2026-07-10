import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { verifyAdminToken } from "@/lib/auth";
import { getManagedProducts, saveManagedProducts } from "@/lib/products";
import { managedProductsInputSchema, productInputSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET() {
  const result = await getManagedProducts();

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
  const collectionPayload = managedProductsInputSchema.safeParse(json);

  if (collectionPayload.success) {
    try {
      const saved = await saveManagedProducts(collectionPayload.data.products);
      revalidateProductPages();

      return NextResponse.json({
        message: "تم حفظ المنتجات للعملاء.",
        products: collectionPayload.data.products,
        saved: saved.saved
      });
    } catch {
      return NextResponse.json(
        { message: "قاعدة بيانات المنتجات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
        { status: 503 }
      );
    }
  }

  const productPayload = productInputSchema.safeParse(json);

  if (!productPayload.success) {
    return NextResponse.json({ message: "بيانات المنتج غير صالحة." }, { status: 400 });
  }

  const current = await getManagedProducts();
  const nextProduct = productPayload.data;
  const products = current.products.some((product) => product.id === nextProduct.id)
    ? current.products.map((product) => (product.id === nextProduct.id ? nextProduct : product))
    : [nextProduct, ...current.products];

  try {
    const saved = await saveManagedProducts(products);
    revalidateProductPages();

    return NextResponse.json(
      {
        message: "تم حفظ المنتج للعملاء.",
        product: nextProduct,
        products,
        saved: saved.saved
      },
      { status: 201 }
    );
  } catch {
    return NextResponse.json(
      { message: "قاعدة بيانات المنتجات غير مفعلة. لم يتم حفظ التغيير.", saved: false },
      { status: 503 }
    );
  }
}

