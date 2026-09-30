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
    const subjectParam = searchParams.get("subject") || searchParams.get("subjectId");

    // Resolve subject if provided
    let subject = null;
    if (subjectParam) {
      const lower = subjectParam.toLowerCase();
      subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { id: subjectParam },
            { name: { contains: subjectParam, mode: "insensitive" } },
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

    // Fetch user profile scoped to subject
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

    if (topicName) {
      const studentScore = topicMastery.find(t => t.topicName.toLowerCase() === topicName.toLowerCase())?.score ?? 45;
      const prediction = predictDifficulty(topicName, studentScore);
      return NextResponse.json({ prediction });
    }

    // Filter benchmarks by subject if available
    const benchmarkEntries = Object.entries(COHORT_BENCHMARKS).filter(([_, b]) => {
      if (!subject) return true;
      return b.subjectName.toLowerCase() === subject.name.toLowerCase();
    });

    const targetList = benchmarkEntries.length > 0 ? benchmarkEntries : Object.entries(COHORT_BENCHMARKS);

    const predictions = targetList.map(([tName]) => {
      const studentScore = topicMastery.find(t => t.topicName.toLowerCase() === tName.toLowerCase())?.score ?? 45;
      return predictDifficulty(tName, studentScore);
    });

    return NextResponse.json({
      subject: subject?.name || "All Subjects",
      predictions,
      totalTrackedTopics: predictions.length,
      criticalBottlenecksCount: predictions.filter(p => p.riskLevel === "critical_bottleneck").length,
    });
  } catch (error) {
    console.error("[COHORT_GET]", error);
    return NextResponse.json({ error: "Failed to fetch cohort predictions" }, { status: 500 });
  }
}
