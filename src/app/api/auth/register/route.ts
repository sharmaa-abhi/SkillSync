import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
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

    // Check if user already exists (with retry for transient cold-start / pooler blips)
    let existingUser = null;
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        existingUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
        });
        break;
      } catch (dbErr: any) {
        attempts++;
        if (attempts >= maxAttempts) throw dbErr;
        // Exponential backoff: 300ms, 600ms
        await new Promise((resolve) => setTimeout(resolve, attempts * 300));
      }
    }

    if (existingUser) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists.", code: "DUPLICATE_EMAIL" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    let user = null;
    attempts = 0;
    while (attempts < maxAttempts) {
      try {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            password: hashedPassword,
            name: name.trim(),
          },
          select: {
            id: true,
            email: true,
            name: true,
            onboardingCompleted: true,
          },
        });
        break;
      } catch (createErr: any) {
        // Unique constraint error from database
        if (createErr?.code === "P2002") {
          return NextResponse.json(
            { success: false, error: "An account with this email already exists.", code: "DUPLICATE_EMAIL" },
            { status: 409 }
          );
        }
        attempts++;
        if (attempts >= maxAttempts) throw createErr;
        await new Promise((resolve) => setTimeout(resolve, attempts * 300));
      }
    }

    return NextResponse.json(
      { success: true, user },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("[register error]", error?.name || error);

    // Clean unique constraint catch
    if (error?.code === "P2002") {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists.", code: "DUPLICATE_EMAIL" },
        { status: 409 }
      );
    }

    const errorMsg = String(error?.message || "");
    const errorName = String(error?.name || "");

    // Identify specific database connectivity / socket / timeout failures
    const isDbConnectivityError =
      error?.code === "P1001" || // Can't reach database server
      error?.code === "P1002" || // The database server was reached but timed out
      error?.code === "P1008" || // Operations timed out
      error?.code === "P1017" || // Server has closed the connection
      error?.code === "P2024" || // Timed out fetching a new connection from the connection pool
      errorName === "PrismaClientInitializationError" ||
      errorMsg.includes("Can't reach database") ||
      errorMsg.includes("Timed out") ||
      errorMsg.includes("connection closed") ||
      errorMsg.includes("ECONNREFUSED") ||
      errorMsg.includes("ETIMEDOUT") ||
      errorMsg.includes("DATABASE_URL");

    if (isDbConnectivityError) {
      return NextResponse.json(
        {
          success: false,
          error: "Registration service is temporarily unavailable. Please try again shortly.",
          code: "SERVICE_UNAVAILABLE",
        },
        { status: 503 }
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
