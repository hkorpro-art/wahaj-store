import "server-only";

import { defaultSiteContent, type SiteContent } from "./admin-local";
import { supabaseContentRepository } from "./supabase/repositories";

export async function getSiteContent(): Promise<{ content: SiteContent; source: "firebase" | "default" }> {
  if (supabaseContentRepository.isConfigured()) {
    try {
      const content = await supabaseContentRepository.getSiteContent();
      if (content) return { content, source: "firebase" };
    } catch (error) {
      console.error("Unable to load site content from the production data store:", error);
    }
  }
  return { content: defaultSiteContent, source: "default" };
}

export async function saveSiteContent(content: SiteContent) {
  if (!supabaseContentRepository.isConfigured()) throw new Error("Supabase is not configured.");
  return supabaseContentRepository.saveSiteContent(content);
}
