import { prisma } from "../src/lib/prisma";

const BASE_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function runTestSuite() {
  console.log("==================================================");
  console.log("    SKILLSYNC REGISTRATION API VERIFICATION       ");
  console.log("==================================================\n");

  const results: { test: string; status: "PASS" | "FAIL"; details: string }[] = [];

  // Helper for POST /api/auth/register
  async function postRegister(payload: any) {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(text);
    } catch {
      data = { rawText: text };
    }
    return { status: res.status, data };
  }

  // TEST 1: Valid new user registration
  const uniqueEmail = `flow_test_${Date.now()}@skillsync.ai`;
  let registeredUserId: string | null = null;
  try {
    const res = await postRegister({
      name: "Flow Test User",
      email: uniqueEmail,
      password: "SuperSecurePassword123!",
    });

    if (res.status === 201 && res.data.success && res.data.user?.id) {
      registeredUserId = res.data.user.id;
      results.push({
        test: "TEST 1: Valid new user registration",
        status: "PASS",
        details: `Returned 201 Created. User ID: ${registeredUserId}, Email: ${res.data.user.email}`,
      });
    } else {
      results.push({
        test: "TEST 1: Valid new user registration",
        status: "FAIL",
        details: `Expected 201 with success:true, got status ${res.status}: ${JSON.stringify(res.data)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 1: Valid new user registration",
      status: "FAIL",
      details: err.message,
    });
  }

  // TEST 2: Existing email (duplicate registration)
  try {
    const res = await postRegister({
      name: "Duplicate User",
      email: uniqueEmail,
      password: "AnotherPassword123!",
    });

    if (res.status === 409 && res.data.code === "DUPLICATE_EMAIL") {
      results.push({
        test: "TEST 2: Duplicate email rejection",
        status: "PASS",
        details: `Returned 409 Conflict. Message: "${res.data.error}", Code: "${res.data.code}"`,
      });
    } else {
      results.push({
        test: "TEST 2: Duplicate email rejection",
        status: "FAIL",
        details: `Expected 409 with DUPLICATE_EMAIL, got status ${res.status}: ${JSON.stringify(res.data)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 2: Duplicate email rejection",
      status: "FAIL",
      details: err.message,
    });
  }

  // TEST 3: Invalid email format
  try {
    const res = await postRegister({
      name: "Bad Email User",
      email: "not-an-email",
      password: "ValidPassword123!",
    });

    if (res.status === 400 && res.data.code === "INVALID_EMAIL") {
      results.push({
        test: "TEST 3: Invalid email validation",
        status: "PASS",
        details: `Returned 400 Bad Request. Message: "${res.data.error}", Code: "${res.data.code}"`,
      });
    } else {
      results.push({
        test: "TEST 3: Invalid email validation",
        status: "FAIL",
        details: `Expected 400 with INVALID_EMAIL, got status ${res.status}: ${JSON.stringify(res.data)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 3: Invalid email validation",
      status: "FAIL",
      details: err.message,
    });
  }

  // TEST 4: Missing required fields
  try {
    const resMissingName = await postRegister({
      name: "",
      email: "valid@test.com",
      password: "ValidPassword123!",
    });

    const resMissingEmail = await postRegister({
      name: "John",
      email: "",
      password: "ValidPassword123!",
    });

    if (
      resMissingName.status === 400 &&
      resMissingEmail.status === 400 &&
      resMissingName.data.code === "VALIDATION_ERROR"
    ) {
      results.push({
        test: "TEST 4: Missing required fields rejection",
        status: "PASS",
        details: `Returned 400 Bad Request for both missing name and missing email.`,
      });
    } else {
      results.push({
        test: "TEST 4: Missing required fields rejection",
        status: "FAIL",
        details: `Expected 400 for missing fields, got name: ${resMissingName.status}, email: ${resMissingEmail.status}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 4: Missing required fields rejection",
      status: "FAIL",
      details: err.message,
    });
  }

  // TEST 5: Short / weak password (< 8 chars)
  try {
    const res = await postRegister({
      name: "Short Pw User",
      email: "shortpw@test.com",
      password: "12345",
    });

    if (res.status === 400 && res.data.code === "WEAK_PASSWORD") {
      results.push({
        test: "TEST 5: Password length validation (< 8 chars)",
        status: "PASS",
        details: `Returned 400 Bad Request. Message: "${res.data.error}", Code: "${res.data.code}"`,
      });
    } else {
      results.push({
        test: "TEST 5: Password length validation",
        status: "FAIL",
        details: `Expected 400 with WEAK_PASSWORD, got status ${res.status}: ${JSON.stringify(res.data)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 5: Password length validation",
      status: "FAIL",
      details: err.message,
    });
  }

  // TEST 6: Verify Registered User can authenticate via NextAuth
  try {
    const { authOptions } = await import("../src/lib/auth");
    const credentialsProvider: any = authOptions.providers.find(
      (p: any) => p.id === "credentials" || p.name === "credentials"
    );
    const authorizeFn = credentialsProvider?.options?.authorize || credentialsProvider?.authorize;

    const authResult = await authorizeFn(
      { email: uniqueEmail, password: "SuperSecurePassword123!" },
      {} as any
    );

    if (authResult?.email === uniqueEmail && authResult?.id === registeredUserId) {
      results.push({
        test: "TEST 6: Immediate login authorization for new user",
        status: "PASS",
        details: `Newly created user authenticated successfully through NextAuth.`,
      });
    } else {
      results.push({
        test: "TEST 6: Immediate login authorization for new user",
        status: "FAIL",
        details: `Expected successful auth, got: ${JSON.stringify(authResult)}`,
      });
    }
  } catch (err: any) {
    results.push({
      test: "TEST 6: Immediate login authorization for new user",
      status: "FAIL",
      details: err.message,
    });
  }

  // Clean up test user
  if (registeredUserId) {
    try {
      await prisma.user.delete({ where: { id: registeredUserId } });
    } catch {}
  }

  // Print results
  console.log("------------------ TEST RESULTS ------------------");
  for (const r of results) {
    const badge = r.status === "PASS" ? "✅ [PASS]" : "❌ [FAIL]";
    console.log(`${badge} ${r.test}`);
    console.log(`   └─ ${r.details}\n`);
  }

  const passCount = results.filter((r) => r.status === "PASS").length;
  console.log(`Summary: ${passCount}/${results.length} tests passed.`);
  console.log("==================================================");

  if (passCount !== results.length) {
    process.exit(1);
  }
}

runTestSuite()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
