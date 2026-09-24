import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeLearning, generateLearningPlan } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { assessmentId } = await request.json();
    if (!assessmentId) return NextResponse.json({ error: "Assessment ID required." }, { status: 400 });

    const assessment = await prisma.assessment.findFirst({
      where: { id: assessmentId, userId, status: "completed" },
      include: { subject: true },
    });
    if (!assessment) return NextResponse.json({ error: "Completed assessment not found." }, { status: 404 });

    const topicScores = await prisma.topicScore.findMany({ where: { assessmentId } });
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Run AI analysis
    const analysis = await analyzeLearning({
      studentName: user?.name || "Student",
      educationLevel: user?.educationLevel || "Student",
      learningGoals: user?.learningGoals || "Improve understanding",
      subjectName: assessment.subject.name,
      topicScores: topicScores.map(ts => ({
        topicName: ts.topicName,
        correct: ts.correctAnswers,
        total: ts.totalQuestions,
        percentage: ts.percentage,
      })),
      overallScore: assessment.overallScore,
    });

    const strengths = analysis.topicMastery.filter(t => t.masteryLevel === "strong").map(t => t.topicName);
    const weaknesses = analysis.topicMastery.filter(t => t.masteryLevel === "weak").map(t => t.topicName);

    // Upsert learning profile
    await prisma.learningProfile.upsert({
      where: { userId_subjectId: { userId, subjectId: assessment.subjectId } },
      create: {
        userId,
        subjectId: assessment.subjectId,
        overallMastery: assessment.overallScore,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        topicMastery: JSON.stringify(analysis.topicMastery),
        aiAnalysis: JSON.stringify(analysis),
        assessmentCount: 1,
        lastAssessedAt: new Date(),
      },
      update: {
        overallMastery: assessment.overallScore,
        strengths: JSON.stringify(strengths),
        weaknesses: JSON.stringify(weaknesses),
        topicMastery: JSON.stringify(analysis.topicMastery),
        aiAnalysis: JSON.stringify(analysis),
        assessmentCount: { increment: 1 },
        lastAssessedAt: new Date(),
      },
    });

    // Generate learning plan
    const plan = await generateLearningPlan({
      studentName: user?.name || "Student",
      subjectName: assessment.subject.name,
      topicMastery: analysis.topicMastery.map(t => ({ topicName: t.topicName, masteryLevel: t.masteryLevel, score: t.score })),
      weaknesses,
    });

    // Save plan
    await prisma.learningPlan.updateMany({
      where: { userId, subjectId: assessment.subjectId, status: "active" },
      data: { status: "superseded" },
    });

    await prisma.learningPlan.create({
      data: {
        userId,
        subjectId: assessment.subjectId,
        title: plan.title,
        estimatedDuration: plan.estimatedDuration,
        items: JSON.stringify(plan.items),
        aiOutput: JSON.stringify(plan),
        status: "active",
      },
    });

    // Create progress record
    await prisma.progressRecord.create({
      data: {
        userId,
        subjectId: assessment.subjectId,
        overallMastery: assessment.overallScore,
        topicScores: JSON.stringify(topicScores.map(ts => ({ topicName: ts.topicName, score: ts.percentage }))),
        trigger: "assessment",
        triggerId: assessmentId,
      },
    });

    return NextResponse.json({ analysis, plan });
  } catch (error) {
    console.error("[ANALYSIS_GENERATE]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
