import type { ManagedCategory } from "./admin-local";
import { parseStoredImages, storeImage } from "./imagekit";

export const FIRESTORE_CATEGORIES_COLLECTION = "categories";

type CategoryRow = Record<string, unknown>;

export function rowToManagedCategory(row: CategoryRow): ManagedCategory | null {
  const id = stringValue(row.id);
  const name = stringValue(row.name);
  const imageList = parseStoredImages(row.image ?? row.images);
  const image =
    imageList.length > 0
      ? imageList[0]
      : storeImage("https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1100&q=85");

  if (!id || !name) {
    return null;
  }

  return {
    id,
    slug: stringValue(row.slug) || createSlug(name) || id,
    name,
    image,
    description: stringValue(row.description) || undefined,
    sortOrder: numberValue(row.sortOrder ?? row.sort_order, 0),
    visible: booleanValue(row.visible, true),
    linkedProducts: arrayValue(row.linkedProducts ?? row.linked_products),
    createdAt: stringValue(row.createdAt ?? row.created_at) || undefined,
    updatedAt: stringValue(row.updatedAt ?? row.updated_at) || undefined
  };
}

export function categoryToRow(category: ManagedCategory) {
  return {
    id: category.id,
    slug: category.slug,
    name: category.name,
    image: category.image,
    description: category.description ?? "",
    sort_order: category.sortOrder,
    visible: category.visible !== false,
    linked_products: category.linkedProducts ?? [],
    created_at: category.createdAt ?? new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function rowSortOrder(row: CategoryRow, fallback: number) {
  return numberValue(row.sort_order ?? row.sortOrder, fallback);
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

function booleanValue(value: unknown, fallback: boolean) {
  return typeof value === "boolean" ? value : fallback;
}

export function createSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")
    .replace(/^-+|-+$/g, "");
}
