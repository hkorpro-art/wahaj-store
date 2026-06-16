"use client";

import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import { ArrowRight, ChevronDown, Heart, Maximize2, Minus, Share2, ShoppingBag, Sparkles, Star, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePostHog } from "posthog-js/react";
import { useCart } from "@/lib/cart-context";
import type { ManagedProduct } from "@/lib/admin-local";
import { formatPrice } from "@/lib/data";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import TrustStrip from "@/components/storefront/TrustStrip";
import { imageUrl, productCoverUrl, resolveImageSrc } from "@/lib/imagekit";
import { FIRESTORE_PRODUCTS_COLLECTION, rowSortOrder, rowToManagedProduct } from "@/lib/product-record";
import { whatsappUrl } from "@/lib/whatsapp";

type ProductDetailClientProps = {
  slug: string;
  initialProduct: ManagedProduct | null;
  initialSimilarProducts: ManagedProduct[];
  parentCategory?: { name: string; slug: string };
};

function normalizeSlug(value: string) {
  try {
    return decodeURIComponent(value).trim().toLowerCase();
  } catch {
    return value.trim().toLowerCase();
  }
}

function matchesProductRoute(product: ManagedProduct, routeSlug: string) {
  const normalizedRoute = normalizeSlug(routeSlug);
  return (
    normalizeSlug(product.slug) === normalizedRoute ||
    normalizeSlug(product.id) === normalizedRoute
  );
}

function normalizeProductImages(images: ManagedProduct["images"] | unknown): ManagedProduct["images"] {
  if (!Array.isArray(images)) {
    const single = resolveImageSrc(images);
    return single ? [{ url: single, fileId: "" }] : [];
  }

  return images
    .map((image) => {
      const url = resolveImageSrc(image);
      if (!url) {
        return null;
      }

      if (typeof image === "object" && image !== null && "fileId" in image) {
        const fileId = (image as { fileId?: unknown }).fileId;
        return { url, fileId: typeof fileId === "string" ? fileId : "" };
      }

      return { url, fileId: "" };
    })
    .filter((image): image is { url: string; fileId: string } => Boolean(image));
}

const colorMap: Record<string, string> = {
  "روز قولد": "#B76E79",
  فضي: "#DDE2E8",
  ذهبي: "#E0B56A",
  "ذهبي ناعم": "#D8A48F",
  لؤلؤي: "#F7EFEA"
};

export default function ProductDetailClient({ slug, initialProduct, initialSimilarProducts, parentCategory }: ProductDetailClientProps) {
  const posthog = usePostHog();
  const [product, setProduct] = useState<ManagedProduct | null>(
    initialProduct
      ? {
          ...initialProduct,
          images: normalizeProductImages(initialProduct.images)
        }
      : null
  );
  const [similarProducts, setSimilarProducts] = useState<ManagedProduct[]>(initialSimilarProducts);
  const [liveResolved, setLiveResolved] = useState(!isFirebaseClientConfigured || !db);
  const [selectedImage, setSelectedImage] = useState(
    initialProduct ? productCoverUrl(initialProduct.images, { width: 1200 }) : ""
  );
  const [fullscreen, setFullscreen] = useState(false);
  const [color, setColor] = useState(initialProduct?.colors[0] ?? "");
  const [size, setSize] = useState(initialProduct?.sizes[0] ?? "");
  const [quantity, setQuantity] = useState(1);
  const [inspired, setInspired] = useState(false);
  const [added, setAdded] = useState(false);
  const [careOpen, setCareOpen] = useState(false);

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

        const nextProduct = liveProducts.find((item) => matchesProductRoute(item, slug)) ?? null;

        setProduct((current) => {
          if (nextProduct) {
            return {
              ...nextProduct,
              images: normalizeProductImages(nextProduct.images)
            };
          }

          return current;
        });
        setSimilarProducts(
          nextProduct
            ? liveProducts
                .filter((item) => item.category === nextProduct.category && item.id !== nextProduct.id)
                .slice(0, 4)
                .map((item) => ({ ...item, images: normalizeProductImages(item.images) }))
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

    setSelectedImage(productCoverUrl(product.images, { width: 1200 }));
    setColor(product.colors[0] ?? "");
    setSize(product.sizes[0] ?? "");

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product_view", productId: product.id, productName: product.name })
    }).catch(() => {});

    posthog?.capture("product_view", {
      product_id: product.id,
      product_name: product.name,
      $current_url: window.location.href,
    });
  }, [product, posthog]);

  const { addToCart } = useCart();

  function addTouch() {
    if (!product) return;
    addToCart(product);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  function handleDirectCheckout(e: React.MouseEvent) {
    e.preventDefault();
    if (!product) return;

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "whatsapp_click", productId: product.id, productName: product.name, source: "product_detail" })
    }).catch(() => {});

    posthog?.capture("whatsapp_click", {
      product_id: product.id,
      product_name: product.name,
      source: "product_detail",
      $current_url: window.location.href,
    });

    const link = window.location.href;
    let message = `مرحباً وهاج ✨\nأرغب بطلب القطعة التالية:\n\nالمنتج: ${product.name}\n`;
    if (color) message += `اللون: ${color}\n`;
    if (size) message += `المقاس: ${size}\n`;
    message += `الكمية: ${quantity}\n\n`;
    message += `رابط القطعة: ${link}`;

    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");
  }

  async function handleShare() {
    if (navigator.share && product) {
      try {
        await navigator.share({
          title: product.name,
          text: `ألقِ نظرة على ${product.name} من وهاج ✨`,
          url: window.location.href
        });
      } catch (err) {
        console.log("Share failed", err);
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert("تم نسخ الرابط!");
    }
  }

  if (!product && !liveResolved) {
    return (
      <main className="min-h-screen bg-wahaj-bg px-4 py-16 text-wahaj-text">
        <div className="mx-auto max-w-xl rounded-[8px] border border-wahaj-border bg-white/75 p-6 text-center shadow-soft">
          <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">WAHAJ Live</p>
          <h1 className="mt-3 font-thmanyah-display text-3xl font-medium text-wahaj-ink">جاري تحميل المنتج...</h1>
        </div>
      </main>
    );
  }

  const galleryImages = normalizeProductImages(product?.images);
  const coverImage = product ? productCoverUrl(galleryImages, { width: 1200 }) : "";

  if (!product || galleryImages.length === 0 || !coverImage) {
    return (
      <main className="min-h-screen bg-wahaj-bg px-4 py-16 text-wahaj-text">
        <div className="mx-auto max-w-xl rounded-[8px] border border-wahaj-border bg-white/75 p-6 text-center shadow-soft">
          <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">WAHAJ Live</p>
          <h1 className="mt-3 font-thmanyah-display text-3xl font-medium text-wahaj-ink">المنتج غير متوفر حالياً</h1>
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
            {parentCategory ? (
              <nav className="mb-0.5 flex items-center justify-center gap-1 text-xs text-wahaj-text/60" dir="rtl">
                <Link href="/" className="hover:text-wahaj-rose transition">الرئيسية</Link>
                <ChevronDown className="h-3 w-3 -rotate-90 text-wahaj-text/40" />
                <Link href={`/category/${parentCategory.slug}`} className="hover:text-wahaj-rose transition">{parentCategory.name}</Link>
                <ChevronDown className="h-3 w-3 -rotate-90 text-wahaj-text/40" />
              </nav>
            ) : null}
            <p className="truncate font-thmanyah-text text-lg font-medium text-wahaj-ink">{product.name}</p>
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
              src={selectedImage || coverImage}
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
            {galleryImages.map((image, index) => {
              const thumbSrc = imageUrl(image, { width: 160, height: 160 }) || image?.url || "";
              const fullSrc = imageUrl(image, { width: 1200 }) || image?.url || "";
              const isSelected = selectedImage === thumbSrc || selectedImage === fullSrc;

              if (!thumbSrc) {
                return null;
              }

              return (
                <button
                  key={`${image?.url || "image"}-${index}`}
                  onClick={() => setSelectedImage(fullSrc)}
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
                <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">قطعة مختارة</p>
                <h1 className="mt-1 font-thmanyah-display text-3xl font-medium leading-tight text-wahaj-ink sm:text-4xl">
                  {product.name}
                </h1>
              </div>
              <div className="flex items-center gap-1 rounded-full bg-white/80 px-3 py-1 text-wahaj-stars">
                <Star className="h-4 w-4" fill="currentColor" />
                <span className="text-sm font-bold">{product.rating}</span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-end gap-3">
              <p className="type-product-price text-3xl font-medium text-brand-burgundy">{formatPrice(product.price)}</p>
              {product.compareAt ? (
                <p className="pb-1 text-sm text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p>
              ) : null}
            </div>
            {product.showScarcity && product.scarcityText ? (
              <p className="mt-1 font-thmanyah-text text-sm text-wahaj-rose/80">{product.scarcityText}</p>
            ) : null}
            <p className="mt-4 leading-8 text-wahaj-text/78">{product.description}</p>
            <TrustStrip />
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
                  className={`flex min-h-11 items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${
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
                  className={`min-h-11 rounded-full border px-4 text-sm font-bold ${
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
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-wahaj-border"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-8 text-center font-thmanyah-text text-xl font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity((value) => value + 1)}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-wahaj-border"
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
            <div className="flex gap-2">
              <button
                onClick={handleDirectCheckout}
                className="flex-1 flex min-h-[52px] items-center justify-center gap-2 rounded-full bg-wahaj-rose px-5 py-3 font-bold text-white shadow-glow"
              >
                <Sparkles className="h-5 w-5" />
                اطلبي الان ✨
              </button>
              <button
                onClick={handleShare}
                className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-wahaj-rose bg-wahaj-soft text-wahaj-rose transition hover:bg-wahaj-rose hover:text-white"
                aria-label="مشاركة القطعة"
              >
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="mt-4 rounded-[8px] border border-wahaj-border bg-white/76 shadow-soft">
            <button
              onClick={() => setCareOpen((o) => !o)}
              className="flex w-full items-center justify-between p-4 font-bold text-wahaj-ink"
            >
              <span>تفاصيل القطعة والعناية بها</span>
              <ChevronDown className={`h-5 w-5 text-wahaj-rose transition-transform duration-300 ${careOpen ? "rotate-180" : ""}`} />
            </button>
            <AnimatePresence>
              {careOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-wahaj-border/50 p-4 pt-2 text-sm leading-7 text-wahaj-text/80">
                    <p>للحفاظ على بريق الزركون ولمعة القطعة الفاخرة لأطول فترة ممكنة:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      <li>تجنبي تعريض القطعة للعطور أو المواد الكيميائية مباشرة.</li>
                      <li>احفظيها في علبتها الأصلية بعيداً عن الرطوبة.</li>
                      <li>نظفي القطعة بلطف باستخدام المنديل المرفق بعد كل استخدام.</li>
                    </ul>
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </section>
      </div>

      <section className="mx-auto mt-8 max-w-6xl px-4 md:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">تقييمات وهاج</p>
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
            <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">قد تناسبك</p>
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
                    src={productCoverUrl(item.images, { width: 440, height: 550 }) || "/favicon.ico"}
                    alt={item.name}
                    fill
                    sizes="220px"
                    className="object-cover"
                  />
                </div>
                <div className="p-3">
                  <p className="line-clamp-2 min-h-10 text-sm font-bold text-wahaj-ink">{item.name}</p>
                  <p className="type-product-price mt-2 font-medium text-brand-burgundy">{formatPrice(item.price)}</p>
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
              <Image src={selectedImage || coverImage} alt={product.name} fill sizes="90vw" className="object-contain" />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}
