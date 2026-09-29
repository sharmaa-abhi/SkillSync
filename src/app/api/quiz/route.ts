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

    const { action, quizId, answers, subjectId, subject, topicName, difficultyPreference } = await request.json();

    if (action === "generate") {
      // Get learning profile to target topics
      const profile = await prisma.learningProfile.findFirst({
        where: { userId, ...(subjectId ? { subjectId } : {}) },
        orderBy: { updatedAt: "desc" },
      });
      const rawMastery = profile?.topicMastery;
      const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
        topicName: string;
        score: number;
        masteryLevel: string;
      }>;

      let targetTopics: Array<{ topicName: string; mastery: number }> = [];

      if (topicName) {
        // Specific topic requested
        const matched = topicMastery.find(t => t.topicName.toLowerCase() === topicName.toLowerCase());
        targetTopics = [{ topicName, mastery: matched ? matched.score : 45 }];
      } else {
        // Prioritize weak and medium topics
        targetTopics = topicMastery
          .filter(t => t.masteryLevel !== "strong")
          .sort((a, b) => a.score - b.score)
          .slice(0, 3)
          .map(t => ({ topicName: t.topicName, mastery: t.score }));

        if (targetTopics.length === 0 && topicMastery.length > 0) {
          targetTopics = topicMastery.slice(0, 3).map(t => ({ topicName: t.topicName, mastery: t.score }));
        }

        if (targetTopics.length === 0) {
          const subLower = String(subjectId || subject || "").toLowerCase();
          if (subLower.includes("dbms") || subLower.includes("data")) {
            targetTopics = [{ topicName: "Normalization", mastery: 36 }];
          } else if (subLower.includes("os") || subLower.includes("operat")) {
            targetTopics = [{ topicName: "Deadlocks", mastery: 34 }];
          } else if (subLower.includes("cn") || subLower.includes("network")) {
            targetTopics = [{ topicName: "IP Addressing & Subnetting", mastery: 39 }];
          } else if (subLower.includes("dsa") || subLower.includes("algo") || subLower.includes("struct")) {
            targetTopics = [{ topicName: "Dynamic Programming", mastery: 32 }];
          } else {
            targetTopics = [{ topicName: "Factorisation", mastery: 38 }];
          }
        }
      }

      const diffPref = (difficultyPreference === "easy" || difficultyPreference === "medium" || difficultyPreference === "hard" || difficultyPreference === "adaptive")
        ? difficultyPreference
        : "adaptive";

      const questions = await generateQuiz(targetTopics, 5, diffPref);

      const quiz = await prisma.quiz.create({
        data: {
          userId,
          subjectId: subjectId || profile?.subjectId || "unknown",
          targetTopics: JSON.stringify(targetTopics.map(t => t.topicName)),
          totalQuestions: questions.length,
          questions: JSON.stringify(questions),
          difficulty: diffPref,
          status: "in_progress",
        },
      });

      return NextResponse.json({
        quiz: {
          id: quiz.id,
          difficulty: diffPref,
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

      const questions = (typeof quiz.questions === "string" ? JSON.parse(quiz.questions) : quiz.questions) as Array<{ id: string; correctAnswer: number; explanation: string; topic: string }>;
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
        data: { correctAnswers: correct, score, status: "completed", answers: JSON.stringify(results), completedAt: new Date() },
      });

      // Update learning profile with quiz results
      const profile = await prisma.learningProfile.findFirst({ where: { userId, subjectId: quiz.subjectId } });
      if (profile) {
        const rawMastery = profile.topicMastery;
        const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;

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
            topicMastery: JSON.stringify(updatedMastery),
            strengths: JSON.stringify(newStrengths),
            weaknesses: JSON.stringify(newWeaknesses),
            quizCount: { increment: 1 },
          },
        });

        // Record progress
        await prisma.progressRecord.create({
          data: {
            userId,
            subjectId: quiz.subjectId,
            overallMastery: newOverall,
            topicScores: JSON.stringify(updatedMastery.map(t => ({ topicName: t.topicName, score: t.score }))),
            trigger: "quiz",
            triggerId: quizId,
          },
        });

        // Sync with active Learning Plan (Closed-loop mastery)
        try {
          const activePlan = await prisma.learningPlan.findFirst({
            where: { userId, status: "active" },
            orderBy: { createdAt: "desc" },
          });

          if (activePlan) {
            const planItems = (typeof activePlan.items === "string" ? JSON.parse(activePlan.items) : activePlan.items) as Array<{
              order: number;
              topic: string;
              activity: string;
              durationMinutes: number;
              priority: string;
              reason: string;
              isCompleted?: boolean;
            }>;

            let planModified = false;
            const updatedPlanItems = planItems.map(item => {
              const matchedResult = topicQuizScores.get(item.topic);
              if (matchedResult && (matchedResult.correct / matchedResult.total) >= 0.6) {
                if (!item.isCompleted) {
                  planModified = true;
                  return { ...item, isCompleted: true };
                }
              }
              return item;
            });

            if (planModified) {
              await prisma.learningPlan.update({
                where: { id: activePlan.id },
                data: { items: JSON.stringify(updatedPlanItems) },
              });
            }
          }
        } catch (planErr) {
          console.error("Failed to sync plan after quiz:", planErr);
        }

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
