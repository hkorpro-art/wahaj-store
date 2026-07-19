import "server-only";

import type { ManagedCategory } from "./admin-local";
import { seedCategories } from "./categories";
import { categoryRepository } from "./category-repository";

type CategorySource = "firebase" | "seed";

export async function getManagedCategories(): Promise<{ categories: ManagedCategory[]; source: CategorySource }> {
  if (categoryRepository.isConfigured()) {
    try {
      const managedCategories = await categoryRepository.getAll();

      return {
        categories: managedCategories && managedCategories.length > 0 ? managedCategories : seedCategories,
        source: "firebase"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load categories from Firebase:", message);
    }
  }

  return { categories: seedCategories, source: "seed" };
}
