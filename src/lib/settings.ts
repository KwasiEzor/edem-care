import "server-only";
import { unstable_cache } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { 
  AdminSettings, 
  DEFAULT_SETTINGS 
} from "./settings.client";

export * from "./settings.client";

/**
 * Fetches settings from the database with Next.js data cache.
 * Uses unstable_cache for persistent server-side caching with revalidation.
 */
export const getSettings = unstable_cache(
  async (): Promise<AdminSettings> => {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from("admin_settings")
        .select("*")
        .eq("id", "default")
        .single();

      if (error || !data) {
        console.error("Failed to fetch settings from DB:", error);
        return DEFAULT_SETTINGS;
      }

      return { ...DEFAULT_SETTINGS, ...data };
    } catch (err) {
      console.error("Settings fetch error:", err);
      return DEFAULT_SETTINGS;
    }
  },
  ["admin-settings"], // Cache key
  {
    revalidate: 3600, // Fallback revalidate 1 hour
    tags: ["settings"], // Revalidation tag for manual purging
  }
);
