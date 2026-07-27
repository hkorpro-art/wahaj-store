"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Gem, RefreshCw, Share2, ShoppingBag, Sparkles, Tag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ManagedProduct, SiteContent } from "@/lib/admin-local";
import { imageUrl, productCoverUrl, resolveImageSrc } from "@/lib/imagekit";
import { whatsappUrl } from "@/lib/whatsapp";

type ProductDetailClientProps = {
  slug: string;
  initialProduct: ManagedProduct | null;
  initialSimilarProducts: ManagedProduct[];
  parentCategory?: { name: string; slug: string };
  siteContentDefaults: SiteContent;
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

const accordionConfig = [
  { id: "details", title: "تفاصيل القطعة", Icon: Sparkles },
  { id: "care", title: "العناية بالقطعة", Icon: Gem },
  { id: "shipping", title: "الشحن والتوصيل", Icon: Truck },
  { id: "returns", title: "الاستبدال والاسترجاع", Icon: RefreshCw }
];

function isVideoUrl(url: string) {
  return /\.(mp4|webm|mov|avi)$/i.test(url) || url.includes("video");
}

function formatPriceLatin(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} YER`;
}

export default function ProductDetailClient({ slug, initialProduct, initialSimilarProducts, siteContentDefaults }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ManagedProduct | null>(
    initialProduct
      ? {
          ...initialProduct,
          images: normalizeProductImages(initialProduct.images)
        }
      : null
  );
  const [similarProducts, setSimilarProducts] = useState<ManagedProduct[]>(initialSimilarProducts);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [color, setColor] = useState(initialProduct?.colors[0] ?? "");
  const [size, setSize] = useState(initialProduct?.sizes[0] ?? "");
  const [added, setAdded] = useState(false);
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (!product) {
      return;
    }

    setColor(product.colors[0] ?? "");
    setSize(product.sizes[0] ?? "");
    setSelectedImageIndex(0);

    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: "product_view", productId: product.id, productName: product.name })
    }).catch(() => {});

  }, [product?.id]);

  useEffect(() => {
    if (!product || product.images.length <= 1 || reducedMotion) return;
    const timer = setInterval(() => {
      setSelectedImageIndex((i) => (i + 1) % product.images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [product, reducedMotion]);

  const { addToCart, cartCount } = useCart();

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

    const link = window.location.href;
    let message = `مرحباً وهاج ✨\nأرغب بطلب القطعة التالية:\n\nالمنتج: ${product.name}\n`;
    if (color) message += `اللون: ${color}\n`;
    if (size) message += `المقاس: ${size}\n`;
    message += "الكمية: 1\n\n";
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
        if (err instanceof Error && err.name !== "AbortError") {
          await navigator.clipboard.writeText(window.location.href);
        }
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  }

  const galleryImages = useMemo(() => normalizeProductImages(product?.images), [product?.images]);
  const coverImage = useMemo(() => product ? productCoverUrl(galleryImages, { width: 1200 }) : "", [product, galleryImages]);

  if (!product || galleryImages.length === 0 || !coverImage) {
    return (
      <main className="min-h-screen bg-wahaj-bg px-4 py-16 text-wahaj-text">
        <div className="mx-auto max-w-xl rounded-[8px] border border-wahaj-border bg-white/75 p-6 text-center shadow-soft">
          <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">WAHAJ Live</p>
          <h1 className="mt-3 font-thmanyah-display text-3xl font-medium text-wahaj-ink">المنتج غير متوفر حالياً</h1>
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

  const hasAnyOption = product.colors.length > 0 || product.sizes.length > 0;

  return (
    <main className="min-h-screen bg-wahaj-bg text-wahaj-text">
      {/* ─── HEADER: Back + Name + Cart ─── */}
      <header className="sticky top-0 z-40 border-b border-wahaj-border/50 bg-wahaj-bg/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-lg items-center px-4 py-3">
          <Link
            href="/"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-wahaj-ink/60 transition hover:bg-wahaj-soft/40 hover:text-wahaj-ink"
            aria-label="العودة"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="min-w-0 flex-1 truncate text-center">
            <span className="block truncate px-2 font-thmanyah-text text-base font-bold text-wahaj-ink">
              {product?.name || "المنتج"}
            </span>
          </div>
          <Link
            href="/cart"
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-wahaj-ink/60 transition hover:bg-wahaj-soft/40 hover:text-wahaj-ink"
            aria-label="السلة"
          >
            <ShoppingBag className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-wahaj-rose px-1 text-[10px] font-bold text-white">
                {cartCount > 9 ? "9+" : cartCount}
              </span>
            ) : null}
          </Link>
        </div>
      </header>

      {/* ─── PRODUCT HERO ─── */}
      <section className="relative">
        <div
          className="relative w-full overflow-hidden bg-wahaj-card"
          style={{ height: "55vh", minHeight: "420px", maxHeight: "660px" }}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0 : 0.5, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              {isVideoUrl(galleryImages[selectedImageIndex]?.url || "") ? (
                <video
                  src={galleryImages[selectedImageIndex]?.url}
                  className="h-full w-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={imageUrl(galleryImages[selectedImageIndex], { width: 1200 }) || galleryImages[selectedImageIndex]?.url || ""}
                  alt={product.name}
                  fill
                  priority
                  fetchPriority="high"
                  sizes="100vw"
                  className="object-cover"
                />
              )}
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-wahaj-ink/6 to-transparent" />
        </div>

        {/* Thumbnails */}
        {galleryImages.length > 1 ? (
          <div className="flex justify-center gap-2 overflow-x-auto px-4 pb-1 pt-3 hide-scrollbar">
            {galleryImages.map((image, index) => {
              const thumbSrc = imageUrl(image, { width: 80, height: 80 }) || image?.url || "";
              const isSelected = index === selectedImageIndex;
              const isVideo = isVideoUrl(image?.url || "");

              if (!thumbSrc) return null;

              return (
                <button
                  key={`${image?.url || "image"}-${index}`}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`relative h-14 w-14 shrink-0 overflow-hidden rounded-[6px] border transition-all duration-300 ${
                    isSelected
                      ? "border-wahaj-rose ring-1 ring-wahaj-rose/30 scale-105"
                      : "border-wahaj-border/60 opacity-60 hover:opacity-100"
                  }`}
                >
                  {isVideo ? (
                    <div className="relative h-full w-full">
                      <Image src={thumbSrc} alt={product.name} fill sizes="56px" className="object-cover" />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <span className="text-white text-xs">▶</span>
                      </div>
                    </div>
                  ) : (
                    <Image src={thumbSrc} alt={product.name} fill sizes="56px" className="object-cover" />
                  )}
                </button>
              );
            })}
          </div>
        ) : null}
      </section>

      {/* ─── CONTENT ─── */}
      <div className="mx-auto max-w-lg px-4 pb-8">

        {/* ─── PRODUCT INFO ─── */}
        <section className="mt-7">
          {/* Name + Price row */}
          <div className="flex items-start justify-between gap-4">
            <h1 className="min-w-0 flex-1 font-thmanyah-display text-3xl font-bold leading-tight text-wahaj-ink">
              {product.name}
            </h1>
            <div className="shrink-0 text-left">
              <p className="font-thmanyah-display text-2xl font-semibold leading-none text-[#5A222A]">
                {formatPriceLatin(product.price)}
              </p>
              {product.compareAt ? (
                <p className="mt-1 text-sm font-medium leading-none text-[#A15C64]/60 line-through">
                  {formatPriceLatin(product.compareAt)}
                </p>
              ) : null}
            </div>
          </div>

          {/* Brand */}
          {product.brand ? (
            <div className="mt-4">
              <span className="inline-flex items-center gap-1.5 text-sm font-bold text-wahaj-rose">
                <Tag className="h-4 w-4" />
                <span>{product.brand}</span>
              </span>
            </div>
          ) : null}

          {/* Description */}
          <p className="mt-3 leading-7 text-wahaj-text/78 line-clamp-2 text-base">
            {product.description}
          </p>
        </section>

        {/* ─── OPTIONS ─── */}
        {hasAnyOption ? (
          <section className="mt-5 divide-y divide-wahaj-border/40">

            {product.colors.length > 0 ? (
              <div className="py-3.5">
                <p className="mb-2.5 text-sm font-bold text-wahaj-ink">اختاري اللون</p>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((option) => (
                    <button
                      key={option}
                      onClick={() => setColor(option)}
                      className={`flex min-h-10 items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-bold transition-all duration-200 ${
                        color === option
                          ? "border-wahaj-rose bg-wahaj-rose/8 text-wahaj-rose"
                          : "border-wahaj-border/60 text-wahaj-text hover:border-wahaj-rose/40"
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-white/70 shadow-sm"
                        style={{ background: colorMap[option] || "#F3D6D9" }}
                      />
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            {product.sizes.length > 0 ? (
              <div className="py-3.5">
                <p className="mb-2.5 text-sm font-bold text-wahaj-ink">اختاري المقاس</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((option) => (
                    <button
                      key={option}
                      onClick={() => setSize(option)}
                      className={`min-h-10 rounded-full border px-4 py-1.5 text-sm font-bold transition-all duration-200 ${
                        size === option
                          ? "border-wahaj-rose bg-wahaj-rose text-white"
                          : "border-wahaj-border/60 bg-white/70 text-wahaj-text hover:border-wahaj-rose/40"
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

          </section>
        ) : null}

        {/* ─── PURCHASE ACTIONS ─── */}
        <section className="mt-6 space-y-3">
          <p className="whitespace-nowrap text-center font-thmanyah-text text-[14px] text-wahaj-text/60 sm:text-[15px]">
            فحص قبل التسليم • دفع عند الاستلام • استبدال واسترجاع
          </p>
          <button
            onClick={handleDirectCheckout}
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-full bg-wahaj-rose px-4 font-bold text-white shadow-glow transition-transform active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5 shrink-0" />
            <span className="truncate">اطلبي الآن</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={addTouch}
              className="flex min-h-[52px] flex-1 items-center justify-center gap-2 rounded-full bg-wahaj-ink px-4 font-bold text-white shadow-sm transition-transform active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5 shrink-0" />
              {added ? "تمت ✓" : "أضيفي للسلة"}
            </button>
            <button
              onClick={handleShare}
              className="flex min-h-[52px] w-[52px] shrink-0 items-center justify-center rounded-full border border-wahaj-rose/50 bg-wahaj-soft/60 text-wahaj-rose transition hover:bg-wahaj-rose hover:text-white"
              aria-label="مشاركة القطعة"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* ─── ACCORDION ─── */}
        <section className="mt-4 space-y-2">
          {accordionConfig.map(({ id, title, Icon }) => {
            const contentMap: Record<string, string> = {
              details: product.accordionDetails || siteContentDefaults.accordionDetails,
              care: product.accordionCare || siteContentDefaults.accordionCare,
              shipping: product.accordionShipping || siteContentDefaults.accordionShipping,
              returns: product.accordionReturns || siteContentDefaults.accordionReturns
            };
            const content = contentMap[id];
            const isOpen = openAccordion === id;

            return (
              <div key={id} className="border-b border-wahaj-border/30">
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-base font-bold text-wahaj-ink transition-colors hover:bg-wahaj-soft/30"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5">
                    <Icon className="h-4 w-4 text-wahaj-rose/70" />
                    <span>{title}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-wahaj-rose/60 transition-transform duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="content"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: reducedMotion ? 0 : 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-wahaj-border/30 px-4 py-3.5 text-sm leading-7 text-wahaj-text/80">
                        {content}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* ─── RELATED PRODUCTS ─── */}
        {similarProducts.length > 0 ? (
          <section className="mt-8">
            <div className="mb-4">
              <h2 className="font-thmanyah-display text-xl font-medium text-wahaj-ink">قد يعجبك أيضاً</h2>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {similarProducts.slice(0, 3).map((item) => (
                <Link
                  key={item.id}
                  href={`/product/${item.slug}`}
                  className="group overflow-hidden rounded-[8px] border border-wahaj-border/60 bg-white/70 shadow-sm transition-shadow hover:shadow-glow"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Image
                      src={productCoverUrl(item.images, { width: 440, height: 550 }) || "/favicon.ico"}
                      alt={item.name}
                      fill
                      sizes="(max-width: 640px) 50vw, 33vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-10 text-sm font-bold text-wahaj-ink">{item.name}</p>
                    <p className="mt-1 font-thmanyah-text text-sm font-medium text-brand-burgundy">{formatPriceLatin(item.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>


    </main>
  );
}
