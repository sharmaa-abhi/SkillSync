import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Resolves the Supabase project URL from environment variables.
 * Checks both server-only and NEXT_PUBLIC_ prefixed variants.
 */
function getSupabaseUrl(): string {
  return (
    process.env.SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    ""
  );
}

/**
 * Resolves the Supabase publishable (anon) key from environment variables.
 * Supports both the new `sb_publishable_` format and legacy `eyJ...` JWT format.
 */
function getSupabasePublishableKey(): string {
  return (
    process.env.SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    ""
  );
}

/**
 * Resolves the Supabase secret (service role) key from environment variables.
 * This key grants admin-level access — NEVER expose client-side.
 */
function getSupabaseSecretKey(): string {
  return (
    process.env.SUPABASE_SECRET_KEY ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    ""
  );
}

/**
 * Returns a diagnostic summary of which Supabase environment variables are available.
 * Values are masked — only presence/absence and key prefix are reported.
 */
export function getSupabaseConfigDiagnostics(): {
  hasUrl: boolean;
  hasPublishableKey: boolean;
  hasSecretKey: boolean;
  urlSource: string;
  publishableKeyPrefix: string;
  secretKeyPrefix: string;
} {
  const url = getSupabaseUrl();
  const pubKey = getSupabasePublishableKey();
  const secKey = getSupabaseSecretKey();
  return {
    hasUrl: Boolean(url),
    hasPublishableKey: Boolean(pubKey),
    hasSecretKey: Boolean(secKey),
    urlSource: url ? url.substring(0, 30) + "..." : "(missing)",
    publishableKeyPrefix: pubKey ? pubKey.substring(0, 16) + "..." : "(missing)",
    secretKeyPrefix: secKey ? secKey.substring(0, 12) + "..." : "(missing)",
  };
}

// ---------------------------------------------------------------------------
// Lazy-initialized Supabase clients
//
// Previous implementation created clients at module-load time.  If env vars
// were not yet available (e.g. Vercel cold-start, missing dashboard config)
// the clients were permanently bound to placeholder URLs and every request
// would silently fail.  Now we create them lazily on first access.
// ---------------------------------------------------------------------------

let _supabasePublic: SupabaseClient | null = null;
let _supabaseAdmin: SupabaseClient | null = null;

/**
 * Public Supabase client for client-side and unauthenticated requests.
 * Created lazily on first access so env vars are read at runtime, not build time.
 */
export const supabasePublic: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabasePublic) {
      const url = getSupabaseUrl();
      const key = getSupabasePublishableKey();
      if (!url || !key) {
        console.error(
          "[supabase] Missing SUPABASE_URL or publishable key. " +
            "Available env vars checked: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, " +
            "SUPABASE_PUBLISHABLE_KEY, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, " +
            "NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_ANON_KEY"
        );
      }
      _supabasePublic = createClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key",
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }
    const value = (_supabasePublic as any)[prop];
    return typeof value === "function" ? value.bind(_supabasePublic) : value;
  },
});

/**
 * Admin Supabase client with elevated service privileges.
 * Used exclusively server-side for user provisioning and management.
 * NEVER expose this or import this into client components.
 *
 * Created lazily on first access so env vars are read at runtime, not build time.
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    if (!_supabaseAdmin) {
      const url = getSupabaseUrl();
      const key = getSupabaseSecretKey();
      if (!url || !key) {
        console.error(
          "[supabase] Missing SUPABASE_URL or secret key for admin client. " +
            "Available env vars checked: SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, " +
            "SUPABASE_SECRET_KEY, SUPABASE_SERVICE_ROLE_KEY. " +
            "Diagnostics: " +
            JSON.stringify(getSupabaseConfigDiagnostics())
        );
      }
      _supabaseAdmin = createClient(
        url || "https://placeholder.supabase.co",
        key || "placeholder-key",
        {
          auth: {
            persistSession: false,
            autoRefreshToken: false,
          },
        }
      );
    }
    const value = (_supabaseAdmin as any)[prop];
    return typeof value === "function" ? value.bind(_supabaseAdmin) : value;
  },
});
