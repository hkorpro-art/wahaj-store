"use client";

import { AnimatePresence, motion } from "framer-motion";
import { collection, doc, onSnapshot } from "firebase/firestore";
import {
  ChevronLeft,
  Gem,
  Home,
  Menu,
  MessageCircle,
  Minus,
  Search,
  ShoppingBag,
  Sparkles,
  Star,
  Trash2,
  UserRound,
  X
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  adminStorageKeys,
  defaultSiteContent,
  type ManagedProduct,
  type ManagedStory,
  type SiteContent
} from "@/lib/admin-local";
import { type ElementContrasts } from "@/lib/contrast";
import BrandMark from "@/components/storefront/BrandMark";
import LifestyleHero from "@/components/storefront/LifestyleHero";
import { formatPrice, products, stories } from "@/lib/data";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { imageUrl, MENU_ICON_IDS, parseStoredImage, type MenuIconId, type MenuIconsRecord } from "@/lib/imagekit";
import { FIRESTORE_PRODUCTS_COLLECTION, rowSortOrder, rowToManagedProduct } from "@/lib/product-record";
import { buildCartMessage, buildSingleProductMessage, whatsappUrl } from "@/lib/whatsapp";
import type { CartItem, Product } from "@/lib/types";

const fadeUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
} as const;

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
} as const;

const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }
  }
} as const;

const seedManagedProducts = products.map((product) => ({ ...product, visible: true }));

export default function WahajStorefront() {
  const [storeProducts, setStoreProducts] = useState<ManagedProduct[]>(seedManagedProducts);
  const [storeStories, setStoreStories] = useState<ManagedStory[]>(
    stories.map((story) => ({ ...story, visible: true, target: story.id as ManagedStory["target"] }))
  );
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [activeCategory, setActiveCategory] = useState<LuxuryCategoryId>("new");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuIcons, setMenuIcons] = useState<MenuIconsRecord>({});
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
              if (!active) {
                return;
              }

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
            () => {
              void loadStoreProducts();
            }
          )
        : null;

    if (!unsubscribeProducts) {
      void loadStoreProducts();
    }

    async function loadMenuIcons() {
      try {
        const response = await fetch(`/api/store-menu-icons?refresh=${Date.now()}`, { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as { icons?: MenuIconsRecord } | null;

        if (active && response.ok) {
          setMenuIcons(payload?.icons || {});
        }
      } catch {
        if (active) {
          setMenuIcons({});
        }
      }
    }

    const unsubscribeMenuIcons =
      db && isFirebaseClientConfigured
        ? onSnapshot(
            doc(db, "store_settings", "menu_icons"),
            (snapshot) => {
              if (!active) {
                return;
              }

              const data = snapshot.data() as Record<string, unknown> | undefined;
              const icons: MenuIconsRecord = {};

              for (const id of MENU_ICON_IDS) {
                const parsed = parseStoredImage(data?.[id]);
                if (parsed) {
                  icons[id] = parsed;
                }
              }

              setMenuIcons(icons);
            },
            () => {
              void loadMenuIcons();
            }
          )
        : null;

    if (!unsubscribeMenuIcons) {
      void loadMenuIcons();
    }

    try {
      const savedContent = window.localStorage.getItem(adminStorageKeys.content);
      const savedStories = window.localStorage.getItem(adminStorageKeys.stories);

      if (savedContent) {
        setSiteContent({ ...defaultSiteContent, ...(JSON.parse(savedContent) as SiteContent) });
      }

      if (savedStories) {
        setStoreStories(JSON.parse(savedStories) as ManagedStory[]);
      }
    } catch {
      setStoreStories(stories.map((story) => ({ ...story, visible: true, target: story.id as ManagedStory["target"] })));
      setSiteContent(defaultSiteContent);
    }

    return () => {
      active = false;
      unsubscribeProducts?.();
      unsubscribeMenuIcons?.();
    };
  }, []);

  const displayStories = useMemo(() => {
    return storeStories.map((story) => {
      const iconId = (story.target || story.id) as MenuIconId;
      const icon = menuIcons[iconId];

      if (icon) {
        return { ...story, image: imageUrl(icon, { width: 128, height: 128 }) };
      }

      return { ...story, image: imageUrl(story.image, { width: 128, height: 128 }) };
    });
  }, [storeStories, menuIcons]);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesVisibility = product.visible !== false;
      const matchesCategory =
        activeCategory === "new"
          ? product.status.includes("new")
          : activeCategory === "sets"
            ? product.category === "sets"
            : activeCategory === "offers"
              ? Boolean(product.compareAt)
              : activeCategory === "trend"
                ? product.status.includes("trend")
                : true;
      const matchesQuery =
        query.trim().length === 0 ||
        product.name.includes(query.trim()) ||
        product.tags.some((tag) => tag.includes(query.trim()));

      return matchesVisibility && matchesCategory && matchesQuery;
    });
  }, [storeProducts, activeCategory, query]);

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  function addToCart(product: Product) {
    setCart((current) => {
      const item = current[product.id];
      return {
        ...current,
        [product.id]: {
          product,
          quantity: item ? item.quantity + 1 : 1
        }
      };
    });
    setCartOpen(true);
  }

  function updateQuantity(productId: string, delta: number) {
    setCart((current) => {
      const item = current[productId];
      if (!item) return current;
      const nextQuantity = item.quantity + delta;
      if (nextQuantity < 1) {
        const next = { ...current };
        delete next[productId];
        return next;
      }
      return {
        ...current,
        [productId]: {
          ...item,
          quantity: nextQuantity
        }
      };
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) => {
      const next = { ...current };
      delete next[productId];
      return next;
    });
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

    let message = buildCartMessage(cartItems);
    message = message.replace("الاسم:", `الاسم: ${customerName}`);
    if (isGift) {
      message = message.replace("ملاحظات:", `ملاحظات: إرسال كهدية وتغليف فاخر 🎁\nرسالة الإهداء: "${giftMessage}"`);
    }
    window.open(whatsappUrl(message), "_blank", "noopener,noreferrer");

    setCart({});
    setCartOpen(false);
  }

  function handleCategorySelect(id: LuxuryCategoryId) {
    setActiveCategory(id);
    window.requestAnimationFrame(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-wahaj-bg text-wahaj-text luxury-grain luxury-radial-light">
      <Header
        cartCount={cartItems.length}
        query={query}
        setQuery={setQuery}
        heroContrasts={heroContrasts}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />

      <LifestyleHero products={storeProducts} onContrastChange={setHeroContrasts} />

      <OfferBar offers={siteContent.offerMessages} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
        <CategoryNav activeCategory={activeCategory} onSelect={handleCategorySelect} />

        <motion.section id="products" {...fadeUp} className="lux-section">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">مختارات وهاج</p>
              <h2 className="type-section text-wahaj-ink">{luxuryCategories.find((c) => c.id === activeCategory)?.label || "الكل"}</h2>
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
                  onCart={addToCart}
                />
              ))}
            </AnimatePresence>
          </motion.div>
          {filteredProducts.length === 0 ? (
            <div className="mt-4 rounded-[8px] border border-dashed border-wahaj-border bg-white/70 p-6 text-center text-sm text-wahaj-text/70">
              لا توجد منتجات مطابقة حالياً. أضيفي منتجاً في Firestore أو غيّري البحث والتصنيف.
            </div>
          ) : null}
        </motion.section>

        <LuxuryInfo />
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
        onClose={() => setCartOpen(false)}
        onQty={updateQuantity}
        onRemove={removeFromCart}
        onCheckout={openWhatsAppForCart}
      />

      <MenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} />
    </main>
  );
}

/* ═══════════════════════════════════════════════════════════
   HEADER — Premium Glass Nav
   ═══════════════════════════════════════════════════════════ */

type HeaderProps = {
  cartCount: number;
  query: string;
  setQuery: (value: string) => void;
  heroContrasts: ElementContrasts;
  onCart: () => void;
  onMenu: () => void;
};

function Header({ cartCount, query, setQuery, heroContrasts, onCart, onMenu }: HeaderProps) {
  const menuIsDark = heroContrasts.menu === "dark";
  const logoIsDark = heroContrasts.logo === "dark";
  const cartIsDark = heroContrasts.cart === "dark";
  const searchIsDark = heroContrasts.search === "dark";

  /* Menu icon */
  const menuBg = menuIsDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)";
  const menuBorder = menuIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)";
  const menuColor = menuIsDark ? "#FFFFFF" : "#450006";
  const menuHoverBg = menuIsDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)";

  /* Cart icon */
  const cartBg = cartIsDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)";
  const cartBorder = cartIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)";
  const cartColor = cartIsDark ? "#FFFFFF" : "#450006";
  const cartHoverBg = cartIsDark ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.9)";

  /* Logo */
  const logoColor = logoIsDark ? "#FFFFFF" : "#450006";
  const logoShadow = logoIsDark ? "drop-shadow-[0_2px_10px_rgba(0,0,0,0.25)]" : "";

  /* Search bar */
  const searchBg = searchIsDark ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.75)";
  const searchBorder = searchIsDark ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.08)";
  const searchColor = searchIsDark ? "#FFFFFF" : "#450006";
  const searchPlaceholder = searchIsDark ? "rgba(255,255,255,0.5)" : "rgba(69,0,6,0.5)";
  const searchFocusBorder = searchIsDark ? "rgba(255,255,255,0.4)" : "rgba(69,0,6,0.3)";

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:px-6 lg:px-8">
        <button
          aria-label="القائمة"
          onClick={onMenu}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300"
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
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full backdrop-blur-md transition-all duration-300"
          style={{ backgroundColor: cartBg, color: cartColor, border: `1px solid ${cartBorder}` }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = cartHoverBg; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = cartBg; }}
        >
          <ShoppingBag className="h-[18px] w-[18px]" />
          {cartCount > 0 ? <Counter value={cartCount} /> : null}
        </button>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-3 sm:px-6 lg:px-8">
        <label
          className="flex h-9 items-center gap-2 rounded-full px-3 backdrop-blur-md transition-all duration-300"
          style={{
            backgroundColor: searchBg,
            border: `1px solid ${searchBorder}`,
            color: searchColor
          }}
        >
          <Search className="h-3.5 w-3.5 shrink-0" style={{ color: searchColor, opacity: 0.7 }} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent text-xs outline-none"
            style={{ color: searchColor }}
            placeholder="ابحثي عن زركون، تاج، طقم..."
          />
        </label>
      </div>
      <style>{`
        .wahaj-brand-wordmark { color: ${logoColor} !important; text-shadow: ${logoIsDark ? "0 2px 10px rgba(0,0,0,0.25)" : "none"} !important; }
        input::placeholder { color: ${searchPlaceholder} !important; opacity: 1 !important; }
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
   CATEGORY NAV — Premium Luxury Text Navigation
   ═══════════════════════════════════════════════════════════ */

const luxuryCategories = [
  { id: "new", label: "جديد" },
  { id: "sets", label: "أطقم" },
  { id: "offers", label: "عروض" },
  { id: "trend", label: "ترند" },
  { id: "clients", label: "تصوير عميلات" }
] as const;

type LuxuryCategoryId = (typeof luxuryCategories)[number]["id"];

function CategoryNav({
  activeCategory,
  onSelect
}: {
  activeCategory: LuxuryCategoryId;
  onSelect: (id: LuxuryCategoryId) => void;
}) {
  return (
    <motion.nav
      id="categories"
      aria-label="تصنيفات المنتجات"
      className="mt-6 mb-2"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: "-40px" }}
    >
      <motion.div
        className="flex flex-wrap items-center justify-center gap-x-1 gap-y-2 sm:gap-x-2"
        variants={{
          hidden: { opacity: 0 },
          show: {
            opacity: 1,
            transition: { staggerChildren: 0.08, delayChildren: 0.1 }
          }
        }}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-40px" }}
      >
        {luxuryCategories.map((cat) => {
          const active = activeCategory === cat.id;
          return (
            <motion.button
              key={cat.id}
              onClick={() => onSelect(cat.id)}
              className="group relative px-4 py-2 sm:px-5 sm:py-2.5"
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
                }
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <span
                className={`relative z-10 text-sm sm:text-base font-medium transition-colors duration-500 ${
                  active
                    ? "text-wahaj-rose"
                    : "text-wahaj-text/60 group-hover:text-wahaj-ink"
                }`}
              >
                {cat.label}
              </span>
              <motion.span
                className="absolute bottom-1 left-1/2 h-[1.5px] -translate-x-1/2 bg-wahaj-rose"
                initial={false}
                animate={{
                  width: active ? "60%" : "0%",
                  opacity: active ? 1 : 0
                }}
                transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              />
              <span
                className={`absolute inset-0 rounded-full transition-all duration-500 ${
                  active
                    ? "bg-wahaj-rose/8"
                    : "bg-transparent group-hover:bg-wahaj-ink/4"
                }`}
              />
            </motion.button>
          );
        })}
      </motion.div>
    </motion.nav>
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
      className="group overflow-hidden rounded-[8px] border border-wahaj-border bg-white/78 luxury-depth backdrop-blur-xl transition-all duration-400 hover:luxury-depth-hover"
      whileHover={{ y: -6 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1], layout: { duration: 0.3 } }}
    >
      <div className="relative">
        <Link href={productHref} className="relative block aspect-[4/5] overflow-hidden bg-wahaj-card">
          <Image
            src={imageUrl(product.images[0], { width: 640, height: 800 })}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover img-luxury-zoom"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-wahaj-ink/38 to-transparent" />
        </Link>
        <div className="absolute right-2 top-2 flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/82 px-2 py-1 text-[10px] font-bold text-wahaj-rose backdrop-blur-sm">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="p-3">
        <Link href={productHref}>
          <h3 className="type-product-title line-clamp-2 min-h-12 text-wahaj-ink transition-colors duration-300 group-hover:text-wahaj-rose">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-1 text-xs text-wahaj-stars">
          <Star className="h-4 w-4" fill="currentColor" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-wahaj-text/55">({product.reviews})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <p className="type-product-price font-medium text-brand-burgundy">{formatPrice(product.price)}</p>
          {product.compareAt ? (
            <p className="text-xs text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p>
          ) : null}
        </div>
        <motion.button
          onClick={() => onCart(product)}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-wahaj-ink px-3 text-sm font-bold text-white transition-all duration-350 hover:bg-wahaj-rose btn-luxury"
          whileTap={{ scale: 0.97 }}
        >
          <ShoppingBag className="h-4 w-4" />
          أضيفي للسلة
        </motion.button>
      </div>
    </motion.article>
  );
}

/* ═══════════════════════════════════════════════════════════
   LUXURY INFO — Value Proposition
   ═══════════════════════════════════════════════════════════ */

function LuxuryInfo() {
  const items = [
    { title: "طلب واتساب", text: "رسالة مرتبة تلقائيًا بكل المنتجات والأسعار." },
    { title: "تغليف فاخر", text: "تجربة هدية ناعمة من أول لحظة." },
    { title: "اختيار دقيق", text: "زركون ولمسات Rose Gold بتفاصيل منتقاة." }
  ];

  return (
    <motion.section {...fadeUp} className="mt-10">
      <motion.div variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-60px" }} className="grid gap-3 md:grid-cols-3">
        {items.map((item) => (
          <motion.div variants={staggerItem} key={item.title} className="rounded-[8px] border border-wahaj-border bg-white/70 p-5 shadow-soft luxury-depth transition-all duration-350 hover:luxury-depth-hover">
            <Sparkles className="h-5 w-5 text-wahaj-rose" />
            <h3 className="mt-3 font-display text-lg font-medium text-wahaj-ink">{item.title}</h3>
            <p className="mt-2 text-sm leading-7 text-wahaj-text/72">{item.text}</p>
          </motion.div>
        ))}
      </motion.div>
      <div className="md:col-span-3 mt-4 flex flex-wrap justify-center gap-3 text-sm text-wahaj-text/72">
        <Link href="/about" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2 btn-luxury">من نحن</Link>
        <Link href="/faq" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2 btn-luxury">الأسئلة الشائعة</Link>
        <Link href="/order-policy" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2 btn-luxury">سياسة الطلب</Link>
        <Link href="/exchange-policy" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2 btn-luxury">سياسة الاستبدال</Link>
        <Link href="/contact" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2 btn-luxury">تواصل معنا</Link>
      </div>
    </motion.section>
  );
}

/* ═══════════════════════════════════════════════════════════
   BOTTOM NAVIGATION — Floating Premium Bar
   ═══════════════════════════════════════════════════════════ */

function BottomNavigation({
  cartCount,
  onCart
}: {
  cartCount: number;
  onCart: () => void;
}) {
  const items = [
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "الأقسام", href: "#categories", icon: Gem },
    { label: "السلة", href: "#", icon: ShoppingBag, action: onCart, count: cartCount },
    { label: "حسابي", href: "/admin/login", icon: UserRound }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-3">
      <div className="glass grid grid-cols-4 gap-1 rounded-full px-2 py-2 shadow-satin">
        {items.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-wahaj-rose transition-all duration-300">
                <Icon className="h-5 w-5" />
                {item.count ? <Counter value={item.count} /> : null}
              </span>
              <span className="max-w-full truncate text-[10px] font-bold text-wahaj-text/72">{item.label}</span>
            </>
          );

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className={`flex min-w-0 flex-col items-center justify-center rounded-full py-1 transition-all duration-300 ${
                  index === 2 ? "bg-wahaj-rose/12 shadow-glow" : ""
                }`}
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex min-w-0 flex-col items-center justify-center rounded-full py-1 transition-all duration-300 ${
                index === 0 ? "bg-white/60" : ""
              }`}
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

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noreferrer"
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
   CART SHEET — Premium Slide-in Cart
   ═══════════════════════════════════════════════════════════ */

type CartSheetProps = {
  open: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: (customerName: string, customerPhone: string, isGift: boolean, giftMessage: string) => void;
};

function CartSheet({ open, items, total, onClose, onQty, onRemove, onCheckout }: CartSheetProps) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [error, setError] = useState("");

  function handleCheckoutSubmit() {
    if (!customerName.trim() || !customerPhone.trim()) {
      setError("يرجى كتابة الاسم ورقم الهاتف لإتمام الطلب الفاخر.");
      return;
    }
    setError("");
    onCheckout(customerName.trim(), customerPhone.trim(), isGift, isGift ? giftMessage.trim() : "");
  }

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70] flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-wahaj-ink/35 backdrop-blur-md" onClick={onClose} aria-label="إغلاق" />
          <motion.aside
            className="glass relative h-full w-[86vw] max-w-md overflow-hidden p-6 shadow-satin flex flex-col justify-between"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
          >
            <div className="flex flex-col h-full justify-between">
              <div>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="font-thmanyah-text text-sm font-medium text-wahaj-rose">سلة وهاج</p>
                    <h2 className="font-display text-3xl font-medium leading-tight text-wahaj-ink">طلبك الناعم</h2>
                  </div>
                  <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 btn-luxury">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1 admin-scrollbar">
                  {items.length === 0 ? (
                    <div className="rounded-[8px] border border-wahaj-border bg-white/70 p-5 text-center">
                      <ShoppingBag className="mx-auto h-8 w-8 text-wahaj-rose" />
                      <p className="mt-3 font-bold">السلة فارغة الآن</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <motion.div key={item.product.id} layout initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex gap-3 rounded-[8px] border border-wahaj-border bg-white/78 p-2 luxury-depth">
                        <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[8px]">
                          <Image
                            src={imageUrl(item.product.images[0], { width: 160, height: 160 })}
                            alt={item.product.name}
                            fill
                            sizes="80px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-2 font-bold text-wahaj-ink">{item.product.name}</p>
                          <p className="text-sm text-wahaj-rose">{formatPrice(item.product.price)}</p>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <button
                              onClick={() => onQty(item.product.id, -1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-wahaj-border btn-luxury"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                            <button
                              onClick={() => onQty(item.product.id, 1)}
                              className="flex h-8 w-8 items-center justify-center rounded-full border border-wahaj-border btn-luxury"
                            >
                              +
                            </button>
                            <button
                              onClick={() => onRemove(item.product.id)}
                              className="mr-auto flex h-8 w-8 items-center justify-center rounded-full bg-wahaj-card text-wahaj-rose btn-luxury"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <a
                            href={whatsappUrl(buildSingleProductMessage(item.product, item.quantity))}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-3 inline-flex rounded-full border border-wahaj-border bg-white/80 px-3 py-1 text-xs font-bold text-wahaj-rose btn-luxury"
                          >
                            طلب منتج واحد
                          </a>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>

              <div>
                {items.length > 0 ? (
                  <div className="space-y-3 border-t border-wahaj-border/70 pt-4 mb-4">
                    <p className="text-sm font-bold text-wahaj-ink">تفاصيل الاتصال</p>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        className="AdminInput"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="الاسم الكريم"
                      />
                      <input
                        className="AdminInput"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="رقم الهاتف"
                        inputMode="tel"
                      />
                    </div>

                    <label className="flex items-center gap-2 rounded-[8px] border border-wahaj-border/60 bg-white/50 px-3 py-2 text-xs font-bold cursor-pointer transition hover:bg-white/80">
                      <input
                        type="checkbox"
                        checked={isGift}
                        onChange={(e) => setIsGift(e.target.checked)}
                        className="accent-wahaj-rose"
                      />
                      <span>إرسال كهدية وتغليف فاخر 🎁</span>
                    </label>

                    {isGift ? (
                      <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="relative"
                      >
                        <textarea
                          className="AdminInput min-h-16 py-2 text-sm"
                          value={giftMessage}
                          onChange={(e) => setGiftMessage(e.target.value)}
                          placeholder="اكتبي رسالة الإهداء هنا..."
                        />
                      </motion.div>
                    ) : null}

                    {error ? <p className="text-xs text-red-600 font-bold">{error}</p> : null}
                  </div>
                ) : null}

                <div className="rounded-[8px] bg-wahaj-ink p-4 text-white">
                  <div className="flex items-center justify-between text-sm">
                    <span>الإجمالي</span>
                    <span className="font-thmanyah-text text-xl font-bold">{formatPrice(total)}</span>
                  </div>
                  <button
                    onClick={handleCheckoutSubmit}
                    disabled={items.length === 0}
                    className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-white font-bold text-wahaj-rose disabled:cursor-not-allowed disabled:opacity-45 btn-luxury hover:bg-wahaj-soft"
                  >
                    إتمـام الطلب الفاخر ✨
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════════════════
   MENU SHEET — Premium Navigation Drawer
   ═══════════════════════════════════════════════════════════ */

function MenuSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const links = [
    ["من نحن", "/about"],
    ["الأسئلة الشائعة", "/faq"],
    ["سياسة الطلب", "/order-policy"],
    ["سياسة الاستبدال", "/exchange-policy"],
    ["تواصل معنا", "/contact"],
    ["لوحة التحكم", "/admin"]
  ];

  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[75]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-wahaj-ink/25 backdrop-blur-sm" onClick={onClose} aria-label="إغلاق" />
          <motion.aside
            className="glass absolute bottom-0 right-0 top-0 w-[86vw] max-w-sm p-5"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
          >
            <div className="flex items-center justify-between">
              <BrandMark size="md" className="items-start text-right" />
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 btn-luxury">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-7 space-y-2">
              {links.map(([label, href]) => (
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
