import "server-only";

import { MENU_ICON_IDS, type MenuIconId, type MenuIconsRecord } from "./imagekit";
import { supabaseContentRepository } from "./supabase/repositories";

export { MENU_ICON_IDS, type MenuIconId, type MenuIconsRecord };

export async function getMenuIcons(): Promise<{ icons: MenuIconsRecord; source: "supabase" | "firebase" | "default" }> {
  if (!supabaseContentRepository.isConfigured()) return { icons: {}, source: "default" };
  const icons = await supabaseContentRepository.getMenuIcons();
  return icons ? { icons, source: "supabase" } : { icons: {}, source: "default" };
}

export async function saveMenuIcons(icons: MenuIconsRecord) {
  if (!supabaseContentRepository.isConfigured()) return { saved: false };
  return supabaseContentRepository.saveMenuIcons(icons);
}
