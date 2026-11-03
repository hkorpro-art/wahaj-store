import "server-only";

import { orders as seedOrders } from "./data";
import { supabaseOrderRepository } from "./supabase/repositories";
import type { Order } from "./types";

export async function getManagedOrders(): Promise<Order[]> {
  if (supabaseOrderRepository.isConfigured()) {
    try {
      return await supabaseOrderRepository.getAll();
    } catch (error) {
      console.error("Unable to load orders from the production data store:", error);
    }
  }

  return seedOrders;
}

export async function saveOrder(order: Order) {
  if (supabaseOrderRepository.isConfigured()) {
    try {
      return await supabaseOrderRepository.create(order);
    } catch (error) {
      console.error("Unable to save order to the production data store:", error);
    }
  }
  return { saved: false };
}

export async function deleteOrder(orderId: string) {
  if (supabaseOrderRepository.isConfigured()) {
    try {
      return await supabaseOrderRepository.delete(orderId);
    } catch (error) {
      console.error("Unable to delete order from the production data store:", error);
    }
  }
  return { deleted: false };
}

export const deleteOrderFromFirestore = deleteOrder;
