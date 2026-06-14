import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { getManagedCategories } from "@/lib/category-management";
import { getManagedProducts } from "@/lib/products";
import { formatPrice } from "@/lib/data";
import { imageUrl, productCoverUrl } from "@/lib/imagekit";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const { categories } = await getManagedCategories();
  const category = categories.find((c) => c.slug === params.slug && c.visible !== false);

  if (!category) {
    return {
      title: "التصنيف غير موجود | وهاج",
      description: "التصنيف المطلوب غير متوفر حالياً في متجر وهاج."
    };
  }

  const ogImage = category.image
    ? imageUrl(category.image, { width: 1200, height: 630 })
    : undefined;

  return {
    title: `${category.name} | متجر وهاج للزركون الفاخر`,
    description: category.description || `تصفحي تشكيلة ${category.name} المميزة والراقية من متجر وهاج للزركون الفاخر.`,
    openGraph: {
      title: `${category.name} | WAHAJ`,
      description: category.description || `تصفحي تشكيلة ${category.name} من وهاج.`,
      url: `https://wahaj.store/category/${category.slug}`,
      images: ogImage ? [{ url: ogImage, width: 1200, height: 630 }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: `${category.name} | WAHAJ`,
      description: category.description || `تصفحي تشكيلة ${category.name} من وهاج.`,
      images: ogImage ? [ogImage] : []
    },
    alternates: {
      canonical: `https://wahaj.store/category/${category.slug}`
    }
  };
}

export default async function CategoryPage(props: Props) {
  const params = await props.params;
  const [{ categories }, { products }] = await Promise.all([
    getManagedCategories(),
    getManagedProducts()
  ]);

  const category = categories.find((c) => c.slug === params.slug && c.visible !== false);

  if (!category) {
    notFound();
  }

  // Filter products belonging to this category
  // A product belongs to the category if its categoryIds array contains the category's ID
  const categoryProducts = products.filter(
    (product) =>
      product.visible !== false &&
      product.categoryIds &&
      product.categoryIds.includes(category.id)
  );

  return (
    <main className="min-h-screen bg-wahaj-bg pb-28 text-wahaj-text luxury-grain">
      {/* Premium Category Header */}
      <div className="relative overflow-hidden border-b border-wahaj-border bg-white/40 pb-12 pt-8 backdrop-blur-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-wahaj-text/60" dir="rtl">
            <Link href="/" className="hover:text-wahaj-rose transition">الرئيسية</Link>
            <ChevronRight className="h-3.5 w-3.5 text-wahaj-text/40" />
            <span className="text-wahaj-ink font-semibold">{category.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">
            {/* Category Image */}
            <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-full border border-wahaj-border bg-white/80 p-1 shadow-soft">
              <div className="relative h-full w-full overflow-hidden rounded-full">
                <img
                  src={category.image ? imageUrl(category.image, { width: 224, height: 224 }) : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=224&q=80"}
                  alt={category.name}
                  className="h-full w-full object-cover"
                />
              </div>
            </div>

            {/* Category Meta */}
            <div className="text-center md:text-right flex-1">
              <h1 className="font-thmanyah-display text-3xl font-medium text-wahaj-ink">{category.name}</h1>
              {category.description ? (
                <p className="mt-2 text-sm leading-relaxed text-wahaj-text/75 max-w-2xl">{category.description}</p>
              ) : (
                <p className="mt-2 text-sm text-wahaj-text/50">اكتشفي مجموعة مختارة من تفاصيل الزركون الفاخرة.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid Section */}
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between gap-4" dir="rtl">
          <p className="text-xs font-bold text-wahaj-rose/80">تشكيلة {category.name}</p>
          <span className="rounded-full border border-wahaj-border bg-white/70 px-3 py-1 text-xs text-wahaj-text">
            {categoryProducts.length} قطعة
          </span>
        </div>

        {categoryProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" dir="rtl">
            {categoryProducts.map((item) => (
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
            لا توجد منتجات متوفرة في هذا التصنيف حالياً. ترقبي عروضنا الفاخرة قريباً.
          </div>
        )}
      </div>
    </main>
  );
}
