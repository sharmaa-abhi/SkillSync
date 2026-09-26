import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { assessmentId, answers, timeTakenSeconds } = await request.json();
    if (!assessmentId || !answers || !Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json({ error: "Assessment ID and non-empty answers array are required." }, { status: 400 });
    }

    // Verify ownership
    const assessment = await prisma.assessment.findFirst({ where: { id: assessmentId, userId } });
    if (!assessment) return NextResponse.json({ error: "Assessment not found." }, { status: 404 });
    if (assessment.status === "completed") return NextResponse.json({ error: "Assessment already submitted." }, { status: 400 });

    // Get questions with correct answers
    const questions = await prisma.question.findMany({
      where: { id: { in: answers.map((a: { questionId: string }) => a.questionId) } },
      include: { topic: { select: { id: true, name: true } } },
    });

    const questionMap = new Map(questions.map(q => [q.id, q]));

    // Score answers
    let totalCorrect = 0;
    const topicScoresMap = new Map<string, { topicName: string; correct: number; total: number }>();
    const answerRecords: { assessmentId: string; questionId: string; selectedOption: number | null; isCorrect: boolean }[] = [];

    for (const answer of answers as { questionId: string; selectedOption: number | null }[]) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = answer.selectedOption === question.correctAnswer;
      if (isCorrect) totalCorrect++;

      answerRecords.push({
        assessmentId,
        questionId: answer.questionId,
        selectedOption: answer.selectedOption,
        isCorrect,
      });

      const topicKey = question.topic.id;
      const existing = topicScoresMap.get(topicKey) || { topicName: question.topic.name, correct: 0, total: 0 };
      existing.total++;
      if (isCorrect) existing.correct++;
      topicScoresMap.set(topicKey, existing);
    }

    const overallScore = Math.round((totalCorrect / answers.length) * 100);

    // Save answers
    await prisma.answer.createMany({ data: answerRecords });

    // Save topic scores
    const topicScoreRecords = Array.from(topicScoresMap.entries()).map(([topicId, data]) => ({
      assessmentId,
      topicId,
      topicName: data.topicName,
      totalQuestions: data.total,
      correctAnswers: data.correct,
      percentage: Math.round((data.correct / data.total) * 100),
    }));

    await prisma.topicScore.createMany({ data: topicScoreRecords });

    // Update assessment
    await prisma.assessment.update({
      where: { id: assessmentId },
      data: {
        correctAnswers: totalCorrect,
        overallScore,
        timeTakenSeconds: timeTakenSeconds || null,
        status: "completed",
        completedAt: new Date(),
      },
    });

    return NextResponse.json({
      result: {
        assessmentId,
        overallScore,
        totalQuestions: answers.length,
        correctAnswers: totalCorrect,
        topicScores: topicScoreRecords.map(ts => ({
          ...ts,
          masteryLevel: ts.percentage <= 40 ? "weak" : ts.percentage <= 70 ? "medium" : "strong",
        })),
      },
    });
  } catch (error) {
    console.error("[ASSESSMENT_SUBMIT]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
