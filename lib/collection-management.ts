import "server-only";

import type { ManagedCollection } from "./admin-local";
import { seedCollections } from "./collections";
import { collectionRepository } from "./collection-repository";

type CollectionSource = "supabase" | "firebase" | "seed";

export async function getManagedCollections(): Promise<{ collections: ManagedCollection[]; source: CollectionSource }> {
  if (collectionRepository.isConfigured()) {
    try {
      const managedCollections = await collectionRepository.getAll();

      return {
        collections: managedCollections && managedCollections.length > 0 ? managedCollections : seedCollections,
        source: "supabase"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load collections from the production data store:", message);
    }
  }

  return { collections: seedCollections, source: "seed" };
}
