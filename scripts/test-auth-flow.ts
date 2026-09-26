import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";
import { authOptions } from "../src/lib/auth";

async function runAuthDiagnostic() {
  console.log("==================================================");
  console.log("       SKILLSYNC AUTH SYSTEM FULL AUDIT           ");
  console.log("==================================================\n");

  const results: { test: string; status: "PASS" | "FAIL"; details: string }[] = [];

  // --- TEST 1: Database Connection ---
  try {
    const userCount = await prisma.user.count();
    results.push({
      test: "Database Connection (PostgreSQL Supabase)",
      status: "PASS",
      details: `Connected successfully. Current user count: ${userCount}`,
    });
  } catch (err: any) {
    results.push({
      test: "Database Connection",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 2: User Registration Simulation ---
  const testEmail = `audit_test_${Date.now()}@skillsync.ai`;
  const testPassword = "ValidPassword123!";
  const testName = "Audit Test User";

  let createdUserId: string | null = null;
  try {
    const hashedPassword = await bcrypt.hash(testPassword, 12);
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: hashedPassword,
        name: testName,
      },
    });
    createdUserId = user.id;
    results.push({
      test: "User Registration & Password Hashing (bcrypt, 12 rounds)",
      status: "PASS",
      details: `Created user ${user.email} (ID: ${user.id}). Hash starts with: ${user.password.substring(0, 10)}...`,
    });
  } catch (err: any) {
    results.push({
      test: "User Registration",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 3: Duplicate Email Prevention ---
  try {
    let duplicateCaught = false;
    try {
      await prisma.user.create({
        data: {
          email: testEmail,
          password: "anotherpassword",
          name: "Duplicate User",
        },
      });
    } catch {
      duplicateCaught = true;
    }

    if (duplicateCaught) {
      results.push({
        test: "Duplicate Email Constraint (Unique @email)",
        status: "PASS",
        details: "Prisma rejected duplicate user creation with matching email constraint.",
      });
    } else {
      results.push({
        test: "Duplicate Email Constraint",
        status: "FAIL",
        details: "Duplicate email was unexpectedly allowed.",
      });
    }
  } catch (err: any) {
    results.push({
      test: "Duplicate Email Constraint",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 4: NextAuth Credentials Provider - Valid Credentials ---
  try {
    const credentialsProvider = authOptions.providers.find(
      (p: any) => p.id === "credentials" || p.name === "credentials"
    ) as any;

    const authorizeFn = credentialsProvider?.options?.authorize || credentialsProvider?.authorize;

    if (!authorizeFn) {
      throw new Error("Credentials provider authorize function not found in authOptions");
    }

    const authResult = await authorizeFn(
      { email: testEmail, password: testPassword },
      {} as any
    );

    if (authResult && authResult.email === testEmail) {
      results.push({
        test: "NextAuth Authorize with Valid Credentials",
        status: "PASS",
        details: `Successfully authorized user: ${authResult.name} (${authResult.email}), ID: ${authResult.id}`,
      });
    } else {
      results.push({
        test: "NextAuth Authorize with Valid Credentials",
        status: "FAIL",
        details: `Expected user object but got: ${JSON.stringify(authResult)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "NextAuth Authorize with Valid Credentials",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 5: NextAuth Credentials Provider - Invalid Password ---
  try {
    const credentialsProvider = authOptions.providers.find(
      (p: any) => p.id === "credentials" || p.name === "credentials"
    ) as any;

    const authorizeFn = credentialsProvider?.options?.authorize || credentialsProvider?.authorize;

    const invalidAuthResult = await authorizeFn(
      { email: testEmail, password: "WrongPassword999" },
      {} as any
    );

    if (invalidAuthResult === null) {
      results.push({
        test: "NextAuth Authorize with Wrong Password Rejection",
        status: "PASS",
        details: "Returned null (access denied) as expected.",
      });
    } else {
      results.push({
        test: "NextAuth Authorize with Wrong Password Rejection",
        status: "FAIL",
        details: `Unexpectedly returned user: ${JSON.stringify(invalidAuthResult)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "NextAuth Authorize with Wrong Password Rejection",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 6: NextAuth JWT & Session Callbacks ---
  try {
    if (authOptions.callbacks?.jwt && authOptions.callbacks?.session) {
      const mockUser = { id: createdUserId!, email: testEmail, name: testName };
      const token = await authOptions.callbacks.jwt({
        token: {},
        user: mockUser as any,
        account: null,
      });

      const session = await authOptions.callbacks.session({
        session: { user: { name: testName, email: testEmail }, expires: "" },
        token,
        user: mockUser as any,
        newSession: undefined,
        trigger: "update",
      });

      if ((session?.user as any)?.id === createdUserId) {
        results.push({
          test: "NextAuth JWT & Session Callbacks (user ID propagation)",
          status: "PASS",
          details: `Session correctly embeds user id: ${(session.user as any).id}`,
        });
      } else {
        results.push({
          test: "NextAuth JWT & Session Callbacks",
          status: "FAIL",
          details: `Session missing expected user id: ${JSON.stringify(session)}`,
        });
      }
    }
  } catch (err: any) {
    results.push({
      test: "NextAuth JWT & Session Callbacks",
      status: "FAIL",
      details: err.message,
    });
  }

  // --- TEST 7: Demo User Initialization ---
  try {
    const demoEmail = "alex@skillsync.ai";
    const demoPassword = "password123";
    let demoUser = await prisma.user.findUnique({ where: { email: demoEmail } });

    if (!demoUser) {
      const hashedDemoPw = await bcrypt.hash(demoPassword, 12);
      demoUser = await prisma.user.create({
        data: {
          email: demoEmail,
          password: hashedDemoPw,
          name: "Alex Rivera",
          educationLevel: "undergraduate",
          learningGoals: "Master DBMS relational concepts, normal forms, and SQL optimization",
          preferredStyle: "visual_practical",
          onboardingCompleted: true,
        },
      });
      results.push({
        test: "Demo User Provisioning (alex@skillsync.ai)",
        status: "PASS",
        details: `Created demo user with pre-configured onboarding profile (ID: ${demoUser.id}).`,
      });
    } else {
      results.push({
        test: "Demo User Provisioning (alex@skillsync.ai)",
        status: "PASS",
        details: `Demo user already exists (ID: ${demoUser.id}).`,
      });
    }

    // Verify demo login works
    const credentialsProvider = authOptions.providers.find(
      (p: any) => p.id === "credentials" || p.name === "credentials"
    ) as any;
    const authorizeFn = credentialsProvider?.options?.authorize || credentialsProvider?.authorize;
    const demoAuth = await authorizeFn(
      { email: demoEmail, password: demoPassword },
      {} as any
    );
    if (demoAuth?.email === demoEmail) {
      results.push({
        test: "Demo User One-Click Login Verification",
        status: "PASS",
        details: `Verified credentials for alex@skillsync.ai authenticate cleanly.`,
      });
    } else {
      results.push({
        test: "Demo User One-Click Login Verification",
        status: "FAIL",
        details: `Failed to authenticate demo user credentials.`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "Demo User Verification",
      status: "FAIL",
      details: err.message,
    });
  }

  // Clean up temporary audit user
  if (createdUserId) {
    try {
      await prisma.user.delete({ where: { id: createdUserId } });
    } catch {}
  }

  // --- Print Summary ---
  console.log("------------------ RESULTS ------------------");
  for (const r of results) {
    const badge = r.status === "PASS" ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${badge} ${r.test}`);
    console.log(`   └─ ${r.details}\n`);
  }

  const passCount = results.filter((r) => r.status === "PASS").length;
  console.log(`Summary: ${passCount}/${results.length} tests passed.`);
  console.log("==================================================");
}

runAuthDiagnostic()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
