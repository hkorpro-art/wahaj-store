import type { HeroAnimationSettings, HeroSlide } from "./admin-local";
import { getFirebaseFirestoreAdmin } from "./firebase-admin";

const HERO_SLIDES_COLLECTION = "hero_slides";
const HERO_SETTINGS_DOC = "hero_settings";

type HeroSource = "firebase" | "seed";

export async function getHeroSlides(): Promise<{ slides: HeroSlide[]; source: HeroSource }> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const snapshot = await firestore
        .collection(HERO_SLIDES_COLLECTION)
        .get();

      const slides = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() } as HeroSlide))
        .sort((a, b) => a.sortOrder - b.sortOrder);

      if (slides.length > 0) {
        return { slides, source: "firebase" };
      }
    } catch (error) {
      console.error("Unable to load hero slides from Firebase:", error);
    }
  }

  return { slides: [], source: "seed" };
}

export async function saveHeroSlides(slides: HeroSlide[]) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  const batch = firestore.batch();
  const collection = firestore.collection(HERO_SLIDES_COLLECTION);
  const nextIds = new Set(slides.map((slide) => slide.id));

  slides.forEach((slide) => {
    const ref = collection.doc(slide.id);
    batch.set(ref, { ...slide, updatedAt: new Date().toISOString() });
  });

  const snapshot = await collection.select().get();
  snapshot.docs.forEach((doc) => {
    if (!nextIds.has(doc.id)) {
      batch.delete(doc.ref);
    }
  });

  await batch.commit();
  return { saved: true as const };
}

export async function getHeroSettings(): Promise<HeroAnimationSettings> {
  const firestore = getFirebaseFirestoreAdmin();

  if (firestore) {
    try {
      const doc = await firestore.collection("store_settings").doc(HERO_SETTINGS_DOC).get();
      if (doc.exists) {
        return doc.data() as HeroAnimationSettings;
      }
    } catch (error) {
      console.error("Unable to load hero settings from Firebase:", error);
    }
  }

  return {
    transitionSpeed: 700,
    autoPlay: true,
    autoPlayInterval: 5000,
    floatingEffect: true,
    backgroundBlur: 4,
    sideScale: 0.7,
    showHero: true
  };
}

export async function saveHeroSettings(settings: HeroAnimationSettings) {
  const firestore = getFirebaseFirestoreAdmin();

  if (!firestore) {
    throw new Error("Firebase Firestore Admin is not configured.");
  }

  await firestore.collection("store_settings").doc(HERO_SETTINGS_DOC).set(settings);
  return { saved: true as const };
}