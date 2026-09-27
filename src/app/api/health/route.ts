import { NextResponse } from "next/server";
import { getSupabaseConfigDiagnostics } from "@/lib/supabase";

/**
 * GET /api/health
 * Production-safe health check endpoint.
 * Reports whether critical environment variables are available at runtime.
 * Does NOT expose secret values — only presence/absence.
 */
export async function GET() {
  const supabase = getSupabaseConfigDiagnostics();

  const checks = {
    supabaseUrl: supabase.hasUrl,
    supabasePublishableKey: supabase.hasPublishableKey,
    supabaseSecretKey: supabase.hasSecretKey,
    databaseUrl: Boolean(process.env.DATABASE_URL),
    nextauthSecret: Boolean(process.env.NEXTAUTH_SECRET),
    nextauthUrl: Boolean(process.env.NEXTAUTH_URL),
  };

  const allHealthy = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      checks,
      // Only show prefixes in non-production or if explicitly requested
      ...(process.env.NODE_ENV !== "production"
        ? {
            details: {
              supabaseUrlPrefix: supabase.urlSource,
              publishableKeyPrefix: supabase.publishableKeyPrefix,
              secretKeyPrefix: supabase.secretKeyPrefix,
            },
          }
        : {}),
    },
    { status: allHealthy ? 200 : 503 }
  );
}
