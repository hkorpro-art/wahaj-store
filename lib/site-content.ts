import "server-only";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { defaultSiteContent } from "./admin-local";
import type { SiteContent } from "./admin-local";

const SITE_CONTENT_COLLECTION = "store_settings";
const SITE_CONTENT_DOC = "site_content";

export async function getSiteContent(): Promise<{ content: SiteContent; source: "firebase" | "default" }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const doc = await firestore.collection(SITE_CONTENT_COLLECTION).doc(SITE_CONTENT_DOC).get();
      if (doc.exists) {
        const data = doc.data() as Partial<SiteContent>;
        return {
          content: { ...defaultSiteContent, ...data },
          source: "firebase"
        };
      }
    } catch (error) {
      console.error("Unable to load site content from Firebase:", error);
    }
  }

  return { content: defaultSiteContent, source: "default" };
}

export async function saveSiteContent(content: SiteContent) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  await firestore.collection(SITE_CONTENT_COLLECTION).doc(SITE_CONTENT_DOC).set(content, { merge: true });
  return { saved: true as const };
}
