import "server-only";

import { unstable_cache } from "next/cache";
import { invalidateCacheTag } from "./cache-invalidation";
import { getSiteContent } from "./site-content";

const SITE_CONTENT_CACHE_TAG = "site-content";
const SITE_CONTENT_REVALIDATE_SECONDS = 300;

export const getCachedSiteContent = unstable_cache(
  getSiteContent,
  [SITE_CONTENT_CACHE_TAG],
  {
    revalidate: SITE_CONTENT_REVALIDATE_SECONDS,
    tags: [SITE_CONTENT_CACHE_TAG]
  }
);

export function invalidateSiteContentCache() {
  invalidateCacheTag(SITE_CONTENT_CACHE_TAG, "site content");
}
