import "server-only";

import type { HeroAnimationSettings, HeroSlide } from "./admin-local";
import { supabaseContentRepository } from "./supabase/repositories";

const DEFAULT_HERO_SETTINGS: HeroAnimationSettings = {
  transitionSpeed: 700,
  autoPlay: true,
  autoPlayInterval: 5000,
  floatingEffect: true,
  backgroundBlur: 4,
  sideScale: 0.7,
  showHero: true
};

const SEED_HERO_SLIDES: HeroSlide[] = [
  {
    id: "hero-seed-1",
    title: "مجموعة وهاج الفاخرة",
    subtitle: "تألقي ببريق لا يزول مع أرقى المجوهرات والإكسسوارات المصممة بعناية لتناسب إطلالتك",
    image: {
      fileId: "seed-1",
      url: "https://ik.imagekit.io/wahaj0/1784209588270_m05p4b.webp"
    },
    mobileImage: {
      fileId: "seed-1-m",
      url: "https://ik.imagekit.io/wahaj0/1784209588270_m05p4b.webp"
    },
    focusX: 50,
    focusY: 40,
    autoContrast: true,
    ctaText: "شاهدي القطع",
    destinationType: "category",
    destinationValue: "atqam",
    sortOrder: 0,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "hero-seed-2",
    title: "أطقم الزفاف والمناسبات",
    subtitle: "فخامة تليق بأجمل لحظاتك مع أطقم زركون استثنائية مصممة بأعلى معايير الإتقان",
    image: {
      fileId: "seed-2",
      url: "https://ik.imagekit.io/wahaj0/1784207445258_b0u3e.webp"
    },
    mobileImage: {
      fileId: "seed-2-m",
      url: "https://ik.imagekit.io/wahaj0/1784207445258_b0u3e.webp"
    },
    focusX: 50,
    focusY: 40,
    autoContrast: true,
    ctaText: "شاهدي الأطقم",
    destinationType: "category",
    destinationValue: "uqud",
    sortOrder: 1,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  },
  {
    id: "hero-seed-3",
    title: "إكسسوارات يومية راقية",
    subtitle: "تصاميم عصرية خفيفة وأنيقة تضفي لمسة ساحرة على يومك وإطلالتك اليومية",
    image: {
      fileId: "seed-3",
      url: "https://ik.imagekit.io/wahaj0/1784207650159_f29cbn.webp"
    },
    mobileImage: {
      fileId: "seed-3-m",
      url: "https://ik.imagekit.io/wahaj0/1784207650159_f29cbn.webp"
    },
    focusX: 50,
    focusY: 40,
    autoContrast: true,
    ctaText: "تسوقي الآن",
    destinationType: "category",
    destinationValue: "asawir",
    sortOrder: 2,
    isActive: true,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z"
  }
];

type HeroSource = "supabase" | "firebase" | "seed";

export async function getHeroSlides(): Promise<{ slides: HeroSlide[]; source: HeroSource }> {
  if (supabaseContentRepository.isConfigured()) {
    try {
      const slides = await supabaseContentRepository.getHeroSlides();
      if (slides.length > 0) return { slides, source: "supabase" };
    } catch (error) {
      console.error("Unable to load hero slides from the production data store:", error);
    }
  }

  return { slides: SEED_HERO_SLIDES, source: "seed" };
}

export async function saveHeroSlides(slides: HeroSlide[]) {
  if (!supabaseContentRepository.isConfigured()) throw new Error("Supabase is not configured.");
  return supabaseContentRepository.replaceHeroSlides(slides);
}

export async function getHeroSettings(): Promise<HeroAnimationSettings> {
  if (supabaseContentRepository.isConfigured()) {
    try {
      return await supabaseContentRepository.getHeroSettings() ?? DEFAULT_HERO_SETTINGS;
    } catch (error) {
      console.error("Unable to load hero settings from the production data store:", error);
    }
  }
  return DEFAULT_HERO_SETTINGS;
}

export async function saveHeroSettings(settings: HeroAnimationSettings) {
  if (!supabaseContentRepository.isConfigured()) throw new Error("Supabase is not configured.");
  return supabaseContentRepository.saveHeroSettings(settings);
}
