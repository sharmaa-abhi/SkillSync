import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorRespond } from "@/lib/ai";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const topicName = searchParams.get("topicName");

    // Fetch user's profile for topic mastery
    const profile = await prisma.learningProfile.findFirst({ where: { userId } });
    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;

    // Find the latest active session for this user and topic if requested
    const tutorSession = await prisma.tutorSession.findFirst({
      where: {
        userId,
        ...(topicName ? { topicName } : {}),
      },
      orderBy: { createdAt: "desc" },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    const currentTopicMastery = topicName ? topicMastery.find(t => t.topicName.toLowerCase() === topicName.toLowerCase()) : null;

    return NextResponse.json({
      session: tutorSession
        ? {
            id: tutorSession.id,
            topicName: tutorSession.topicName,
            messages: tutorSession.messages.map(m => ({
              id: m.id,
              role: m.role,
              content: m.content,
              timestamp: m.createdAt,
            })),
          }
        : null,
      mastery: currentTopicMastery?.score ?? 45,
      masteryLevel: currentTopicMastery?.masteryLevel ?? "in_progress",
      allTopicsMastery: topicMastery,
    });
  } catch (error) {
    console.error("[TUTOR_GET]", error);
    return NextResponse.json({ error: "Failed to fetch tutor data" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { sessionId, message, topicName, subjectId, topicId, mode, language } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Start new session or continue existing
    let tutorSession;
    if (sessionId) {
      tutorSession = await prisma.tutorSession.findFirst({ where: { id: sessionId, userId } });
      if (!tutorSession) {
        // Create session if passed ID was invalid/expired
        tutorSession = await prisma.tutorSession.create({
          data: {
            userId,
            topicId: topicId || "unknown",
            topicName: topicName || "General",
            subjectId: subjectId || "unknown",
          },
        });
      }
    } else {
      // Get mastery info for context
      const profile = await prisma.learningProfile.findFirst({ where: { userId } });
      const rawMastery = profile?.topicMastery;
      const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;
      const currentTopic = topicMastery.find(t => t.topicName.toLowerCase() === (topicName || "").toLowerCase());

      tutorSession = await prisma.tutorSession.create({
        data: {
          userId,
          topicId: topicId || "unknown",
          topicName: topicName || "General",
          subjectId: subjectId || "unknown",
          context: JSON.stringify({ mastery: currentTopic?.score || 45, masteryLevel: currentTopic?.masteryLevel || "intermediate" }),
        },
      });
    }

    // Save student message
    await prisma.tutorMessage.create({
      data: { sessionId: tutorSession.id, role: "student", content: message },
    });

    // Get conversation history
    const history = await prisma.tutorMessage.findMany({
      where: { sessionId: tutorSession.id },
      orderBy: { createdAt: "asc" },
    });

    // Get full student profile context
    const profile = await prisma.learningProfile.findFirst({ where: { userId } });
    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;
    const currentTopic = topicMastery.find(t => t.topicName.toLowerCase() === tutorSession.topicName.toLowerCase());

    const rawWeaknesses = profile?.weaknesses;
    const weaknesses = ((typeof rawWeaknesses === "string" ? JSON.parse(rawWeaknesses) : rawWeaknesses) || []) as string[];

    const rawStrengths = profile?.strengths;
    const strengths = ((typeof rawStrengths === "string" ? JSON.parse(rawStrengths) : rawStrengths) || []) as string[];

    // Fetch latest completed quiz for contextual awareness
    const recentQuiz = await prisma.quiz.findFirst({
      where: { userId, status: "completed" },
      orderBy: { completedAt: "desc" },
    });

    let recentQuizPerformance: string | undefined = undefined;
    if (recentQuiz) {
      const targetTopics = typeof recentQuiz.targetTopics === "string" ? JSON.parse(recentQuiz.targetTopics) : recentQuiz.targetTopics;
      recentQuizPerformance = `Scored ${recentQuiz.score}% (${recentQuiz.correctAnswers}/${recentQuiz.totalQuestions} correct) on ${Array.isArray(targetTopics) ? targetTopics.join(", ") : "recent practice"}`;
    }

    // Get AI response with full context injection
    const response = await tutorRespond({
      studentName: user?.name,
      educationLevel: user?.educationLevel || "Student",
      learningGoals: user?.learningGoals || undefined,
      preferredStyle: user?.preferredStyle || undefined,
      overallMastery: profile?.overallMastery,
      topicName: tutorSession.topicName,
      masteryLevel: currentTopic?.masteryLevel || "intermediate",
      score: currentTopic?.score || 45,
      weaknesses,
      strengths,
      recentQuizPerformance,
      conversationHistory: history.map(m => ({ role: m.role, content: m.content })),
      studentMessage: message,
      mode: mode || "socratic",
      language: language || "en",
    });

    // Save tutor response
    await prisma.tutorMessage.create({
      data: { sessionId: tutorSession.id, role: "tutor", content: response },
    });

    await prisma.tutorSession.update({
      where: { id: tutorSession.id },
      data: { messageCount: { increment: 2 } },
    });

    return NextResponse.json({
      sessionId: tutorSession.id,
      response,
      topicName: tutorSession.topicName,
      source: tutorSession.topicName ? `Standard Curriculum — ${tutorSession.topicName}` : "Curriculum Standard Source",
      confidence: 94,
    });
  } catch (error) {
    console.error("[TUTOR_POST]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      await prisma.tutorMessage.deleteMany({ where: { sessionId } });
      await prisma.tutorSession.deleteMany({ where: { id: sessionId, userId } });
    } else {
      // Clear all sessions for this user
      const userSessions = await prisma.tutorSession.findMany({ where: { userId }, select: { id: true } });
      const ids = userSessions.map(s => s.id);
      await prisma.tutorMessage.deleteMany({ where: { sessionId: { in: ids } } });
      await prisma.tutorSession.deleteMany({ where: { userId } });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[TUTOR_DELETE]", error);
    return NextResponse.json({ error: "Failed to reset session" }, { status: 500 });
  }
}
