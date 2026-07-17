import "server-only";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { defaultSiteContent } from "./admin-local";
import type { SiteContent } from "./admin-local";
import { repairDeepText } from "./text-repair";

const SITE_CONTENT_COLLECTION = "store_settings";
const SITE_CONTENT_DOC = "site_content";

export async function getSiteContent(): Promise<{ content: SiteContent; source: "firebase" | "default" }> {
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

  return { content, source };
}

export async function saveSiteContent(content: SiteContent) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  await firestore.collection(SITE_CONTENT_COLLECTION).doc(SITE_CONTENT_DOC).set(repairDeepText(content), { merge: true });
  return { saved: true as const };
}
