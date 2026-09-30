import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  generateTopicReviewCards,
  calculateNextSM2Interval,
  calculateRetention,
  getForgettingRisk,
  SpacedCard,
} from "@/lib/spacedRepetition";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const subjectIdParam = searchParams.get("subjectId");
    const subjectParam = searchParams.get("subject");

    // Resolve subject if provided
    let subject = null;
    const rawSubject = subjectIdParam || subjectParam;
    if (rawSubject) {
      const lower = rawSubject.toLowerCase();
      subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { id: rawSubject },
            { name: { contains: rawSubject, mode: "insensitive" } },
            ...(lower.includes("python") || lower === "py"
              ? [{ name: { contains: "Python", mode: "insensitive" as const } }]
              : []),
            ...(lower.includes("math")
              ? [{ name: { contains: "Math", mode: "insensitive" as const } }]
              : []),
            ...(!lower.includes("struct") && !lower.includes("algo") && (lower.includes("dbms") || lower.includes("database"))
              ? [{ name: { contains: "Database", mode: "insensitive" as const } }]
              : []),
            ...(lower === "os" || lower.includes("operat")
              ? [{ name: { contains: "Operating", mode: "insensitive" as const } }]
              : []),
            ...(lower === "cn" || lower.includes("network")
              ? [{ name: { contains: "Network", mode: "insensitive" as const } }]
              : []),
            ...(lower === "dsa" || lower.includes("struct") || lower.includes("algo")
              ? [{ name: { contains: "Structure", mode: "insensitive" as const } }]
              : []),
          ],
        },
      });
    }

    // Fetch user's learning profile scoped to subject if resolved
    const profile = await prisma.learningProfile.findFirst({
      where: { userId, ...(subject ? { subjectId: subject.id } : {}) },
      orderBy: { updatedAt: "desc" },
    });

    if (!subject && profile?.subjectId) {
      subject = await prisma.subject.findUnique({ where: { id: profile.subjectId } });
    }

    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
      topicName: string;
      score: number;
    }>;

    const subjectName = subject?.name || "Mathematics";
    const subLower = subjectName.toLowerCase();

    const fallbackTopics =
      subLower.includes("python")
        ? [
            { topicName: "Functions & Scope", score: 40 },
            { topicName: "Object-Oriented Programming (OOP)", score: 35 },
            { topicName: "Control Flow & Loops", score: 70 },
            { topicName: "Python Basics & Syntax", score: 85 },
          ]
        : subLower.includes("struct") || subLower.includes("algo") || subLower.includes("dsa")
        ? [
            { topicName: "Trees & Binary Search Trees", score: 45 },
            { topicName: "Graph Algorithms & Traversals", score: 35 },
            { topicName: "Stacks & Queues", score: 65 },
            { topicName: "Arrays & Strings", score: 80 },
          ]
        : subLower.includes("database") || subLower.includes("dbms")
        ? [
            { topicName: "Normalization & Normal Forms", score: 42 },
            { topicName: "Transactions & Concurrency", score: 56 },
            { topicName: "Indexing & Query Optimization", score: 71 },
            { topicName: "SQL Fundamentals", score: 84 },
          ]
        : subLower === "os" || subLower.includes("operat")
        ? [
            { topicName: "Process Synchronization & Deadlocks", score: 40 },
            { topicName: "Memory Management & Paging", score: 45 },
            { topicName: "CPU Scheduling Algorithms", score: 70 },
            { topicName: "Processes & Threads", score: 80 },
          ]
        : subLower === "cn" || subLower.includes("network")
        ? [
            { topicName: "IP Addressing & Subnetting", score: 42 },
            { topicName: "Routing Protocols & Algorithms", score: 48 },
            { topicName: "Transport Layer (TCP vs UDP)", score: 75 },
            { topicName: "OSI & TCP/IP Models", score: 85 },
          ]
        : [
            { topicName: "Factorisation", score: 38 },
            { topicName: "Quadratic Equations", score: 72 },
            { topicName: "Algebraic Manipulation", score: 84 },
            { topicName: "Polynomials", score: 65 },
          ];

    const cards = generateTopicReviewCards(
      topicMastery.length > 0 ? topicMastery : fallbackTopics,
      subjectName
    );

    // Sort cards so that highest forgetting risk (lowest retention) appears first
    cards.sort((a, b) => a.retentionRate - b.retentionRate);

    const dueToday = cards.filter(c => c.retentionRate < 75);

    return NextResponse.json({
      cards,
      dueTodayCount: dueToday.length,
      averageRetention: Math.round(cards.reduce((s, c) => s + c.retentionRate, 0) / cards.length),
      forgettingCurveSummary: {
        criticalCount: cards.filter(c => c.forgettingRisk === "critical").length,
        mediumCount: cards.filter(c => c.forgettingRisk === "medium").length,
        lowCount: cards.filter(c => c.forgettingRisk === "low").length,
      },
    });
  } catch (error) {
    console.error("[REVIEW_GET]", error);
    return NextResponse.json({ error: "Failed to fetch spaced review queue" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { cardId, quality, repetitionNumber, intervalDays, easinessFactor } = await request.json();

    const sm2Result = calculateNextSM2Interval(
      repetitionNumber || 1,
      intervalDays || 1,
      easinessFactor || 2.5,
      quality !== undefined ? quality : 4
    );

    return NextResponse.json({
      success: true,
      cardId,
      result: {
        ...sm2Result,
        retentionRate: 100, // Reset to 100% freshly reviewed
        forgettingRisk: "low",
      },
    });
  } catch (error) {
    console.error("[REVIEW_POST]", error);
    return NextResponse.json({ error: "Failed to record review" }, { status: 500 });
  }
}
