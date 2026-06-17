import type { Metadata } from "next";
import { SITE_URL } from "@/lib/site-config";
import ProductDetailClient from "@/components/storefront/ProductDetailClient";
import JsonLd from "@/components/JsonLd";
import { imageUrl, productCoverUrl } from "@/lib/imagekit";
import { getManagedProducts } from "@/lib/products";
import { seedCategories } from "@/lib/categories";
import type { Collection } from "@/lib/types";

const legacyCategoryToId: Record<string, string> = {
  sets: "atqam",
  earrings: "aqrat",
  bracelets: "asawir"
};

function findProductCategory(product: { category: string; categoryIds?: string[] }): Collection | undefined {
  const id = product.categoryIds?.[0] ?? legacyCategoryToId[product.category];
  return id ? seedCategories.find((c) => c.id === id && c.visible) : undefined;
}

export const revalidate = 300;

type ProductPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const ogImage = productCoverUrl(product.images, { width: 1200 });

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} | وهاج`,
      description: product.description,
      url: `${SITE_URL}/product/${product.slug}`,
      type: "website",
      images: ogImage
        ? [{ url: ogImage, width: 1200, height: 1500 }]
        : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | وهاج`,
      description: product.description,
      images: ogImage ? [ogImage] : []
    },
    alternates: {
      canonical: `${SITE_URL}/product/${product.slug}`
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
    ? managedProducts.filter((item) => item.visible !== false && item.category === initialProduct.category && item.id !== initialProduct.id).slice(0, 3)
    : [];

  const productCategory = initialProduct ? findProductCategory(initialProduct) : undefined;

  const breadcrumbItems = productCategory
    ? [
        { "@type": "ListItem" as const, position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem" as const, position: 2, name: productCategory.name, item: `${SITE_URL}/category/${productCategory.slug}` },
        { "@type": "ListItem" as const, position: 3, name: initialProduct?.name || "المنتج", item: `${SITE_URL}/product/${slug}` }
      ]
    : [
        { "@type": "ListItem" as const, position: 1, name: "الرئيسية", item: SITE_URL },
        { "@type": "ListItem" as const, position: 2, name: initialProduct?.name || "المنتج", item: `${SITE_URL}/product/${slug}` }
      ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: breadcrumbItems
        }}
      />
      {initialProduct ? (
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Product",
            name: initialProduct.name,
            description: initialProduct.description,
            image: initialProduct.images.map((img) =>
              imageUrl(img, { width: 1200 })
            ).filter(Boolean),
            brand: {
              "@type": "Brand",
              name: "WAHAJ"
            },
            offers: {
              "@type": "Offer",
              price: initialProduct.price,
              priceCurrency: "YER",
              availability: initialProduct.inventoryStatus === "نفد"
                ? "https://schema.org/OutOfStock"
                : initialProduct.inventoryStatus === "منخفض"
                  ? "https://schema.org/LimitedAvailability"
                  : "https://schema.org/InStock",
              url: `${SITE_URL}/product/${initialProduct.slug}`
            },
            ...(initialProduct.rating > 0 && initialProduct.reviews > 0
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: initialProduct.rating,
                    reviewCount: initialProduct.reviews
                  }
                }
              : {}),
            ...(initialProduct.colors.length > 0 ? { color: initialProduct.colors.join(", ") } : {}),
            ...(initialProduct.material ? { material: initialProduct.material } : {})
          }}
        />
      ) : null}
      <ProductDetailClient
        slug={slug}
        initialProduct={initialProduct}
        initialSimilarProducts={initialSimilarProducts}
        parentCategory={productCategory ? { name: productCategory.name, slug: productCategory.slug } : undefined}
      />
    </>
  );
}
