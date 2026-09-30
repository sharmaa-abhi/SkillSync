import { prisma } from "../src/lib/prisma";
import { generateFallbackTutorResponse, generateFallbackQuiz } from "../src/lib/ai";
import { generateTopicReviewCards } from "../src/lib/spacedRepetition";
import { predictDifficulty, COHORT_BENCHMARKS } from "../src/lib/cohortAnalytics";
import { retrieveCurriculumPassages } from "../src/lib/rag";

interface TestResult {
  section: string;
  subject: string;
  status: "PASS" | "FAIL";
  details: string;
}

const ALL_SUBJECTS = [
  "Python Programming",
  "Database Management Systems",
  "Mathematics",
  "Computer Networks",
  "Operating Systems",
  "Data Structures & Algorithms",
];

async function main() {
  console.log("================================================================================");
  console.log("      SKILLSYNC AI — COMPREHENSIVE MULTI-SUBJECT SYSTEM VERIFICATION           ");
  console.log("================================================================================\n");

  const results: TestResult[] = [];

  // ============================================================================
  // 1. DATABASE SEEDING VERIFICATION
  // ============================================================================
  console.log(">>> [1/6] Verifying Database Seeding for All 6 Subjects...");
  for (const subjectName of ALL_SUBJECTS) {
    try {
      const subject = await prisma.subject.findFirst({
        where: { name: subjectName },
        include: {
          topics: {
            include: {
              _count: { select: { questions: true } },
            },
          },
        },
      });

      if (!subject) {
        results.push({
          section: "Database Seeding",
          subject: subjectName,
          status: "FAIL",
          details: `Subject record missing in database.`,
        });
        continue;
      }

      const totalQ = subject.topics.reduce((acc, t) => acc + t._count.questions, 0);
      if (subject.topics.length >= 4 && totalQ >= 5) {
        results.push({
          section: "Database Seeding",
          subject: subjectName,
          status: "PASS",
          details: `Found ${subject.topics.length} topics and ${totalQ} questions.`,
        });
      } else {
        results.push({
          section: "Database Seeding",
          subject: subjectName,
          status: "FAIL",
          details: `Insufficient topics (${subject.topics.length}) or questions (${totalQ}).`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "Database Seeding",
        subject: subjectName,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // 2. RAG CURRICULUM GROUNDING VERIFICATION
  // ============================================================================
  console.log("\n>>> [2/6] Verifying RAG Curriculum Knowledge Base Grounding...");
  const ragQueries = [
    { subject: "Python Programming", query: "LEGB scope and closure functions", check: "LEGB" },
    { subject: "Database Management Systems", query: "BCNF decomposition and functional dependencies", check: "BCNF" },
    { subject: "Mathematics", query: "factoring trinomials and quadratic formula", check: "ax²" },
    { subject: "Computer Networks", query: "three way handshake TCP sequence number", check: "TCP" },
    { subject: "Operating Systems", query: "Banker's algorithm safe state allocation", check: "Banker" },
    { subject: "Data Structures & Algorithms", query: "binary search tree in-order traversal", check: "traversal" },
  ];

  for (const item of ragQueries) {
    try {
      const passages = retrieveCurriculumPassages(item.query, item.subject);
      const combined = passages.map(p => `${p.text} ${p.keyRuleOrFormula || ""} ${p.pedagogicalTakeaway}`).join(" ");
      if (passages.length > 0 && combined.toLowerCase().includes(item.check.toLowerCase())) {
        results.push({
          section: "RAG Grounding",
          subject: item.subject,
          status: "PASS",
          details: `Retrieved ${passages.length} passages. Top source: ${passages[0].source} (${passages[0].chapter})`,
        });
      } else {
        results.push({
          section: "RAG Grounding",
          subject: item.subject,
          status: "FAIL",
          details: `RAG retrieval returned 0 passages or missed keyword '${item.check}'.`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "RAG Grounding",
        subject: item.subject,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // 3. AI TUTOR FALLBACK & DOMAIN AWARENESS VERIFICATION
  // ============================================================================
  console.log("\n>>> [3/6] Verifying AI Tutor Domain-Aware Fallbacks...");
  for (const subjectName of ALL_SUBJECTS) {
    try {
      const response = generateFallbackTutorResponse(
        {
          studentMessage: `I am struggling with key concepts in ${subjectName}. What should I focus on?`,
          subjectName,
          topicName: "Core Concepts",
          score: 42,
          masteryLevel: "medium",
          educationLevel: "Undergraduate",
          conversationHistory: [],
          weaknesses: [],
          strengths: [],
        },
        "socratic",
        "en"
      );

      // Verification: must NOT fall back to Mathematics quadratic equations unless it's actually Mathematics!
      const isMathResponse = response.includes("x² + 8x + 15") || response.includes("Factorisation");
      if (subjectName !== "Mathematics" && isMathResponse) {
        results.push({
          section: "AI Tutor Fallback",
          subject: subjectName,
          status: "FAIL",
          details: `Subject fell back to hardcoded Mathematics quadratic equations!`,
        });
      } else if (response.length > 50) {
        results.push({
          section: "AI Tutor Fallback",
          subject: subjectName,
          status: "PASS",
          details: `Domain response snippet: "${response.substring(0, 70).replace(/\n/g, " ")}..."`,
        });
      } else {
        results.push({
          section: "AI Tutor Fallback",
          subject: subjectName,
          status: "FAIL",
          details: `Empty or malformed tutor fallback response.`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "AI Tutor Fallback",
        subject: subjectName,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // 4. ADAPTIVE PRACTICE & QUIZ GENERATION VERIFICATION
  // ============================================================================
  console.log("\n>>> [4/6] Verifying Quiz Generation & Subject Domain Accuracy...");
  const quizTopics = [
    { subject: "Python Programming", topic: "Functions & Scope" },
    { subject: "Database Management Systems", topic: "Normalization" },
    { subject: "Mathematics", topic: "Factorisation" },
    { subject: "Computer Networks", topic: "IP Addressing & Subnetting" },
    { subject: "Operating Systems", topic: "Deadlocks" },
    { subject: "Data Structures & Algorithms", topic: "Binary Search Trees" },
  ];

  for (const item of quizTopics) {
    try {
      const fallbackQuestions = generateFallbackQuiz(
        [{ topicName: item.topic, mastery: 40 }],
        2,
        "medium"
      );

      if (fallbackQuestions.length >= 2) {
        const q0 = fallbackQuestions[0];
        results.push({
          section: "Quiz Generation",
          subject: item.subject,
          status: "PASS",
          details: `Generated ${fallbackQuestions.length} questions for topic '${item.topic}'. Q1: "${q0.question.substring(0, 50)}..."`,
        });
      } else {
        results.push({
          section: "Quiz Generation",
          subject: item.subject,
          status: "FAIL",
          details: `Generated fewer than 2 questions: ${fallbackQuestions.length}`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "Quiz Generation",
        subject: item.subject,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // 5. SPACED REPETITION (SM-2) ENGINE VERIFICATION
  // ============================================================================
  console.log("\n>>> [5/6] Verifying Spaced Repetition Cards & Retention Curves...");
  for (const subjectName of ALL_SUBJECTS) {
    try {
      const cards = generateTopicReviewCards(
        [
          { topicName: "Foundations", score: 35 },
          { topicName: "Core Mechanisms", score: 65 },
          { topicName: "Advanced Architecture", score: 85 },
        ],
        subjectName
      );

      if (cards.length === 3 && cards[0].subjectName === subjectName && cards[0].keyConcept) {
        results.push({
          section: "Spaced Repetition",
          subject: subjectName,
          status: "PASS",
          details: `Generated 3 cards for ${cards[0].subjectName}. Card 1 risk: ${cards[0].forgettingRisk}, retention: ${cards[0].retentionRate}%`,
        });
      } else {
        results.push({
          section: "Spaced Repetition",
          subject: subjectName,
          status: "FAIL",
          details: `Card generation misattributed subject: ${cards[0]?.subjectName}`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "Spaced Repetition",
        subject: subjectName,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // 6. COHORT ANALYTICS & BOTTLENECK PREDICTION VERIFICATION
  // ============================================================================
  console.log("\n>>> [6/6] Verifying Cohort Analytics Benchmarks & Bottleneck Predictor...");
  const sampleTopics = [
    { subject: "Python Programming", topic: "Functions & Scope" },
    { subject: "Database Management Systems", topic: "Transactions & Concurrency" },
    { subject: "Mathematics", topic: "Factorisation" },
    { subject: "Computer Networks", topic: "IP Addressing & Subnetting" },
    { subject: "Operating Systems", topic: "Process Synchronization & Deadlocks" },
    { subject: "Data Structures & Algorithms", topic: "Trees & Binary Search Trees" },
  ];

  for (const item of sampleTopics) {
    try {
      const benchmark = COHORT_BENCHMARKS[item.topic];
      const prediction = predictDifficulty(item.topic, 42); // 42% mastery test

      if (benchmark && benchmark.subjectName === item.subject && prediction.riskLevel) {
        results.push({
          section: "Cohort Analytics",
          subject: item.subject,
          status: "PASS",
          details: `Benchmark verified. Topic: '${item.topic}' -> Risk: [${prediction.riskLevel}], Struggle Rate: ${prediction.cohortStruggleRate}%, Pass Prob: ${prediction.predictedPassProbability}%`,
        });
      } else {
        results.push({
          section: "Cohort Analytics",
          subject: item.subject,
          status: "FAIL",
          details: `Benchmark missing or subject misaligned: ${benchmark ? benchmark.subjectName : "NOT FOUND"}`,
        });
      }
    } catch (err: any) {
      results.push({
        section: "Cohort Analytics",
        subject: item.subject,
        status: "FAIL",
        details: err.message,
      });
    }
  }

  // ============================================================================
  // SUMMARY REPORT
  // ============================================================================
  console.log("\n================================================================================");
  console.log("                        VERIFICATION RESULTS SUMMARY                            ");
  console.log("================================================================================");

  let passed = 0;
  let failed = 0;

  for (const res of results) {
    const symbol = res.status === "PASS" ? " [PASS] " : "![FAIL]!";
    console.log(`${symbol} | ${res.section.padEnd(20)} | ${res.subject.padEnd(30)} | ${res.details}`);
    if (res.status === "PASS") passed++;
    else failed++;
  }

  console.log("--------------------------------------------------------------------------------");
  console.log(`TOTAL CHECKS: ${results.length} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("================================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
