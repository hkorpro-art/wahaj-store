type ProductWithCategoryIds = {
  category: string;
  categoryIds?: string[];
};

export const LEGACY_CATEGORY_TO_COLLECTION_ID: Record<string, string> = {
  sets: "atqam",
  earrings: "aqrat",
  bracelets: "asawir"
};

export function getCollectionIdsForLegacyCategory(category: string): string[] {
  const collectionId = LEGACY_CATEGORY_TO_COLLECTION_ID[category];
  return collectionId ? [collectionId] : [];
}

export function ensureProductCategoryIds<T extends ProductWithCategoryIds>(product: T): T {
  if (product.categoryIds?.length) return product;
  const categoryIds = getCollectionIdsForLegacyCategory(product.category);
  return categoryIds.length ? { ...product, categoryIds } : product;
}
