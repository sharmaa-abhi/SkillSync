import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { predictDifficulty, COHORT_BENCHMARKS } from "@/lib/cohortAnalytics";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get("topicName");

    // Fetch user profile
    const profile = await prisma.learningProfile.findFirst({
      where: { userId },
      orderBy: { updatedAt: "desc" },
    });

    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
      topicName: string;
      score: number;
    }>;

    if (topicName) {
      const studentScore = topicMastery.find(t => t.topicName.toLowerCase() === topicName.toLowerCase())?.score ?? 45;
      const prediction = predictDifficulty(topicName, studentScore);
      return NextResponse.json({ prediction });
    }

    // Return predictions for all topics
    const predictions = Object.keys(COHORT_BENCHMARKS).map(tName => {
      const studentScore = topicMastery.find(t => t.topicName.toLowerCase() === tName.toLowerCase())?.score ?? 45;
      return predictDifficulty(tName, studentScore);
    });

    return NextResponse.json({
      predictions,
      totalTrackedTopics: predictions.length,
      criticalBottlenecksCount: predictions.filter(p => p.riskLevel === "critical_bottleneck").length,
    });
  } catch (error) {
    console.error("[COHORT_GET]", error);
    return NextResponse.json({ error: "Failed to fetch cohort predictions" }, { status: 500 });
  }
}
