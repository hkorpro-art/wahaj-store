import "server-only";

import { revalidateTag, unstable_cache } from "next/cache";
import { getManagedCategories } from "./category-management";
import { getManagedCollections } from "./collection-management";
import { getManagedProducts } from "./products";

const PUBLIC_PRODUCTS_CACHE_TAG = "public-catalog-products";
const PUBLIC_CATEGORIES_CACHE_TAG = "public-catalog-categories";
const PUBLIC_COLLECTIONS_CACHE_TAG = "public-catalog-collections";
const PUBLIC_CATALOG_REVALIDATE_SECONDS = 300;

export const getCachedProducts = unstable_cache(
  getManagedProducts,
  [PUBLIC_PRODUCTS_CACHE_TAG],
  {
    revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_PRODUCTS_CACHE_TAG]
  }
);

export const getCachedCategories = unstable_cache(
  getManagedCategories,
  [PUBLIC_CATEGORIES_CACHE_TAG],
  {
    revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_CATEGORIES_CACHE_TAG]
  }
);

export const getCachedCollections = unstable_cache(
  getManagedCollections,
  [PUBLIC_COLLECTIONS_CACHE_TAG],
  {
    revalidate: PUBLIC_CATALOG_REVALIDATE_SECONDS,
    tags: [PUBLIC_COLLECTIONS_CACHE_TAG]
  }
);

export async function getCachedFooterNavigation() {
  const [{ collections }, { categories }] = await Promise.all([
    getCachedCollections(),
    getCachedCategories()
  ]);

  return { collections, categories };
}

function invalidateCacheTag(tag: string, label: string) {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    // A cache failure must not turn an already-persisted admin change into a failed response.
    console.error(`Unable to invalidate ${label} cache:`, error);
  }
}

export function invalidateProductsCache() {
  invalidateCacheTag(PUBLIC_PRODUCTS_CACHE_TAG, "public products");
}

export function invalidateCategoriesCache() {
  invalidateCacheTag(PUBLIC_CATEGORIES_CACHE_TAG, "public categories");
}

export function invalidateCollectionsCache() {
  invalidateCacheTag(PUBLIC_COLLECTIONS_CACHE_TAG, "public collections");
}
