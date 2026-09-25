import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

/**
 * Sanitizes a PostgreSQL connection URL:
 * 1. Strips accidental outer quotes.
 * 2. Removes literal square brackets `[password]` if copied directly from Supabase UI templates.
 * 3. Safely encodes special characters (like '@' or '#') inside the password portion so URL parsing succeeds.
 */
export function sanitizeDatabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return "";
  let url = rawUrl.trim();

  // Strip wrapping quotes
  if (
    (url.startsWith('"') && url.endsWith('"')) ||
    (url.startsWith("'") && url.endsWith("'"))
  ) {
    url = url.slice(1, -1).trim();
  }

  // Handle bracketed password and unencoded characters in postgres connection strings
  // Pattern: postgresql://[user]:[password]@[host]:[port]/[db]?params
  url = url.replace(
    /^(postgres(?:ql)?:\/\/[^:]+:)(.+)(@[^@/]+(?::\d+)?\/.*)$/,
    (_match, prefix, password, hostAndRest) => {
      let cleanPass = password;
      if (cleanPass.startsWith("[") && cleanPass.endsWith("]")) {
        cleanPass = cleanPass.slice(1, -1);
      }
      try {
        cleanPass = encodeURIComponent(decodeURIComponent(cleanPass));
      } catch {
        // keep as is if decode fails
      }
      return `${prefix}${cleanPass}${hostAndRest}`;
    }
  );

  return url;
}

/**
 * Resolves the database connection string with fallback detection:
 * 1. Checks process.env.DATABASE_URL
 * 2. Checks process.env.DIRECT_URL
 * 3. Inspects .env.local and .env files directly if environment variables weren't passed to the runtime
 * 4. Ensures process.env.DATABASE_URL is always set so Prisma schema validation never fails
 */
function resolveDatabaseUrl(): string {
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.trim()) {
    return sanitizeDatabaseUrl(process.env.DATABASE_URL);
  }

  if (process.env.DIRECT_URL && process.env.DIRECT_URL.trim()) {
    return sanitizeDatabaseUrl(process.env.DIRECT_URL);
  }

  // Attempt to read from .env.local or .env in project root if process.env was not populated
  const envFiles = [".env.local", ".env"];
  for (const envFile of envFiles) {
    try {
      const filePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), envFile);
      if (fs.existsSync(filePath)) {
        const lines = fs.readFileSync(filePath, "utf-8").split("\n");
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("DATABASE_URL=")) {
            const val = trimmed.slice("DATABASE_URL=".length).trim();
            const cleaned = sanitizeDatabaseUrl(val);
            if (cleaned) return cleaned;
          }
        }
        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith("DIRECT_URL=")) {
            const val = trimmed.slice("DIRECT_URL=".length).trim();
            const cleaned = sanitizeDatabaseUrl(val);
            if (cleaned) return cleaned;
          }
        }
      }
    } catch {
      // Continue search
    }
  }

  return "";
}

const activeDbUrl = resolveDatabaseUrl();

// Ensure process.env has DATABASE_URL set so Prisma's schema validation passes
if (activeDbUrl) {
  process.env.DATABASE_URL = activeDbUrl;
  if (!process.env.DIRECT_URL) {
    process.env.DIRECT_URL = activeDbUrl;
  }
}

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient(
    activeDbUrl
      ? {
          datasources: {
            db: {
              url: activeDbUrl,
            },
          },
        }
      : undefined
  );

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
