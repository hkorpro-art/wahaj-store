import type { ManagedProduct } from "./admin-local";
import { parseStoredImages, storeImage } from "./imagekit";

export const FIRESTORE_PRODUCTS_COLLECTION = "production_products";

type ProductRow = Record<string, unknown>;

export function rowToManagedProduct(row: ProductRow): ManagedProduct | null {
  const id = stringValue(row.id);
  const name = stringValue(row.name);
  const imageList = parseStoredImages(row.images);
  const images =
    imageList.length > 0
      ? imageList
      : [storeImage("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85")];

  if (!id || !name) {
    return null;
  }

  const stock = numberValue(row.stock, 0);

  return {
    id,
    slug: stringValue(row.slug) || createSlug(name) || id,
    name,
    category: stringValue(row.category) || "sets",
    price: numberValue(row.price, 0),
    compareAt: optionalNumber(row.compare_at ?? row.compareAt),
    rating: numberValue(row.rating, 5),
    reviews: numberValue(row.reviews, 0),
    badges: arrayValue(row.badges) as ManagedProduct["badges"],
    status: arrayValue(row.status) as ManagedProduct["status"],
    images,
    colors: arrayValue(row.colors),
    sizes: arrayValue(row.sizes),
    stock,
    inventoryStatus: (stringValue(row.inventory_status ?? row.inventoryStatus) || inventoryFromStock(stock)) as ManagedProduct["inventoryStatus"],
    description: stringValue(row.description),
    material: stringValue(row.material),
    tags: arrayValue(row.tags),
    views: numberValue(row.views, 0),
    sold: numberValue(row.sold, 0),
    visible: booleanValue(row.visible, true),
    discountEndsAt: stringValue(row.discount_ends_at ?? row.discountEndsAt) || undefined,
    showScarcity: booleanValue(row.showScarcity ?? row.show_scarcity, false),
    scarcityText: stringValue(row.scarcityText ?? row.scarcity_text)
  };
}

export function productToRow(product: ManagedProduct) {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    price: product.price,
    compare_at: product.compareAt ?? null,
    rating: product.rating,
    reviews: product.reviews,
    badges: product.badges,
    status: product.status,
    images: product.images,
    colors: product.colors,
    sizes: product.sizes,
    stock: product.stock,
    inventory_status: product.inventoryStatus,
    description: product.description,
    material: product.material,
    tags: product.tags,
    views: product.views,
    sold: product.sold,
    visible: product.visible !== false,
    discount_ends_at: product.discountEndsAt ?? null,
    show_scarcity: product.showScarcity ?? false,
    scarcity_text: product.scarcityText ?? ""
  };
}

export function rowSortOrder(row: ProductRow, fallback: number) {
  return numberValue(row.sort_order, fallback);
}

function arrayValue(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) {
        return parsed.map((item) => String(item).trim()).filter(Boolean);
      }
    } catch {
      return value
        .split(/[\n,،]+/)
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function numberValue(value: unknown, fallback: number) {
  const number = typeof value === "number" ? value : Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function optionalNumber(value: unknown) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
}

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

function inventoryFromStock(stock: number) {
  if (stock <= 0) return "نفد";
  if (stock <= 8) return "منخفض";
  return "متوفر";
}

function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}
