import type { categoryRepository } from "@/lib/category-repository";
import type { collectionRepository } from "@/lib/collection-repository";
import type { productRepository } from "@/lib/product-repository";
import type {
  SupabaseCategoryRepository,
  SupabaseCollectionRepository,
  SupabaseProductRepository
} from "./catalog";

type Assert<T extends true> = T;
type IsAssignable<Actual, Expected> = [Actual] extends [Expected] ? true : false;

type ProductContract = Pick<
  typeof productRepository,
  "isConfigured" | "getAllProducts" | "createProduct" | "updateProduct" | "deleteProduct" | "reorderProducts"
>;
type CategoryContract = Pick<
  typeof categoryRepository,
  "isConfigured" | "getAll" | "create" | "update" | "delete" | "reorder"
>;
type CollectionContract = Pick<
  typeof collectionRepository,
  "isConfigured" | "getAll" | "create" | "update" | "delete" | "reorder"
>;

export type ProductRepositoryContractCheck = Assert<
  IsAssignable<SupabaseProductRepository, ProductContract>
>;
export type CategoryRepositoryContractCheck = Assert<
  IsAssignable<SupabaseCategoryRepository, CategoryContract>
>;
export type CollectionRepositoryContractCheck = Assert<
  IsAssignable<SupabaseCollectionRepository, CollectionContract>
>;
