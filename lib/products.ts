import type { ManagedProduct } from "./admin-local";
import { productRepository } from "./product-repository";

type ProductSource = "supabase" | "firebase";

export async function getManagedProducts(): Promise<{ products: ManagedProduct[]; source: ProductSource }> {
  if (!productRepository.isConfigured()) {
    throw new Error("The production product data store is not configured.");
  }

  try {
    const managedProducts = await productRepository.getAllProducts();

    return {
      products: managedProducts,
      source: "supabase"
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("Unable to load products from the production data store:", message);
    throw error;
  }
}
