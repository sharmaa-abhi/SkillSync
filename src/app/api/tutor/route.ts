import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tutorRespond } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { sessionId, message, topicName, subjectId, topicId } = await request.json();

    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Start new session or continue existing
    let tutorSession;
    if (sessionId) {
      tutorSession = await prisma.tutorSession.findFirst({ where: { id: sessionId, userId } });
      if (!tutorSession) return NextResponse.json({ error: "Session not found." }, { status: 404 });
    } else {
      // Get mastery info for context
      const profile = await prisma.learningProfile.findFirst({ where: { userId } });
      const rawMastery = profile?.topicMastery;
      const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;
      const currentTopic = topicMastery.find(t => t.topicName === topicName);

      tutorSession = await prisma.tutorSession.create({
        data: {
          userId,
          topicId: topicId || "unknown",
          topicName: topicName || "General",
          subjectId: subjectId || "unknown",
          context: JSON.stringify({ mastery: currentTopic?.score || 0, masteryLevel: currentTopic?.masteryLevel || "unknown" }),
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

    // Get profile context
    const profile = await prisma.learningProfile.findFirst({ where: { userId } });
    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{ topicName: string; score: number; masteryLevel: string }>;
    const currentTopic = topicMastery.find(t => t.topicName === tutorSession.topicName);

    // Get AI response
    const response = await tutorRespond({
      topicName: tutorSession.topicName,
      masteryLevel: currentTopic?.masteryLevel || "unknown",
      score: currentTopic?.score || 0,
      educationLevel: user?.educationLevel || "Student",
      conversationHistory: history.map(m => ({ role: m.role, content: m.content })),
      studentMessage: message,
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
    });
  } catch (error) {
    console.error("[TUTOR]", error);
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
