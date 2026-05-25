import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { orders as seedOrders } from "./data";
import type { Order } from "./types";

export const FIRESTORE_ORDERS_COLLECTION = "production_orders";

export async function getManagedOrders(): Promise<Order[]> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore.collection(FIRESTORE_ORDERS_COLLECTION).get();
      const managedOrders = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          customer: String(data.customer || ""),
          phone: String(data.phone || ""),
          products: Array.isArray(data.products) ? data.products.map(String) : [],
          total: Number(data.total || 0),
          notes: String(data.notes || ""),
          status: data.status || "جديد",
          createdAt: String(data.createdAt || ""),
          isGift: Boolean(data.isGift),
          giftMessage: String(data.giftMessage || "")
        } as Order;
      });

      return managedOrders.sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id));
    } catch (error) {
      console.error("Unable to load orders from Firebase:", error);
    }
  }

  return seedOrders;
}

export async function saveOrder(order: Order) {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      await firestore.collection(FIRESTORE_ORDERS_COLLECTION).doc(order.id).set({
        customer: order.customer,
        phone: order.phone,
        products: order.products,
        total: order.total,
        notes: order.notes,
        status: order.status,
        createdAt: order.createdAt,
        isGift: order.isGift ?? false,
        giftMessage: order.giftMessage ?? ""
      });
      return { saved: true };
    } catch (error) {
      console.error("Unable to save order to Firebase:", error);
    }
  }
  return { saved: false };
}

export async function deleteOrderFromFirestore(orderId: string) {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      await firestore.collection(FIRESTORE_ORDERS_COLLECTION).doc(orderId).delete();
      return { deleted: true };
    } catch (error) {
      console.error("Unable to delete order from Firebase:", error);
    }
  }
  return { deleted: false };
}
