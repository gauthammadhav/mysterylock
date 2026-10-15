import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseUrl, getSupabasePublishableKey } from "./env";

/**
 * Creates a Supabase client for use in Browser/Client Components.
 */
export function createClient() {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();

  if (!url || !key) {
    // Return a dummy client or handle unconfigured gracefully
    return createBrowserClient(
      url || "https://placeholder.supabase.co",
      key || "placeholder-key"
    );
  }

  return createBrowserClient(url, key);
}
