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

async function resolveUniqueProductSlug(
  client: ReturnType<typeof getSupabaseServerClient>,
  baseSlug: string,
  productId: string
): Promise<string> {
  const normalized = baseSlug.trim() || `product-${Date.now()}`;

  const { data: existing } = await client
    .from("production_products")
    .select("id")
    .eq("slug", normalized)
    .neq("id", productId)
    .maybeSingle();

  if (!existing) {
    return normalized;
  }

  const root = normalized.replace(/-\d+$/, "");
  for (let counter = 2; counter <= 30; counter++) {
    const candidate = `${root}-${counter}`;
    const { data: clash } = await client
      .from("production_products")
      .select("id")
      .eq("slug", candidate)
      .neq("id", productId)
      .maybeSingle();

    if (!clash) {
      return candidate;
    }
  }

  return `${root}-${Date.now()}`;
}

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
    const client = getSupabaseServerClient();
    const uniqueSlug = await resolveUniqueProductSlug(client, product.slug, product.id);
    const finalProduct = uniqueSlug !== product.slug ? { ...product, slug: uniqueSlug } : product;

    await client
      .from("production_products")
      .upsert(productToSupabase(finalProduct, options.sortOrder ?? 0))
      .throwOnError();
    return { product: finalProduct, saved: true as const };
  }

  async updateProduct(product: ManagedProduct) {
    const client = getSupabaseServerClient();
    const uniqueSlug = await resolveUniqueProductSlug(client, product.slug, product.id);
    const finalProduct = uniqueSlug !== product.slug ? { ...product, slug: uniqueSlug } : product;

    await client
      .from("production_products")
      .upsert(productToSupabase(finalProduct))
      .throwOnError();
    return { product: finalProduct, saved: true as const };
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

  protected async ensureUniqueSlug(collection: ManagedCollection): Promise<ManagedCollection> {
    const client = getSupabaseServerClient();
    const candidate = collection.slug.trim() || `item-${Date.now()}`;
    const { data: existing } = await client
      .from(this.table)
      .select("id")
      .eq("slug", candidate)
      .neq("id", collection.id)
      .maybeSingle();

    if (!existing) return collection;

    const root = candidate.replace(/-\d+$/, "");
    for (let counter = 2; counter <= 30; counter++) {
      const testSlug = `${root}-${counter}`;
      const { data: clash } = await client
        .from(this.table)
        .select("id")
        .eq("slug", testSlug)
        .neq("id", collection.id)
        .maybeSingle();

      if (!clash) {
        return { ...collection, slug: testSlug };
      }
    }

    return { ...collection, slug: `${root}-${Date.now()}` };
  }

  protected async createRecord(collection: ManagedCollection, options: { sortOrder?: number } = {}) {
    const sortOrder = options.sortOrder ?? collection.sortOrder;
    const finalCollection = await this.ensureUniqueSlug(collection);
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      await client.from("categories").insert(categoryToSupabase(finalCollection, sortOrder)).throwOnError();
    } else {
      await client.from("collections").insert(collectionToSupabase(finalCollection, sortOrder)).throwOnError();
    }
    return { collection: finalCollection, saved: true as const };
  }

  protected async updateRecord(collection: ManagedCollection) {
    const finalCollection = await this.ensureUniqueSlug(collection);
    const row = collectionToSupabase(finalCollection);
    const { id: _id, created_at: _createdAt, updated_at: _updatedAt, ...update } = row;
    const client = getSupabaseServerClient();
    if (this.table === "categories") {
      await client.from("categories").update(update).eq("id", finalCollection.id).select("id").single().throwOnError();
    } else {
      await client.from("collections").update(update).eq("id", finalCollection.id).select("id").single().throwOnError();
    }
    return { collection: finalCollection, saved: true as const };
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
