import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { supabaseAdmin, getSupabaseConfigDiagnostics } from "@/lib/supabase";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // Pre-flight: verify Supabase configuration is available
    const diag = getSupabaseConfigDiagnostics();
    if (!diag.hasUrl || !diag.hasSecretKey) {
      console.error("[register] Supabase configuration missing in runtime environment!", {
        diagnostics: diag,
        nodeEnv: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
      });
      return NextResponse.json(
        {
          success: false,
          error: "Registration service is temporarily unavailable. Please try again in a few moments.",
          code: "SERVICE_UNAVAILABLE",
          _debug: process.env.NODE_ENV !== "production" ? diag : undefined,
        },
        { status: 503 }
      );
    }

    let body: any;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid request payload. Please send valid JSON.", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { success: false, error: "Invalid request body.", code: "INVALID_BODY" },
        { status: 400 }
      );
    }

    const { email, password, name } = body;

    // Validate Full Name
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Full Name is required.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Validate Email presence
    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { success: false, error: "Email address is required.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    // Validate Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: "Please enter a valid email address.", code: "INVALID_EMAIL" },
        { status: 400 }
      );
    }

    // Validate Password
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required.", code: "VALIDATION_ERROR" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: "Password must be at least 8 characters long.", code: "WEAK_PASSWORD" },
        { status: 400 }
      );
    }

    // 1. Create User in Supabase Authentication (auth.users)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: {
        name: name.trim(),
      },
    });

    if (authError) {
      const errorMsg = String(authError.message || "").toLowerCase();
      const errorCode = String((authError as any).code || "");

      // Handle duplicate email in Supabase Auth
      if (
        errorCode === "email_exists" ||
        errorMsg.includes("already been registered") ||
        errorMsg.includes("already registered") ||
        errorMsg.includes("unique constraint")
      ) {
        return NextResponse.json(
          {
            success: false,
            error: "An account with this email already exists.",
            code: "DUPLICATE_EMAIL",
          },
          { status: 409 }
        );
      }

      console.error("[register][Supabase Auth error]", {
        message: authError.message,
        status: authError.status,
        name: authError.name,
        code: (authError as any).code,
        diagnostics: diag,
      });

      return NextResponse.json(
        {
          success: false,
          error: "Unable to create your account in the authentication service. Please try again.",
          code: "AUTH_SERVICE_ERROR",
        },
        { status: 500 }
      );
    }

    if (!authData?.user) {
      return NextResponse.json(
        {
          success: false,
          error: "Failed to provision authentication account.",
          code: "AUTH_PROVISION_FAILED",
        },
        { status: 500 }
      );
    }

    const supabaseUser = authData.user;

    // 2. Synchronize with Prisma PostgreSQL database
    const hashedPassword = await bcrypt.hash(password, 12);
    try {
      await prisma.user.upsert({
        where: { email: normalizedEmail },
        update: {
          name: name.trim(),
          password: hashedPassword,
        },
        create: {
          id: supabaseUser.id,
          email: normalizedEmail,
          password: hashedPassword,
          name: name.trim(),
          onboardingCompleted: false,
        },
      });
    } catch (dbErr: any) {
      // Non-fatal if Prisma connection is momentarily syncing; Supabase Auth user is already safely created
      console.warn("[register] Prisma sync warning:", dbErr?.message);
    }

    return NextResponse.json(
      {
        success: true,
        user: {
          id: supabaseUser.id,
          email: normalizedEmail,
          name: name.trim(),
          onboardingCompleted: false,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[register error]", error?.name || error);

    const errorMsg = String(error?.message || "");

    if (error?.code === "P2002" || errorMsg.includes("already exists")) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists.", code: "DUPLICATE_EMAIL" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred while creating your account. Please try again.",
        code: "INTERNAL_ERROR",
      },
      { status: 500 }
    );
  }
}
