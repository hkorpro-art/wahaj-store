export const FIRESTORE_CATEGORIES_COLLECTION = "categories";
export {
  rowToManagedCollection as rowToManagedCategory,
  collectionToRow as categoryToRow,
  rowSortOrder,
  createSlug
} from "./collection-record";
