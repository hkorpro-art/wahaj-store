import "server-only";

import type { ManagedCollection } from "./admin-local";
import { seedCollections } from "./collections";
import { collectionRepository } from "./collection-repository";

type CollectionSource = "firebase" | "seed";

export async function getManagedCollections(): Promise<{ collections: ManagedCollection[]; source: CollectionSource }> {
  if (collectionRepository.isConfigured()) {
    try {
      const managedCollections = await collectionRepository.getAll();

      return {
        collections: managedCollections && managedCollections.length > 0 ? managedCollections : seedCollections,
        source: "firebase"
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error("Unable to load collections from Firebase:", message);
    }
  }

  return { collections: seedCollections, source: "seed" };
}
