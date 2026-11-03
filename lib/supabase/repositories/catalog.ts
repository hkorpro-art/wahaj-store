import "server-only";

import type { ManagedCategory, ManagedCollection, ManagedProduct } from "@/lib/admin-local";
import type { Tables } from "../database.types";
import {
  categoryToSupabase,
  collectionFromSupabase,
  collectionToSupabase,
  productFromSupabase,
  productToSupabase,
  productUpdateToSupabase
} from "../mappers";
import { readAllPages } from "../pagination";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "../server";

export class SupabaseProductRepository {
  isConfigured = isSupabaseServerConfigured;

  async getAllProducts() {
    const client = getSupabaseServerClient();
    const rows = await readAllPages<Tables<"production_products">>((from, to) =>
      client
        .from("production_products")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("id", { ascending: true })
        .range(from, to)
        .throwOnError()
    );
    return rows.map(productFromSupabase);
  }

  async createProduct(product: ManagedProduct, options: { sortOrder?: number } = {}) {
    await getSupabaseServerClient()
      .from("production_products")
      .upsert(productToSupabase(product, options.sortOrder ?? 0))
      .throwOnError();
    return { product, saved: true as const };
  }

  async updateProduct(product: ManagedProduct) {
    await getSupabaseServerClient()
      .from("production_products")
      .upsert(productToSupabase(product))
      .throwOnError();
    return { product, saved: true as const };
  }

  async deleteProduct(id: string) {
    await getSupabaseServerClient().from("production_products").delete().eq("id", id).throwOnError();
    return { deleted: true as const };
  }

  async reorderProducts({ productId, adjacentProductId }: { productId: string; adjacentProductId: string }) {
    try {
      await getSupabaseServerClient()
        .rpc("swap_product_sort_order", { p_first_id: productId, p_second_id: adjacentProductId })
        .throwOnError();
    } catch (error) {
      if (isMissingSwapRow(error)) throw new Error("The product to reorder no longer exists.");
      throw error;
    }
    return { saved: true as const };
  }
}

abstract class SupabaseCollectionLikeRepository {
  abstract readonly table: "categories" | "collections";
  abstract readonly swapFunction: "swap_category_sort_order" | "swap_collection_sort_order";

  isConfigured = isSupabaseServerConfigured;

  async getAll(): Promise<ManagedCollection[]> {
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      const rows = await readAllPages<Tables<"categories">>((from, to) =>
        client.from("categories").select("*").order("sort_order").order("id").range(from, to).throwOnError()
      );
      return rows.map(collectionFromSupabase);
    }
    const rows = await readAllPages<Tables<"collections">>((from, to) =>
      client.from("collections").select("*").order("sort_order").order("id").range(from, to).throwOnError()
    );
    return rows.map(collectionFromSupabase);
  }

  protected async createRecord(collection: ManagedCollection, options: { sortOrder?: number } = {}) {
    const sortOrder = options.sortOrder ?? collection.sortOrder;
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      await client.from("categories").insert(categoryToSupabase(collection, sortOrder)).throwOnError();
    } else {
      await client.from("collections").insert(collectionToSupabase(collection, sortOrder)).throwOnError();
    }
    return { collection, saved: true as const };
  }

  protected async updateRecord(collection: ManagedCollection) {
    const row = collectionToSupabase(collection);
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...update } = row;
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      await client.from("categories").update(update).eq("id", collection.id).select("id").single().throwOnError();
    } else {
      await client.from("collections").update(update).eq("id", collection.id).select("id").single().throwOnError();
    }
    return { collection, saved: true as const };
  }

  protected async deleteRecord(id: string) {
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      await client.from("categories").delete().eq("id", id).throwOnError();
    } else {
      await client.from("collections").delete().eq("id", id).throwOnError();
    }
    return { deleted: true as const };
  }

  protected async reorderRecords(firstId: string, secondId: string, missingMessage: string) {
    try {
      const client = getSupabaseServerClient();
      if (this.swapFunction === "swap_category_sort_order") {
        await client.rpc("swap_category_sort_order", { p_first_id: firstId, p_second_id: secondId }).throwOnError();
      } else {
        await client.rpc("swap_collection_sort_order", { p_first_id: firstId, p_second_id: secondId }).throwOnError();
      }
    } catch (error) {
      if (isMissingSwapRow(error)) throw new Error(missingMessage);
      throw error;
    }
    return { saved: true as const };
  }
}

export class SupabaseCategoryRepository extends SupabaseCollectionLikeRepository {
  readonly table = "categories" as const;
  readonly swapFunction = "swap_category_sort_order" as const;

  async create(category: ManagedCategory, options: { sortOrder?: number } = {}) {
    const { saved } = await this.createRecord(category, options);
    return { category, saved };
  }

  async update(category: ManagedCategory) {
    const { saved } = await this.updateRecord(category);
    return { category, saved };
  }

  delete(id: string) {
    return this.deleteRecord(id);
  }

  reorder({ categoryId, adjacentCategoryId }: { categoryId: string; adjacentCategoryId: string }) {
    return this.reorderRecords(categoryId, adjacentCategoryId, "The category to reorder no longer exists.");
  }
}

export class SupabaseCollectionRepository extends SupabaseCollectionLikeRepository {
  readonly table = "collections" as const;
  readonly swapFunction = "swap_collection_sort_order" as const;

  create(collection: ManagedCollection, options: { sortOrder?: number } = {}) {
    return this.createRecord(collection, options);
  }

  update(collection: ManagedCollection) {
    return this.updateRecord(collection);
  }

  delete(id: string) {
    return this.deleteRecord(id);
  }

  reorder({ collectionId, adjacentCollectionId }: { collectionId: string; adjacentCollectionId: string }) {
    return this.reorderRecords(collectionId, adjacentCollectionId, "The collection to reorder no longer exists.");
  }
}

function isMissingSwapRow(error: unknown) {
  if (!error || typeof error !== "object" || !("message" in error)) return false;
  const message = String(error.message);
  return message.includes("_not_found");
}
