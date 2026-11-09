"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ChevronDown, Gem, RefreshCw, Share2, ShieldCheck, ShoppingBag, Sparkles, Tag, Truck } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { ManagedProduct, SiteContent } from "@/lib/admin-local";
import { imageUrl, productCoverUrl, resolveImageSrc } from "@/lib/imagekit";
import { whatsappUrl } from "@/lib/whatsapp";
import { formatPrice, getProductCode } from "@/lib/data";
import { ProductCard } from "@/components/storefront/ProductCard";

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

function formatPriceRiyal(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)} ريال`;
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
  const [hasInteracted, setHasInteracted] = useState(false);
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
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [slug]);

  useEffect(() => {
    if (initialProduct) {
      setProduct({
        ...initialProduct,
        images: normalizeProductImages(initialProduct.images)
      });
      setSimilarProducts(initialSimilarProducts);
      setColor(initialProduct.colors[0] ?? "");
      setSize(initialProduct.sizes[0] ?? "");
      setSelectedImageIndex(0);
      setHasInteracted(false);
    }
  }, [slug, initialProduct, initialSimilarProducts]);

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
    if (!product || product.images.length <= 1 || reducedMotion || hasInteracted) return;
    const timer = setInterval(() => {
      setSelectedImageIndex((i) => (i + 1) % product.images.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [product, reducedMotion, hasInteracted]);

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

    const code = getProductCode(product);
    const link = window.location.href;
    let message = `مرحبًا وهاج ✨\nأود طلب القطعة التالية:\n\n${product.name} (#${code})\n`;
    if (color) message += `اللون: ${color}\n`;
    if (size) message += `المقاس: ${size}\n`;
    message += "الكمية: 1\n";
    message += `السعر: ${formatPrice(product.price)}\n\n`;
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
          className="relative w-full overflow-hidden bg-wahaj-card" onTouchStart={() => setHasInteracted(true)} onPointerDown={() => setHasInteracted(true)}
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
                  onClick={() => { setSelectedImageIndex(index); setHasInteracted(true); }}
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
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="font-sans font-black text-3xl sm:text-4xl text-[#450006] tracking-tight tabular-nums">
                  {new Intl.NumberFormat("en-US").format(product.price)}
                </span>
                <span className="text-sm sm:text-base font-black text-[#7A1D28]">
                  ريال
                </span>
              </div>
              {product.compareAt ? (
                <div className="mt-1 flex items-baseline justify-end gap-1">
                  <span className="text-sm sm:text-base font-semibold text-neutral-400 line-through tabular-nums">
                    {new Intl.NumberFormat("en-US").format(product.compareAt)} ريال
                  </span>
                </div>
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

        {/* ─── OPTIONS: Tactile Apple Swatches ─── */}
        {hasAnyOption ? (
          <section className="mt-5 divide-y divide-neutral-200/50">

            {product.colors.length > 0 ? (
              <div className="py-3.5">
                <p className="mb-2.5 text-xs font-bold tracking-wider text-[#2A1215]/80">اختاري اللون</p>
                <div className="flex flex-wrap gap-2.5">
                  {product.colors.map((option) => {
                    const isSelected = color === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setColor(option)}
                        className={`flex min-h-10 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "border-brand-burgundy bg-brand-burgundy/10 text-brand-burgundy shadow-xs ring-1 ring-brand-burgundy/30 scale-[1.02]"
                            : "border-neutral-200/80 bg-white/80 text-[#2A1215]/80 hover:border-neutral-300"
                        }`}
                      >
                        <span
                          className="h-4 w-4 rounded-full border border-black/10 shadow-xs"
                          style={{ background: colorMap[option] || "#F3D6D9" }}
                        />
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {product.sizes.length > 0 ? (
              <div className="py-3.5">
                <p className="mb-2.5 text-xs font-bold tracking-wider text-[#2A1215]/80">اختاري المقاس</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((option) => {
                    const isSelected = size === option;
                    return (
                      <button
                        key={option}
                        onClick={() => setSize(option)}
                        className={`min-h-10 rounded-full border px-4 py-1.5 text-xs font-bold transition-all duration-200 active:scale-95 ${
                          isSelected
                            ? "border-brand-burgundy bg-brand-burgundy text-white shadow-xs scale-[1.02]"
                            : "border-neutral-200/80 bg-white/80 text-[#2A1215]/80 hover:border-neutral-300"
                        }`}
                      >
                        {option}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

          </section>
        ) : null}

        {/* ─── PURCHASE ACTIONS & APPLE TRUST BADGES ─── */}
        <section className="mt-6 space-y-3">
          <button
            onClick={handleDirectCheckout}
            className="flex min-h-[54px] w-full items-center justify-center gap-2 rounded-full bg-brand-burgundy px-4 font-bold text-white shadow-[0_8px_24px_rgba(69,0,6,0.22)] transition-all hover:bg-brand-burgundy-deep active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5 shrink-0 text-brand-champagne" />
            <span className="truncate text-base">اطلبي الآن مباشرة</span>
          </button>
          <div className="flex gap-2">
            <button
              onClick={addTouch}
              className="flex min-h-[50px] flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300/80 bg-white/90 px-4 font-bold text-[#2A1215] shadow-xs transition-all hover:bg-white active:scale-[0.98]"
            >
              <ShoppingBag className="h-5 w-5 shrink-0 text-brand-burgundy" />
              <span>{added ? "أضيفت للطلب ✨" : "أضيفي للسلة"}</span>
            </button>
            <button
              onClick={handleShare}
              className="flex min-h-[50px] w-[50px] shrink-0 items-center justify-center rounded-full border border-neutral-200/80 bg-white/80 text-[#2A1215] transition-all hover:bg-white active:scale-95 shadow-xs"
              aria-label="مشاركة القطعة"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </section>

        {/* ─── ACCORDION: Apple Inset Grouped ─── */}
        <section className="mt-5 overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/85 shadow-[0_2px_12px_rgba(69,0,6,0.03)] divide-y divide-neutral-100">
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
              <div key={id}>
                <button
                  onClick={() => setOpenAccordion(isOpen ? null : id)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-sm font-bold text-[#2A1215] transition-colors hover:bg-neutral-50/80 active:bg-neutral-100/60"
                  aria-expanded={isOpen}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-brand-burgundy/8 text-brand-burgundy">
                      <Icon className="h-3.5 w-3.5" />
                    </span>
                    <span>{title}</span>
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 text-neutral-400 transition-transform duration-300 ${
                      isOpen ? "rotate-180 text-brand-burgundy" : ""
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
                      transition={{ duration: reducedMotion ? 0 : 0.25, ease: "easeInOut" }}
                      className="overflow-hidden bg-neutral-50/50"
                    >
                      <div className="border-t border-neutral-100 px-4 py-3 text-xs leading-6 text-neutral-600">
                        {content}
                      </div>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            );
          })}
        </section>

        {/* ─── RELATED PRODUCTS (Luxury Apple Grid) ─── */}
        {similarProducts.length > 0 ? (
          <section className="mt-10 border-t border-neutral-200/60 pt-8">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-thmanyah-display text-xl font-bold text-[#2A1215]">قد يعجبك أيضاً</h2>
                <p className="text-xs text-neutral-500">قطع فاخرة منتقاة بعناية تليق باختيارك</p>
              </div>
              <span className="rounded-full bg-wahaj-soft px-3 py-1 text-xs font-bold text-brand-burgundy">
                {similarProducts.length} قطعة
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {similarProducts.map((item) => (
                <ProductCard
                  key={item.id}
                  product={item}
                  onCart={addToCart}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>

      {/* ─── APPLE HIG MOBILE STICKY BUY BAR ─── */}
      {product ? (
        <div className="fixed safe-bottom inset-x-4 z-40 mx-auto max-w-md md:hidden">
          <div className="flex items-center justify-between gap-3 rounded-full liquid-glass-pill px-4 py-2 shadow-[0_16px_40px_rgba(45,0,4,0.14)]">
            <div className="min-w-0 flex-1 pr-1 text-right">
              <p className="truncate text-xs font-bold text-wahaj-ink">{product.name}</p>
              <p className="font-sans text-sm font-black text-[#450006] tracking-tight tabular-nums">
                {new Intl.NumberFormat("en-US").format(product.price)} <span className="text-xs font-black text-[#7A1D28]">ريال</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={addTouch}
                className="flex h-11 w-11 items-center justify-center rounded-full bg-wahaj-soft text-brand-burgundy transition-transform active:scale-90"
                aria-label="أضيفي للسلة"
              >
                <ShoppingBag className="h-4 w-4" />
              </button>
              <button
                onClick={handleDirectCheckout}
                className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-brand-burgundy px-5 text-xs font-bold text-white shadow-sm transition-transform active:scale-95"
              >
                <Sparkles className="h-4 w-4 text-brand-champagne" />
                <span>اطلبي الآن</span>
              </button>
            </div>
          </div>
        </div>
      ) : null}

    </main>
  );
}
