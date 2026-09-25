import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding SkillSync AI database...");

  // ---------------------------------------------------------
  // 1. Create Mathematics Subject (Flagship Pitch Deck Track)
  // ---------------------------------------------------------
  const maths = await prisma.subject.upsert({
    where: { name: "Mathematics" },
    update: {},
    create: {
      name: "Mathematics",
      description: "High-yield foundational to advanced algebra: Algebraic Manipulation, Factorisation, and Quadratic Equations.",
      icon: "📐",
    },
  });
  console.log(`✅ Subject: ${maths.name}`);

  const mathsTopicsData = [
    { name: "Algebraic Manipulation", description: "Expanding brackets, collecting like terms, and working with algebraic fractions", order: 1, difficulty: "beginner" },
    { name: "Factorisation", description: "Factoring out GCF, grouping, difference of two squares, and monic trinomial factoring", order: 2, difficulty: "intermediate" },
    { name: "Quadratic Equations", description: "Standard form ax² + bx + c = 0, discriminant test, and quadratic formula application", order: 3, difficulty: "intermediate" },
    { name: "Polynomials", description: "Degree, roots, polynomial division, and the Factor / Remainder theorems", order: 4, difficulty: "intermediate" },
    { name: "Coordinate Geometry", description: "Parabolas, vertex form, axis of symmetry, and intercepts on the Cartesian plane", order: 5, difficulty: "advanced" },
  ];

  const mathsTopics: Record<string, string> = {};
  for (const t of mathsTopicsData) {
    const topic = await prisma.topic.upsert({
      where: { subjectId_name: { subjectId: maths.id, name: t.name } },
      update: {},
      create: { ...t, subjectId: maths.id },
    });
    mathsTopics[t.name] = topic.id;
    console.log(`  ✅ Maths Topic: ${t.name}`);
  }

  // Maths Diagnostic & Practice Questions
  const mathsQuestions = [
    // Algebraic Manipulation
    {
      topicName: "Algebraic Manipulation",
      text: "What is the expanded form of 3(2x - 5)?",
      options: ["6x - 15", "6x - 5", "5x - 15", "6x + 15"],
      correctAnswer: 0,
      explanation: "Distribute 3 across both terms inside brackets: 3 * 2x = 6x, and 3 * (-5) = -15. Result: 6x - 15.",
      difficulty: "easy",
    },
    {
      topicName: "Algebraic Manipulation",
      text: "Simplify the expression: 4x + 7 - 2x + 3",
      options: ["2x + 10", "6x + 10", "2x + 4", "6x + 4"],
      correctAnswer: 0,
      explanation: "Combine like terms: (4x - 2x) = 2x, and constants (7 + 3) = 10. Result: 2x + 10.",
      difficulty: "easy",
    },
    {
      topicName: "Algebraic Manipulation",
      text: "What is (x + 3)(x - 4) expanded?",
      options: ["x² - x - 12", "x² + x - 12", "x² - 7x - 12", "x² - 12"],
      correctAnswer: 0,
      explanation: "Using FOIL: x*x = x², x*(-4) = -4x, 3*x = 3x, 3*(-4) = -12. Combining middle terms gives -x: x² - x - 12.",
      difficulty: "medium",
    },

    // Factorisation (Prerequisite Gap Focus)
    {
      topicName: "Factorisation",
      text: "Factor completely: x² - 9",
      options: ["(x - 3)(x + 3)", "(x - 3)²", "(x + 3)²", "x(x - 9)"],
      correctAnswer: 0,
      explanation: "This is a difference of two squares: a² - b² = (a - b)(a + b). Here a = x and b = 3, so (x - 3)(x + 3).",
      difficulty: "easy",
    },
    {
      topicName: "Factorisation",
      text: "What are the factors of the quadratic trinomial x² + 5x + 6?",
      options: ["(x + 2)(x + 3)", "(x + 1)(x + 6)", "(x - 2)(x - 3)", "(x + 5)(x + 1)"],
      correctAnswer: 0,
      explanation: "We need two numbers that multiply to 6 and add to 5. Those numbers are 2 and 3: (x + 2)(x + 3).",
      difficulty: "medium",
    },
    {
      topicName: "Factorisation",
      text: "Factor out the greatest common factor from 6x³ - 9x²:",
      options: ["3x²(2x - 3)", "3x(2x² - 3x)", "x²(6x - 9)", "9x²(x - 1)"],
      correctAnswer: 0,
      explanation: "The GCD of 6 and 9 is 3, and the lowest power of x is x². Factoring out 3x² leaves (2x - 3).",
      difficulty: "medium",
    },
    {
      topicName: "Factorisation",
      text: "Factor the expression 2x² + 7x + 3:",
      options: ["(2x + 1)(x + 3)", "(2x + 3)(x + 1)", "(2x - 1)(x - 3)", "(x + 7)(2x + 1)"],
      correctAnswer: 0,
      explanation: "Splitting the middle term: ac = 6. Numbers multiplying to 6 and adding to 7 are 6 and 1: 2x² + 6x + x + 3 = 2x(x + 3) + 1(x + 3) = (2x + 1)(x + 3).",
      difficulty: "hard",
    },

    // Quadratic Equations (Current Focus at 72%)
    {
      topicName: "Quadratic Equations",
      text: "What are the solutions to (x - 2)(x + 5) = 0?",
      options: ["x = 2 or x = -5", "x = -2 or x = 5", "x = 2 or x = 5", "x = -2 or x = -5"],
      correctAnswer: 0,
      explanation: "By the zero-product property, either x - 2 = 0 (so x = 2) or x + 5 = 0 (so x = -5).",
      difficulty: "easy",
    },
    {
      topicName: "Quadratic Equations",
      text: "For the quadratic equation ax² + bx + c = 0, what is the formula for the discriminant?",
      options: ["b² - 4ac", "b² + 4ac", "√(b² - 4ac)", "-b ± √(b² - 4ac)"],
      correctAnswer: 0,
      explanation: "The discriminant Δ is given by b² - 4ac. If Δ > 0 there are two distinct real roots; if Δ = 0, one real repeated root; if Δ < 0, complex roots.",
      difficulty: "medium",
    },
    {
      topicName: "Quadratic Equations",
      text: "If the discriminant of a quadratic equation is negative (b² - 4ac < 0), what does it indicate about the roots?",
      options: ["Two complex / non-real roots", "Two distinct real roots", "Exactly one real root", "Infinite real roots"],
      correctAnswer: 0,
      explanation: "A negative discriminant means the square root is non-real, giving two complex conjugate roots.",
      difficulty: "medium",
    },
    {
      topicName: "Quadratic Equations",
      text: "Solve x² - 6x + 9 = 0:",
      options: ["x = 3 (repeated root)", "x = -3 (repeated root)", "x = 3 or x = -3", "x = 0 or x = 6"],
      correctAnswer: 0,
      explanation: "x² - 6x + 9 is a perfect square: (x - 3)² = 0. Therefore x = 3 is a double root.",
      difficulty: "easy",
    },

    // Polynomials
    {
      topicName: "Polynomials",
      text: "According to the Remainder Theorem, if polynomial P(x) is divided by (x - a), the remainder is:",
      options: ["P(a)", "P(-a)", "P(0)", "P(x) / a"],
      correctAnswer: 0,
      explanation: "The Remainder Theorem states that evaluating P(x) at x = a yields exactly the remainder of division by (x - a).",
      difficulty: "medium",
    },
    {
      topicName: "Polynomials",
      text: "If (x - 2) is a factor of P(x), what must be true about P(2)?",
      options: ["P(2) = 0", "P(2) = 2", "P(2) = -2", "P(2) > 0"],
      correctAnswer: 0,
      explanation: "By the Factor Theorem, (x - c) is a factor of P(x) if and only if P(c) = 0.",
      difficulty: "easy",
    },

    // Coordinate Geometry
    {
      topicName: "Coordinate Geometry",
      text: "What is the vertex of the parabola represented by y = (x - 3)² + 4?",
      options: ["(3, 4)", "(-3, 4)", "(3, -4)", "(4, 3)"],
      correctAnswer: 0,
      explanation: "In vertex form y = a(x - h)² + k, the vertex coordinates are (h, k). Here h = 3 and k = 4, so (3, 4).",
      difficulty: "easy",
    },
  ];

  for (const q of mathsQuestions) {
    const topicId = mathsTopics[q.topicName];
    if (topicId) {
      await prisma.question.create({
        data: {
          topicId,
          text: q.text,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          type: "assessment",
        },
      });
    }
  }
  console.log(`✅ Seeded ${mathsQuestions.length} Mathematics questions`);

  // ---------------------------------------------------------
  // 2. Create DBMS Subject
  // ---------------------------------------------------------
  const dbms = await prisma.subject.upsert({
    where: { name: "Database Management Systems" },
    update: {},
    create: {
      name: "Database Management Systems",
      description: "Relational database design, SQL, normalization, transactions, and concurrency protocols.",
      icon: "🗄️",
    },
  });
  console.log(`✅ Subject: ${dbms.name}`);

  // ---------------------------------------------------------
  // 3. Pre-configure Alex Rivera Demo Student (Section 22 of prompt)
  // ---------------------------------------------------------
  const demoEmail = "alex@skillsync.ai";
  const hashedPassword = await bcrypt.hash("password123", 12);

  const demoUser = await prisma.user.upsert({
    where: { email: demoEmail },
    update: {
      name: "Alex Rivera",
      educationLevel: "Grade 11 / CBSE Class 11",
      learningGoals: "Improve in Mathematics — Master Quadratic Equations & Clear Prerequisite Gaps",
      preferredStyle: "Interactive Socratic & Visual Graphs",
      onboardingCompleted: true,
    },
    create: {
      email: demoEmail,
      name: "Alex Rivera",
      password: hashedPassword,
      educationLevel: "Grade 11 / CBSE Class 11",
      learningGoals: "Improve in Mathematics — Master Quadratic Equations & Clear Prerequisite Gaps",
      preferredStyle: "Interactive Socratic & Visual Graphs",
      onboardingCompleted: true,
    },
  });
  console.log(`✅ Demo User: ${demoUser.name} (${demoUser.email})`);

  // Learning Profile for Mathematics (72% overall, weak Factorisation prerequisite gap)
  const mathProfileData = {
    overallMastery: 72,
    strengths: JSON.stringify(["Algebraic Manipulation", "Polynomials"]),
    weaknesses: JSON.stringify(["Factorisation"]),
    topicMastery: JSON.stringify([
      { topicName: "Algebraic Manipulation", score: 84, masteryLevel: "strong" },
      { topicName: "Factorisation", score: 38, masteryLevel: "weak" },
      { topicName: "Quadratic Equations", score: 72, masteryLevel: "medium" },
      { topicName: "Polynomials", score: 65, masteryLevel: "medium" },
      { topicName: "Coordinate Geometry", score: 40, masteryLevel: "weak" },
    ]),
    aiAnalysis: JSON.stringify({
      summary: "Strong algebra mechanics and formula understanding (72%), but a critical prerequisite gap in Factorisation (38%) is bottlenecking quadratic equation solving.",
      reasoning: [
        "Diagnostic identified prerequisite gap: Factorisation score is 38%. Missed trinomial decomposition questions.",
        "Quadratic equations score is 72%: Knows the quadratic formula, but gets stuck when factoring is required.",
      ],
      recommendations: [
        "Review Factorisation (10 min session) before proceeding to quadratic formula derivations.",
        "Take a 5-question adaptive practice quiz on monic trinomial factoring.",
      ],
      nextBestAction: {
        title: "Review Factorisation",
        topicName: "Factorisation",
        durationMinutes: 10,
        difficulty: "Level 2",
        reason: "Your last 3 diagnostic answers show a prerequisite gap. Factorisation is required before quadratic solving.",
        actionType: "tutor",
      },
      streak: 8,
      weeklyGoal: { current: 4, target: 5 },
      reteachRate: "28%",
    }),
    assessmentCount: 2,
    quizCount: 4,
    totalStudyMinutes: 65,
  };

  await prisma.learningProfile.upsert({
    where: { userId_subjectId: { userId: demoUser.id, subjectId: maths.id } },
    update: mathProfileData,
    create: {
      userId: demoUser.id,
      subjectId: maths.id,
      ...mathProfileData,
    },
  });

  // 7-Day Personalized Learning Plan for Alex Rivera
  await prisma.learningPlan.upsert({
    where: { id: "demo-maths-plan-1" },
    update: {},
    create: {
      id: "demo-maths-plan-1",
      userId: demoUser.id,
      subjectId: maths.id,
      title: "7-Day Mathematics Mastery Roadmap",
      estimatedDuration: "1.5 hours total (10-15 mins/day)",
      status: "active",
      items: JSON.stringify([
        {
          order: 1,
          topic: "Factorisation",
          activity: "Common Factors & Difference of Two Squares",
          durationMinutes: 10,
          priority: "critical",
          reason: "Identified prerequisite gap: Core mechanical foundation for quadratics.",
          isCompleted: false,
        },
        {
          order: 2,
          topic: "Factorisation",
          activity: "Monic Trinomial Decomposition Practice",
          durationMinutes: 12,
          priority: "high",
          reason: "Required before factoring standard form quadratics.",
          isCompleted: false,
        },
        {
          order: 3,
          topic: "Quadratic Equations",
          activity: "Solving Quadratics by Factoring",
          durationMinutes: 15,
          priority: "high",
          reason: "Current focus: Connects prerequisite factoring into equation solutions.",
          isCompleted: false,
        },
        {
          order: 4,
          topic: "Quadratic Equations",
          activity: "Completing the Square Intuition",
          durationMinutes: 10,
          priority: "medium",
          reason: "Provides the geometric bridge to the quadratic formula.",
          isCompleted: false,
        },
        {
          order: 5,
          topic: "Quadratic Equations",
          activity: "Discriminant & Nature of Roots Test",
          durationMinutes: 12,
          priority: "medium",
          reason: "Ensures speed and accuracy for exam conditions.",
          isCompleted: false,
        },
        {
          order: 6,
          topic: "Polynomials",
          activity: "Factor Theorem Applications",
          durationMinutes: 15,
          priority: "low",
          reason: "Expands quadratic methods to cubic polynomials.",
          isCompleted: false,
        },
        {
          order: 7,
          topic: "Mathematics",
          activity: "Adaptive Milestone Practice & Skill Graph Update",
          durationMinutes: 15,
          priority: "high",
          reason: "Verifies whether prerequisite gap has shifted from Weak to Mastered.",
          isCompleted: false,
        },
      ]),
    },
  });

  console.log("🎉 Complete seeding finished successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
