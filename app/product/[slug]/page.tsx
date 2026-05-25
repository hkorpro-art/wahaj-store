import type { Metadata } from "next";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import { products } from "@/lib/data";
import { productCoverUrl } from "@/lib/imagekit";
import { getManagedProducts } from "@/lib/products";

export const dynamic = "force-dynamic";

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug
  }));
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { products: managedProducts } = await getManagedProducts();
  const product = managedProducts.find((item) => matchesProductRoute(item, slug));

  if (!product) {
    return {
      title: "منتج وهاج | WAHAJ",
      description: "تفاصيل المنتج يتم تحديثها مباشرة من Firestore."
    };
  }

  return {
    title: `${product.name} | وهاج`,
    description: product.description,
    openGraph: {
      title: `${product.name} | WAHAJ`,
      description: product.description,
      images: [productCoverUrl(product.images, { width: 1200 })].filter(Boolean)
    }
  };
}

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function matchesProductRoute(product: { id: string; slug: string }, routeSlug: string) {
  const normalizedRoute = normalizeSlug(routeSlug);
  return normalizeSlug(product.slug) === normalizedRoute || normalizeSlug(product.id) === normalizedRoute;
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const { products: managedProducts } = await getManagedProducts();
  const initialProduct =
    managedProducts.find((item) => matchesProductRoute(item, slug) && item.visible !== false) ?? null;
  const initialSimilarProducts = initialProduct
    ? managedProducts.filter((item) => item.visible !== false && item.category === initialProduct.category && item.id !== initialProduct.id).slice(0, 4)
    : [];

  return <ProductDetailClient slug={slug} initialProduct={initialProduct} initialSimilarProducts={initialSimilarProducts} />;
}
