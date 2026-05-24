"use client";

import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot } from "firebase/firestore";
import {
  BadgePlus,
  Boxes,
  ChevronLeft,
  CircleDot,
  Crown,
  Gem,
  Heart,
  Home,
  Menu,
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
import { categories, formatPrice, products, stories } from "@/lib/data";
import { db, isFirebaseClientConfigured } from "@/lib/firebase";
import { FIRESTORE_PRODUCTS_COLLECTION, rowSortOrder, rowToManagedProduct } from "@/lib/product-record";
import { buildCartMessage, buildSingleProductMessage, whatsappUrl } from "@/lib/whatsapp";
import type { CartItem, Category, Product } from "@/lib/types";

const categoryIcons = {
  Crown,
  Sparkles,
  CircleDot,
  Gem,
  Boxes,
  BadgePlus
};

type StoryFilter = "all" | "new" | "offers" | "trend" | "sets";

const storyFilterLabels: Record<StoryFilter, string> = {
  all: "لمسات تصنع الفرق",
  new: "وصل حديثًا",
  offers: "عروض وهاج",
  trend: "منتجات ترند",
  sets: "أطقم وهاج"
};

const heroSlides = [
  {
    image:
      "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1300&q=88",
    title: "مجموعة لونا",
    note: "لمسات تصنع الفرق"
  },
  {
    image:
      "https://images.unsplash.com/photo-1605100804763-247f67b3557e?auto=format&fit=crop&w=1300&q=88",
    title: "أطقم زركون",
    note: "لأنك تستحقين التألق"
  },
  {
    image:
      "https://images.unsplash.com/photo-1602751584552-8ba73aad10e1?auto=format&fit=crop&w=1300&q=88",
    title: "أقراط ترند",
    note: "نعومة تكمّل حضورك"
  }
];

const fadeUp = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] }
} as const;

const seedManagedProducts = products.map((product) => ({ ...product, visible: true }));

export default function WahajStorefront() {
  const [splash, setSplash] = useState(true);
  const [storeProducts, setStoreProducts] = useState<ManagedProduct[]>(seedManagedProducts);
  const [storeStories, setStoreStories] = useState<ManagedStory[]>(
    stories.map((story) => ({ ...story, visible: true, target: story.id as ManagedStory["target"] }))
  );
  const [siteContent, setSiteContent] = useState<SiteContent>(defaultSiteContent);
  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [cart, setCart] = useState<Record<string, CartItem>>({});
  const [inspiration, setInspiration] = useState<Record<string, Product>>({});
  const [cartOpen, setCartOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeStory, setActiveStory] = useState<ManagedStory | null>(null);
  const [storyFilter, setStoryFilter] = useState<StoryFilter>("all");

  useEffect(() => {
    const timer = window.setTimeout(() => setSplash(false), 1450);
    return () => window.clearTimeout(timer);
  }, []);

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
    };
  }, []);

  const filteredProducts = useMemo(() => {
    return storeProducts.filter((product) => {
      const matchesVisibility = product.visible !== false;
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      const matchesStory =
        storyFilter === "all" ||
        (storyFilter === "new" && product.status.includes("new")) ||
        (storyFilter === "offers" && Boolean(product.compareAt)) ||
        (storyFilter === "trend" && product.status.includes("trend")) ||
        (storyFilter === "sets" && product.category === "sets");
      const matchesQuery =
        query.trim().length === 0 ||
        product.name.includes(query.trim()) ||
        product.tags.some((tag) => tag.includes(query.trim()));

      return matchesVisibility && matchesCategory && matchesStory && matchesQuery;
    });
  }, [storeProducts, activeCategory, storyFilter, query]);

  const cartItems = Object.values(cart);
  const cartTotal = cartItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const inspirationItems = Object.values(inspiration);

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

  function toggleInspiration(product: Product) {
    setInspiration((current) => {
      const next = { ...current };
      if (next[product.id]) {
        delete next[product.id];
      } else {
        next[product.id] = product;
      }
      return next;
    });
  }

  function openWhatsAppForCart() {
    if (cartItems.length === 0) return;
    window.open(whatsappUrl(buildCartMessage(cartItems)), "_blank", "noopener,noreferrer");
  }

  function handleStorySelect(story: ManagedStory) {
    const target = story.target || story.id;

    if (target === "clients") {
      setActiveStory(story);
      return;
    }

    const nextFilter = (target === "new" || target === "offers" || target === "trend" || target === "sets"
      ? target
      : "all") as StoryFilter;

    setStoryFilter(nextFilter);
    setActiveCategory("all");
    window.requestAnimationFrame(() => {
      document.getElementById("products")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <main className="min-h-screen overflow-hidden bg-wahaj-bg text-wahaj-text">
      <AnimatePresence>{splash ? <SplashScreen /> : null}</AnimatePresence>

      <Header
        cartCount={cartItems.length}
        inspirationCount={inspirationItems.length}
        query={query}
        setQuery={setQuery}
        onCart={() => setCartOpen(true)}
        onMenu={() => setMenuOpen(true)}
      />

      <OfferBar offers={siteContent.offerMessages} />

      <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 lg:px-8">
        <StoriesRail stories={storeStories.filter((story) => story.visible !== false)} activeStoryId={storyFilter} onOpen={handleStorySelect} />
        <HeroSection content={siteContent} />
        <CategoryRail activeCategory={activeCategory} setActiveCategory={setActiveCategory} />

        <motion.section id="products" {...fadeUp} className="mt-9">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <p className="font-thmanyah text-sm font-medium text-wahaj-rose">مختارات وهاج</p>
              <h2 className="type-section text-wahaj-ink">{storyFilterLabels[storyFilter]}</h2>
            </div>
            <div className="flex items-center gap-2">
              {storyFilter !== "all" ? (
                <button
                  onClick={() => setStoryFilter("all")}
                  className="rounded-full border border-wahaj-border bg-white/70 px-3 py-1 text-xs font-medium text-wahaj-rose"
                >
                  عرض الكل
                </button>
              ) : null}
              <span className="rounded-full border border-wahaj-border bg-white/70 px-3 py-1 text-xs text-wahaj-text">
                {filteredProducts.length} قطعة
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                product={product}
                priority={index < 2}
                isInspired={Boolean(inspiration[product.id])}
                onCart={addToCart}
                onInspiration={toggleInspiration}
              />
            ))}
          </div>
          {filteredProducts.length === 0 ? (
            <div className="mt-4 rounded-[8px] border border-dashed border-wahaj-border bg-white/70 p-6 text-center text-sm text-wahaj-text/70">
              لا توجد منتجات مطابقة حالياً. أضيفي منتجاً في Firestore أو غيّري البحث والتصنيف.
            </div>
          ) : null}
        </motion.section>

        <motion.section id="inspiration" {...fadeUp} className="mt-10">
          <div className="satin-surface rounded-[8px] border border-wahaj-border p-4 shadow-soft md:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-thmanyah text-sm font-medium text-wahaj-rose">مساحتك الخاصة</p>
                <h2 className="font-display text-2xl font-medium leading-tight text-wahaj-ink">احفظي للإلهام ✨</h2>
              </div>
              <Heart className="h-6 w-6 text-wahaj-rose" />
            </div>
            {inspirationItems.length > 0 ? (
              <div className="mt-4 flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                {inspirationItems.map((product) => (
                  <Link
                    href={`/product/${product.slug}`}
                    key={product.id}
                    className="glass min-w-40 rounded-[8px] p-2"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[8px]">
                      <Image src={product.images[0]} alt={product.name} fill sizes="160px" className="object-cover" />
                    </div>
                    <p className="mt-2 line-clamp-2 text-sm font-bold">{product.name}</p>
                    <p className="text-sm text-wahaj-rose">{formatPrice(product.price)}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm leading-7 text-wahaj-text/75">
                القطع التي تلامس ذوقك ستظهر هنا بنعومة.
              </p>
            )}
          </div>
        </motion.section>

        <LuxuryInfo />
      </div>

      <BottomNavigation
        cartCount={cartItems.length}
        inspirationCount={inspirationItems.length}
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
      <StoryModal story={activeStory} onClose={() => setActiveStory(null)} />
    </main>
  );
}

function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-wahaj-bg"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.02 }}
      transition={{ duration: 0.55, ease: "easeInOut" }}
    >
      <div className="absolute inset-0 satin-surface" />
      <motion.div
        className="relative flex flex-col items-center"
        initial={{ opacity: 0, y: 14, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.85, ease: "easeOut" }}
      >
        <div className="rose-glow flex h-24 w-24 items-center justify-center rounded-full bg-white/70">
          <Sparkles className="h-10 w-10 text-wahaj-rose" />
        </div>
        <h1 className="mt-5 font-display text-4xl font-medium text-wahaj-ink">وهاج</h1>
        <p className="font-thmanyah text-sm font-medium text-wahaj-rose">WAHAJ Luxury Accessories</p>
        <div className="mt-7 lux-loader" />
      </motion.div>
    </motion.div>
  );
}

type HeaderProps = {
  cartCount: number;
  inspirationCount: number;
  query: string;
  setQuery: (value: string) => void;
  onCart: () => void;
  onMenu: () => void;
};

function Header({ cartCount, inspirationCount, query, setQuery, onCart, onMenu }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-wahaj-border/70 bg-wahaj-bg/74 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <button
          aria-label="القائمة"
          onClick={onMenu}
          className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-wahaj-rose"
        >
          <Menu className="h-5 w-5" />
        </button>

        <Link href="/" className="min-w-fit">
          <p className="font-display text-2xl font-medium text-wahaj-ink">وهاج</p>
          <p className="-mt-1 font-thmanyah text-[11px] font-medium text-wahaj-rose">WAHAJ</p>
        </Link>

        <label className="glass flex h-11 min-w-0 flex-1 items-center gap-2 rounded-full px-3">
          <Search className="h-4 w-4 shrink-0 text-wahaj-rose" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-full min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-wahaj-text/45"
            placeholder="ابحثي عن زركون، تاج، طقم..."
          />
        </label>

        <Link
          aria-label="احفظي للإلهام"
          href="#inspiration"
          className="glass relative hidden h-11 w-11 shrink-0 items-center justify-center rounded-full text-wahaj-rose sm:flex"
        >
          <Heart className="h-5 w-5" />
          {inspirationCount > 0 ? <Counter value={inspirationCount} /> : null}
        </Link>

        <button
          aria-label="السلة"
          onClick={onCart}
          className="glass relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-wahaj-rose"
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
    <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-wahaj-rose px-1 text-[11px] font-bold text-white shadow-glow">
      {value}
    </span>
  );
}

function OfferBar({ offers }: { offers: string[] }) {
  const items = offers.length > 0 ? offers : defaultSiteContent.offerMessages;

  return (
    <div className="overflow-hidden border-b border-wahaj-border/60 bg-wahaj-rose text-white">
      <div className="offer-marquee flex w-max gap-8 whitespace-nowrap py-2 text-sm">
        {[...items, ...items, ...items].map((offer, index) => (
          <span key={`${offer}-${index}`} className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-wahaj-stars" />
            {offer}
          </span>
        ))}
      </div>
    </div>
  );
}

function StoriesRail({
  stories: items,
  activeStoryId,
  onOpen
}: {
  stories: ManagedStory[];
  activeStoryId: string;
  onOpen: (story: ManagedStory) => void;
}) {
  return (
    <motion.section aria-label="stories" {...fadeUp} className="flex gap-4 overflow-x-auto pb-3 pt-1 hide-scrollbar">
      {items.map((story) => {
        const active = (story.target || story.id) === activeStoryId;

        return (
          <button
            key={story.id}
            onClick={() => onOpen(story)}
            className="group min-w-20 text-center"
            aria-pressed={active}
          >
            <span
              className={`mx-auto block rounded-full p-[2px] transition group-hover:scale-105 ${
                active ? "shadow-glow" : "shadow-soft"
              }`}
              style={{
                background: `linear-gradient(135deg, ${story.color}, #E0B56A)`
              }}
            >
              <span
                className={`relative block h-16 w-16 overflow-hidden rounded-full border-2 ${
                  active ? "border-wahaj-rose" : "border-white"
                }`}
              >
                <Image src={story.image} alt={story.title} fill sizes="64px" className="object-cover" />
              </span>
            </span>
            <span className={`mt-2 block text-xs font-bold ${active ? "text-wahaj-rose" : "text-wahaj-text"}`}>
              {story.title}
            </span>
          </button>
        );
      })}
    </motion.section>
  );
}

function HeroSection({ content }: { content: SiteContent }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const slide = heroSlides[activeSlide];

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % heroSlides.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <motion.section
      {...fadeUp}
      className="relative mt-3 overflow-hidden rounded-[8px] border border-wahaj-border bg-wahaj-card shadow-satin"
    >
      <div className="absolute inset-0 satin-surface" />
      <div className="relative grid gap-5 p-4 md:grid-cols-[1fr_1.08fr] md:p-7">
        <div className="z-10 flex min-h-[310px] flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-bold text-wahaj-rose shadow-soft">
              <Sparkles className="h-4 w-4" />
              {content.heroBadge}
            </span>
            <h1 className="type-hero mt-5 max-w-xl text-wahaj-ink">
              {content.heroTitle}
            </h1>
            <p className="mt-3 max-w-lg text-base leading-8 text-wahaj-text/78">
              {content.heroDescription}
            </p>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="#products"
              className="inline-flex min-h-12 items-center justify-center rounded-full bg-wahaj-rose px-5 font-bold text-white shadow-glow"
            >
              {content.primaryCta}
            </Link>
            <Link
              href="#categories"
              className="inline-flex min-h-12 items-center justify-center rounded-full border border-wahaj-border bg-white/70 px-5 font-bold text-wahaj-rose"
            >
              {content.secondaryCta}
            </Link>
          </div>
        </div>

        <div className="relative min-h-[310px] overflow-hidden rounded-[8px] bg-white/45 shadow-soft">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide.image}
              className="absolute inset-0"
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.02 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            >
              <Image
                src={slide.image}
                alt={slide.title}
                fill
                priority={activeSlide === 0}
                sizes="(min-width: 768px) 48vw, 100vw"
                className="object-cover"
              />
            </motion.div>
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-wahaj-ink/38 via-transparent to-white/8" />
          <div className="absolute bottom-4 right-4 rounded-[8px] border border-white/60 bg-white/72 p-3 backdrop-blur-xl">
            <p className="text-xs text-wahaj-rose">{slide.note}</p>
            <p className="font-display text-lg font-medium text-wahaj-ink">{slide.title}</p>
          </div>
          <div className="absolute bottom-4 left-4 flex gap-2">
            {heroSlides.map((item, index) => (
              <button
                key={item.image}
                onClick={() => setActiveSlide(index)}
                className={`h-2.5 rounded-full transition-all ${
                  index === activeSlide ? "w-7 bg-white shadow-glow" : "w-2.5 bg-white/55"
                }`}
                aria-label={`عرض ${item.title}`}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function CategoryRail({
  activeCategory,
  setActiveCategory
}: {
  activeCategory: string;
  setActiveCategory: (category: string) => void;
}) {
  const allCategories: Array<Category | { id: string; name: string; icon: string; image: string }> = [
    {
      id: "all",
      name: "الكل",
      icon: "Sparkles",
      image: categories[0].image
    },
    ...categories
  ];

  return (
    <motion.section id="categories" {...fadeUp} className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="font-thmanyah text-sm font-medium text-wahaj-rose">أقسام ناعمة</p>
          <h2 className="type-section text-wahaj-ink">اختاري وهجك</h2>
        </div>
        <ChevronLeft className="h-5 w-5 text-wahaj-rose" />
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
        {allCategories.map((category) => {
          const Icon = categoryIcons[category.icon as keyof typeof categoryIcons] || Sparkles;
          const active = activeCategory === category.id;
          return (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className="group min-w-[86px] text-center"
            >
              <span
                className={`mx-auto flex h-[74px] w-[74px] items-center justify-center rounded-full border transition duration-300 ${
                  active
                    ? "border-wahaj-rose bg-white shadow-glow"
                    : "border-wahaj-border bg-white/72 shadow-soft group-hover:scale-105"
                }`}
              >
                <Icon className={`h-8 w-8 ${active ? "text-wahaj-rose" : "text-wahaj-text/70"}`} strokeWidth={1.55} />
              </span>
              <span className={`mt-2 block text-sm font-bold ${active ? "text-wahaj-rose" : "text-wahaj-text"}`}>
                {category.name}
              </span>
            </button>
          );
        })}
      </div>
    </motion.section>
  );
}

type ProductCardProps = {
  product: Product;
  isInspired: boolean;
  priority?: boolean;
  onCart: (product: Product) => void;
  onInspiration: (product: Product) => void;
};

function ProductCard({ product, isInspired, priority, onCart, onInspiration }: ProductCardProps) {
  const productHref = `/product/${product.slug}`;

  return (
    <motion.article
      layout
      className="group overflow-hidden rounded-[8px] border border-wahaj-border bg-white/78 shadow-soft backdrop-blur-xl"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
    >
      <div className="relative">
        <Link href={productHref} className="relative block aspect-[4/5] overflow-hidden bg-wahaj-card">
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw"
            className="object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-wahaj-ink/38 to-transparent" />
        </Link>
        <div className="absolute right-2 top-2 flex flex-wrap gap-1">
          {product.badges.slice(0, 2).map((badge) => (
            <span key={badge} className="rounded-full bg-white/82 px-2 py-1 text-[10px] font-bold text-wahaj-rose">
              {badge}
            </span>
          ))}
        </div>
        <button
          aria-label="احفظي للإلهام"
          onClick={() => onInspiration(product)}
          className={`absolute left-2 top-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/70 backdrop-blur-xl transition ${
            isInspired ? "bg-wahaj-rose text-white shadow-glow" : "bg-white/76 text-wahaj-rose"
          }`}
        >
          <Heart className="h-4 w-4" fill={isInspired ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-3">
        <Link href={productHref}>
          <h3 className="type-product-title line-clamp-2 min-h-12 text-wahaj-ink">{product.name}</h3>
        </Link>
        <div className="mt-2 flex items-center gap-1 text-xs text-wahaj-stars">
          <Star className="h-4 w-4" fill="currentColor" />
          <span className="font-bold">{product.rating}</span>
          <span className="text-wahaj-text/55">({product.reviews})</span>
        </div>
        <div className="mt-2 flex flex-wrap items-end gap-2">
          <p className="font-thmanyah text-base font-medium text-wahaj-rose">{formatPrice(product.price)}</p>
          {product.compareAt ? (
            <p className="text-xs text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p>
          ) : null}
        </div>
        <button
          onClick={() => onCart(product)}
          className="mt-3 flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-wahaj-ink px-3 text-sm font-bold text-white transition hover:bg-wahaj-rose"
        >
          <ShoppingBag className="h-4 w-4" />
          أضيفي للسلة
        </button>
      </div>
    </motion.article>
  );
}

function LuxuryInfo() {
  const items = [
    { title: "طلب واتساب", text: "رسالة مرتبة تلقائيًا بكل المنتجات والأسعار." },
    { title: "تغليف فاخر", text: "تجربة هدية ناعمة من أول لحظة." },
    { title: "اختيار دقيق", text: "زركون ولمسات Rose Gold بتفاصيل منتقاة." }
  ];

  return (
    <motion.section {...fadeUp} className="mt-10 grid gap-3 md:grid-cols-3">
      {items.map((item) => (
        <div key={item.title} className="rounded-[8px] border border-wahaj-border bg-white/70 p-4 shadow-soft">
          <Sparkles className="h-5 w-5 text-wahaj-rose" />
          <h3 className="mt-3 font-display text-lg font-medium text-wahaj-ink">{item.title}</h3>
          <p className="mt-2 text-sm leading-7 text-wahaj-text/72">{item.text}</p>
        </div>
      ))}
      <div className="md:col-span-3 mt-2 flex flex-wrap justify-center gap-3 text-sm text-wahaj-text/72">
        <Link href="/about" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2">
          من نحن
        </Link>
        <Link href="/faq" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2">
          الأسئلة الشائعة
        </Link>
        <Link href="/order-policy" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2">
          سياسة الطلب
        </Link>
        <Link href="/exchange-policy" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2">
          سياسة الاستبدال
        </Link>
        <Link href="/contact" className="rounded-full border border-wahaj-border bg-white/70 px-4 py-2">
          تواصل معنا
        </Link>
      </div>
    </motion.section>
  );
}

function BottomNavigation({
  cartCount,
  inspirationCount,
  onCart
}: {
  cartCount: number;
  inspirationCount: number;
  onCart: () => void;
}) {
  const items = [
    { label: "الرئيسية", href: "/", icon: Home },
    { label: "الأقسام", href: "#categories", icon: Gem },
    { label: "السلة", href: "#", icon: ShoppingBag, action: onCart, count: cartCount },
    { label: "احفظي للإلهام", href: "#inspiration", icon: Heart, count: inspirationCount },
    { label: "حسابي", href: "/admin/login", icon: UserRound }
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-3">
      <div className="glass grid grid-cols-5 gap-1 rounded-full px-2 py-2 shadow-satin">
        {items.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <>
              <span className="relative flex h-9 w-9 items-center justify-center rounded-full text-wahaj-rose">
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
                className={`flex min-w-0 flex-col items-center justify-center rounded-full py-1 ${
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
              className={`flex min-w-0 flex-col items-center justify-center rounded-full py-1 ${
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

function FloatingWhatsApp({ items }: { items: CartItem[] }) {
  const href =
    items.length > 0
      ? whatsappUrl(buildCartMessage(items))
      : whatsappUrl("مرحبًا وهاج ✨\nأرغب بمعرفة أحدث القطع المتوفرة.");

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-24 left-4 z-30 flex h-12 w-12 items-center justify-center rounded-full bg-wahaj-success text-white shadow-glow"
      aria-label="واتساب وهاج"
    >
      <Sparkles className="h-5 w-5" />
    </a>
  );
}

type CartSheetProps = {
  open: boolean;
  items: CartItem[];
  total: number;
  onClose: () => void;
  onQty: (productId: string, delta: number) => void;
  onRemove: (productId: string) => void;
  onCheckout: () => void;
};

function CartSheet({ open, items, total, onClose, onQty, onRemove, onCheckout }: CartSheetProps) {
  return (
    <AnimatePresence>
      {open ? (
        <motion.div className="fixed inset-0 z-[70]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <button className="absolute inset-0 bg-wahaj-ink/25 backdrop-blur-sm" onClick={onClose} aria-label="إغلاق" />
          <motion.aside
            className="glass absolute inset-x-0 bottom-0 mx-auto max-h-[86vh] max-w-lg overflow-hidden rounded-t-[8px] p-4 shadow-satin"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 26, stiffness: 240 }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="font-thmanyah text-sm font-medium text-wahaj-rose">سلة وهاج</p>
                <h2 className="font-display text-3xl font-medium leading-tight text-wahaj-ink">طلبك الناعم</h2>
              </div>
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[48vh] space-y-3 overflow-y-auto pr-1 admin-scrollbar">
              {items.length === 0 ? (
                <div className="rounded-[8px] border border-wahaj-border bg-white/70 p-5 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-wahaj-rose" />
                  <p className="mt-3 font-bold">السلة فارغة الآن</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.product.id} className="flex gap-3 rounded-[8px] border border-wahaj-border bg-white/78 p-2">
                    <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-[8px]">
                      <Image src={item.product.images[0]} alt={item.product.name} fill sizes="80px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-2 font-bold text-wahaj-ink">{item.product.name}</p>
                      <p className="text-sm text-wahaj-rose">{formatPrice(item.product.price)}</p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => onQty(item.product.id, -1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-wahaj-border"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="min-w-6 text-center font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onQty(item.product.id, 1)}
                          className="flex h-8 w-8 items-center justify-center rounded-full border border-wahaj-border"
                        >
                          +
                        </button>
                        <button
                          onClick={() => onRemove(item.product.id)}
                          className="mr-auto flex h-8 w-8 items-center justify-center rounded-full bg-wahaj-card text-wahaj-rose"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                      <a
                        href={whatsappUrl(buildSingleProductMessage(item.product, item.quantity))}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-3 inline-flex rounded-full border border-wahaj-border bg-white/80 px-3 py-1 text-xs font-bold text-wahaj-rose"
                      >
                        طلب منتج واحد
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 rounded-[8px] bg-wahaj-ink p-4 text-white">
              <div className="flex items-center justify-between text-sm">
                <span>الإجمالي</span>
                <span className="font-thmanyah text-xl font-bold">{formatPrice(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                disabled={items.length === 0}
                className="mt-4 flex min-h-12 w-full items-center justify-center rounded-full bg-white font-bold text-wahaj-rose disabled:cursor-not-allowed disabled:opacity-45"
              >
                طلب السلة كاملة عبر واتساب
              </button>
            </div>
          </motion.aside>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

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
              <div>
                <p className="font-display text-2xl font-medium text-wahaj-ink">وهاج</p>
                <p className="text-sm text-wahaj-rose">WAHAJ</p>
              </div>
              <button onClick={onClose} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-7 space-y-2">
              {links.map(([label, href]) => (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white/70 px-4 py-3 font-bold"
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

function StoryModal({ story, onClose }: { story: ManagedStory | null; onClose: () => void }) {
  return (
    <AnimatePresence>
      {story ? (
        <motion.div
          className="fixed inset-0 z-[78] flex items-center justify-center bg-wahaj-ink/70 p-4 backdrop-blur-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative aspect-[9/16] w-full max-w-sm overflow-hidden rounded-[8px] bg-wahaj-card shadow-satin"
            initial={{ scale: 0.92, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.94, y: 20 }}
          >
            <Image src={story.image} alt={story.title} fill sizes="360px" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-wahaj-ink/72 via-transparent to-wahaj-ink/12" />
            <button
              onClick={onClose}
              className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/80"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute inset-x-4 bottom-5 text-white">
              <p className="font-display text-2xl font-medium">{story.title}</p>
              <p className="mt-2 text-sm leading-7 text-white/82">لمعة وهاج المختارة لهذا الأسبوع.</p>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
