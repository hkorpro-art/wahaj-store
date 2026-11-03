import "server-only";

import type { HeroAnimationSettings, HeroSlide, SiteContent } from "@/lib/admin-local";
import type { MenuIconsRecord } from "@/lib/imagekit";
import type { Tables } from "../database.types";
import {
  heroSettingsFromSupabase,
  heroSettingsToSupabase,
  heroSlideFromSupabase,
  heroSlideToSupabase,
  menuIconsFromSupabase,
  menuIconsToSupabase,
  siteContentFromSupabase,
  siteContentToSupabase
} from "../mappers";
import { readAllPages } from "../pagination";
import { getSupabaseServerClient, isSupabaseServerConfigured } from "../server";

export class SupabaseContentRepository {
  isConfigured = isSupabaseServerConfigured;

  async getSiteContent() {
    const { data } = await getSupabaseServerClient()
      .from("site_content")
      .select("*")
      .eq("id", "site_content")
      .maybeSingle()
      .throwOnError();
    return data ? siteContentFromSupabase(data) : null;
  }

  async saveSiteContent(content: SiteContent) {
    await getSupabaseServerClient().from("site_content").upsert(siteContentToSupabase(content)).throwOnError();
    return { saved: true as const };
  }

  async getHeroSettings() {
    const { data } = await getSupabaseServerClient()
      .from("hero_settings")
      .select("*")
      .eq("id", "hero_settings")
      .maybeSingle()
      .throwOnError();
    return data ? heroSettingsFromSupabase(data) : null;
  }

  async saveHeroSettings(settings: HeroAnimationSettings) {
    await getSupabaseServerClient().from("hero_settings").upsert(heroSettingsToSupabase(settings)).throwOnError();
    return { saved: true as const };
  }

  async getMenuIcons() {
    const { data } = await getSupabaseServerClient()
      .from("menu_icons")
      .select("*")
      .eq("id", "menu_icons")
      .maybeSingle()
      .throwOnError();
    return data ? menuIconsFromSupabase(data) : null;
  }

  async saveMenuIcons(icons: MenuIconsRecord) {
    await getSupabaseServerClient().from("menu_icons").upsert(menuIconsToSupabase(icons)).throwOnError();
    return { saved: true as const };
  }

  async getHeroSlides() {
    const client = getSupabaseServerClient();
    const rows = await readAllPages<Tables<"hero_slides">>((from, to) =>
      client.from("hero_slides").select("*").order("sort_order").order("id").range(from, to).throwOnError()
    );
    return rows.map(heroSlideFromSupabase);
  }

  async replaceHeroSlides(slides: HeroSlide[]) {
    const updatedAt = new Date().toISOString();
    await getSupabaseServerClient()
      .rpc("replace_hero_slides", { p_rows: slides.map((slide) => heroSlideToSupabase({ ...slide, updatedAt })) })
      .throwOnError();
    return { saved: true as const };
  }
}
