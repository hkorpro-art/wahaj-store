"use client";

import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowRight, Heart, Maximize2, Minus, ShoppingBag, Sparkles, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ManagedProduct } from "@/lib/admin-local";
import { formatPrice } from "@/lib/data";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { imageUrl } from "@/lib/imagekit";
import { FIRESTORE_PRODUCTS_COLLECTION, rowSortOrder, rowToManagedProduct } from "@/lib/product-record";
import { buildSingleProductMessage, whatsappUrl } from "@/lib/whatsapp";

type ProductDetailClientProps = {
  slug: string;
  initialProduct: ManagedProduct | null;
  initialSimilarProducts: ManagedProduct[];
};

const colorMap: Record<string, string> = {
  "روز قولد": "#B76E79",
  فضي: "#DDE2E8",
  ذهبي: "#E0B56A",
  "ذهبي ناعم": "#D8A48F",
  لؤلؤي: "#F7EFEA"
};

export default function ProductDetailClient({ slug, initialProduct, initialSimilarProducts }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ManagedProduct | null>(initialProduct);
  const [similarProducts, setSimilarProducts] = useState<ManagedProduct[]>(initialSimilarProducts);
  const [liveResolved, setLiveResolved] = useState(!isFirebaseClientConfigured || !db);
  const [selectedImage, setSelectedImage] = useState(
    initialProduct?.images[0] ? imageUrl(initialProduct.images[0], { width: 1200 }) : ""
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [color, setColor] = useState(initialProduct?.colors[0] ?? "");
  const [size, setSize] = useState(initialProduct?.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [inspired, setInspired] = useState(false);
  const [added, setAdded] = useState(false);

  const checkoutUrl = useMemo(
    () => (product ? whatsappUrl(buildSingleProductMessage(product, quantity, { color, size })) : "#"),
    [product, quantity, color, size]
  );

  useEffect(() => {
    if (!db || !isFirebaseClientConfigured) {
      return;
    }

    const unsubscribe = onSnapshot(
      collection(db, FIRESTORE_PRODUCTS_COLLECTION),
      (snapshot) => {
        const liveProducts = snapshot.docs
          .map((doc, index) => {
            const data = doc.data() as Record<string, unknown>;
            return {
              sortOrder: rowSortOrder(data, index),
              product: rowToManagedProduct({ id: doc.id, ...data })
            };
          })
          .filter((item) => item.product)
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map((item) => item.product as ManagedProduct)
          .filter((item) => item.visible !== false);

        const nextProduct = liveProducts.find((item) => item.slug === slug) ?? null;

        setProduct(nextProduct);
        setSimilarProducts(
          nextProduct
            ? liveProducts.filter((item) => item.category === nextProduct.category && item.id !== nextProduct.id).slice(0, 4)
            : []
        );
        setLiveResolved(true);
      },
      () => {
        setLiveResolved(true);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  useEffect(() => {
    if (!product) {
      return;
    }

    setSelectedImage(product.images[0] ? imageUrl(product.images[0], { width: 1200 }) : "");
    setColor(product.colors[0] ?? "");
    setSize(product.sizes[0] ?? "");
  }, [product]);

  function addTouch() {
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  if (!product && !liveResolved) {
    return (
      <main className="min-h-screen bg-wahaj-bg px-4 py-16 text-wahaj-text">
        <div className="mx-auto max-w-xl rounded-[8px] border border-wahaj-border bg-white/75 p-6 text-center shadow-soft">
          <p className="font-thmanyah text-sm font-medium text-wahaj-rose">WAHAJ Live</p>
          <h1 className="mt-3 font-display text-3xl font-medium text-wahaj-ink">جاري تحميل المنتج...</h1>
        </div>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-wahaj-bg px-4 py-16 text-wahaj-text">
        <div className="mx-auto max-w-xl rounded-[8px] border border-wahaj-border bg-white/75 p-6 text-center shadow-soft">
          <p className="font-thmanyah text-sm font-medium text-wahaj-rose">WAHAJ Live</p>
          <h1 className="mt-3 font-display text-3xl font-medium text-wahaj-ink">المنتج غير متوفر حالياً</h1>
          <p className="mt-3 text-sm leading-7 text-wahaj-text/72">
            إذا كان المنتج قد أُزيل من Firestore فستختفي صفحته مباشرة من العرض الحي.
          </p>
          <Link
            href="/"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full bg-wahaj-ink px-5 text-sm font-bold text-white"
          >
            العودة إلى المتجر
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-wahaj-bg pb-28 text-wahaj-text">
      <header className="sticky top-0 z-40 border-b border-wahaj-border/70 bg-wahaj-bg/76 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <Link
            href="/"
            className="glass flex h-11 w-11 items-center justify-center rounded-full text-wahaj-rose"
            aria-label="العودة"
          >
            <ArrowRight className="h-5 w-5" />
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate font-thmanyah text-lg font-medium text-wahaj-ink">{product.name}</p>
            <p className="text-xs text-wahaj-rose">WAHAJ Detail</p>
          </div>
          <button
            onClick={() => setInspired((value) => !value)}
            className={`glass flex h-11 w-11 items-center justify-center rounded-full ${
              inspired ? "bg-wahaj-rose text-white" : "text-wahaj-rose"
            }`}
            aria-label="احفظي للإلهام"
          >
            <Heart className="h-5 w-5" fill={inspired ? "currentColor" : "none"} />
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-5 px-4 pt-4 md:grid-cols-[1.06fr_.94fr] md:px-6 lg:px-8">
        <section>
          <motion.div
            layout
            className="relative aspect-[4/5] overflow-hidden rounded-[8px] border border-wahaj-border bg-wahaj-card shadow-satin md:aspect-[1/1]"
          >
            <Image
              src={selectedImage}
              alt={product.name}
              fill
              priority
              sizes="(min-width: 768px) 52vw, 100vw"
              className="object-cover transition duration-700 hover:scale-110"
            />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-wahaj-ink/38 to-transparent" />
            <button
              onClick={() => setFullscreen(true)}
              className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/78 text-wahaj-rose backdrop-blur-xl"
              aria-label="عرض كامل"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 right-4 flex gap-1">
              {product.badges.map((badge) => (
                <span key={badge} className="rounded-full bg-white/82 px-3 py-1 text-xs font-bold text-wahaj-rose">
                  {badge}
                </span>
              ))}
            </div>
          </motion.div>

          <div className="mt-3 flex gap-3 overflow-x-auto pb-1 hide-scrollbar">
            {product.images.map((image) => {
              const thumbSrc = imageUrl(image, { width: 160, height: 160 });
              const isSelected = selectedImage === thumbSrc || selectedImage === imageUrl(image, { width: 1200 });

              return (
                <button
                  key={image.url}
                  onClick={() => setSelectedImage(imageUrl(image, { width: 1200 }))}
                  className={`relative h-20 w-20 shrink-0 overflow-hidden rounded-[8px] border ${
                    isSelected ? "border-wahaj-rose shadow-glow" : "border-wahaj-border"
                  }`}
                >
                  <Image src={thumbSrc} alt={product.name} fill sizes="80px" className="object-cover" />
                </button>
              );
            })}
          </div>
        </section>

        <section className="space-y-4">
          <div className="satin-surface rounded-[8px] border border-wahaj-border p-4 shadow-soft md:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-thmanyah text-sm font-medium text-wahaj-rose">قطعة مختارة</p>
                <h1 className="mt-1 font-display text-3xl font-medium leading-tight text-wahaj-ink sm:text-4xl">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-wahaj-stars">
                <Star className="h-4 w-4" fill="currentColor" />
                <span className="text-sm font-bold">{product.rating}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <p className="font-thmanyah text-3xl font-bold text-wahaj-rose">{formatPrice(product.price)}</p>
              {product.compareAt ? (
                <p className="pb-1 text-sm text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p>
              ) : null}
            </div>
            <p className="mt-4 leading-8 text-wahaj-text/78">{product.description}</p>
            <p className="mt-3 rounded-[8px] bg-white/70 p-3 text-sm leading-7 text-wahaj-text/74">
              {product.material}
            </p>
          </div>

          <div className="rounded-[8px] border border-wahaj-border bg-white/76 p-4 shadow-soft">
            <p className="mb-3 font-bold text-wahaj-ink">اختاري اللون</p>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((option) => (
                <button
                  key={option}
                  onClick={() => setColor(option)}
                  className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${
                    color === option ? "border-wahaj-rose bg-wahaj-soft text-wahaj-rose" : "border-wahaj-border"
                  }`}
                >
                  <span
                    className="h-5 w-5 rounded-full border border-white shadow-soft"
                    style={{ background: colorMap[option] || "#F3D6D9" }}
                  />
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-wahaj-border bg-white/76 p-4 shadow-soft">
            <p className="mb-3 font-bold text-wahaj-ink">اختاري المقاس</p>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => (
                <button
                  key={option}
                  onClick={() => setSize(option)}
                  className={`min-h-10 rounded-full border px-4 text-sm font-bold ${
                    size === option ? "border-wahaj-rose bg-wahaj-rose text-white" : "border-wahaj-border bg-white/70"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-[8px] border border-wahaj-border bg-white/76 p-4 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <p className="font-bold text-wahaj-ink">الكمية</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity((value) => Math.max(1, value - 1))}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-wahaj-border"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-thmanyah text-xl font-bold">{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-wahaj-border"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={addTouch}
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-wahaj-ink px-5 py-3 font-bold text-white shadow-soft"
            >
              <ShoppingBag className="h-5 w-5" />
              {added ? "تمت إضافة لمستك" : "أضيفي لمستك ✨"}
            </button>
            <a
              href={checkoutUrl}
              target="_blank"
              rel="noreferrer"
              className="flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-wahaj-rose px-5 py-3 font-bold text-white shadow-glow"
            >
              <Sparkles className="h-5 w-5" />
              احجزي الآن ✨
            </a>
          </div>
        </section>
      </div>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-thmanyah text-sm font-medium text-wahaj-rose">تقييمات وهاج</p>
            <h2 className="type-section text-wahaj-ink">لمعة وصلت لعميلاتنا</h2>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {["التغليف راق جدًا واللمعة مثل الصورة.", "وصلت بسرعة، قطعة ناعمة وتناسب كل شيء.", "تفاصيل الزركون فاخرة وهادئة."].map(
            (review) => (
              <div key={review} className="rounded-[8px] border border-wahaj-border bg-white/76 p-4 shadow-soft">
                <div className="flex text-wahaj-stars">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className="h-4 w-4" fill="currentColor" />
                  ))}
                </div>
                <p className="mt-3 text-sm leading-7 text-wahaj-text/78">{review}</p>
              </div>
            )
          )}
        </div>
      </section>

      {similarProducts.length > 0 ? (
        <section className="mx-auto mt-8 max-w-6xl px-4 md:px-6 lg:px-8">
          <div className="mb-4">
            <p className="font-thmanyah text-sm font-medium text-wahaj-rose">قد تناسبك</p>
            <h2 className="type-section text-wahaj-ink">منتجات مشابهة</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {similarProducts.map((item) => (
              <Link
                key={item.id}
                href={`/product/${item.slug}`}
                className="overflow-hidden rounded-[8px] border border-wahaj-border bg-white/76 shadow-soft"
              >
                <div className="relative aspect-[4/5]">
                  <Image
                    src={imageUrl(item.images[0], { width: 440, height: 550 })}
                    alt={item.name}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-10 text-sm font-bold text-wahaj-ink">{item.name}</p>
                  <p className="mt-2 text-sm font-bold text-wahaj-rose">{formatPrice(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <AnimatePresence>
        {fullscreen ? (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-wahaj-ink/88 p-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              onClick={() => setFullscreen(false)}
              className="absolute left-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/84 text-wahaj-rose"
              aria-label="إغلاق"
            >
              <X className="h-5 w-5" />
            </button>
            <motion.div
              className="relative h-[86vh] w-full max-w-3xl overflow-hidden rounded-[8px] bg-wahaj-card"
              initial={{ scale: 0.94 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.96 }}
            >
              <Image src={selectedImage} alt={product.name} fill sizes="90vw" className="object-contain" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
