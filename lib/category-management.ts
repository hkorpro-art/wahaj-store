import "server-only";

import type { ManagedCategory } from "./admin-local";
import { seedCategories } from "./categories";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_CATEGORIES_COLLECTION, categoryToRow, rowSortOrder, rowToManagedCategory } from "./category-record";

type CategorySource = "firebase" | "seed";

export async function getManagedCategories(): Promise<{ categories: ManagedCategory[]; source: CategorySource }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore.collection(FIRESTORE_CATEGORIES_COLLECTION).get();
      const managedCategories = snapshot.docs
        .map((doc, index) => {
          const data = doc.data() as Record<string, unknown>;
          return {
            sortOrder: rowSortOrder(data, index),
            category: rowToManagedCategory({ id: doc.id, ...data })
          };
        })
        .filter((item) => item.category)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.category as ManagedCategory);

      if (managedCategories.length > 0) {
        return {
          categories: managedCategories,
          source: "firebase"
        };
      } else {
        console.log("No categories in Firestore. Seeding default categories...");
        await saveManagedCategories(seedCategories);
        return {
          categories: seedCategories,
          source: "seed"
        };
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load categories from Firebase:", message);
    }
  }

  return { categories: seedCategories, source: "seed" };
}

export async function saveManagedCategories(categories: ManagedCategory[]) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  const batch = firestore.batch();
  const collection = firestore.collection(FIRESTORE_CATEGORIES_COLLECTION);
  const nextIds = new Set(categories.map((cat) => cat.id));

  categories.forEach((cat, index) => {
    const ref = collection.doc(cat.id);
    batch.set(ref, { ...categoryToRow(cat), sort_order: index });
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
