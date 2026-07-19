import type { ManagedProduct } from "./admin-local";
import { ensureProductCategoryIds } from "./category-mapping";
import { products as seedProducts } from "./data";
import { productRepository } from "./product-repository";

type ProductSource = "firebase" | "seed";

export function seedManagedProducts(): ManagedProduct[] {
  return seedProducts.map((product) => ensureProductCategoryIds({ ...product, visible: true }));
}

export async function getManagedProducts(): Promise<{ products: ManagedProduct[]; source: ProductSource }> {
  if (productRepository.isConfigured()) {
    try {
      const managedProducts = await productRepository.getAllProducts();

      return {
        products: managedProducts && managedProducts.length > 0 ? managedProducts : seedManagedProducts(),
        source: "firebase"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load products from Firebase:", message);
    }
  }

  return { products: seedManagedProducts(), source: "seed" };
}
