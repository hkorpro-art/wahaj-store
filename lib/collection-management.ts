import "server-only";

import type { ManagedCollection } from "./admin-local";
import { seedCollections } from "./collections";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_COLLECTIONS_COLLECTION, collectionToRow, rowSortOrder, rowToManagedCollection } from "./collection-record";

type CollectionSource = "firebase" | "seed";

export async function getManagedCollections(): Promise<{ collections: ManagedCollection[]; source: CollectionSource }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore.collection(FIRESTORE_COLLECTIONS_COLLECTION).get();
      const managedCollections = snapshot.docs
        .map((doc, index) => {
          const data = doc.data() as Record<string, unknown>;
          return {
            sortOrder: rowSortOrder(data, index),
            collection: rowToManagedCollection({ id: doc.id, ...data })
          };
        })
        .filter((item) => item.collection)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.collection as ManagedCollection);

      if (managedCollections.length > 0) {
        return {
          collections: managedCollections,
          source: "firebase"
        };
      } else {
        console.log("No collections in Firestore. Seeding default collections...");
        await saveManagedCollections(seedCollections);
        return {
          collections: seedCollections,
          source: "seed"
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load collections from Firebase:", message);
    }
  }

  return { collections: seedCollections, source: "seed" };
}

export async function saveManagedCollections(collections: ManagedCollection[]) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  const batch = firestore.batch();
  const collection = firestore.collection(FIRESTORE_COLLECTIONS_COLLECTION);
  const nextIds = new Set(collections.map((cat) => cat.id));

  collections.forEach((cat, index) => {
    const ref = collection.doc(cat.id);
    batch.set(ref, { ...collectionToRow(cat), sort_order: index });
  });

  const snapshot = await collection.select().get();
  snapshot.docs.forEach((doc) => {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();

  return { saved: true as const };
}
