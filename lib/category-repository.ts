import "server-only";

import type { ManagedCategory } from "./admin-local";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_CATEGORIES_COLLECTION, categoryToRow, rowSortOrder, rowToManagedCategory } from "./category-record";

/**
 * Firestore persistence boundary for storefront categories.
 */
class CategoryRepository {
  isConfigured() {
    return Boolean(getFirebaseFirestoreAdmin());
  }

  async getAll(): Promise<ManagedCategory[] | null> {
    const firestore = getFirebaseFirestoreAdmin();

    if (!firestore) {
      return null;
    }

    const snapshot = await firestore.collection(FIRESTORE_CATEGORIES_COLLECTION).get();

    return snapshot.docs
      .map((doc, index) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          sortOrder: rowSortOrder(data, index),
          category: this.mapCategoryRow(doc.id, data)
        };
      })
      .filter((item) => item.category)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.category as ManagedCategory);
  }

  async create(category: ManagedCategory, options: { sortOrder?: number } = {}) {
    const { collection } = this.getConfiguredCollection();

    await collection.doc(category.id).create({
      ...categoryToRow(category),
      sort_order: options.sortOrder ?? category.sortOrder
    });

    return { category, saved: true as const };
  }

  async update(category: ManagedCategory) {
    const { collection } = this.getConfiguredCollection();
    await collection.doc(category.id).update(categoryToRow(category));

    return { category, saved: true as const };
  }

  async delete(id: string) {
    const { collection } = this.getConfiguredCollection();
    await collection.doc(id).delete();

    return { deleted: true as const };
  }

  async reorder({ categoryId, adjacentCategoryId }: { categoryId: string; adjacentCategoryId: string }) {
    const { firestore, collection } = this.getConfiguredCollection();
    const categoryRef = collection.doc(categoryId);
    const adjacentCategoryRef = collection.doc(adjacentCategoryId);
    const [categorySnapshot, adjacentCategorySnapshot] = await Promise.all([categoryRef.get(), adjacentCategoryRef.get()]);

    if (!categorySnapshot.exists || !adjacentCategorySnapshot.exists) {
      throw new Error("The category to reorder no longer exists.");
    }

    const categorySortOrder = rowSortOrder(categorySnapshot.data() as Record<string, unknown>, 0);
    const adjacentCategorySortOrder = rowSortOrder(adjacentCategorySnapshot.data() as Record<string, unknown>, 0);
    const batch = firestore.batch();

    batch.update(categoryRef, { sort_order: adjacentCategorySortOrder });
    batch.update(adjacentCategoryRef, { sort_order: categorySortOrder });

    await batch.commit();

    return { saved: true as const };
  }

  private getConfiguredCollection() {
    const firestore = getFirebaseFirestoreAdmin();

    if (!firestore) {
      throw new Error("Firebase Firestore Admin is not configured.");
    }

    return {
      firestore,
      collection: firestore.collection(FIRESTORE_CATEGORIES_COLLECTION)
    };
  }

  private mapCategoryRow(id: string, data: Record<string, unknown>): ManagedCategory | null {
    return rowToManagedCategory({ id, ...data });
  }
}

export const categoryRepository = new CategoryRepository();
