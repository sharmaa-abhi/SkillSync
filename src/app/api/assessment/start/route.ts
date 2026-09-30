import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { subjectId } = await request.json();
    if (!subjectId) return NextResponse.json({ error: "Subject ID is required." }, { status: 400 });

    const subLower = String(subjectId).toLowerCase();
    const resolvedSubject = await prisma.subject.findFirst({
      where: {
        OR: [
          { id: subjectId },
          { name: { contains: subjectId, mode: "insensitive" } },
          ...(subLower.includes("python") || subLower === "py"
            ? [{ name: { contains: "Python", mode: "insensitive" as const } }]
            : []),
          ...(subLower.includes("math")
            ? [{ name: { contains: "Math", mode: "insensitive" as const } }]
            : []),
          ...(subLower.includes("dbms") || subLower.includes("database")
            ? [{ name: { contains: "Database", mode: "insensitive" as const } }]
            : []),
          ...(subLower === "os" || subLower.includes("operat")
            ? [{ name: { contains: "Operating", mode: "insensitive" as const } }]
            : []),
          ...(subLower === "cn" || subLower.includes("network")
            ? [{ name: { contains: "Network", mode: "insensitive" as const } }]
            : []),
          ...(subLower === "dsa" || subLower.includes("struct") || subLower.includes("algo")
            ? [{ name: { contains: "Structure", mode: "insensitive" as const } }]
            : []),
        ],
      },
    });

    const targetSubjectId = resolvedSubject ? resolvedSubject.id : subjectId;

    // Get all questions for the subject, grouped by topic
    const topics = await prisma.topic.findMany({
      where: { subjectId: targetSubjectId },
      include: { questions: { where: { type: "assessment" } } },
      orderBy: { order: "asc" },
    });

    const allQuestions = topics.flatMap(t =>
      t.questions.map(q => ({
        id: q.id,
        text: q.text,
        options: typeof q.options === "string" ? JSON.parse(q.options) : q.options,
        topicId: t.id,
        topicName: t.name,
        difficulty: q.difficulty,
      }))
    );

    if (allQuestions.length === 0) {
      return NextResponse.json({ error: "No questions available for this subject." }, { status: 400 });
    }

    // Create assessment record
    const assessment = await prisma.assessment.create({
      data: { userId, subjectId: targetSubjectId, totalQuestions: allQuestions.length, status: "in_progress" },
    });

    // Return questions WITHOUT correctAnswer
    return NextResponse.json({
      assessment: {
        id: assessment.id,
        totalQuestions: allQuestions.length,
        timeLimitMinutes: 20,
        questions: allQuestions.map(q => ({
          id: q.id,
          text: q.text,
          options: q.options,
          topicName: q.topicName,
        })),
      },
    }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
