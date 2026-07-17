import "server-only";

import { revalidateTag } from "next/cache";

export function invalidateCacheTag(tag: string, label: string) {
  try {
    revalidateTag(tag, { expire: 0 });
  } catch (error) {
    // A cache failure must not turn an already-persisted change into a failed response.
    console.error(`Unable to invalidate ${label} cache:`, error);
  }
}
