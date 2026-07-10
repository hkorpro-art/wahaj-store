import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { cache } from "react";
import { ChevronRight } from "lucide-react";
import { SITE_URL } from "@/lib/site-config";
import { getManagedCollections } from "@/lib/collection-management";
import { getManagedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/data";
import { imageUrl, productCoverUrl } from "@/lib/imagekit";
import { TrackCollectionVisit } from "@/components/storefront/TrackVisit";
import JsonLd from "@/components/JsonLd";

const getCachedPageData = cache(async () => {
  const [collectionsResult, productsResult] = await Promise.all([
    getManagedCollections(),
    getManagedProducts()
  ]);
  return { collections: collectionsResult.collections, products: productsResult.products };
});

export const revalidate = 300;

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { collections } = await getCachedPageData();
  const routeSlug = normalizeSlug(params.slug);
  const collection = collections.find((c) => normalizeSlug(c.slug) === routeSlug && c.visible !== false);

  if (!collection) {
    return {
      title: "المجموعة غير موجودة | وهاج",
      description: "المجموعة المطلوبة غير متوفرة حالياً في متجر وهاج."
    };
  }

  const ogImage = collection.image
    ? imageUrl(collection.image, { width: 1200, height: 630 })
    : undefined;

  const description = (collection.description || `تصفحي تشكيلة ${collection.name} المميزة والراقية من متجر وهاج للزركون الفاخر.`).length > 160
    ? (collection.description || `تصفحي تشكيلة ${collection.name} المميزة والراقية من متجر وهاج للزركون الفاخر.`).slice(0, 157) + "..."
    : (collection.description || `تصفحي تشكيلة ${collection.name} المميزة والراقية من متجر وهاج للزركون الفاخر.`);

  return {
    title: collection.name,
    description,
    keywords: [`${collection.name}`, "وهاج", "WAHAJ", "إكسسوارات نسائية", "مجموعة مجوهرات", "زركون فاخر", "تشكيلة راقية"],
    openGraph: {
      title: `${collection.name} | وهاج`,
      description: collection.description || `تصفحي تشكيلة ${collection.name} من وهاج.`,
      url: `${SITE_URL}/collections/${collection.slug}`,
      type: "website",
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${collection.name} | وهاج`,
      description: collection.description || `تصفحي تشكيلة ${collection.name} من وهاج.`,
      images: ogImage ? [ogImage] : []
    },
    alternates: {
      canonical: `${SITE_URL}/collections/${collection.slug}`
    }
  };
}

export default async function CollectionPage(props: Props) {
  const params = await props.params;
  const { collections, products } = await getCachedPageData();
  const routeSlug = normalizeSlug(params.slug);

  const collection = collections.find((c) => normalizeSlug(c.slug) === routeSlug && c.visible !== false);

  if (!collection) {
    notFound();
  }

  const collectionProducts = products.filter(
    (product) =>
      product.visible !== false &&
      product.categoryIds &&
      product.categoryIds.includes(collection.id)
  );

  // Also include products from linkedProducts
  const linkedProducts = products.filter(
    (product) =>
      product.visible !== false &&
      collection.linkedProducts.includes(product.id) &&
      !collectionProducts.includes(product)
  );

  const allProducts = [...collectionProducts, ...linkedProducts];

  const collectionImage = collection.image
    ? imageUrl(collection.image, { width: 1200 })
    : null;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "الرئيسية", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: collection.name, item: `${SITE_URL}/collections/${collection.slug}` }
          ]
        }}
      />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: collection.name,
          description: collection.description || `تصفحي تشكيلة ${collection.name} من وهاج.`,
          url: `${SITE_URL}/collections/${collection.slug}`,
          ...(collectionImage ? { image: collectionImage } : {}),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: allProducts.map((product, index) => ({
              "@type": "ListItem",
              position: index + 1,
              url: `${SITE_URL}/product/${product.slug}`
            }))
          }
        }}
      />
      <main className="min-h-screen bg-wahaj-bg pb-28 text-wahaj-text luxury-grain">
      <TrackCollectionVisit collectionId={collection.id} collectionName={collection.name} />
      <div className="relative overflow-hidden border-b border-wahaj-border bg-white/40 pb-12 pt-8 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-wahaj-text/60" dir="rtl">
            <Link href="/" className="hover:text-wahaj-rose transition">الرئيسية</Link>
            <ChevronRight className="h-3.5 w-3.5 text-wahaj-text/40" />
            <span className="text-wahaj-ink font-semibold">{collection.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-wahaj-border bg-white/80 p-1 shadow-soft">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <Image
                  src={collection.image ? imageUrl(collection.image, { width: 224, height: 224 }) : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=224&q=80"}
                  alt={collection.name}
                  fill
                  sizes="112px"
                  className="object-cover"
                />
              </div>
            </div>

            <div className="text-center md:text-right flex-1">
              <h1 className="font-thmanyah-display text-3xl font-medium text-wahaj-ink">{collection.name}</h1>
              {collection.description ? (
                <p className="mt-2 text-sm leading-relaxed text-wahaj-text/75 max-w-2xl">{collection.description}</p>
              ) : (
                <p className="mt-2 text-sm text-wahaj-text/50">اكتشفي مجموعة مختارة من تفاصيل الزركون الفاخرة.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4" dir="rtl">
          <p className="text-xs font-bold text-wahaj-rose/80">تشكيلة {collection.name}</p>
          <span className="rounded-full border border-wahaj-border bg-white/70 px-3 py-1 text-xs text-wahaj-text">
            {allProducts.length} قطعة
          </span>
        </div>

        {allProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" dir="rtl">
            {allProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="group overflow-hidden rounded-[8px] border border-wahaj-border bg-white/70 shadow-sm transition hover:shadow-soft hover:bg-white"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <Image
                    src={productCoverUrl(item.images, { width: 440, height: 550 }) || "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=440&q=80"}
                    alt={item.name}
                    fill
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  {item.badges && item.badges.length > 0 ? (
                    <div className="absolute bottom-2 right-2 flex gap-1">
                      {item.badges.map((b) => (
                        <span key={b} className="rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-wahaj-rose shadow-sm">
                          {b}
                        </span>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="p-3.5 text-right">
                  <p className="line-clamp-2 min-h-10 text-sm font-bold text-wahaj-ink group-hover:text-wahaj-rose transition duration-300">{item.name}</p>
                  <p className="type-product-price mt-2 font-medium text-brand-burgundy">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[8px] border border-dashed border-wahaj-border bg-white/40 p-12 text-center text-sm text-wahaj-text/60" dir="rtl">
            لا توجد منتجات متوفرة في هذه المجموعة حالياً. ترقبي مجموعاتنا الفاخرة قريباً.
          </div>
        )}
      </div>
    </main>
    </>
  );
}
