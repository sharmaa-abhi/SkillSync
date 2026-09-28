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

    // Fetch user's latest learning profile for mastery metrics
    const profile = await prisma.learningProfile.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
      topicName: string;
      score: number;
    }>;

    const cards = generateTopicReviewCards(
      topicMastery.length > 0
        ? topicMastery
        : [
            { topicName: "Factorisation", score: 38 },
            { topicName: "Quadratic Equations", score: 72 },
            { topicName: "Algebraic Manipulation", score: 84 },
            { topicName: "Polynomials", score: 65 },
          ]
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
