import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateQuiz } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { action, quizId, answers, subjectId } = await request.json();

    if (action === "generate") {
      // Get learning profile to target weak topics
      const profile = await prisma.learningProfile.findFirst({ where: { userId, ...(subjectId ? { subjectId } : {}) } });
      const topicMastery = (profile?.topicMastery as Array<{ topicName: string; score: number; masteryLevel: string }>) || [];

      // Prioritize weak and medium topics
      const targetTopics = topicMastery
        .filter(t => t.masteryLevel !== "strong")
        .sort((a, b) => a.score - b.score)
        .slice(0, 3)
        .map(t => ({ topicName: t.topicName, mastery: t.score }));

      if (targetTopics.length === 0 && topicMastery.length > 0) {
        // All strong — quiz on all topics
        targetTopics.push(...topicMastery.slice(0, 3).map(t => ({ topicName: t.topicName, mastery: t.score })));
      }

      const questions = await generateQuiz(targetTopics, 5);

      const quiz = await prisma.quiz.create({
        data: {
          userId,
          subjectId: subjectId || profile?.subjectId || "unknown",
          targetTopics: JSON.parse(JSON.stringify(targetTopics.map(t => t.topicName))),
          totalQuestions: questions.length,
          questions: JSON.parse(JSON.stringify(questions)),
          status: "in_progress",
        },
      });

      return NextResponse.json({
        quiz: {
          id: quiz.id,
          questions: questions.map(q => ({
            id: q.id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            topic: q.topic,
          })),
          targetTopics: targetTopics.map(t => t.topicName),
        },
      }, { status: 201 });
    }

    if (action === "submit") {
      if (!quizId || !answers) return NextResponse.json({ error: "Quiz ID and answers required." }, { status: 400 });

      const quiz = await prisma.quiz.findFirst({ where: { id: quizId, userId } });
      if (!quiz) return NextResponse.json({ error: "Quiz not found." }, { status: 404 });
      if (quiz.status === "completed") return NextResponse.json({ error: "Quiz already submitted." }, { status: 400 });

      const questions = quiz.questions as Array<{ id: string; correctAnswer: number; explanation: string; topic: string }>;
      let correct = 0;
      const results = [];

      for (const answer of answers as Array<{ questionId: string; selectedOption: number }>) {
        const question = questions.find(q => q.id === answer.questionId);
        if (!question) continue;
        const isCorrect = answer.selectedOption === question.correctAnswer;
        if (isCorrect) correct++;
        results.push({ questionId: answer.questionId, selectedOption: answer.selectedOption, correctAnswer: question.correctAnswer, isCorrect, explanation: question.explanation, topic: question.topic });
      }

      const score = Math.round((correct / questions.length) * 100);

      await prisma.quiz.update({
        where: { id: quizId },
        data: { correctAnswers: correct, score, status: "completed", answers: JSON.parse(JSON.stringify(results)), completedAt: new Date() },
      });

      // Update learning profile with quiz results
      const profile = await prisma.learningProfile.findFirst({ where: { userId, subjectId: quiz.subjectId } });
      if (profile) {
        const topicMastery = (profile.topicMastery as Array<{ topicName: string; score: number; masteryLevel: string }>) || [];

        // Calculate per-topic quiz scores
        const topicQuizScores = new Map<string, { correct: number; total: number }>();
        for (const r of results) {
          const existing = topicQuizScores.get(r.topic) || { correct: 0, total: 0 };
          existing.total++;
          if (r.isCorrect) existing.correct++;
          topicQuizScores.set(r.topic, existing);
        }

        // Blend quiz results with existing mastery (weighted)
        const updatedMastery = topicMastery.map(t => {
          const quizResult = topicQuizScores.get(t.topicName);
          if (quizResult) {
            const quizScore = Math.round((quizResult.correct / quizResult.total) * 100);
            const newScore = Math.round(t.score * 0.6 + quizScore * 0.4); // Weighted blend
            return {
              ...t,
              score: newScore,
              masteryLevel: newScore <= 40 ? "weak" : newScore <= 70 ? "medium" : "strong",
            };
          }
          return t;
        });

        const newOverall = Math.round(updatedMastery.reduce((s, t) => s + t.score, 0) / updatedMastery.length);
        const newStrengths = updatedMastery.filter(t => t.masteryLevel === "strong").map(t => t.topicName);
        const newWeaknesses = updatedMastery.filter(t => t.masteryLevel === "weak").map(t => t.topicName);

        await prisma.learningProfile.update({
          where: { id: profile.id },
          data: {
            overallMastery: newOverall,
            topicMastery: JSON.parse(JSON.stringify(updatedMastery)),
            strengths: JSON.parse(JSON.stringify(newStrengths)),
            weaknesses: JSON.parse(JSON.stringify(newWeaknesses)),
            quizCount: { increment: 1 },
          },
        });

        // Record progress
        await prisma.progressRecord.create({
          data: {
            userId,
            subjectId: quiz.subjectId,
            overallMastery: newOverall,
            topicScores: JSON.parse(JSON.stringify(updatedMastery.map(t => ({ topicName: t.topicName, score: t.score })))),
            trigger: "quiz",
            triggerId: quizId,
          },
        });

        return NextResponse.json({
          result: { score, correct, total: questions.length, results },
          profileUpdate: {
            previousMastery: profile.overallMastery,
            newMastery: newOverall,
            topicChanges: updatedMastery.map(t => {
              const prev = topicMastery.find(p => p.topicName === t.topicName);
              return { topicName: t.topicName, previousScore: prev?.score || 0, newScore: t.score, change: t.score - (prev?.score || 0) };
            }).filter(c => c.change !== 0),
          },
        });
      }

      return NextResponse.json({ result: { score, correct, total: questions.length, results } });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error) {
    console.error("[QUIZ]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
