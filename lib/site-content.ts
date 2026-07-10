import "server-only";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { defaultSiteContent } from "./admin-local";
import type { SiteContent } from "./admin-local";
import { getCoupons } from "./coupons";
import { repairDeepText } from "./text-repair";
import type { Coupon } from "./types";

const SITE_CONTENT_COLLECTION = "store_settings";
const SITE_CONTENT_DOC = "site_content";

function isCouponActive(coupon: Coupon): boolean {
  if (!coupon.active) return false;
  if (new Date(coupon.expiresAt) < new Date()) return false;
  if (coupon.usageCount >= coupon.usageLimit) return false;
  return true;
}

export async function getSiteContent(): Promise<{ content: SiteContent; source: "firebase" | "default"; activeCoupons: Coupon[] }> {
  const firestore = getFirebaseFirestoreAdmin();
  let content: SiteContent;
  let source: "firebase" | "default";

  if (firestore) {
    try {
      const doc = await firestore.collection(SITE_CONTENT_COLLECTION).doc(SITE_CONTENT_DOC).get();
      if (doc.exists) {
        const data = doc.data() as Partial<SiteContent>;
        content = repairDeepText({ ...defaultSiteContent, ...data });
        source = "firebase";
      } else {
        content = defaultSiteContent;
        source = "default";
      }
    } catch (error) {
      console.error("Unable to load site content from Firebase:", error);
      content = defaultSiteContent;
      source = "default";
    }
  } else {
    content = defaultSiteContent;
    source = "default";
  }

  let activeCoupons: Coupon[] = [];
  if (content.showActiveCoupons && source === "firebase") {
    try {
      const { coupons } = await getCoupons();
      activeCoupons = coupons.filter(isCouponActive);
    } catch (error) {
      console.error("Unable to load coupons for offer bar:", error);
    }
  }

  return { content, source, activeCoupons };
}

export async function saveSiteContent(content: SiteContent) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  await firestore.collection(SITE_CONTENT_COLLECTION).doc(SITE_CONTENT_DOC).set(repairDeepText(content), { merge: true });
  return { saved: true as const };
}
