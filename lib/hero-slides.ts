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

  return { slides: [], source: "seed" };
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
