import { NextResponse } from "next/server";
import { cookies } from "next/headers";
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

async function saveProductsRequest(request: Request) {
  const token = (await cookies()).get("wahaj_admin")?.value;
  const admin = await verifyAdminToken(token);

  if (!admin) {
    return NextResponse.json({ message: "ط؛ظٹط± ظ…طµط±ط­." }, { status: 401 });
  }

  const json = await request.json();
  const collectionPayload = managedProductsInputSchema.safeParse(json);

  if (collectionPayload.success) {
    const saved = await saveManagedProducts(collectionPayload.data.products);

    return NextResponse.json({
      message: saved.saved ? "طھظ… ط­ظپط¸ ط§ظ„ظ…ظ†طھط¬ط§طھ ظ„ظ„ط¹ظ…ظ„ط§ط،." : "ظ„ظ… ظٹطھظ… ط¶ط¨ط· shared database ط¨ط¹ط¯طŒ ظپط¨ظ‚ظٹ ط§ظ„ط­ظپط¸ ظ…ط­ظ„ظٹط§.",
      products: collectionPayload.data.products,
      saved: saved.saved
    });
  }

  const productPayload = productInputSchema.safeParse(json);

  if (!productPayload.success) {
    return NextResponse.json({ message: "ط¨ظٹط§ظ†ط§طھ ط§ظ„ظ…ظ†طھط¬ ط؛ظٹط± طµط§ظ„ط­ط©." }, { status: 400 });
  }

  const current = await getManagedProducts();
  const nextProduct = productPayload.data;
  const products = current.products.some((product) => product.id === nextProduct.id)
    ? current.products.map((product) => (product.id === nextProduct.id ? nextProduct : product))
    : [nextProduct, ...current.products];

  const saved = await saveManagedProducts(products);

  return NextResponse.json(
    {
      message: saved.saved ? "طھظ… ط­ظپط¸ ط§ظ„ظ…ظ†طھط¬ ظ„ظ„ط¹ظ…ظ„ط§ط،." : "ظ„ظ… ظٹطھظ… ط¶ط¨ط· shared database ط¨ط¹ط¯طŒ ظپط¨ظ‚ظٹ ط§ظ„ط­ظپط¸ ظ…ط­ظ„ظٹط§.",
      product: nextProduct,
      products,
      saved: saved.saved
    },
    { status: 201 }
  );
}

