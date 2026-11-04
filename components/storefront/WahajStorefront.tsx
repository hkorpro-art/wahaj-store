"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Gem,
  Home,
  Menu,
  MessageCircle,
  Settings,
  ShoppingBag,
  Sparkles,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  defaultSiteContent,
  type ManagedCollection,
  type ManagedProduct,
  type SiteContent
} from "@/lib/admin-local";
import { useCart } from "@/lib/cart-context";
import { type ElementContrasts } from "@/lib/contrast";
import BrandMark from "@/components/storefront/BrandMark";
import LifestyleHero from "@/components/storefront/LifestyleHero";
import CircularCollections from "@/components/storefront/CircularCollections";
import NotificationOptIn from "@/components/storefront/NotificationOptIn";
import NotificationForegroundListener from "@/components/storefront/NotificationForegroundListener";
import NotificationSettingsEntry from "@/components/storefront/NotificationSettingsEntry";
import { formatPrice } from "@/lib/data";
import { imageUrl } from "@/lib/imagekit";
import { buildCartMessage, whatsappUrl } from "@/lib/whatsapp";
import type { CartItem, Coupon, Product } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
} as const;

type WahajStorefrontProps = {
  initialProducts: ManagedProduct[];
  initialCollections: ManagedCollection[];
  initialSiteContent: SiteContent;
  initialActiveCoupons: Coupon[];
};

export default function WahajStorefront({
  initialProducts,
  initialCollections,
  initialSiteContent,
  initialActiveCoupons
}: WahajStorefrontProps) {
  const router = useRouter();
  const { cartItems, cartTotal, cartCount, addToCart: contextAddToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [storeProducts, setStoreProducts] = useState<ManagedProduct[]>(initialProducts);
  const [siteContent, setSiteContent] = useState<SiteContent>(initialSiteContent);
  const [activeCoupons, setActiveCoupons] = useState<Coupon[]>(initialActiveCoupons);
  const [query, setQuery] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<{ visible: boolean; productName: string }>({ visible: false, productName: "" });
  const [heroContrasts, setHeroContrasts] = useState<ElementContrasts>({ logo: "dark", menu: "dark", cart: "dark", search: "dark" });

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesVisibility = product.visible !== false;
      const matchesQuery =
        query.trim().length === 0 ||
        product.name.includes(query.trim()) ||
        product.tags.some((tag) => tag.includes(query.trim()));

      return matchesVisibility && matchesQuery;
    });
  }, [storeProducts, query]);

  function handleAddToCart(product: Product) {
    contextAddToCart(product);
    setAddedToast({ visible: true, productName: product.name });
    setTimeout(() => setAddedToast({ visible: false, productName: "" }), 2500);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-wahaj-bg text-wahaj-text luxury-grain luxury-radial-light">
      <NotificationForegroundListener />
      <Header
        cartCount={cartItems.length}
        heroContrasts={heroContrasts}
        onCart={() => router.push("/cart")}
        onMenu={() => setMenuOpen(true)}
      />

      <LifestyleHero
        products={storeProducts}
        onContrastChange={setHeroContrasts}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <OfferBar offers={siteContent.offerMessages} activeCoupons={activeCoupons} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <NotificationOptIn />

        <div id="collections-section">
          <div className="mb-4">
            <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">مجموعات وهاج</p>
            <h2 className="type-section text-wahaj-ink">اختاري بحسب مجموعتك</h2>
          </div>
          <CircularCollections collections={initialCollections} />
        </div>

        <motion.section id="products" {...fadeUp} className="lux-section">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">مختارات وهاج</p>
              <h2 className="type-section text-wahaj-ink">تسوقي من وهاج</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-wahaj-border bg-white/70 px-3 py-1 text-xs text-wahaj-text">
                {filteredProducts.length} قطعة
              </span>
            </div>
          </div>

          <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            <AnimatePresence mode="popLayout">
                {filteredProducts.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  priority={index < 2}
                  loading={index >= 4 ? "lazy" : undefined}
                  onCart={handleAddToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredProducts.length === 0 ? (
            <div className="mt-4 rounded-[8px] border border-dashed border-wahaj-border bg-white/70 p-6 text-center text-sm text-wahaj-text/70">
              لا توجد منتجات مطابقة حالياً. أضيفي منتجاً في Firestore أو غيّري البحث.
            </div>
          ) : null}
        </motion.section>

      </div>

      <BottomNavigation
        cartCount={cartItems.length}
        onCart={() => router.push("/cart")}
      />

      <FloatingWhatsApp items={cartItems} />

      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} collections={initialCollections} />

      <AnimatePresence>
        {addedToast.visible ? (
          <motion.div
            key="cart-toast"
            initial={{ opacity: 0, y: -24, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -16, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className="fixed top-6 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-3 rounded-full liquid-glass-pill px-5 py-2.5 shadow-[0_16px_40px_rgba(45,0,4,0.14)]"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-burgundy text-brand-champagne shadow-xs">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <div className="text-right">
              <p className="text-xs font-extrabold text-brand-burgundy">أضيفت إلى طلبك ✨</p>
              <p className="text-[11px] text-wahaj-text/75 line-clamp-1">{addedToast.productName}</p>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   HEADER — Premium Glass Nav
   ═══════════════════════════════════════════════════════════ */

type HeaderProps = {
  cartCount: number;
  heroContrasts: ElementContrasts;
  onCart: () => void;
  onMenu: () => void;
};

function Header({ cartCount, heroContrasts, onCart, onMenu }: HeaderProps) {
  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6 lg:px-8">
        <button
          aria-label="القائمة الرئيسية"
          onClick={onMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full liquid-glass text-brand-burgundy shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/90"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className="px-4 py-1">
            <BrandMark
              size="md"
              showSubtitle={false}
              className="items-center text-center"
            />
          </Link>
        </div>

        <button
          aria-label="سلة التسوق"
          onClick={onCart}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full liquid-glass text-brand-burgundy shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 hover:bg-white/90"
        >
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 ? <Counter value={cartCount} /> : null}
        </button>
      </div>
    </header>
  );
}

function Counter({ value }: { value: number }) {
  return (
    <motion.span
      key={value}
      initial={{ scale: 1 }}
      animate={{ scale: [1, 1.2, 1] }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-wahaj-rose px-1 text-[11px] font-bold text-white shadow-glow"
    >
      {value}
    </motion.span>
  );
}

/* ═══════════════════════════════════════════════════════════
   OFFER BAR — Animated Marquee
   ═══════════════════════════════════════════════════════════ */

function OfferBar({ offers, activeCoupons }: { offers: string[]; activeCoupons: Coupon[] }) {
  const couponMessages = useMemo(
    () =>
      activeCoupons.map((c) =>
        c.type === "percentage"
          ? `خصم ${c.value}% بكود ${c.code}`
          : `خصم ${c.value} ريال بكود ${c.code}`,
      ),
    [activeCoupons],
  );

  const manualItems = offers.length > 0 ? offers : defaultSiteContent.offerMessages;
  const items = [...manualItems, ...couponMessages];

  return (
    <div className="overflow-hidden border-b border-white/20 bg-white/30 backdrop-blur-sm">
      <div className="offer-marquee flex w-max gap-6 whitespace-nowrap py-2 text-[11px]">
        {[...items, ...items, ...items].map((offer, index) => (
          <span key={`${offer}-${index}`} className="flex items-center gap-1.5 text-wahaj-rose/70">
            <Sparkles className="h-3 w-3 text-wahaj-rose/40" />
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}



/* ═══════════════════════════════════════════════════════════
   PRODUCT CARD — Premium Luxury Card
   ═══════════════════════════════════════════════════════════ */

type ProductCardProps = {
  product: Product;
  priority?: boolean;
  loading?: "lazy" | "eager";
  onCart: (product: Product) => void;
};

function ProductCard({ product, priority, loading, onCart }: ProductCardProps) {
  const [justAdded, setJustAdded] = useState(false);
  const productHref = `/product/${product.slug}`;

  function handleAdd() {
    onCart(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1500);
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.96, y: 14 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.96 }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[20px] border border-white/80 bg-white/90 shadow-[0_4px_20px_rgba(69,0,6,0.05)] transition-all duration-300 hover:shadow-[0_12px_36px_rgba(69,0,6,0.12)] hover:-translate-y-1"
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.3 } }}
    >
      <div>
        <div className="relative">
          <Link href={productHref} className="relative block aspect-[3/4] overflow-hidden bg-wahaj-card">
            <Image
              src={imageUrl(product.images[0], { width: 640, height: 853 })}
              alt={product.name}
              fill
              priority={priority}
              loading={loading}
              sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 via-black/10 to-transparent" />
          </Link>
          <div className="absolute right-2.5 top-2.5 flex flex-wrap gap-1.5">
            {product.badges.slice(0, 2).map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-white/70 bg-white/90 px-2.5 py-0.5 text-[10px] font-bold text-brand-burgundy shadow-sm backdrop-blur-md"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        <div className="p-3.5">
          <Link href={productHref}>
            <h3 className="line-clamp-2 text-sm font-bold leading-snug text-wahaj-ink transition-colors duration-200 group-hover:text-brand-burgundy">
              {product.name}
            </h3>
          </Link>
          <div className="mt-2 flex flex-wrap items-baseline gap-2">
            <p className="text-sm font-extrabold text-brand-burgundy tracking-tight">
              {formatPrice(product.price)}
            </p>
            {product.compareAt ? (
              <p className="text-xs text-wahaj-text/50 line-through">
                {formatPrice(product.compareAt)}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5 pt-0">
        <motion.button
          onClick={handleAdd}
          className={`flex min-h-[42px] w-full items-center justify-center gap-1.5 rounded-full px-3 text-xs font-bold transition-all duration-300 active:scale-[0.96] shadow-sm ${
            justAdded
              ? "bg-brand-burgundy-deep text-brand-champagne shadow-md"
              : "bg-brand-burgundy text-white hover:bg-brand-burgundy-deep hover:shadow-md"
          }`}
          whileTap={{ scale: 0.96 }}
        >
          {justAdded ? (
            <>
              <Check className="h-3.5 w-3.5 text-brand-champagne" />
              <span>أضيفت للطلب ✨</span>
            </>
          ) : (
            <>
              <ShoppingBag className="h-3.5 w-3.5" />
              <span>أضيفي للسلة</span>
            </>
          )}
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOTTOM NAVIGATION — Floating Glass Bar
   ═══════════════════════════════════════════════════════════ */

function BottomNavigation({
  cartCount,
  onCart
}: {
  cartCount: number;
  onCart: () => void;
}) {
  const pathname = usePathname();
  const router = useRouter();

  function scrollToCollections() {
    if (pathname === "/") {
      document.getElementById("collections-section")?.scrollIntoView({ behavior: "smooth" });
    } else {
      router.push("/#collections-section");
    }
  }

  const items = [
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "المجموعات", href: "#", icon: Gem, action: scrollToCollections },
    { label: "السلة", href: "#", icon: ShoppingBag, action: onCart, count: cartCount }
  ];

  return (
    <nav className="fixed safe-bottom left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-around gap-1.5 sm:gap-3 rounded-full liquid-glass-pill px-4 py-1.5 shadow-[0_12px_36px_rgba(45,0,4,0.12)]">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname || (item.href !== "/" && pathname?.startsWith(item.href));
          const content = (
            <div className={`flex min-h-[44px] min-w-[68px] sm:min-w-[76px] flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1 transition-all duration-300 ${
              isActive ? "bg-brand-burgundy/10 text-brand-burgundy font-bold" : "text-wahaj-ink/75 hover:text-brand-burgundy"
            }`}>
              <span className="relative flex h-6 w-6 items-center justify-center">
                <Icon className="h-4 w-4" />
                {item.count ? <Counter value={item.count} /> : null}
              </span>
              <span className="max-w-full truncate text-[11px] leading-tight">
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="transition-transform duration-200 active:scale-95"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="transition-transform duration-200 active:scale-95"
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/* ═══════════════════════════════════════════════════════════
   FLOATING WHATSAPP — Premium CTA
   ═══════════════════════════════════════════════════════════ */

function FloatingWhatsApp({ items }: { items: CartItem[] }) {
  const href =
    items.length > 0
      ? whatsappUrl(buildCartMessage(items))
      : whatsappUrl("مرحبًا وهاج ✨\nأرغب بمعرفة أحدث القطع المتوفرة.");

  function handleClick() {
    fetch("/api/analytics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "whatsapp_click",
        source: "floating_button",
        itemCount: items.length,
        total: items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
        productIds: items.map((i) => i.product.id).join(","),
        productNames: items.map((i) => `${i.product.name} (x${i.quantity})`).join(" | ")
      })
    }).catch(() => {});
  }

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
      onClick={handleClick}
      animate={{ scale: [1, 1.04, 1] }}
      whileHover={{ y: -3, scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ duration: 1, repeat: Infinity, repeatDelay: 7, ease: [0.22, 1, 0.36, 1] }}
      className="fixed bottom-24 left-4 z-30 flex h-13 w-13 items-center justify-center rounded-full bg-wahaj-success text-white shadow-glow"
      aria-label="واتساب وهاج"
    >
      <MessageCircle className="h-6 w-6" fill="currentColor" strokeWidth={1.5} />
    </motion.a>
  );
}



/* ═══════════════════════════════════════════════════════════
   MENU SHEET — Premium Navigation Drawer
   ═══════════════════════════════════════════════════════════ */

function MenuSheet({ open, onClose, collections }: { open: boolean; onClose: () => void; collections: ManagedCollection[] }) {
  const infoLinks = [
    ["من نحن", "/about"],
    ["الأسئلة الشائعة", "/faq"],
    ["سياسة الطلب", "/order-policy"],
    ["سياسة الاستبدال", "/exchange-policy"],
    ["تواصل معنا", "/contact"]
  ];

  const visibleCollections = collections.filter((c) => c.visible);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[75]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-wahaj-ink/25 backdrop-blur-sm" onClick={onClose} aria-label="إغلاق" />
          <motion.aside
            className="glass absolute bottom-0 right-0 top-0 w-[86vw] max-w-sm p-5 overflow-y-auto"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
          >
            <div className="flex items-center justify-between">
              <BrandMark size="md" className="items-start text-right" />
              <button onClick={onClose} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/80 btn-luxury">
                <X className="h-5 w-5" />
              </button>
            </div>

            {visibleCollections.length > 0 ? (
              <>
                <p className="mt-7 mb-2 text-xs font-bold text-wahaj-rose/80">المجموعات</p>
                <div className="space-y-2">
                  {visibleCollections.map((c) => (
                    <Link
                      key={c.id}
                      href={`/collections/${c.slug}`}
                      onClick={onClose}
                      className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white/70 px-4 py-3 font-bold btn-luxury"
                    >
                      {c.name}
                      <ChevronLeft className="h-4 w-4 text-wahaj-rose" />
                    </Link>
                  ))}
                </div>
              </>
            ) : null}

            <p className="mt-5 mb-2 text-xs font-bold text-wahaj-rose/80">وهاج</p>
            <div className="space-y-2">
              {infoLinks.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white/70 px-4 py-3 font-bold btn-luxury"
                >
                  {label}
                  <ChevronLeft className="h-4 w-4 text-wahaj-rose" />
                </Link>
              ))}
            </div>
            <NotificationSettingsEntry />
            <Link
              href="/admin"
              onClick={onClose}
              className="mt-5 flex items-center justify-center gap-1.5 text-wahaj-rose/40 hover:text-wahaj-rose/70 transition-colors"
              aria-label="لوحة التحكم"
            >
              <Settings className="h-4 w-4" />
            </Link>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
