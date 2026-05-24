import type { ManagedProduct } from "./admin-local";
import { products as seedProducts } from "./data";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { FIRESTORE_PRODUCTS_COLLECTION, productToRow, rowSortOrder, rowToManagedProduct } from "./product-record";

type ProductSource = "firebase" | "seed";

export function seedManagedProducts(): ManagedProduct[] {
  return seedProducts.map((product) => ({ ...product, visible: true }));
}

export async function getManagedProducts(): Promise<{ products: ManagedProduct[]; source: ProductSource }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore.collection(FIRESTORE_PRODUCTS_COLLECTION).get();
      const managedProducts = snapshot.docs
        .map((doc, index) => {
          const data = doc.data() as Record<string, unknown>;
          return {
            sortOrder: rowSortOrder(data, index),
            product: rowToManagedProduct({ id: doc.id, ...data })
          };
        })
        .filter((item) => item.product)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((item) => item.product as ManagedProduct);

      return {
        products: managedProducts.length > 0 ? managedProducts : seedManagedProducts(),
        source: "firebase"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load products from Firebase:", message);
    }
  }

  return { products: seedManagedProducts(), source: "seed" };
}

export async function saveManagedProducts(products: ManagedProduct[]) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  const batch = firestore.batch();
  const collection = firestore.collection(FIRESTORE_PRODUCTS_COLLECTION);
  const nextIds = new Set(products.map((product) => product.id));

  products.forEach((product, index) => {
    const ref = collection.doc(product.id);
    batch.set(ref, { ...productToRow(product), sort_order: index });
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
