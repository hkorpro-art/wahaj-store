"use client";

import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import {
  ChevronLeft,
  ChevronRight,
  Gem,
  Home,
  Menu,
  MessageCircle,
  Minus,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePostHog } from "posthog-js/react";
import {
  adminStorageKeys,
  defaultSiteContent,
  type ManagedProduct,
  type SiteContent
} from "@/lib/admin-local";
import { useCart } from "@/lib/cart-context";
import { type ElementContrasts } from "@/lib/contrast";
import BrandMark from "@/components/storefront/BrandMark";
import LifestyleHero from "@/components/storefront/LifestyleHero";
import CircularCollections from "@/components/storefront/CircularCollections";
import { seedCollections } from "@/lib/collections";
import { seedCategories } from "@/lib/categories";
import CircularCategoryNav from "@/components/storefront/CircularCategoryNav";
import { formatPrice, products } from "@/lib/data";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { imageUrl } from "@/lib/imagekit";
import { FIRESTORE_PRODUCTS_COLLECTION, rowSortOrder, rowToManagedProduct } from "@/lib/product-record";
import { buildCartMessage, whatsappUrl } from "@/lib/whatsapp";
import type { CartItem, Product } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
} as const;

const seedManagedProducts = products.map((product) => ({ ...product, visible: true }));

export default function WahajStorefront() {
  const posthog = usePostHog();
  const { cartItems, cartTotal, cartCount, addToCart: contextAddToCart, updateQuantity, removeFromCart, clearCart } = useCart();
  const [storeProducts, setStoreProducts] = useState<ManagedProduct[]>(seedManagedProducts);
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [query, setQuery] = useState("");
  const prevQuery = useRef("");
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [addedToast, setAddedToast] = useState<{ visible: boolean; productName: string }>({ visible: false, productName: "" });
  const [heroContrasts, setHeroContrasts] = useState<ElementContrasts>({ logo: "dark", menu: "dark", cart: "dark", search: "dark" });

  useEffect(() => {
    let active = true;

    async function loadStoreProducts() {
      try {
        const response = await fetch(`/api/products?refresh=${Date.now()}`, { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (active && response.ok && Array.isArray(payload?.products)) {
          setStoreProducts(payload.products as ManagedProduct[]);
          return;
        }
      } catch {
        if (active) {
          setStoreProducts(seedManagedProducts);
        }
      }
    }

    const unsubscribeProducts =
      db && isFirebaseClientConfigured
        ? onSnapshot(
            collection(db, FIRESTORE_PRODUCTS_COLLECTION),
            (snapshot) => {
              if (!active) return;
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
                .map((item) => item.product as ManagedProduct);
              setStoreProducts(liveProducts);
            },
            () => { void loadStoreProducts(); }
          )
        : null;

    if (!unsubscribeProducts) {
      void loadStoreProducts();
    }

    try {
      const savedContent = window.localStorage.getItem(adminStorageKeys.content);
      if (savedContent) {
        setSiteContent({ ...defaultSiteContent, ...(JSON.parse(savedContent) as SiteContent) });
      }
    } catch {
      setSiteContent(defaultSiteContent);
    }

    return () => {
      active = false;
      unsubscribeProducts?.();
    };
  }, []);

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

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed && trimmed !== prevQuery.current) {
      posthog?.capture("search", { query: trimmed, $current_url: window.location.href });
    }
    prevQuery.current = trimmed;
  }, [query, posthog]);

  function handleCartCheckout() {
    openWhatsAppForCart("", "", false, "");
  }

  function handleAddToCart(product: Product) {
    contextAddToCart(product);
    setCartOpen(true);
    setAddedToast({ visible: true, productName: product.name });
    setTimeout(() => setAddedToast({ visible: false, productName: "" }), 2500);
  }

  async function openWhatsAppForCart(customerName: string, customerPhone: string, isGift: boolean, giftMessage: string) {
    if (cartItems.length === 0) return;

    const order = {
      customer: customerName,
      phone: customerPhone,
      products: cartItems.map((item) => `${item.product.name} (x${item.quantity})`),
      total: cartTotal,
      notes: isGift ? `تغليف إهداء: ${giftMessage}` : "طلب عادي",
      isGift,
      giftMessage
    };

    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (err) {
      console.error("Failed to save order to Firestore:", err);
    }

    for (const item of cartItems) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp_click", productId: item.product.id, productName: item.product.name, source: "cart_checkout" })
      }).catch(() => {});

      posthog?.capture("whatsapp_click", { product_id: item.product.id, product_name: item.product.name, source: "cart_checkout", $current_url: window.location.href });
    }

    let message = buildCartMessage(cartItems);
    message = message.replace("الاسم:", `الاسم: ${customerName}`);
    if (isGift) {
      message = message.replace("ملاحظات:", `ملاحظات: إرسال كهدية وتغليف فاخر 🎁\nرسالة الإهداء: "${giftMessage}"`);
    }
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");

    clearCart();
    setCartOpen(false);
  }

  return (
    <main className="min-h-screen overflow-hidden bg-wahaj-bg text-wahaj-text luxury-grain luxury-radial-light">
      <Header
        cartCount={cartItems.length}
        heroContrasts={heroContrasts}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />

      <LifestyleHero
        products={storeProducts}
        onContrastChange={setHeroContrasts}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <OfferBar offers={siteContent.offerMessages} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">

        <div id="collections-section">
          <div className="mb-4">
            <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">مجموعات وهاج</p>
            <h2 className="type-section text-wahaj-ink">اختاري بحسب مجموعتك</h2>
          </div>
          <CircularCollections />
        </div>

        <CircularCategoryNav />

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
        onCart={() => setCartOpen(true)}
      />

      <FloatingWhatsApp items={cartItems} />

      <CartSheet
        open={cartOpen}
        items={cartItems}
        total={cartTotal}
        products={storeProducts}
        onClose={() => setCartOpen(false)}
        onQty={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={handleCartCheckout}
      />

      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />

      <AnimatePresence>
        {addedToast.visible ? (
          <motion.div
            key="cart-toast"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="fixed bottom-28 left-1/2 z-[80] -translate-x-1/2 rounded-2xl border border-wahaj-border/60 bg-white/90 px-5 py-3 text-center shadow-satin backdrop-blur-xl"
          >
            <p className="text-sm font-bold text-wahaj-ink">✨ أضيفت إلى طلبك</p>
            <p className="mt-0.5 text-xs text-wahaj-text/70 line-clamp-1">{addedToast.productName}</p>
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
  const menuIsDark = heroContrasts.menu === "dark";
  const logoIsDark = heroContrasts.logo === "dark";
  const cartIsDark = heroContrasts.cart === "dark";

  const menuBg = menuIsDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)";
  const menuBorder = menuIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)";
  const menuColor = menuIsDark ? "#FFFFFF" : "#450006";
  const menuHoverBg = menuIsDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)";

  const cartBg = cartIsDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)";
  const cartBorder = cartIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)";
  const cartColor = cartIsDark ? "#FFFFFF" : "#450006";
  const cartHoverBg = cartIsDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)";

  const logoColor = logoIsDark ? "#FFFFFF" : "#450006";
  const logoShadow = logoIsDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]" : "";

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <button
          aria-label="القائمة"
          onClick={onMenu}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: menuBg, color: menuColor, border: `1px solid ${menuBorder}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = menuHoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = menuBg; }}
        >
          <Menu className="h-[18px] w-[18px]" />
        </button>

        <div className="flex flex-1 items-center justify-center">
          <Link href="/" className={`px-4 py-1 ${logoShadow}`}>
            <BrandMark
              size="md"
              showSubtitle={false}
              className="items-center text-center"
            />
          </Link>
        </div>

        <button
          aria-label="السلة"
          onClick={onCart}
          className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: cartBg, color: cartColor, border: `1px solid ${cartBorder}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cartHoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = cartBg; }}
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          {cartCount > 0 ? <Counter value={cartCount} /> : null}
        </button>
      </div>
      <style>{`
        .wahaj-brand-wordmark { color: ${logoColor} !important; text-shadow: ${logoIsDark ? "0 2px 10px rgba(0,0,0,0.25)" : "none"} !important; }
      `}</style>
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

function OfferBar({ offers }: { offers: string[] }) {
  const items = offers.length > 0 ? offers : defaultSiteContent.offerMessages;

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
  onCart: (product: Product) => void;
};

function ProductCard({ product, priority, onCart }: ProductCardProps) {
  const productHref = `/product/${product.slug}`;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group overflow-hidden rounded-xl border border-wahaj-border/50 bg-white/85 shadow-[0_2px_16px_rgba(69,0,6,0.05)] transition-all duration-400 hover:shadow-[0_8px_30px_rgba(69,0,6,0.10)]"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.3 } }}
    >
      <div className="relative">
        <Link href={productHref} className="relative block aspect-[3/4] overflow-hidden bg-wahaj-card">
          <Image
            src={imageUrl(product.images[0], { width: 640, height: 853 })}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/30 to-transparent" />
        </Link>
        <div className="absolute right-2 top-2 flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/85 px-2 py-0.5 text-[10px] font-bold text-wahaj-rose shadow-sm backdrop-blur-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3">
        <Link href={productHref}>
          <h3 className="line-clamp-2 text-sm font-bold leading-snug text-wahaj-ink transition-colors duration-300 group-hover:text-wahaj-rose">{product.name}</h3>
        </Link>
        <div className="mt-1.5 flex items-center gap-1 text-[11px] text-wahaj-stars">
          <Star className="h-3.5 w-3.5" fill="currentColor" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-wahaj-text/55">({product.reviews})</span>
        </div>
        <div className="mt-1.5 flex flex-wrap items-end gap-2">
          <p className="text-sm font-semibold text-brand-burgundy">{formatPrice(product.price)}</p>
          {product.compareAt ? (
            <p className="text-[11px] text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p>
          ) : null}
        </div>
        <motion.button
          onClick={() => onCart(product)}
          className="mt-2.5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-full bg-wahaj-ink px-3 text-xs font-bold text-white transition-all duration-300 hover:bg-wahaj-rose active:scale-[0.97]"
          whileTap={{ scale: 0.97 }}
        >
          <ShoppingBag className="h-3.5 w-3.5" />
          أضيفي للسلة
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
    <nav className="fixed bottom-7 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center justify-around gap-3 rounded-full border border-wahaj-border/40 bg-white/70 px-5 py-1.5 shadow-[0_4px_20px_rgba(69,0,6,0.06)] backdrop-blur-xl transition-all duration-300">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = item.href === pathname || (item.href !== "/" && pathname?.startsWith(item.href));
          const content = (
            <>
              <span
                className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-300 ${
                  isActive ? "bg-wahaj-rose/10 text-wahaj-rose" : "text-wahaj-ink"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.count ? <Counter value={item.count} /> : null}
              </span>
              <span
                className={`max-w-full truncate transition-colors duration-300 ${
                  isActive ? "text-[10px] font-bold text-wahaj-rose" : "text-[10px] font-medium text-wahaj-text/60"
                }`}
              >
                {item.label}
              </span>
            </>
          );

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className="flex min-w-0 flex-col items-center justify-center gap-0.5 rounded-full px-3 py-1 transition-all duration-300 hover:scale-105 active:scale-95"
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
  const posthog = usePostHog();
  const href =
    items.length > 0
      ? whatsappUrl(buildCartMessage(items))
      : whatsappUrl("مرحبًا وهاج ✨\nأرغب بمعرفة أحدث القطع المتوفرة.");

  function handleClick() {
    for (const item of items) {
      fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "whatsapp_click", productId: item.product.id, productName: item.product.name, source: "floating_button" })
      }).catch(() => {});

      posthog?.capture("whatsapp_click", { product_id: item.product.id, product_name: item.product.name, source: "floating_button", $current_url: window.location.href });
    }
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
   CART SHEET — Luxury Slide-in Cart
   ═══════════════════════════════════════════════════════════ */

type CartSheetProps = {
  open: boolean;
  items: CartItem[];
  total: number;
  products: ManagedProduct[];
  onClose: () => void;
  onQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
};

function CartSheet({ open, items, total, products, onClose, onQty, onRemove, onCheckout }: CartSheetProps) {
  const cartProductIds = useMemo(() => new Set(items.map((i) => i.product.id)), [items]);

  const suggested = useMemo(() => {
    return products
      .filter((p) => p.visible !== false && !cartProductIds.has(p.id))
      .slice(0, 2);
  }, [products, cartProductIds]);

  const totalQty = items.reduce((s, i) => s + i.quantity, 0);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[70] bg-wahaj-bg"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 250, mass: 0.8 }}
        >
          {items.length === 0 ? (
            /* ── Empty State: flex centering ── */
            <div className="flex h-full flex-col">
              <div className="flex shrink-0 items-center justify-between border-b border-wahaj-border/40 bg-white/90 px-4 py-3">
                <button
                  onClick={onClose}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-wahaj-soft/60 text-wahaj-ink transition-all duration-200 active:scale-90 hover:bg-wahaj-soft"
                  aria-label="العودة للتسوق"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="flex items-center gap-2">
                  <span className="font-display text-lg font-medium text-wahaj-ink">طلبك الناعم ✨</span>
                </div>
                <div className="w-10" />
              </div>
              <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 text-center">
                <div className="mb-5 rounded-full bg-wahaj-soft/60 p-4">
                  <ShoppingBag className="h-8 w-8 text-wahaj-rose" />
                </div>
                <p className="font-display text-xl font-medium text-wahaj-ink">✨ لم تختاري لمستك بعد</p>
                <p className="mt-2 text-sm leading-6 text-wahaj-text/70">
                  اكتشفي قطعاً صُممت لتضيئي بها لحظاتك
                </p>
                <button
                  onClick={onClose}
                  className="mt-6 flex min-h-11 items-center justify-center rounded-full bg-wahaj-ink px-8 text-sm font-bold text-white transition-all duration-300 hover:bg-wahaj-rose"
                >
                  استكشفي المجموعة
                </button>
              </div>
            </div>
          ) : (
            /* ── Non-empty: natural flow with sticky top bar + checkout ── */
            <div className="h-full overflow-y-auto">
              <div className="sticky top-0 z-10 border-b border-wahaj-border/40 bg-white/90 px-4 py-3 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <button
                    onClick={onClose}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-wahaj-soft/60 text-wahaj-ink transition-all duration-200 active:scale-90 hover:bg-wahaj-soft"
                    aria-label="العودة للتسوق"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                  <div className="flex items-center gap-2">
                    <span className="font-display text-lg font-medium text-wahaj-ink">طلبك الناعم ✨</span>
                    <span className="rounded-full bg-wahaj-rose/10 px-2.5 py-0.5 text-xs font-bold text-wahaj-rose">
                      {totalQty}
                    </span>
                  </div>
                  <div className="w-10" />
                </div>
              </div>

              <div className="px-4 pt-4 pb-4 space-y-3">
                <p className="font-thmanyah-text text-xs font-medium text-wahaj-text/60">
                  طلبك الناعم • {totalQty} {totalQty === 1 ? "قطعة مختارة" : "قطع مختارة"} ✨
                </p>

                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.product.id}
                      layout
                      initial={{ opacity: 0, x: -30, scale: 0.96 }}
                      animate={{ opacity: 1, x: 0, scale: 1 }}
                      exit={{ opacity: 0, x: 30, scale: 0.96 }}
                      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                      className="flex gap-4 rounded-2xl border border-wahaj-border/50 bg-white/85 p-4 shadow-[0_2px_12px_rgba(69,0,6,0.06)]"
                    >
                      <div className="relative h-28 w-24 shrink-0 overflow-hidden rounded-xl">
                        <Image
                          src={imageUrl(item.product.images[0], { width: 200, height: 260 })}
                          alt={item.product.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-between">
                        <div>
                          <p className="line-clamp-2 text-sm font-bold leading-snug text-wahaj-ink">
                            {item.product.name}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-wahaj-rose">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1 rounded-full border border-wahaj-border/60 bg-white/80 p-0.5 shadow-sm">
                            <button
                              onClick={() => onQty(item.product.id, -1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/60 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <motion.span
                              key={item.quantity}
                              initial={{ scale: 1.2, opacity: 0.6 }}
                              animate={{ scale: 1, opacity: 1 }}
                              transition={{ duration: 0.15 }}
                              className="min-w-[24px] text-center text-sm font-bold text-wahaj-ink"
                            >
                              {item.quantity}
                            </motion.span>
                            <button
                              onClick={() => onQty(item.product.id, 1)}
                              className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/60 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                            >
                              <span className="text-lg font-bold leading-none">+</span>
                            </button>
                          </div>
                          <button
                            onClick={() => onRemove(item.product.id)}
                            className="flex h-10 w-10 items-center justify-center rounded-full text-wahaj-text/30 transition-all duration-200 hover:bg-wahaj-soft/60 hover:text-wahaj-rose active:scale-90"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {suggested.length > 0 ? (
                  <div className="pt-2">
                    <p className="mb-3 font-thmanyah-text text-xs font-medium text-wahaj-text/50">
                      قد يعجبك أيضاً
                    </p>
                    <div className="flex gap-3">
                      {suggested.map((p) => {
                        const imgUrl = p.images?.[0]
                          ? imageUrl(p.images[0], { width: 160, height: 160 })
                          : "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=128&q=80";
                        return (
                          <Link
                            key={p.id}
                            href={`/product/${p.slug}`}
                            onClick={onClose}
                            className="flex flex-1 items-center gap-3 rounded-xl border border-wahaj-border/30 bg-white/70 p-2 transition-all duration-200 hover:shadow-md"
                          >
                            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg">
                              <Image
                                src={imgUrl}
                                alt={p.name}
                                fill
                                sizes="56px"
                                className="object-cover"
                              />
                            </div>
                            <p className="line-clamp-2 text-xs font-bold leading-snug text-wahaj-ink">
                              {p.name}
                            </p>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="sticky bottom-0 z-10 border-t border-wahaj-border/40 bg-white/90 px-4 py-4 backdrop-blur-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-wahaj-text/70">الإجمالي</span>
                  <span className="font-thmanyah-text text-xl font-bold text-wahaj-ink">
                    {formatPrice(total)}
                  </span>
                </div>
                <button
                  onClick={onCheckout}
                  className="mt-3 flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-wahaj-ink text-base font-bold text-white shadow-lg transition-all duration-300 hover:bg-wahaj-rose active:scale-[0.98]"
                >
                  <MessageCircle className="h-5 w-5" />
                  إتمام الطلب الفاخر ✨
                </button>
              </div>
            </div>
          )}
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   MENU SHEET — Premium Navigation Drawer
   ═══════════════════════════════════════════════════════════ */

function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const infoLinks = [
    ["من نحن", "/about"],
    ["الأسئلة الشائعة", "/faq"],
    ["سياسة الطلب", "/order-policy"],
    ["سياسة الاستبدال", "/exchange-policy"],
    ["تواصل معنا", "/contact"],
    ["لوحة التحكم", "/admin"]
  ];

  const visibleCollections = seedCollections.filter((c) => c.visible);
  const visibleCategories = seedCategories.filter((c) => c.visible);

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

            {visibleCategories.length > 0 ? (
              <>
                <p className="mt-5 mb-2 text-xs font-bold text-wahaj-rose/80">التصنيفات</p>
                <div className="space-y-2">
                  {visibleCategories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
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
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
