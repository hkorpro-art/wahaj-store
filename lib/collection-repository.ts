import "server-only";

import type { ManagedCollection } from "./admin-local";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_COLLECTIONS_COLLECTION, collectionToRow, rowSortOrder, rowToManagedCollection } from "./collection-record";

/**
 * Firestore persistence boundary for storefront collections.
 */
class CollectionRepository {
  isConfigured() {
    return Boolean(getFirebaseFirestoreAdmin());
  }

  async getAll(): Promise<ManagedCollection[] | null> {
    const firestore = getFirebaseFirestoreAdmin();

    if (!firestore) {
      return null;
    }

    const snapshot = await firestore.collection(FIRESTORE_COLLECTIONS_COLLECTION).get();

    return snapshot.docs
      .map((doc, index) => {
        const data = doc.data() as Record<string, unknown>;
        return {
          sortOrder: rowSortOrder(data, index),
          collection: this.mapCollectionRow(doc.id, data)
        };
      })
      .filter((item) => item.collection)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item) => item.collection as ManagedCollection);
  }

  async create(collection: ManagedCollection, options: { sortOrder?: number } = {}) {
    const { collection: firestoreCollection } = this.getConfiguredCollection();

    await firestoreCollection.doc(collection.id).create({
      ...collectionToRow(collection),
      sort_order: options.sortOrder ?? collection.sortOrder
    });

    return { collection, saved: true as const };
  }

  async update(collection: ManagedCollection) {
    const { collection: firestoreCollection } = this.getConfiguredCollection();
    await firestoreCollection.doc(collection.id).update(collectionToRow(collection));

    return { collection, saved: true as const };
  }

  async delete(id: string) {
    const { collection } = this.getConfiguredCollection();
    await collection.doc(id).delete();

    return { deleted: true as const };
  }

  async reorder({ collectionId, adjacentCollectionId }: { collectionId: string; adjacentCollectionId: string }) {
    const { firestore, collection } = this.getConfiguredCollection();
    const collectionRef = collection.doc(collectionId);
    const adjacentCollectionRef = collection.doc(adjacentCollectionId);
    const [collectionSnapshot, adjacentCollectionSnapshot] = await Promise.all([collectionRef.get(), adjacentCollectionRef.get()]);

    if (!collectionSnapshot.exists || !adjacentCollectionSnapshot.exists) {
      throw new Error("The collection to reorder no longer exists.");
    }

    const collectionSortOrder = rowSortOrder(collectionSnapshot.data() as Record<string, unknown>, 0);
    const adjacentCollectionSortOrder = rowSortOrder(adjacentCollectionSnapshot.data() as Record<string, unknown>, 0);
    const batch = firestore.batch();

    batch.update(collectionRef, { sort_order: adjacentCollectionSortOrder });
    batch.update(adjacentCollectionRef, { sort_order: collectionSortOrder });

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
      collection: firestore.collection(FIRESTORE_COLLECTIONS_COLLECTION)
    };
  }

  private mapCollectionRow(id: string, data: Record<string, unknown>): ManagedCollection | null {
    return rowToManagedCollection({ id, ...data });
  }
}

export const collectionRepository = new CollectionRepository();
