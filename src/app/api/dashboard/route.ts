import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get("subjectId");

    const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true, educationLevel: true } });

    // Get the latest profile
    const profile = subjectId
      ? await prisma.learningProfile.findUnique({ where: { userId_subjectId: { userId, subjectId } } })
      : await prisma.learningProfile.findFirst({ where: { userId }, orderBy: { updatedAt: "desc" } });

    // Get active plan
    const plan = await prisma.learningPlan.findFirst({
      where: { userId, ...(subjectId ? { subjectId } : {}), status: "active" },
      orderBy: { createdAt: "desc" },
    });

    // Get progress history
    const progress = await prisma.progressRecord.findMany({
      where: { userId, ...(subjectId ? { subjectId } : {}) },
      orderBy: { createdAt: "asc" },
      take: 20,
    });

    // Get recent assessments
    const assessments = await prisma.assessment.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 5,
      include: { subject: { select: { name: true } } },
    });

    // Get recent quizzes
    const quizzes = await prisma.quiz.findMany({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
      take: 5,
    });

    return NextResponse.json({
      user,
      profile,
      plan,
      progress,
      recentActivity: [
        ...assessments.map(a => ({ type: "assessment" as const, subject: a.subject.name, score: a.overallScore, date: a.completedAt })),
        ...quizzes.map(q => ({ type: "quiz" as const, score: q.score, date: q.completedAt })),
      ].sort((a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()).slice(0, 5),
    });
  } catch (error) {
    console.error("[DASHBOARD]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
