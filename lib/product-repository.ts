import "server-only";
import type { ManagedProduct } from "./admin-local";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_PRODUCTS_COLLECTION, productToRow, rowSortOrder, rowToManagedProduct } from "./product-record";

/**
 * Firestore persistence boundary for the product catalog.
 */
class ProductRepository {
  isConfigured() {
    return Boolean(getFirebaseFirestoreAdmin());
  }

  async getAllProducts(): Promise<ManagedProduct[] | null> {
    const firestore = getFirebaseFirestoreAdmin();

    if (!firestore) {
      return null;
    }

    const snapshot = await firestore.collection(FIRESTORE_PRODUCTS_COLLECTION).get();

    return snapshot.docs
      .map((doc, index) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          sortOrder: rowSortOrder(data, index),
          product: this.mapProductRow(doc.id, data)
        };
      })
      .filter((item) => item.product)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.product as ManagedProduct);
  }

  async createProduct(product: ManagedProduct, options: { sortOrder?: number } = {}) {
    const { collection } = this.getConfiguredCollection();

    await collection.doc(product.id).create({
      ...productToRow(product),
      sort_order: options.sortOrder ?? 0
    });

    return { product, saved: true as const };
  }

  async updateProduct(product: ManagedProduct) {
    const { collection } = this.getConfiguredCollection();
    await collection.doc(product.id).update(productToRow(product));

    return { product, saved: true as const };
  }

  async deleteProduct(id: string) {
    const { collection } = this.getConfiguredCollection();
    await collection.doc(id).delete();

    return { deleted: true as const };
  }

  async reorderProducts({ productId, adjacentProductId }: { productId: string; adjacentProductId: string }) {
    const { firestore, collection } = this.getConfiguredCollection();
    const productRef = collection.doc(productId);
    const adjacentProductRef = collection.doc(adjacentProductId);
    const [productSnapshot, adjacentProductSnapshot] = await Promise.all([productRef.get(), adjacentProductRef.get()]);

    if (!productSnapshot.exists || !adjacentProductSnapshot.exists) {
      throw new Error("The product to reorder no longer exists.");
    }

    const productSortOrder = rowSortOrder(productSnapshot.data() as Record<string, unknown>, 0);
    const adjacentProductSortOrder = rowSortOrder(adjacentProductSnapshot.data() as Record<string, unknown>, 0);
    const batch = firestore.batch();

    batch.update(productRef, { sort_order: adjacentProductSortOrder });
    batch.update(adjacentProductRef, { sort_order: productSortOrder });

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
      collection: firestore.collection(FIRESTORE_PRODUCTS_COLLECTION)
    };
  }

  private mapProductRow(id: string, data: Record<string, unknown>): ManagedProduct | null {
    return rowToManagedProduct({ id, ...data });
  }
}

export const productRepository = new ProductRepository();
