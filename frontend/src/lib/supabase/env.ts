/**
 * Environment helpers for Supabase configuration.
 * Gracefully handles unconfigured states so the public landing page never crashes.
 */

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

export function getSupabasePublishableKey(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    ""
  );
}

export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const key = getSupabasePublishableKey();
  return (
    Boolean(url && key) &&
    !url.includes("your-project-id") &&
    !key.includes("your-supabase")
  );
}
