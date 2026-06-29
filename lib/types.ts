import type { StoredImage } from "./imagekit";

export type { StoredImage };

export type ProductBadge = "جديد" | "ترند" | "الأكثر مبيعًا" | "محدود" | "مميز";

export type ProductStatus = "new" | "trend" | "best-seller" | "featured";

export type InventoryStatus = "متوفر" | "منخفض" | "نفد";

export type TrustMessage = {
  icon: string;
  text: string;
  visible: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  brand?: string;
  category: string;
  price: number;
  compareAt?: number;
  rating: number;
  reviews: number;
  badges: ProductBadge[];
  status: ProductStatus[];
  images: StoredImage[];
  colors: string[];
  sizes: string[];
  stock: number;
  inventoryStatus: InventoryStatus;
  description: string;
  material: string;
  tags: string[];
  views: number;
  sold: number;
  showScarcity?: boolean;
  scarcityText?: string;
  categoryIds?: string[];
  badgeIcons?: string[];
  ratingLabel?: string;
  trustMessages?: TrustMessage[];
  whatsappCtaText?: string;
  showColors?: boolean;
  showSizes?: boolean;
  showQuantity?: boolean;
  accordionDetails?: string;
  accordionCare?: string;
  accordionShipping?: string;
  accordionReturns?: string;
  videos?: StoredImage[];
};

export type Collection = {
  id: string;
  name: string;
  slug: string;
  image: StoredImage;
  description?: string;
  sortOrder: number;
  visible: boolean;
  linkedProducts: string[];
  createdAt?: string;
  updatedAt?: string;
};

/** @deprecated Use Collection instead */
export type Category = Collection;

export type Story = {
  id: string;
  title: string;
  image: string;
  color: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
  color?: string;
  size?: string;
};

export type OrderStatus = "جديد" | "تم التواصل" | "مؤكد" | "تم التسليم" | "ملغي";

export type Order = {
  id: string;
  customer: string;
  phone: string;
  products: string[];
  total: number;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  isGift?: boolean;
  giftMessage?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone: string;
  vip: boolean;
  orders: number;
  total: number;
  inspiration: string[];
};

export type Coupon = {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrder: number;
  expiresAt: string;
  usageLimit: number;
  usageCount: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};
