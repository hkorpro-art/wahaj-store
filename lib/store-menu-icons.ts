import "server-only";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";
import { MENU_ICON_IDS, parseStoredImage, type MenuIconId, type MenuIconsRecord, type StoredImage } from "./imagekit";

export { MENU_ICON_IDS, type MenuIconId, type MenuIconsRecord };
export const FIRESTORE_STORE_SETTINGS_COLLECTION = "store_settings";
export const MENU_ICONS_DOC_ID = "menu_icons";

export async function getMenuIcons(): Promise<{ icons: MenuIconsRecord; source: "firebase" | "default" }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    return { icons: {}, source: "default" };
  }

  const snapshot = await firestore.collection(FIRESTORE_STORE_SETTINGS_COLLECTION).doc(MENU_ICONS_DOC_ID).get();

  if (!snapshot.exists) {
    return { icons: {}, source: "default" };
  }

  const data = snapshot.data() as Record<string, unknown>;
  const icons: MenuIconsRecord = {};

  for (const id of MENU_ICON_IDS) {
    const parsed = parseStoredImage(data[id]);
    if (parsed) {
      icons[id] = parsed;
    }
  }

  return { icons, source: "firebase" };
}

export async function saveMenuIcons(icons: MenuIconsRecord) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    return { saved: false };
  }

  const payload: Record<string, StoredImage | null> = {};

  for (const id of MENU_ICON_IDS) {
    payload[id] = icons[id] ?? null;
  }

  await firestore.collection(FIRESTORE_STORE_SETTINGS_COLLECTION).doc(MENU_ICONS_DOC_ID).set(payload, { merge: true });

  return { saved: true };
}
