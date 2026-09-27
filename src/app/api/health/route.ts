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
    geminiApiKey: Boolean(process.env.GEMINI_API_KEY),
  };

  const criticalChecks = [
    checks.supabaseUrl,
    checks.supabaseSecretKey,
    checks.supabasePublishableKey,
    checks.databaseUrl,
    checks.nextauthSecret,
  ];

  const allHealthy = criticalChecks.every(Boolean);

  return NextResponse.json(
    {
      status: allHealthy ? "healthy" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.VERCEL_ENV || process.env.NODE_ENV || "unknown",
      region: process.env.VERCEL_REGION || "local",
      checks,
      warnings: [
        ...(!checks.nextauthUrl
          ? ["NEXTAUTH_URL is not set. NextAuth may fail to handle CSRF, cookies, and redirects in production."]
          : []),
        ...(!checks.supabasePublishableKey
          ? ["Supabase publishable key is missing. Login via Supabase Auth will fail."]
          : []),
        ...(!checks.databaseUrl
          ? ["DATABASE_URL is missing. Prisma database queries will fail."]
          : []),
      ],
      // Show partial details (safe prefixes) for debugging
      details: {
        supabaseUrlPrefix: supabase.urlSource,
        publishableKeyPrefix: supabase.publishableKeyPrefix,
        secretKeyPrefix: supabase.secretKeyPrefix,
        nextauthUrlSet: process.env.NEXTAUTH_URL ? process.env.NEXTAUTH_URL.substring(0, 40) : "(not set)",
        nodeEnv: process.env.NODE_ENV || "(not set)",
        vercelEnv: process.env.VERCEL_ENV || "(not set)",
      },
    },
    { status: allHealthy ? 200 : 503 }
  );
}
