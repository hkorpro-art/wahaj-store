"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  BadgePercent,
  BarChart3,
  Bell,
  CheckCircle2,
  CircleDollarSign,
  Copy,
  Eye,
  FileText,
  GripVertical,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  MessageCircle,
  PackageCheck,
  PackagePlus,
  Pencil,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Tags,
  Trash2,
  TrendingUp,
  UploadCloud,
  UsersRound,
  WandSparkles
} from "lucide-react";
import { useEffect, useMemo, useState, type ComponentType, type DragEvent, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis
} from "recharts";
import {
  adminStorageKeys,
  defaultSiteContent,
  type ManagedCoupon,
  type ManagedNotification,
  type ManagedProduct,
  type ManagedStory,
  type SiteContent,
  type StoryTarget
} from "@/lib/admin-local";
import { analytics, categories, coupons as seedCoupons, formatPrice, orders as seedOrders, products as seedProducts, stories as seedStories } from "@/lib/data";
import {
  imageUrl,
  MENU_ICON_IDS,
  storeImage,
  type ImageKitFolder,
  type MenuIconId,
  type MenuIconsRecord,
  type StoredImage
} from "@/lib/imagekit";
import type { Order, OrderStatus, ProductBadge, ProductStatus } from "@/lib/types";

const tabs = [
  { id: "overview", label: "الرئيسية", icon: LayoutDashboard },
  { id: "products", label: "المنتجات", icon: PackagePlus },
  { id: "orders", label: "الطلبات", icon: ShoppingBag },
  { id: "customers", label: "العميلات", icon: UsersRound },
  { id: "coupons", label: "الكوبونات", icon: BadgePercent },
  { id: "content", label: "الموقع", icon: Settings2 },
  { id: "notifications", label: "الإشعارات", icon: Bell },
  { id: "analytics", label: "التحليلات", icon: BarChart3 },
  { id: "ai", label: "AI", icon: WandSparkles }
] as const;

type TabId = (typeof tabs)[number]["id"];
type ProductSyncState = "loading" | "shared" | "local" | "offline";

type CustomerRecord = {
  id: string;
  name: string;
  phone: string;
  orders: number;
  total: number;
  vip: boolean;
  inspiration: string[];
  lastOrder: string;
};

type SalesPoint = {
  sort: string;
  day: string;
  orders: number;
  revenue: number;
};

const chartColors = ["#D89CA4", "#B76E79", "#E0B56A", "#8FAF9A", "#D8A48F"];
const orderStatuses: OrderStatus[] = ["جديد", "تم التواصل", "مؤكد", "تم التسليم", "ملغي"];

const statusClass: Record<OrderStatus, string> = {
  جديد: "bg-wahaj-warning/16 text-wahaj-ink border-wahaj-warning/35",
  "تم التواصل": "bg-wahaj-soft text-wahaj-rose border-wahaj-primary/40",
  مؤكد: "bg-wahaj-success/18 text-wahaj-ink border-wahaj-success/35",
  "تم التسليم": "bg-emerald-50 text-emerald-700 border-emerald-200",
  ملغي: "bg-red-50 text-red-700 border-red-200"
};

const productBadges: ProductBadge[] = ["جديد", "ترند", "الأكثر مبيعًا", "محدود", "مميز"];
const productStatusOptions: Array<{ value: ProductStatus; label: string }> = [
  { value: "new", label: "جديد" },
  { value: "trend", label: "ترند" },
  { value: "best-seller", label: "الأكثر مبيعًا" },
  { value: "featured", label: "مميز" }
];

const storyTargets: Array<{ value: StoryTarget; label: string }> = [
  { value: "new", label: "منتجات جديدة" },
  { value: "offers", label: "منتجات عليها عرض" },
  { value: "trend", label: "منتجات ترند" },
  { value: "sets", label: "الأطقم" },
  { value: "clients", label: "عرض ستوري فقط" },
  { value: "all", label: "كل المنتجات" }
];

const notificationTypes = ["عروض", "تخفيضات", "رجوع المخزون", "وصل حديثًا"];

const initialNotifications: ManagedNotification[] = [
  {
    id: "note-template-1",
    type: "وصل حديثًا",
    title: "وصلت قطع وهاج الجديدة",
    body: "وصلت مجموعة ناعمة بلمعة روز جولد، والكميات محدودة للحجز عبر واتساب.",
    audience: "كل العميلات",
    status: "draft",
    createdAt: "2026-05-23"
  }
];

function seedManagedProducts(): ManagedProduct[] {
  return seedProducts.map((product) => ({ ...product, visible: true }));
}

function seedManagedStories(): ManagedStory[] {
  return seedStories.map((story) => ({
    ...story,
    visible: true,
    target: story.id as StoryTarget
  }));
}

function seedManagedCoupons(): ManagedCoupon[] {
  return seedCoupons.map((coupon) => ({ ...coupon, used: 0, active: true, createdAt: "2026-05-23" }));
}

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStored<T>(key: string, value: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export default function AdminDashboard() {
  const [hydrated, setHydrated] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [products, setProducts] = useState<ManagedProduct[]>(seedManagedProducts);
  const [orders, setOrders] = useState<Order[]>(seedOrders);
  const [coupons, setCoupons] = useState<ManagedCoupon[]>(seedManagedCoupons);
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [stories, setStories] = useState<ManagedStory[]>(seedManagedStories);
  const [notifications, setNotifications] = useState<ManagedNotification[]>(initialNotifications);
  const [vipPhones, setVipPhones] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [productSyncState, setProductSyncState] = useState<ProductSyncState>("loading");
  const [toast, setToast] = useState("جاري التحقق من ربط المنتجات بقاعدة البيانات المشتركة...");
  const [aiProductName, setAiProductName] = useState("");

  async function loadSharedProducts(options?: { silent?: boolean }) {
    try {
      const response = await fetch(`/api/products?refresh=${Date.now()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (!response.ok || !Array.isArray(payload?.products) || payload?.source !== "firebase") {
        throw new Error(payload?.message || "Firestore is not available.");
      }

      setProducts(payload.products as ManagedProduct[]);
      setProductSyncState("shared");
      if (!options?.silent) {
        setToast("تم تحميل المنتجات من Firestore. أي تعديل سيظهر مباشرة للعملاء.");
      }
    } catch {
      setProductSyncState("offline");
      if (!options?.silent) {
        setToast("تعذر الاتصال بـ Firestore حالياً. لن يتم استخدام الحفظ المحلي للمنتجات بعد الآن.");
      }
    }
  }

  useEffect(() => {
    async function loadProducts() {
      const localProducts = readStored(adminStorageKeys.products, seedManagedProducts());
      setProducts(localProducts);

      try {
        const response = await fetch(`/api/products?refresh=${Date.now()}`, { cache: "no-store" });
        const payload = await response.json().catch(() => null);

        if (response.ok && Array.isArray(payload?.products)) {
          const remoteProducts = payload.products as ManagedProduct[];
          const shouldUseRemote = payload.source !== "seed" || localProducts.length === 0;

          if (shouldUseRemote) {
            setProducts(remoteProducts);
            writeStored(adminStorageKeys.products, remoteProducts);
          } else {
            setProducts(localProducts);
          }

          if (payload.source !== "seed") {
            setProductSyncState("shared");
            setToast("تم تحميل المنتجات من قاعدة البيانات المشتركة. أي تعديل سيصل لصفحات العملاء.");
          } else {
            setProductSyncState("local");
            setToast("قاعدة البيانات المشتركة غير مفعلة. التغييرات الحالية محفوظة على هذا الجهاز فقط ولن تظهر للعملاء.");
          }
        } else {
          setProductSyncState("offline");
          setToast("تعذر قراءة المنتجات من الخادم. يتم استخدام النسخة المحلية داخل لوحة التحكم فقط.");
        }
      } catch {
        setProductSyncState("offline");
        setToast("تعذر الاتصال بحفظ المنتجات المشترك. يتم عرض النسخة المحلية داخل لوحة التحكم فقط.");
      }
    }

    void loadSharedProducts();
    void loadSharedOrders();
    setOrders(readStored(adminStorageKeys.orders, seedOrders));
    setCoupons(readStored(adminStorageKeys.coupons, seedManagedCoupons()));
    setContent({ ...defaultSiteContent, ...readStored(adminStorageKeys.content, defaultSiteContent) });
    setStories(readStored(adminStorageKeys.stories, seedManagedStories()));
    setNotifications(readStored(adminStorageKeys.notifications, initialNotifications));
    setVipPhones(readStored(adminStorageKeys.vipPhones, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.orders, orders);
  }, [hydrated, orders]);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.coupons, coupons);
  }, [hydrated, coupons]);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.content, content);
  }, [hydrated, content]);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.stories, stories);
  }, [hydrated, stories]);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.notifications, notifications);
  }, [hydrated, notifications]);

  useEffect(() => {
    if (hydrated) writeStored(adminStorageKeys.vipPhones, vipPhones);
  }, [hydrated, vipPhones]);

  const filteredProducts = useMemo(() => {
    const term = search.trim();
    if (!term) return products;

    return products.filter((product) => {
      const categoryName = getCategoryName(product.category);
      return (
        product.name.includes(term) ||
        categoryName.includes(term) ||
        product.tags.some((tag) => tag.includes(term))
      );
    });
  }, [products, search]);

  const activeProducts = products.filter((product) => product.visible !== false);
  const lowStock = activeProducts.filter((product) => product.stock <= 8);
  const topViewed = [...activeProducts].sort((a, b) => b.views - a.views).slice(0, 5);
  const topSold = [...activeProducts].sort((a, b) => b.sold - a.sold).slice(0, 5);
  const salesData = useMemo(() => buildSalesData(orders), [orders]);
  const categoryData = useMemo(() => buildCategoryData(activeProducts), [activeProducts]);
  const activityData = useMemo(() => buildActivityData(activeProducts), [activeProducts]);
  const customerRecords = useMemo(() => buildCustomerRecords(orders, vipPhones), [orders, vipPhones]);
  const totalViews = activeProducts.reduce((sum, product) => sum + product.views, 0);
  const completedOrders = orders.filter((order) => order.status !== "ملغي");
  const conversionRate = totalViews > 0 ? Math.min(100, (completedOrders.length / totalViews) * 100) : 0;
  const abandonedRate = totalViews > 0 ? Math.min(75, Math.round(((totalViews * 0.012) / Math.max(completedOrders.length, 1)) * 10)) : 0;

  function showToast(message: string) {
    setToast(message);
  }

  async function persistProducts(nextProducts: ManagedProduct[], successMessage: string) {
    try {
      const response = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ products: nextProducts })
      });
      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(payload?.message || "Unable to save products.");
      }

      if (payload?.saved === false) {
        throw new Error("Firestore save failed.");
        showToast("تم حفظ التغيير محليًا فقط. لن يظهر للعملاء حتى تضيف مفاتيح Supabase أو Firebase في إعدادات الموقع.");
        return;
      }

      setProductSyncState("shared");
      showToast(successMessage);
    } catch {
      setProductSyncState("offline");
      showToast("تم حفظ التغيير داخل هذا المتصفح فقط، لكن الحفظ المشترك غير متاح الآن.");
    }
  }

  function upsertProduct(product: ManagedProduct) {
    setProducts((current) => {
      const exists = current.some((item) => item.id === product.id);
      const next = exists ? current.map((item) => (item.id === product.id ? product : item)) : [product, ...current];
      void persistProducts(next, "Product saved and synced for customers.");
      return next;
    });
    showToast("جاري حفظ المنتج ومزامنته مع واجهة العملاء...");
  }

  function duplicateProduct(product: ManagedProduct) {
    const timestamp = Date.now();
    setProducts((current) => {
      const next = [
        {
          ...product,
          id: `${product.id}-${timestamp}`,
          slug: `${product.slug}-copy-${timestamp}`,
          name: `${product.name} نسخة`,
          visible: true,
          stock: Math.max(product.stock, 1)
        },
        ...current
      ];
      void persistProducts(next, "Product duplicated and synced for customers.");
      return next;
    });
    showToast("تم نسخ المنتج ويمكن تعديله الآن من زر التعديل.");
  }

  function updateProductStock(productId: string, delta: number) {
    setProducts((current) => {
      const next: ManagedProduct[] = current.map((product) => {
        if (product.id !== productId) return product;
        const stock = Math.max(0, product.stock + delta);
        return { ...product, stock, inventoryStatus: inventoryFromStock(stock) as ManagedProduct["inventoryStatus"] };
      });
      void persistProducts(next, "Stock updated and synced for customers.");
      return next;
    });
  }

  function toggleProductVisibility(productId: string) {
    setProducts((current) => {
      const next = current.map((product) => (product.id === productId ? { ...product, visible: product.visible === false } : product));
      void persistProducts(next, "Product visibility updated for customers.");
      return next;
    });
  }

  function deleteProduct(productId: string) {
    setProducts((current) => {
      const next = current.filter((product) => product.id !== productId);
      void persistProducts(next, "Product deleted from customer storefront.");
      return next;
    });
    showToast("تم حذف المنتج من لوحة التحكم ومن واجهة المتجر المحلية.");
  }

  function moveProduct(productId: string, direction: -1 | 1) {
    setProducts((current) => {
      const index = current.findIndex((product) => product.id === productId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= current.length) return current;
      const next = [...current];
      [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
      void persistProducts(next, "Product order updated for customers.");
      return next;
    });
  }

    });
  }

  async function loadSharedOrders() {
    try {
      const response = await fetch(`/api/orders?refresh=${Date.now()}`, { cache: "no-store" });
      const payload = await response.json().catch(() => null);

      if (response.ok && Array.isArray(payload?.orders)) {
        setOrders(payload.orders as Order[]);
        writeStored(adminStorageKeys.orders, payload.orders);
      }
    } catch (error) {
      console.error("Failed to load shared orders:", error);
    }
  }

  async function persistOrder(order: Order) {
    try {
      await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order)
      });
    } catch (error) {
      console.error("Failed to persist order to Firestore:", error);
    }
  }

  async function deleteOrderRemote(orderId: string) {
    try {
      await fetch(`/api/orders?id=${orderId}`, {
        method: "DELETE"
      });
    } catch (error) {
      console.error("Failed to delete order from Firestore:", error);
    }
  }

  function createOrder(order: Order) {
    setOrders((current) => [order, ...current]);
    void persistOrder(order);
    setProducts((current) => {
      const next: ManagedProduct[] = current.map((product) => {
        if (!order.products.includes(product.name)) return product;
        const stock = Math.max(0, product.stock - 1);
        return { ...product, stock, sold: product.sold + 1, inventoryStatus: inventoryFromStock(stock) as ManagedProduct["inventoryStatus"] };
      });
      void persistProducts(next, "Order saved and product stock synced.");
      return next;
    });
    showToast("تم تسجيل الطلب وتحديث المخزون والمبيعات المرتبطة به.");
  }

  function updateOrderStatus(orderId: string, status: OrderStatus) {
    setOrders((current) => {
      const next = current.map((order) => (order.id === orderId ? { ...order, status } : order));
      const targetOrder = next.find((order) => order.id === orderId);
      if (targetOrder) {
        void persistOrder(targetOrder);
      }
      return next;
    });
  }

  function deleteOrder(orderId: string) {
    setOrders((current) => current.filter((order) => order.id !== orderId));
    void deleteOrderRemote(orderId);
    showToast("تم حذف الطلب من السجل.");
  }

  function toggleVip(phone: string) {
    setVipPhones((current) => (current.includes(phone) ? current.filter((item) => item !== phone) : [...current, phone]));
  }

  function createCoupon(coupon: ManagedCoupon) {
    setCoupons((current) => [coupon, ...current]);
    showToast("تم حفظ الكوبون في لوحة التحكم.");
  }

  function toggleCoupon(couponId: string) {
    setCoupons((current) => current.map((coupon) => (coupon.id === couponId ? { ...coupon, active: !coupon.active } : coupon)));
  }

  function deleteCoupon(couponId: string) {
    setCoupons((current) => current.filter((coupon) => coupon.id !== couponId));
  }

  function updateStory(storyId: string, patch: Partial<ManagedStory>) {
    setStories((current) => current.map((story) => (story.id === storyId ? { ...story, ...patch } : story)));
  }

  function addStory(story: ManagedStory) {
    setStories((current) => [story, ...current]);
    showToast("تمت إضافة الستوري وربطها بواجهة المتجر.");
  }

  function deleteStory(storyId: string) {
    setStories((current) => current.filter((story) => story.id !== storyId));
  }

  function createNotification(notification: ManagedNotification) {
    setNotifications((current) => [notification, ...current]);
    showToast("تم حفظ الإشعار في السجل المحلي.");
  }

  function updateNotification(notificationId: string, patch: Partial<ManagedNotification>) {
    setNotifications((current) => current.map((item) => (item.id === notificationId ? { ...item, ...patch } : item)));
  }

  function deleteNotification(notificationId: string) {
    setNotifications((current) => current.filter((item) => item.id !== notificationId));
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    window.location.href = "/admin/login";
  }

  const productSyncLabel: Record<ProductSyncState, string> = {
    loading: "جاري التحقق",
    shared: "متصل ومزامن",
    local: "محلي فقط",
    offline: "تعذر الاتصال"
  };
  const productSyncIsShared = productSyncState === "shared";

  return (
    <main className="min-h-screen bg-[#FFFCFA] text-wahaj-text">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-l border-wahaj-border bg-white/88 p-4 backdrop-blur-xl lg:block">
          <AdminBrand />
          <nav className="mt-6 space-y-1">
            {tabs.map((tab) => (
              <TabButton key={tab.id} tab={tab} active={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} />
            ))}
          </nav>
          <div className="mt-6 rounded-[8px] border border-wahaj-border bg-wahaj-card p-4">
            <ShieldCheck className="h-6 w-6 text-wahaj-success" />
            <p className="mt-3 font-bold text-wahaj-ink">لوحة عملية</p>
            <p className="mt-1 text-sm leading-6 text-wahaj-text/70">
              المنتجات تحتاج ربط Supabase أو Firebase حتى تصل تحديثات الأسعار والإضافات لكل العملاء.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 border-b border-wahaj-border bg-white/78 backdrop-blur-2xl">
            <div className="flex items-center justify-between gap-3 px-4 py-3 lg:px-6">
              <div>
                <p className="text-sm text-wahaj-rose">لوحة تحكم وهاج</p>
                <h1 className="font-thmanyah-text text-2xl font-bold text-wahaj-ink">
                  {tabs.find((tab) => tab.id === activeTab)?.label}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <label className="hidden h-11 items-center gap-2 rounded-full border border-wahaj-border bg-white px-4 md:flex">
                  <Search className="h-4 w-4 text-wahaj-rose" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="بحث سريع عن منتج أو قسم"
                    className="w-56 bg-transparent text-sm outline-none"
                  />
                </label>
                <button
                  onClick={() => setActiveTab("notifications")}
                  className="relative flex h-11 w-11 items-center justify-center rounded-full border border-wahaj-border bg-white text-wahaj-rose"
                  aria-label="الإشعارات"
                >
                  <Bell className="h-5 w-5" />
                  {notifications.length > 0 ? (
                    <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-wahaj-rose px-1 text-[11px] font-bold text-white">
                      {notifications.length}
                    </span>
                  ) : null}
                </button>
                <button
                  onClick={logout}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-wahaj-border bg-white text-wahaj-rose"
                  aria-label="تسجيل الخروج"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="flex gap-2 overflow-x-auto px-4 pb-3 hide-scrollbar lg:hidden">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex min-w-fit items-center gap-2 rounded-full border px-3 py-2 text-sm font-bold ${
                    activeTab === tab.id
                      ? "border-wahaj-rose bg-wahaj-soft text-wahaj-rose"
                      : "border-wahaj-border bg-white"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </div>
          </header>

          <div className="p-4 lg:p-6">
            <div
              className={`mb-5 rounded-[8px] border p-3 text-sm font-bold shadow-soft ${
                productSyncIsShared ? "border-wahaj-success/35 bg-white/84 text-wahaj-ink" : "border-wahaj-warning/45 bg-wahaj-warning/12 text-wahaj-ink"
              }`}
            >
              <div className="flex items-start gap-2">
                {productSyncIsShared ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-wahaj-success" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-wahaj-warning" />}
                <span>{toast}</span>
              </div>
            </div>

            {activeTab === "overview" ? (
              <Overview
                products={activeProducts}
                orders={orders}
                coupons={coupons}
                notifications={notifications}
                lowStock={lowStock}
                topViewed={topViewed}
                topSold={topSold}
                salesData={salesData}
                categoryData={categoryData}
                conversionRate={conversionRate}
                abandonedRate={abandonedRate}
                onQuickAction={setActiveTab}
              />
            ) : null}

            {activeTab === "products" ? (
              <ProductsManager
                products={filteredProducts}
                onUpsert={upsertProduct}
                onDuplicate={duplicateProduct}
                onStock={updateProductStock}
                onDelete={deleteProduct}
                onToggleVisible={toggleProductVisibility}
                onAskAi={(name) => {
                  setAiProductName(name);
                  setActiveTab("ai");
                }}
              />
            ) : null}

            {activeTab === "orders" ? (
              <OrdersManager
                orders={orders}
                products={activeProducts}
                onCreate={createOrder}
                onStatus={updateOrderStatus}
                onDelete={deleteOrder}
              />
            ) : null}

            {activeTab === "customers" ? <CustomersManager customers={customerRecords} onToggleVip={toggleVip} /> : null}

            {activeTab === "coupons" ? (
              <CouponsManager coupons={coupons} onCreate={createCoupon} onDelete={deleteCoupon} onToggle={toggleCoupon} />
            ) : null}

            {activeTab === "content" ? (
              <ContentManager
                content={content}
                onContentChange={(next) => {
                  setContent(next);
                  showToast("تم تحديث نصوص الواجهة وشريط العروض.");
                }}
                products={products}
                onMoveProduct={moveProduct}
                stories={stories}
                onUpdateStory={updateStory}
                onAddStory={addStory}
                onDeleteStory={deleteStory}
                productSyncLabel={productSyncLabel[productSyncState]}
              />
            ) : null}

            {activeTab === "notifications" ? (
              <NotificationsManager
                notifications={notifications}
                onCreate={createNotification}
                onUpdate={updateNotification}
                onDelete={deleteNotification}
              />
            ) : null}

            {activeTab === "analytics" ? (
              <AnalyticsManager
                topViewed={topViewed}
                topSold={topSold}
                salesData={salesData}
                categoryData={categoryData}
                activityData={activityData}
                conversionRate={conversionRate}
                abandonedRate={abandonedRate}
              />
            ) : null}

            {activeTab === "ai" ? <AiAssistant initialName={aiProductName} /> : null}
          </div>
        </section>
      </div>
    </main>
  );
}

function AdminBrand() {
  return (
    <div className="rounded-[8px] bg-wahaj-ink p-4 text-white shadow-soft">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/12">
          <Sparkles className="h-6 w-6 text-wahaj-stars" />
        </span>
        <div>
          <p className="font-thmanyah-text text-2xl font-bold">وهاج</p>
          <p className="text-xs text-white/68">WAHAJ Admin OS</p>
        </div>
      </div>
    </div>
  );
}

function TabButton({
  tab,
  active,
  onClick
}: {
  tab: (typeof tabs)[number];
  active: boolean;
  onClick: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-[8px] px-3 py-3 text-sm font-bold transition ${
        active ? "bg-wahaj-soft text-wahaj-rose shadow-soft" : "text-wahaj-text hover:bg-wahaj-card"
      }`}
    >
      <Icon className="h-5 w-5" />
      {tab.label}
    </button>
  );
}

function Overview({
  products,
  orders,
  coupons,
  notifications,
  lowStock,
  topViewed,
  topSold,
  salesData,
  categoryData,
  conversionRate,
  abandonedRate,
  onQuickAction
}: {
  products: ManagedProduct[];
  orders: Order[];
  coupons: ManagedCoupon[];
  notifications: ManagedNotification[];
  lowStock: ManagedProduct[];
  topViewed: ManagedProduct[];
  topSold: ManagedProduct[];
  salesData: SalesPoint[];
  categoryData: Array<{ name: string; value: number }>;
  conversionRate: number;
  abandonedRate: number;
  onQuickAction: (tab: TabId) => void;
}) {
  const revenue = orders.filter((order) => order.status !== "ملغي").reduce((sum, order) => sum + order.total, 0);
  const activeCoupons = coupons.filter((coupon) => coupon.active !== false).length;
  const cards = [
    { label: "عدد الطلبات", value: orders.length.toLocaleString("ar-YE"), icon: ShoppingBag, tone: "text-wahaj-rose" },
    { label: "المنتجات الظاهرة", value: products.length.toLocaleString("ar-YE"), icon: PackageCheck, tone: "text-wahaj-success" },
    { label: "الأرباح", value: formatPrice(revenue), icon: CircleDollarSign, tone: "text-wahaj-stars" },
    { label: "السلات المتروكة", value: `${abandonedRate}%`, icon: AlertTriangle, tone: "text-wahaj-warning" }
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <motion.div
            key={card.label}
            className="rounded-[8px] border border-wahaj-border bg-white p-4 shadow-soft"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-wahaj-text/68">{card.label}</p>
              <card.icon className={`h-6 w-6 ${card.tone}`} />
            </div>
            <p className="mt-3 font-thmanyah-text text-2xl font-bold text-wahaj-ink">{card.value}</p>
          </motion.div>
        ))}
      </div>

      <QuickActions onAction={onQuickAction} />

      <div className="grid gap-5 xl:grid-cols-[1.2fr_.8fr]">
        <Panel title="حركة المبيعات من الطلبات" icon={TrendingUp}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D89CA4" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#D89CA4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#E8D6D6" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#6B4E4E", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B4E4E", fontSize: 12 }} width={44} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="revenue" stroke="#B76E79" fill="url(#salesGradient)" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="أفضل الأقسام" icon={Tags}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={categoryData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={96} paddingAngle={4}>
                  {categoryData.map((entry, index) => (
                    <Cell key={entry.name} fill={chartColors[index % chartColors.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <Ranking title="الأكثر مبيعًا" products={topSold} metric="sold" />
        <Ranking title="الأكثر مشاهدة" products={topViewed} metric="views" />
        <Panel title="تنبيهات مهمة" icon={AlertTriangle}>
          <div className="space-y-3">
            <InfoPill label="منتجات منخفضة المخزون" value={lowStock.length.toLocaleString("ar-YE")} tone="warning" />
            <InfoPill label="كوبونات نشطة" value={activeCoupons.toLocaleString("ar-YE")} tone="rose" />
            <InfoPill label="إشعارات محفوظة" value={notifications.length.toLocaleString("ar-YE")} tone="success" />
            <InfoPill label="معدل التحويل" value={`${conversionRate.toFixed(2)}%`} tone="rose" />
          </div>
        </Panel>
      </div>

      <Panel title="آخر الطلبات" icon={ShoppingBag}>
        <OrdersTable orders={orders.slice(0, 5)} compact />
      </Panel>
    </div>
  );
}

function QuickActions({ onAction }: { onAction: (tab: TabId) => void }) {
  const actions = [
    { label: "إضافة منتج", icon: PackagePlus, tab: "products" as const },
    { label: "إنشاء كوبون", icon: BadgePercent, tab: "coupons" as const },
    { label: "تعديل البنرات", icon: FileText, tab: "content" as const },
    { label: "إضافة Story", icon: ImageIcon, tab: "content" as const },
    { label: "إرسال إشعار", icon: Bell, tab: "notifications" as const },
    { label: "تحديث المخزون", icon: PackageCheck, tab: "products" as const }
  ];

  return (
    <Panel title="إجراءات سريعة" icon={Sparkles}>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {actions.map((action) => (
          <button
            key={action.label}
            onClick={() => onAction(action.tab)}
            className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3 text-center font-bold transition hover:border-wahaj-rose hover:bg-wahaj-soft"
          >
            <action.icon className="h-6 w-6 text-wahaj-rose" />
            {action.label}
          </button>
        ))}
      </div>
    </Panel>
  );
}

type ProductFormState = {
  id?: string;
  name: string;
  price: string;
  compareAt: string;
  category: string;
  description: string;
  material: string;
  stock: string;
  images: StoredImage[];
  colors: string;
  sizes: string;
  tags: string;
  badges: ProductBadge[];
  status: ProductStatus[];
  visible: boolean;
  discountEndsAt: string;
};

function emptyProductForm(): ProductFormState {
  return {
    name: "",
    price: "",
    compareAt: "",
    category: categories[0]?.id || "sets",
    description: "",
    material: "زركون فاخر مع طلاء Rose Gold مقاوم للبهتان",
    stock: "10",
    images: [storeImage("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85")],
    colors: "روز قولد، فضي، ذهبي ناعم",
    sizes: "قابل للتعديل، S، M",
    tags: "وهاج، زركون، جديد",
    badges: ["جديد"],
    status: ["new"],
    visible: true,
    discountEndsAt: ""
  };
}

type ImageKitAuthParameters = {
  expire: number;
  signature: string;
  token: string;
};

type ImageKitUploadResponse = {
  message?: string;
  url?: string;
  fileId?: string;
};

const PRODUCT_IMAGE_MAX_FILE_SIZE = 7 * 1024 * 1024;
const PRODUCT_IMAGE_ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

async function getImageKitAuthParameters() {
  const response = await fetch("/api/imagekit-auth", { cache: "no-store" });
  const payload = (await response.json().catch(() => null)) as (ImageKitAuthParameters & { message?: string }) | null;

  if (!response.ok || !payload?.signature || !payload?.token || !payload?.expire) {
    throw new Error(payload?.message || "تعذر جلب بيانات مصادقة ImageKit.");
  }

  return payload;
}

function createProductImageFileName(fileName: string) {
  const cleaned = fileName.replace(/[^\w.-]+/g, "-").replace(/-+/g, "-");
  return `${Date.now()}-${cleaned || "wahaj-product-image"}`;
}

async function uploadImageToImageKit(file: File, folder: ImageKitFolder): Promise<StoredImage> {
  if (!PRODUCT_IMAGE_ALLOWED_TYPES.has(file.type)) {
    throw new Error(`نوع ملف غير مدعوم: ${file.name}`);
  }

  if (file.size > PRODUCT_IMAGE_MAX_FILE_SIZE) {
    throw new Error(`حجم الملف كبير جداً: ${file.name}`);
  }

  const publicKey = process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY;

  if (!publicKey) {
    throw new Error("قيمة NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY غير متوفرة.");
  }

  const auth = await getImageKitAuthParameters();
  const formData = new FormData();

  formData.append("file", file);
  formData.append("fileName", createProductImageFileName(file.name));
  formData.append("publicKey", publicKey);
  formData.append("signature", auth.signature);
  formData.append("expire", String(auth.expire));
  formData.append("token", auth.token);
  formData.append("folder", folder);
  formData.append("useUniqueFileName", "true");

  const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
    method: "POST",
    body: formData
  });
  const payload = (await response.json().catch(() => null)) as ImageKitUploadResponse | null;

  if (!response.ok || !payload?.url) {
    throw new Error(payload?.message || `تعذر رفع الصورة: ${file.name}`);
  }

  return storeImage(payload.url, payload.fileId || "");
}

async function deleteImageFromImageKit(fileId: string) {
  if (!fileId) {
    return;
  }

  const response = await fetch("/api/imagekit-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileId })
  });
  const payload = (await response.json().catch(() => null)) as { message?: string } | null;

  if (!response.ok) {
    throw new Error(payload?.message || "تعذر حذف الصورة من ImageKit.");
  }
}

const menuIconLabels: Record<MenuIconId, string> = {
  new: "جديد",
  offers: "عروض",
  trend: "ترند",
  sets: "أطقم"
};

function ProductImagesEditor({
  images,
  uploading,
  dropLabel,
  onChange,
  onUploadFiles
}: {
  images: StoredImage[];
  uploading: boolean;
  dropLabel: string;
  onChange: (images: StoredImage[]) => void;
  onUploadFiles: (files: File[]) => void;
}) {
  async function removeImage(index: number) {
    const target = images[index];
    if (!target) {
      return;
    }

    try {
      await deleteImageFromImageKit(target.fileId);
      onChange(images.filter((_, itemIndex) => itemIndex !== index));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "تعذر حذف الصورة.");
    }
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }

    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    onUploadFiles(Array.from(event.dataTransfer.files));
  }

  return (
    <div className="space-y-3">
      {images.length > 0 ? (
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div key={`${image.url}-${index}`} className="relative overflow-hidden rounded-[8px] border border-wahaj-border bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl(image)} alt="" className="aspect-square w-full object-cover" />
              <span className="absolute right-2 top-2 rounded-full bg-wahaj-ink/72 px-2 py-0.5 text-xs font-bold text-white">
                {index + 1}
              </span>
              <div className="absolute inset-x-0 bottom-0 flex justify-between gap-1 bg-wahaj-ink/55 p-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, -1)}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-wahaj-rose disabled:opacity-40"
                  aria-label="تحريك الصورة للأعلى"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, 1)}
                  disabled={index === images.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-wahaj-rose disabled:opacity-40"
                  aria-label="تحريك الصورة للأسفل"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void removeImage(index)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600"
                  aria-label="حذف الصورة"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="rounded-[8px] border border-dashed border-wahaj-border bg-wahaj-bg px-3 py-4 text-center text-sm text-wahaj-text/65">
          لم تُرفع صور بعد. الصورة الأولى هي صورة الغلاف في المتجر.
        </p>
      )}

      <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-full border border-wahaj-border bg-white px-4 text-sm font-bold text-wahaj-rose">
        <UploadCloud className="h-5 w-5" />
        {uploading ? "جاري الرفع..." : "اختيار صور من الجهاز"}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(event) => {
            onUploadFiles(Array.from(event.target.files || []));
            event.currentTarget.value = "";
          }}
        />
      </label>

      <div
        onDrop={handleDrop}
        onDragOver={(event) => event.preventDefault()}
        className="grid min-h-28 place-items-center rounded-[8px] border border-dashed border-wahaj-rose bg-wahaj-soft/45 p-4 text-center"
      >
        <div>
          <UploadCloud className="mx-auto h-7 w-7 text-wahaj-rose" />
          <p className="mt-2 text-sm font-bold">{dropLabel}</p>
        </div>
      </div>
    </div>
  );
}

function MenuIconsManager() {
  const [icons, setIcons] = useState<MenuIconsRecord>({});
  const [uploadingId, setUploadingId] = useState<MenuIconId | null>(null);
  const [message, setMessage] = useState("");
  const [syncLabel, setSyncLabel] = useState("جاري التحميل...");

  useEffect(() => {
    void loadIcons();
  }, []);

  async function loadIcons() {
    try {
      const response = await fetch(`/api/store-menu-icons?refresh=${Date.now()}`, { cache: "no-store" });
      const payload = (await response.json().catch(() => null)) as { icons?: MenuIconsRecord; source?: string } | null;

      if (!response.ok) {
        throw new Error("تعذر تحميل أيقونات القوائم.");
      }

      setIcons(payload?.icons || {});
      setSyncLabel(payload?.source === "firebase" ? "متصل بـ Firestore" : "افتراضي");
    } catch (error) {
      setSyncLabel("تعذر الاتصال");
      setMessage(error instanceof Error ? error.message : "تعذر تحميل الأيقونات.");
    }
  }

  async function persistIcons(next: MenuIconsRecord) {
    const response = await fetch("/api/store-menu-icons", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ icons: next })
    });
    const payload = (await response.json().catch(() => null)) as { message?: string; saved?: boolean } | null;

    if (!response.ok) {
      throw new Error(payload?.message || "تعذر حفظ الأيقونات.");
    }

    setIcons(next);
    setSyncLabel(payload?.saved ? "متصل بـ Firestore" : "محلي");
    setMessage(payload?.message || "تم حفظ الأيقونات.");
  }

  async function uploadIcon(id: MenuIconId, file: File) {
    setUploadingId(id);
    setMessage("");

    try {
      const uploaded = await uploadImageToImageKit(file, "/categories");
      const previous = icons[id];

      if (previous?.fileId) {
        try {
          await deleteImageFromImageKit(previous.fileId);
        } catch {
          // Keep going even if old asset cleanup fails.
        }
      }

      await persistIcons({ ...icons, [id]: uploaded });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر رفع الأيقونة.");
    } finally {
      setUploadingId(null);
    }
  }

  return (
    <Panel title="أيقونات القوائم الرئيسية" icon={ImageIcon}>
      <p className="mb-3 text-sm leading-6 text-wahaj-text/70">
        ارفعي أيقونة لكل قائمة (جديد، عروض، ترند، أطقم). التغييرات تُحفظ في Firestore وتظهر فورًا في الصفحة الرئيسية.
      </p>
      <div className="mb-3 rounded-full bg-wahaj-card px-3 py-1 text-xs font-bold text-wahaj-rose">{syncLabel}</div>
      <div className="grid gap-3 sm:grid-cols-2">
        {MENU_ICON_IDS.map((id) => {
          const icon = icons[id];

          return (
            <div key={id} className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3">
              <p className="font-bold text-wahaj-ink">{menuIconLabels[id]}</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="relative flex h-16 w-16 shrink-0 overflow-hidden rounded-full border border-wahaj-border bg-white">
                  {icon ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={imageUrl(icon, { width: 128, height: 128 })} alt={menuIconLabels[id]} className="h-full w-full object-cover" />
                  ) : (
                    <span className="m-auto text-xs text-wahaj-text/45">بدون صورة</span>
                  )}
                </span>
                <label className="inline-flex min-h-10 cursor-pointer items-center justify-center rounded-full border border-wahaj-border bg-white px-3 text-xs font-bold text-wahaj-rose">
                  {uploadingId === id ? "جاري الرفع..." : "رفع أيقونة"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/avif"
                    className="hidden"
                    disabled={uploadingId !== null}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) {
                        void uploadIcon(id, file);
                      }
                      event.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
      {message ? <p className="mt-3 rounded-[8px] bg-wahaj-card p-3 text-sm font-bold text-wahaj-ink">{message}</p> : null}
    </Panel>
  );
}

function productToForm(product: ManagedProduct): ProductFormState {
  return {
    id: product.id,
    name: product.name,
    price: product.price.toString(),
    compareAt: product.compareAt?.toString() || "",
    category: product.category,
    description: product.description,
    material: product.material,
    stock: product.stock.toString(),
    images: [...product.images],
    colors: product.colors.join("، "),
    sizes: product.sizes.join("، "),
    tags: product.tags.join("، "),
    badges: product.badges,
    status: product.status,
    visible: product.visible !== false,
    discountEndsAt: product.discountEndsAt || ""
  };
}

function ProductsManager({
  products,
  onUpsert,
  onDuplicate,
  onStock,
  onDelete,
  onToggleVisible,
  onAskAi
}: {
  products: ManagedProduct[];
  onUpsert: (product: ManagedProduct) => void;
  onDuplicate: (product: ManagedProduct) => void;
  onStock: (productId: string, delta: number) => void;
  onDelete: (productId: string) => void;
  onToggleVisible: (productId: string) => void;
  onAskAi: (productName: string) => void;
}) {
  const [form, setForm] = useState<ProductFormState>(emptyProductForm);
  const [message, setMessage] = useState("");
  const [dropLabel, setDropLabel] = useState("ارفعي الصور من الزر أو بالسحب، وسيتم إضافة روابط ImageKit تلقائياً.");
  const [uploading, setUploading] = useState(false);

  function submitProduct() {
    const parsedPrice = Number(form.price);
    const parsedCompareAt = form.compareAt ? Number(form.compareAt) : undefined;
    const parsedStock = Number(form.stock);
    const images = form.images.slice(0, 8);

    if (!form.name.trim() || !Number.isFinite(parsedPrice) || parsedPrice <= 0 || images.length === 0) {
      setMessage("اكتبي اسم المنتج، السعر، وارفعي صورة واحدة على الأقل.");
      return;
    }

    const timestamp = Date.now();
    const stock = Number.isFinite(parsedStock) ? Math.max(0, parsedStock) : 0;
    const existing = products.find((product) => product.id === form.id);
    const product: ManagedProduct = {
      id: form.id || `admin-${timestamp}`,
      slug: existing?.slug || createSlug(form.name) || `product-${timestamp}`,
      name: form.name.trim(),
      category: form.category,
      price: parsedPrice,
      compareAt: parsedCompareAt && parsedCompareAt > parsedPrice ? parsedCompareAt : undefined,
      rating: existing?.rating ?? 5,
      reviews: existing?.reviews ?? 0,
      badges: form.badges.length > 0 ? form.badges : ["مميز"],
      status: form.status.length > 0 ? form.status : ["featured"],
      images,
      colors: splitList(form.colors),
      sizes: splitList(form.sizes),
      stock,
      inventoryStatus: inventoryFromStock(stock),
      description: form.description.trim() || "قطعة وهاج فاخرة بلمعة ناعمة وتفاصيل أنثوية راقية.",
      material: form.material.trim() || "تفاصيل فاخرة مختارة من وهاج",
      tags: splitList(form.tags),
      views: existing?.views ?? 0,
      sold: existing?.sold ?? 0,
      visible: form.visible,
      discountEndsAt: form.discountEndsAt || undefined
    };

    onUpsert(product);
    setForm(emptyProductForm());
    setMessage("تم حفظ المنتج بنجاح.");
  }

  async function uploadFiles(files: File[]) {
    if (files.length === 0) {
      return;
    }

    setUploading(true);
    setMessage("");
    setDropLabel(`Uploading ${files.length.toLocaleString("ar-YE")} image(s)...`);

    try {
      if (files.length > 8) {
        throw new Error("Maximum 8 images are allowed per upload.");
      }

      const uploaded = await Promise.all(files.map((file) => uploadImageToImageKit(file, "/products")));
      const merged = [...form.images, ...uploaded];
      const unique = merged.filter(
        (image, index, list) => list.findIndex((item) => item.url === image.url) === index
      ).slice(0, 8);

      setForm((current) => ({ ...current, images: unique }));
      setDropLabel(`تم رفع ${uploaded.length.toLocaleString("ar-YE")} صورة إلى ImageKit.`);
      setMessage("تمت إضافة الصور إلى المنتج بنجاح.");
    } catch (error) {
      const uploadMessage = error instanceof Error ? error.message : "Unable to upload images right now.";
      setMessage(uploadMessage);
      setDropLabel("Upload failed. Please verify the ImageKit settings and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_390px]">
      <Panel title="إدارة المنتجات" icon={PackagePlus}>
        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full min-w-[980px] text-sm">
            <thead>
              <tr className="border-b border-wahaj-border text-right text-wahaj-text/62">
                <th className="py-3">المنتج</th>
                <th>القسم</th>
                <th>السعر</th>
                <th>المخزون</th>
                <th>الظهور</th>
                <th>الحالات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-wahaj-border/70">
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 overflow-hidden rounded-[8px] bg-wahaj-card">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imageUrl(product.images[0])} alt="" className="h-full w-full object-cover" />
                      </span>
                      <div>
                        <p className="font-bold text-wahaj-ink">{product.name}</p>
                        <p className="text-xs text-wahaj-text/55">{product.tags.join("، ")}</p>
                      </div>
                    </div>
                  </td>
                  <td>{getCategoryName(product.category)}</td>
                  <td>
                    <p className="font-bold text-wahaj-rose">{formatPrice(product.price)}</p>
                    {product.compareAt ? <p className="text-xs text-wahaj-text/45 line-through">{formatPrice(product.compareAt)}</p> : null}
                  </td>
                  <td>
                    <div className="flex w-fit items-center gap-2 rounded-full bg-wahaj-card px-2 py-1">
                      <button
                        onClick={() => onStock(product.id, -1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-wahaj-rose"
                        aria-label="تقليل المخزون"
                      >
                        -
                      </button>
                      <span className="min-w-6 text-center font-bold">{product.stock}</span>
                      <button
                        onClick={() => onStock(product.id, 1)}
                        className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-wahaj-rose"
                        aria-label="زيادة المخزون"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>
                    <button
                      onClick={() => onToggleVisible(product.id)}
                      className={`rounded-full border px-3 py-1 text-xs font-bold ${
                        product.visible === false
                          ? "border-red-100 bg-red-50 text-red-600"
                          : "border-wahaj-success/30 bg-wahaj-success/15 text-wahaj-ink"
                      }`}
                    >
                      {product.visible === false ? "مخفي" : "ظاهر"}
                    </button>
                  </td>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {product.badges.map((badge) => (
                        <span key={badge} className="rounded-full border border-wahaj-border px-2 py-1 text-xs">
                          {badge}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setForm(productToForm(product))}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-wahaj-border text-wahaj-rose"
                        aria-label="تعديل المنتج"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDuplicate(product)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-wahaj-border text-wahaj-rose"
                        aria-label="نسخ المنتج"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onAskAi(product.name)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-wahaj-border text-wahaj-rose"
                        aria-label="توليد وصف AI"
                      >
                        <WandSparkles className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => onDelete(product.id)}
                        className="flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600"
                        aria-label="حذف المنتج"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {products.length === 0 ? <EmptyState text="لا توجد منتجات مطابقة للبحث الحالي." /> : null}
      </Panel>

      <div className="space-y-5">
        <Panel title={form.id ? "تعديل منتج" : "إضافة منتج"} icon={PackagePlus}>
          <div className="space-y-3">
            <input className="AdminInput" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="اسم المنتج" />
            <div className="grid grid-cols-2 gap-2">
              <input className="AdminInput" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} placeholder="السعر" inputMode="numeric" />
              <input className="AdminInput" value={form.compareAt} onChange={(event) => setForm({ ...form, compareAt: event.target.value })} placeholder="قبل الخصم" inputMode="numeric" />
            </div>
            <select className="AdminInput" value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })}>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input className="AdminInput" value={form.stock} onChange={(event) => setForm({ ...form, stock: event.target.value })} placeholder="المخزون" inputMode="numeric" />
              <input className="AdminInput" type="date" value={form.discountEndsAt} onChange={(event) => setForm({ ...form, discountEndsAt: event.target.value })} title="نهاية الخصم" />
            </div>
            <ProductImagesEditor
              images={form.images}
              uploading={uploading}
              dropLabel={dropLabel}
              onChange={(images) => setForm({ ...form, images })}
              onUploadFiles={uploadFiles}
            />
            <textarea className="AdminInput min-h-24 py-3" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="الوصف الفاخر" />
            <input className="AdminInput" value={form.material} onChange={(event) => setForm({ ...form, material: event.target.value })} placeholder="الخامة" />
            <div className="grid grid-cols-2 gap-2">
              <input className="AdminInput" value={form.colors} onChange={(event) => setForm({ ...form, colors: event.target.value })} placeholder="الألوان" />
              <input className="AdminInput" value={form.sizes} onChange={(event) => setForm({ ...form, sizes: event.target.value })} placeholder="المقاسات" />
            </div>
            <input className="AdminInput" value={form.tags} onChange={(event) => setForm({ ...form, tags: event.target.value })} placeholder="الوسوم" />

            <div className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3">
              <p className="mb-2 text-sm font-bold text-wahaj-ink">Badges</p>
              <div className="flex flex-wrap gap-2">
                {productBadges.map((badge) => (
                  <ToggleChip
                    key={badge}
                    label={badge}
                    active={form.badges.includes(badge)}
                    onClick={() => setForm({ ...form, badges: toggleArray(form.badges, badge) })}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3">
              <p className="mb-2 text-sm font-bold text-wahaj-ink">حالة المنتج</p>
              <div className="flex flex-wrap gap-2">
                {productStatusOptions.map((status) => (
                  <ToggleChip
                    key={status.value}
                    label={status.label}
                    active={form.status.includes(status.value)}
                    onClick={() => setForm({ ...form, status: toggleArray(form.status, status.value) })}
                  />
                ))}
              </div>
            </div>

            <label className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white px-3 py-2 text-sm font-bold">
              إظهار المنتج في المتجر
              <input type="checkbox" checked={form.visible} onChange={(event) => setForm({ ...form, visible: event.target.checked })} />
            </label>

            {message ? <p className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold text-wahaj-ink">{message}</p> : null}

            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => onAskAi(form.name || "منتج وهاج")} className="min-h-11 rounded-full border border-wahaj-border bg-white px-4 font-bold text-wahaj-rose">
                وصف AI
              </button>
              <button onClick={() => setForm(emptyProductForm())} className="min-h-11 rounded-full border border-wahaj-border bg-white px-4 font-bold text-wahaj-rose">
                تفريغ
              </button>
            </div>
            <button onClick={submitProduct} className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-wahaj-rose px-4 font-bold text-white">
              <PackagePlus className="h-5 w-5" />
              حفظ المنتج
            </button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function OrdersManager({
  orders,
  products,
  onCreate,
  onStatus,
  onDelete
}: {
  orders: Order[];
  products: ManagedProduct[];
  onCreate: (order: Order) => void;
  onStatus: (orderId: string, status: OrderStatus) => void;
  onDelete: (orderId: string) => void;
}) {
  const [customer, setCustomer] = useState("");
  const [phone, setPhone] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [manualTotal, setManualTotal] = useState("");
  const [status, setStatus] = useState<OrderStatus>("جديد");
  const [isGift, setIsGift] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [message, setMessage] = useState("");

  const selectedProducts = products.filter((product) => selected.includes(product.id));
  const autoTotal = selectedProducts.reduce((sum, product) => sum + product.price, 0);

  function submitOrder() {
    const total = manualTotal ? Number(manualTotal) : autoTotal;

    if (!customer.trim() || !phone.trim() || selectedProducts.length === 0 || !Number.isFinite(total)) {
      setMessage("اكتبي اسم العميلة، الهاتف، واختاري منتجًا واحدًا على الأقل.");
      return;
    }

    const timestamp = Date.now();
    onCreate({
      id: `WH-${String(timestamp).slice(-6)}`,
      customer: customer.trim(),
      phone: phone.trim(),
      products: selectedProducts.map((product) => product.name),
      total,
      notes: notes.trim() || "بدون ملاحظات",
      status,
      createdAt: new Date().toISOString().slice(0, 10),
      isGift,
      giftMessage: isGift ? giftMessage.trim() : ""
    });
    setCustomer("");
    setPhone("");
    setSelected([]);
    setNotes("");
    setManualTotal("");
    setStatus("جديد");
    setIsGift(false);
    setGiftMessage("");
    setMessage("تمت إضافة الطلب.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_370px]">
      <Panel title="إدارة الطلبات" icon={ShoppingBag}>
        <OrdersTable orders={orders} onStatus={onStatus} onDelete={onDelete} />
      </Panel>

      <Panel title="إضافة طلب يدوي" icon={PackageCheck}>
        <div className="space-y-3">
          <input className="AdminInput" value={customer} onChange={(event) => setCustomer(event.target.value)} placeholder="اسم العميلة" />
          <input className="AdminInput" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="رقم الهاتف" inputMode="tel" />
          <div className="max-h-64 space-y-2 overflow-y-auto rounded-[8px] border border-wahaj-border bg-wahaj-bg p-2 admin-scrollbar">
            {products.map((product) => (
              <label key={product.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-white px-3 py-2 text-sm">
                <span className="line-clamp-1 font-bold">{product.name}</span>
                <input
                  type="checkbox"
                  checked={selected.includes(product.id)}
                  onChange={() => setSelected((current) => toggleArray(current, product.id))}
                />
              </label>
            ))}
          </div>
          <div className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold text-wahaj-ink">
            الإجمالي التلقائي: {formatPrice(autoTotal)}
          </div>
          <input className="AdminInput" value={manualTotal} onChange={(event) => setManualTotal(event.target.value)} placeholder="إجمالي مخصص اختياري" inputMode="numeric" />
          <textarea className="AdminInput min-h-24 py-3" value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="ملاحظات الطلب" />
          <label className="flex items-center justify-between rounded-[8px] border border-wahaj-border bg-white px-3 py-2 text-sm font-bold">
            إرسال كهدية وتغليف فاخر 🎁
            <input type="checkbox" checked={isGift} onChange={(event) => setIsGift(event.target.checked)} />
          </label>
          {isGift ? (
            <input className="AdminInput" value={giftMessage} onChange={(event) => setGiftMessage(event.target.value)} placeholder="رسالة الإهداء" />
          ) : null}
          <select className="AdminInput" value={status} onChange={(event) => setStatus(event.target.value as OrderStatus)}>
            {orderStatuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          {message ? <p className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold">{message}</p> : null}
          <button onClick={submitOrder} className="min-h-11 w-full rounded-full bg-wahaj-rose px-4 font-bold text-white">
            حفظ الطلب
          </button>
        </div>
      </Panel>
    </div>
  );
}

function OrdersTable({
  orders,
  compact,
  onStatus,
  onDelete
}: {
  orders: Order[];
  compact?: boolean;
  onStatus?: (orderId: string, status: OrderStatus) => void;
  onDelete?: (orderId: string) => void;
}) {
  return (
    <div className="overflow-x-auto admin-scrollbar">
      <table className="w-full min-w-[900px] text-sm">
        <thead>
          <tr className="border-b border-wahaj-border text-right text-wahaj-text/62">
            <th className="py-3">الطلب</th>
            <th>العميلة</th>
            <th>المنتجات</th>
            <th>الإجمالي</th>
            <th>الملاحظات</th>
            <th>الحالة</th>
            {!compact ? <th>إجراءات</th> : null}
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-wahaj-border/70">
              <td className="py-3 font-bold text-wahaj-ink">
                <p>{order.id}</p>
                <p className="text-xs font-normal text-wahaj-text/55">{order.createdAt}</p>
              </td>
              <td>
                <p className="font-bold">{order.customer}</p>
                <p className="text-xs text-wahaj-text/55">{order.phone}</p>
              </td>
              <td className="max-w-72">
                <p className="line-clamp-2">{order.products.join("، ")}</p>
              </td>
              <td className="font-bold text-wahaj-rose">{formatPrice(order.total)}</td>
              <td>
                <p className="line-clamp-2">{order.notes}</p>
                {order.isGift ? (
                  <div className="mt-1 flex flex-col gap-1 rounded bg-wahaj-rose/10 p-1.5 text-xs text-wahaj-rose border border-wahaj-rose/20">
                    <span className="font-bold">🎁 هدية وتغليف فاخر</span>
                    {order.giftMessage ? (
                      <span className="italic">"{order.giftMessage}"</span>
                    ) : (
                      <span className="text-[10px] text-wahaj-rose/60">(بدون رسالة إهداء)</span>
                    )}
                  </div>
                ) : null}
              </td>
              <td>
                {onStatus ? (
                  <select
                    value={order.status}
                    onChange={(event) => onStatus(order.id, event.target.value as OrderStatus)}
                    className={`rounded-full border px-3 py-2 text-xs font-bold outline-none ${statusClass[order.status]}`}
                  >
                    {orderStatuses.map((status) => (
                      <option key={status}>{status}</option>
                    ))}
                  </select>
                ) : (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${statusClass[order.status]}`}>
                    {order.status}
                  </span>
                )}
              </td>
              {!compact ? (
                <td>
                  <div className="flex gap-2">
                    <a
                      href={`https://wa.me/${normalizePhone(order.phone)}?text=${encodeURIComponent(buildOrderMessage(order))}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-wahaj-success text-white"
                      aria-label="رسالة واتساب"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </a>
                    {onDelete ? (
                      <button
                        onClick={() => onDelete(order.id)}
                        className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-red-100 bg-red-50 text-red-600"
                        aria-label="حذف الطلب"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
      {orders.length === 0 ? <EmptyState text="لا توجد طلبات بعد." /> : null}
    </div>
  );
}

function CustomersManager({
  customers,
  onToggleVip
}: {
  customers: CustomerRecord[];
  onToggleVip: (phone: string) => void;
}) {
  if (customers.length === 0) {
    return <EmptyState text="سيظهر ملف العميلة تلقائيًا بعد تسجيل أول طلب." />;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {customers.map((customer) => (
        <Panel key={customer.id} title={customer.name} icon={UsersRound}>
          <div className="space-y-3 text-sm">
            <InfoRow label="الهاتف" value={customer.phone} />
            <InfoRow label="عدد الطلبات" value={customer.orders.toLocaleString("ar-YE")} />
            <InfoRow label="إجمالي الطلبات" value={formatPrice(customer.total)} />
            <InfoRow label="آخر طلب" value={customer.lastOrder} />
            <div className="rounded-[8px] bg-wahaj-card p-3">
              <p className="font-bold text-wahaj-ink">احفظي للإلهام</p>
              <p className="mt-1 leading-6 text-wahaj-text/70">{customer.inspiration.join("، ") || "لا توجد منتجات محفوظة بعد."}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onToggleVip(customer.phone)}
                className={`min-h-10 rounded-full px-3 text-sm font-bold ${
                  customer.vip ? "bg-wahaj-success/20 text-wahaj-ink" : "bg-wahaj-card text-wahaj-rose"
                }`}
              >
                {customer.vip ? "VIP مفعلة" : "تفعيل VIP"}
              </button>
              <a
                href={`https://wa.me/${normalizePhone(customer.phone)}?text=${encodeURIComponent(`مرحبًا ${customer.name}، معك وهاج بخصوص طلباتك.`)}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-10 items-center justify-center rounded-full bg-wahaj-success px-3 text-sm font-bold text-white"
              >
                واتساب
              </a>
            </div>
          </div>
        </Panel>
      ))}
    </div>
  );
}

function CouponsManager({
  coupons,
  onCreate,
  onDelete,
  onToggle
}: {
  coupons: ManagedCoupon[];
  onCreate: (coupon: ManagedCoupon) => void;
  onDelete: (couponId: string) => void;
  onToggle: (couponId: string) => void;
}) {
  const [code, setCode] = useState("");
  const [type, setType] = useState<"percentage" | "fixed">("percentage");
  const [value, setValue] = useState("");
  const [usageLimit, setUsageLimit] = useState("100");
  const [minOrder, setMinOrder] = useState("10000");
  const [expiresAt, setExpiresAt] = useState("2026-12-31");
  const [message, setMessage] = useState("");

  function submitCoupon() {
    const parsedValue = Number(value);
    const parsedLimit = Number(usageLimit);
    const parsedMin = Number(minOrder);

    if (!code.trim() || !Number.isFinite(parsedValue) || parsedValue <= 0 || !expiresAt) {
      setMessage("اكتبي كود الكوبون والقيمة وتاريخ الانتهاء.");
      return;
    }

    onCreate({
      id: `coupon-${Date.now()}`,
      code: code.trim().toUpperCase(),
      type,
      value: parsedValue,
      expiresAt,
      usageLimit: Number.isFinite(parsedLimit) ? parsedLimit : 100,
      minOrder: Number.isFinite(parsedMin) ? parsedMin : 0,
      used: 0,
      active: true,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    setCode("");
    setValue("");
    setExpiresAt("2026-12-31");
    setMessage("تم حفظ الكوبون.");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
      <Panel title="الكوبونات" icon={BadgePercent}>
        <div className="grid gap-3 md:grid-cols-2">
          {coupons.map((coupon) => (
            <div key={coupon.id} className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="font-thmanyah-text text-2xl font-bold text-wahaj-ink">{coupon.code}</p>
                <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-wahaj-rose">
                  {coupon.type === "percentage" ? `${coupon.value}%` : formatPrice(coupon.value)}
                </span>
              </div>
              <div className="mt-4 grid gap-2 text-sm">
                <InfoRow label="تاريخ الانتهاء" value={coupon.expiresAt} />
                <InfoRow label="حد الاستخدام" value={coupon.usageLimit.toLocaleString("ar-YE")} />
                <InfoRow label="المستخدم" value={(coupon.used || 0).toLocaleString("ar-YE")} />
                <InfoRow label="الحد الأدنى" value={formatPrice(coupon.minOrder)} />
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => onToggle(coupon.id)}
                  className={`min-h-9 rounded-full px-3 text-xs font-bold ${
                    coupon.active === false ? "bg-red-50 text-red-600" : "bg-wahaj-success/20 text-wahaj-ink"
                  }`}
                >
                  {coupon.active === false ? "متوقف" : "نشط"}
                </button>
                <button onClick={() => onDelete(coupon.id)} className="min-h-9 rounded-full bg-red-50 px-3 text-xs font-bold text-red-600">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
        {coupons.length === 0 ? <EmptyState text="لا توجد كوبونات محفوظة." /> : null}
      </Panel>

      <Panel title="إنشاء كوبون" icon={BadgePercent}>
        <div className="space-y-3">
          <input className="AdminInput" value={code} onChange={(event) => setCode(event.target.value)} placeholder="CODE" />
          <select className="AdminInput" value={type} onChange={(event) => setType(event.target.value as "percentage" | "fixed")}>
            <option value="percentage">نسبة خصم</option>
            <option value="fixed">مبلغ ثابت</option>
          </select>
          <div className="grid grid-cols-2 gap-2">
            <input className="AdminInput" value={value} onChange={(event) => setValue(event.target.value)} placeholder="القيمة" inputMode="numeric" />
            <input className="AdminInput" value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} placeholder="حد الاستخدام" inputMode="numeric" />
          </div>
          <input className="AdminInput" type="date" value={expiresAt} onChange={(event) => setExpiresAt(event.target.value)} />
          <input className="AdminInput" value={minOrder} onChange={(event) => setMinOrder(event.target.value)} placeholder="حد أدنى للطلب" inputMode="numeric" />
          {message ? <p className="rounded-[8px] bg-wahaj-card p-3 text-sm font-bold">{message}</p> : null}
          <button onClick={submitCoupon} className="min-h-11 w-full rounded-full bg-wahaj-rose px-4 font-bold text-white">
            حفظ الكوبون
          </button>
        </div>
      </Panel>
    </div>
  );
}

function ContentManager({
  content,
  onContentChange,
  products,
  onMoveProduct,
  stories,
  onUpdateStory,
  onAddStory,
  onDeleteStory,
  productSyncLabel
}: {
  content: SiteContent;
  onContentChange: (content: SiteContent) => void;
  products: ManagedProduct[];
  onMoveProduct: (productId: string, direction: -1 | 1) => void;
  stories: ManagedStory[];
  onUpdateStory: (storyId: string, patch: Partial<ManagedStory>) => void;
  onAddStory: (story: ManagedStory) => void;
  onDeleteStory: (storyId: string) => void;
  productSyncLabel: string;
}) {
  const [draft, setDraft] = useState(content);
  const [newStoryTitle, setNewStoryTitle] = useState("");
  const [newStoryImage, setNewStoryImage] = useState("https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=420&q=80");
  const [newStoryTarget, setNewStoryTarget] = useState<StoryTarget>("all");

  useEffect(() => {
    setDraft(content);
  }, [content]);

  function submitStory() {
    if (!newStoryTitle.trim() || !newStoryImage.trim()) return;
    onAddStory({
      id: `story-${Date.now()}`,
      title: newStoryTitle.trim(),
      image: newStoryImage.trim(),
      color: "#D89CA4",
      visible: true,
      target: newStoryTarget
    });
    setNewStoryTitle("");
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <div className="xl:col-span-2">
        <MenuIconsManager />
      </div>

      <Panel title="البنرات والنصوص" icon={FileText}>
        <div className="space-y-3">
          <input className="AdminInput" value={draft.heroBadge} onChange={(event) => setDraft({ ...draft, heroBadge: event.target.value })} placeholder="وسم الهيرو" />
          <input className="AdminInput" value={draft.heroTitle} onChange={(event) => setDraft({ ...draft, heroTitle: event.target.value })} placeholder="عنوان الهيرو" />
          <textarea className="AdminInput min-h-28 py-3" value={draft.heroDescription} onChange={(event) => setDraft({ ...draft, heroDescription: event.target.value })} placeholder="وصف الهيرو" />
          <div className="grid grid-cols-2 gap-2">
            <input className="AdminInput" value={draft.primaryCta} onChange={(event) => setDraft({ ...draft, primaryCta: event.target.value })} placeholder="زر رئيسي" />
            <input className="AdminInput" value={draft.secondaryCta} onChange={(event) => setDraft({ ...draft, secondaryCta: event.target.value })} placeholder="زر ثانوي" />
          </div>
          <textarea
            className="AdminInput min-h-32 py-3"
            value={draft.offerMessages.join("\n")}
            onChange={(event) => setDraft({ ...draft, offerMessages: splitList(event.target.value) })}
            placeholder="شريط العروض، كل عرض في سطر"
          />
          <div className="grid gap-2 sm:grid-cols-2">
            <button onClick={() => onContentChange(draft)} className="min-h-11 rounded-full bg-wahaj-rose px-5 font-bold text-white">
              تحديث الواجهة
            </button>
            <button
              onClick={() => {
                setDraft(defaultSiteContent);
                onContentChange(defaultSiteContent);
              }}
              className="min-h-11 rounded-full border border-wahaj-border bg-white px-5 font-bold text-wahaj-rose"
            >
              استعادة الافتراضي
            </button>
          </div>
        </div>
      </Panel>

      <Panel title="ترتيب المنتجات" icon={GripVertical}>
        <div className="space-y-2">
          {products.map((product, index) => (
            <div key={product.id} className="flex items-center justify-between gap-3 rounded-[8px] bg-wahaj-card px-3 py-2">
              <div className="flex min-w-0 items-center gap-2">
                <GripVertical className="h-4 w-4 shrink-0 text-wahaj-rose" />
                <span className="truncate text-sm font-bold">{product.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white px-2 py-1 text-xs">{index + 1}</span>
                <button
                  onClick={() => onMoveProduct(product.id, -1)}
                  disabled={index === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-wahaj-rose disabled:opacity-35"
                  aria-label="رفع المنتج"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onMoveProduct(product.id, 1)}
                  disabled={index === products.length - 1}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-wahaj-rose disabled:opacity-35"
                  aria-label="خفض المنتج"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Panel title="Stories" icon={ImageIcon}>
        <div className="space-y-3">
          <div className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3">
            <div className="grid gap-2 sm:grid-cols-2">
              <input className="AdminInput" value={newStoryTitle} onChange={(event) => setNewStoryTitle(event.target.value)} placeholder="عنوان Story" />
              <select className="AdminInput" value={newStoryTarget} onChange={(event) => setNewStoryTarget(event.target.value as StoryTarget)}>
                {storyTargets.map((target) => (
                  <option key={target.value} value={target.value}>
                    {target.label}
                  </option>
                ))}
              </select>
            </div>
            <input className="AdminInput mt-2" value={newStoryImage} onChange={(event) => setNewStoryImage(event.target.value)} placeholder="رابط الصورة" />
            <button onClick={submitStory} className="mt-3 min-h-10 rounded-full bg-wahaj-rose px-4 text-sm font-bold text-white">
              إضافة Story
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {stories.map((story) => (
              <div key={story.id} className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-3">
                <input className="AdminInput" value={story.title} onChange={(event) => onUpdateStory(story.id, { title: event.target.value })} />
                <input className="AdminInput mt-2" value={story.image} onChange={(event) => onUpdateStory(story.id, { image: event.target.value })} />
                <select
                  className="AdminInput mt-2"
                  value={story.target || (story.id as StoryTarget)}
                  onChange={(event) => onUpdateStory(story.id, { target: event.target.value as StoryTarget })}
                >
                  {storyTargets.map((target) => (
                    <option key={target.value} value={target.value}>
                      {target.label}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onUpdateStory(story.id, { visible: story.visible === false })}
                    className={`rounded-full px-3 py-1 text-xs font-bold ${
                      story.visible === false ? "bg-red-50 text-red-600" : "bg-wahaj-success/20 text-wahaj-ink"
                    }`}
                  >
                    {story.visible === false ? "مخفية" : "ظاهرة"}
                  </button>
                  <button onClick={() => onDeleteStory(story.id)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>

      <Panel title="حالة الربط" icon={ShieldCheck}>
        <div className="grid gap-2">
          {[
            ["التحكم بالمنتجات", productSyncLabel],
            ["الطلبات والعملاء", "فعلي محليًا"],
            ["البنرات والستوري", "متصل بالواجهة"],
            ["Supabase / Firebase", "جاهز للربط عند إضافة المفاتيح"],
            ["ImageKit", "منتجات /categories و /products"]
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between rounded-[8px] bg-wahaj-card px-3 py-2 text-sm font-bold">
              {label}
              <span className="rounded-full bg-white px-2 py-1 text-xs text-wahaj-rose">{value}</span>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function NotificationsManager({
  notifications,
  onCreate,
  onUpdate,
  onDelete
}: {
  notifications: ManagedNotification[];
  onCreate: (notification: ManagedNotification) => void;
  onUpdate: (notificationId: string, patch: Partial<ManagedNotification>) => void;
  onDelete: (notificationId: string) => void;
}) {
  const [type, setType] = useState(notificationTypes[0]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState("كل العميلات");

  function submit(status: ManagedNotification["status"]) {
    if (!title.trim() || !body.trim()) return;
    onCreate({
      id: `note-${Date.now()}`,
      type,
      title: title.trim(),
      body: body.trim(),
      audience: audience.trim() || "كل العميلات",
      status,
      createdAt: new Date().toISOString().slice(0, 10)
    });
    setTitle("");
    setBody("");
  }

  function useTemplate(templateType: string) {
    setType(templateType);
    setTitle(templateType);
    setBody(`مرحبًا الجميلة، لدينا ${templateType} من وهاج بلمسة ناعمة وكميات مختارة للحجز عبر واتساب.`);
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Panel title="إرسال إشعار" icon={Send}>
        <div className="space-y-3">
          <select className="AdminInput" value={type} onChange={(event) => setType(event.target.value)}>
            {notificationTypes.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
          <input className="AdminInput" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="عنوان الإشعار" />
          <input className="AdminInput" value={audience} onChange={(event) => setAudience(event.target.value)} placeholder="الجمهور" />
          <textarea className="AdminInput min-h-32 py-3" value={body} onChange={(event) => setBody(event.target.value)} placeholder="نص الإشعار" />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => submit("draft")} className="min-h-11 rounded-full border border-wahaj-border bg-white font-bold text-wahaj-rose">
              حفظ مسودة
            </button>
            <button onClick={() => submit("sent")} className="flex min-h-11 items-center justify-center gap-2 rounded-full bg-wahaj-rose font-bold text-white">
              <Send className="h-5 w-5" />
              إرسال
            </button>
          </div>
        </div>
      </Panel>

      <div className="space-y-5">
        <Panel title="قوالب جاهزة" icon={Bell}>
          <div className="grid gap-3 md:grid-cols-2">
            {notificationTypes.map((item) => (
              <button
                key={item}
                onClick={() => useTemplate(item)}
                className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-4 text-right transition hover:border-wahaj-rose"
              >
                <p className="font-bold text-wahaj-ink">{item}</p>
                <p className="mt-2 text-sm leading-7 text-wahaj-text/70">اضغطي لاستخدام قالب قابل للتعديل.</p>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="سجل الإشعارات" icon={FileText}>
          <div className="grid gap-3 md:grid-cols-2">
            {notifications.map((notification) => (
              <div key={notification.id} className="rounded-[8px] border border-wahaj-border bg-wahaj-bg p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-wahaj-ink">{notification.title}</p>
                  <span className={`rounded-full px-3 py-1 text-xs font-bold ${notification.status === "sent" ? "bg-wahaj-success/20" : "bg-white"}`}>
                    {notification.status === "sent" ? "مرسل" : "مسودة"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-7 text-wahaj-text/70">{notification.body}</p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => onUpdate(notification.id, { status: notification.status === "sent" ? "draft" : "sent" })}
                    className="rounded-full bg-white px-3 py-1 text-xs font-bold text-wahaj-rose"
                  >
                    تبديل الحالة
                  </button>
                  <button onClick={() => onDelete(notification.id)} className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-600">
                    حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
          {notifications.length === 0 ? <EmptyState text="لا توجد إشعارات محفوظة." /> : null}
        </Panel>
      </div>
    </div>
  );
}

function AnalyticsManager({
  topViewed,
  topSold,
  salesData,
  categoryData,
  activityData,
  conversionRate,
  abandonedRate
}: {
  topViewed: ManagedProduct[];
  topSold: ManagedProduct[];
  salesData: SalesPoint[];
  categoryData: Array<{ name: string; value: number }>;
  activityData: Array<{ time: string; visits: number }>;
  conversionRate: number;
  abandonedRate: number;
}) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="أوقات النشاط" icon={Eye}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid stroke="#E8D6D6" strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fill: "#6B4E4E", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B4E4E", fontSize: 12 }} width={44} />
                <RechartsTooltip />
                <Bar dataKey="visits" fill="#B76E79" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="معدل التحويل" icon={TrendingUp}>
          <div className="grid h-72 place-items-center">
            <div className="text-center">
              <p className="font-thmanyah-text text-6xl font-bold text-wahaj-rose">{conversionRate.toFixed(2)}%</p>
              <p className="mt-3 text-wahaj-text/70">طلبات واتساب مقارنة بمشاهدات المنتجات المسجلة</p>
              <div className="mx-auto mt-6 h-3 w-64 overflow-hidden rounded-full bg-wahaj-card">
                <div className="h-full rounded-full bg-wahaj-rose" style={{ width: `${Math.min(100, conversionRate * 12)}%` }} />
              </div>
              <p className="mt-3 text-sm text-wahaj-text/60">السلات المتروكة تقديريًا: {abandonedRate}%</p>
            </div>
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="المبيعات اليومية" icon={CircleDollarSign}>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <CartesianGrid stroke="#E8D6D6" strokeDasharray="3 3" />
                <XAxis dataKey="day" tick={{ fill: "#6B4E4E", fontSize: 12 }} />
                <YAxis tick={{ fill: "#6B4E4E", fontSize: 12 }} width={44} />
                <RechartsTooltip />
                <Area type="monotone" dataKey="orders" stroke="#8FAF9A" fill="#8FAF9A33" strokeWidth={3} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="أفضل الأقسام" icon={Tags}>
          <div className="space-y-3">
            {categoryData.map((item, index) => (
              <div key={item.name} className="rounded-[8px] bg-wahaj-card p-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span>{item.name}</span>
                  <span className="text-wahaj-rose">{item.value.toLocaleString("ar-YE")}</span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(100, item.value)}%`,
                      backgroundColor: chartColors[index % chartColors.length]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <Ranking title="أكثر المنتجات مشاهدة" products={topViewed} metric="views" />
        <Ranking title="الأكثر مبيعًا" products={topSold} metric="sold" />
      </div>
    </div>
  );
}

function AiAssistant({ initialName }: { initialName: string }) {
  const [type, setType] = useState("description");
  const [productName, setProductName] = useState(initialName || "طقم لونا زركون روز");
  const [details, setDetails] = useState("قطعة روز قولد مناسبة للمناسبات");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialName) {
      setProductName(initialName);
    }
  }, [initialName]);

  async function generate() {
    setLoading(true);
    setResult("");

    try {
      const response = await fetch("/api/admin/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, productName, details })
      });
      const payload = await response.json().catch(() => null);
      setResult(payload?.result || payload?.message || "تعذر التوليد الآن.");
    } catch {
      setResult("تعذر الاتصال بخدمة AI الآن. القوالب المحلية ستعمل بعد تشغيل الخادم.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[380px_1fr]">
      <Panel title="مساعد وهاج AI" icon={WandSparkles}>
        <div className="space-y-3">
          <select value={type} onChange={(event) => setType(event.target.value)} className="AdminInput">
            <option value="description">توليد وصف المنتج</option>
            <option value="instagram">كتابة Caption انستقرام</option>
            <option value="whatsapp">نص واتساب تسويقي</option>
            <option value="pricing">اقتراح أسعار</option>
            <option value="image">تحسين الصور</option>
          </select>
          <input value={productName} onChange={(event) => setProductName(event.target.value)} className="AdminInput" />
          <textarea value={details} onChange={(event) => setDetails(event.target.value)} className="AdminInput min-h-32 py-3" />
          <button
            onClick={generate}
            disabled={loading}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-wahaj-rose px-4 font-bold text-white disabled:opacity-60"
          >
            <WandSparkles className="h-5 w-5" />
            {loading ? "جار التوليد..." : "توليد"}
          </button>
        </div>
      </Panel>
      <Panel title="الناتج" icon={FileText}>
        <div className="min-h-72 whitespace-pre-line rounded-[8px] border border-wahaj-border bg-wahaj-bg p-4 leading-8 text-wahaj-ink">
          {result || "سيظهر النص هنا بعد التوليد."}
        </div>
      </Panel>
    </div>
  );
}

function Ranking({ title, products, metric }: { title: string; products: ManagedProduct[]; metric: "views" | "sold" }) {
  return (
    <Panel title={title} icon={metric === "views" ? Eye : TrendingUp}>
      <div className="space-y-3">
        {products.map((product, index) => (
          <div key={product.id} className="flex items-center gap-3 rounded-[8px] bg-wahaj-card px-3 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white font-bold text-wahaj-rose">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-wahaj-ink">{product.name}</p>
              <p className="text-xs text-wahaj-text/55">{metric === "views" ? "مشاهدة" : "مبيع"}</p>
            </div>
            <span className="font-bold text-wahaj-rose">{product[metric].toLocaleString("ar-YE")}</span>
          </div>
        ))}
        {products.length === 0 ? <EmptyState text="لا توجد بيانات كافية بعد." /> : null}
      </div>
    </Panel>
  );
}

function ToggleChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-3 py-1 text-xs font-bold ${
        active ? "border-wahaj-rose bg-wahaj-soft text-wahaj-rose" : "border-wahaj-border bg-white text-wahaj-text"
      }`}
    >
      {label}
    </button>
  );
}

function InfoPill({ label, value, tone }: { label: string; value: string; tone: "warning" | "rose" | "success" }) {
  const toneClass = {
    warning: "bg-wahaj-warning/18 text-wahaj-ink",
    rose: "bg-wahaj-soft text-wahaj-rose",
    success: "bg-wahaj-success/18 text-wahaj-ink"
  }[tone];

  return (
    <div className="flex items-center justify-between rounded-[8px] bg-wahaj-card px-3 py-2 text-sm font-bold">
      <span>{label}</span>
      <span className={`rounded-full px-3 py-1 ${toneClass}`}>{value}</span>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-wahaj-text/64">{label}</span>
      <span className="font-bold text-wahaj-ink">{value}</span>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[8px] border border-dashed border-wahaj-border bg-wahaj-bg p-5 text-center text-sm font-bold text-wahaj-text/70">
      {text}
    </div>
  );
}

function Panel({
  title,
  icon: Icon,
  children
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[8px] border border-wahaj-border bg-white p-4 shadow-soft">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="font-thmanyah-text text-xl font-bold text-wahaj-ink">{title}</h2>
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-wahaj-soft text-wahaj-rose">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {children}
    </section>
  );
}

function splitList(value: string) {
  return value
    .split(/[\n,،]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function toggleArray<T>(items: T[], item: T) {
  return items.includes(item) ? items.filter((current) => current !== item) : [...items, item];
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}

function inventoryFromStock(stock: number) {
  if (stock <= 0) return "نفد";
  if (stock <= 8) return "منخفض";
  return "متوفر";
}

function getCategoryName(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.name || categoryId;
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("967")) return digits;
  return `967${digits.replace(/^0+/, "")}`;
}

function buildOrderMessage(order: Order) {
  return [
    `مرحبًا ${order.customer}`,
    `معك وهاج بخصوص طلبك ${order.id}.`,
    "",
    "المنتجات:",
    ...order.products.map((product) => `- ${product}`),
    "",
    `الإجمالي: ${formatPrice(order.total)}`,
    `الحالة: ${order.status}`,
    order.notes ? `الملاحظات: ${order.notes}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function buildCustomerRecords(orders: Order[], vipPhones: string[]): CustomerRecord[] {
  const records = new Map<string, CustomerRecord>();

  for (const order of orders) {
    const key = order.phone || order.customer;
    const current =
      records.get(key) ||
      ({
        id: key,
        name: order.customer,
        phone: order.phone,
        orders: 0,
        total: 0,
        vip: false,
        inspiration: [],
        lastOrder: order.createdAt
      } satisfies CustomerRecord);

    current.orders += 1;
    if (order.status !== "ملغي") {
      current.total += order.total;
    }
    current.lastOrder = order.createdAt > current.lastOrder ? order.createdAt : current.lastOrder;
    current.inspiration = Array.from(new Set([...current.inspiration, ...order.products])).slice(0, 5);
    current.vip = vipPhones.includes(order.phone) || current.orders >= 3 || current.total >= 50000;
    records.set(key, current);
  }

  return Array.from(records.values()).sort((a, b) => b.total - a.total);
}

function buildSalesData(orders: Order[]): SalesPoint[] {
  const map = new Map<string, SalesPoint>();

  for (const order of orders.filter((item) => item.status !== "ملغي")) {
    const date = order.createdAt || "غير محدد";
    const parsed = new Date(`${date}T00:00:00`);
    const day = Number.isNaN(parsed.getTime())
      ? date
      : new Intl.DateTimeFormat("ar-YE", { weekday: "short", day: "numeric" }).format(parsed);
    const current = map.get(date) || { sort: date, day, orders: 0, revenue: 0 };
    current.orders += 1;
    current.revenue += order.total;
    map.set(date, current);
  }

  const values = Array.from(map.values()).sort((a, b) => a.sort.localeCompare(b.sort)).slice(-7);
  return values.length > 0 ? values : analytics.sales.map((item) => ({ ...item, sort: item.day }));
}

function buildCategoryData(products: ManagedProduct[]) {
  return categories
    .map((category) => {
      const categoryProducts = products.filter((product) => product.category === category.id);
      const value = categoryProducts.reduce((sum, product) => sum + product.sold, 0) || categoryProducts.length;
      return { name: category.name, value };
    })
    .filter((item) => item.value > 0);
}

function buildActivityData(products: ManagedProduct[]) {
  const totalViews = products.reduce((sum, product) => sum + product.views, 0);
  const ratios = [0.12, 0.18, 0.26, 0.27, 0.17];

  return analytics.activity.map((item, index) => ({
    time: item.time,
    visits: Math.round(totalViews * ratios[index])
  }));
}
