import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateLearningPlan } from "@/lib/ai";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { searchParams } = new URL(request.url);
    let subjectId = searchParams.get("subjectId");
    const subjectParam = searchParams.get("subject");

    if (!subjectId && subjectParam) {
      const lower = subjectParam.toLowerCase();
      const subject = await prisma.subject.findFirst({
        where: {
          OR: [
            { id: subjectParam },
            { name: { contains: subjectParam, mode: "insensitive" } },
            ...(lower.includes("math")
              ? [{ name: { contains: "Math", mode: "insensitive" as const } }]
              : []),
            ...(lower.includes("dbms") || lower.includes("database")
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
      if (subject) {
        subjectId = subject.id;
      }
    }

    // Get active learning plan
    let plan = await prisma.learningPlan.findFirst({
      where: {
        userId,
        ...(subjectId ? { subjectId } : {}),
        status: "active",
      },
      orderBy: { createdAt: "desc" },
    });

    // If no plan exists, automatically generate one based on learning profile
    if (!plan) {
      const profile = await prisma.learningProfile.findFirst({
        where: { userId, ...(subjectId ? { subjectId } : {}) },
        orderBy: { updatedAt: "desc" },
      });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      const subject = await prisma.subject.findFirst({
        where: subjectId ? { id: subjectId } : { isActive: true },
      });

      if (profile && subject) {
        const rawMastery = profile.topicMastery;
        const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
          topicName: string;
          score: number;
          masteryLevel: string;
        }>;

        const rawWeaknesses = profile.weaknesses;
        const weaknesses = ((typeof rawWeaknesses === "string" ? JSON.parse(rawWeaknesses) : rawWeaknesses) || []) as string[];

        const aiPlan = await generateLearningPlan({
          studentName: user?.name || "Student",
          subjectName: subject.name,
          topicMastery: topicMastery.map(t => ({
            topicName: t.topicName,
            masteryLevel: t.masteryLevel,
            score: t.score,
          })),
          weaknesses,
        });

        // Map items to include activity, reason, and isCompleted
        const formattedItems = aiPlan.items.map((item, idx) => ({
          order: item.order || idx + 1,
          topic: item.topicName,
          activity: item.activities?.[0] || item.objectives?.[0] || `Master ${item.topicName} fundamentals`,
          durationMinutes: item.estimatedMinutes || 15,
          priority: item.priority || "medium",
          reason: `Targeted practice to improve ${item.topicName} mastery.`,
          isCompleted: false,
        }));

        plan = await prisma.learningPlan.create({
          data: {
            userId,
            subjectId: subject.id,
            title: aiPlan.title || `${subject.name} Mastery Roadmap`,
            estimatedDuration: aiPlan.estimatedDuration || "1.5 hours total (10-15 mins/day)",
            status: "active",
            items: JSON.stringify(formattedItems),
            aiOutput: JSON.stringify(aiPlan),
          },
        });
      }
    }

    if (!plan) {
      return NextResponse.json({ plan: null });
    }

    const items = typeof plan.items === "string" ? JSON.parse(plan.items) : plan.items;

    return NextResponse.json({
      plan: {
        id: plan.id,
        title: plan.title,
        estimatedDuration: plan.estimatedDuration,
        status: plan.status,
        items,
        createdAt: plan.createdAt,
        updatedAt: plan.updatedAt,
      },
    });
  } catch (error) {
    console.error("[PLAN_GET]", error);
    return NextResponse.json({ error: "Failed to fetch plan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { subjectId } = await request.json().catch(() => ({}));

    // Find profile
    const profile = await prisma.learningProfile.findFirst({
      where: { userId, ...(subjectId ? { subjectId } : {}) },
      orderBy: { updatedAt: "desc" },
    });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    const targetSubjectId = subjectId || profile?.subjectId;

    let subject = null;
    if (targetSubjectId) {
      subject = await prisma.subject.findUnique({ where: { id: targetSubjectId } });
    }
    if (!subject) {
      subject = await prisma.subject.findFirst({ where: { isActive: true } });
    }

    const rawMastery = profile?.topicMastery;
    const topicMastery = ((typeof rawMastery === "string" ? JSON.parse(rawMastery) : rawMastery) || []) as Array<{
      topicName: string;
      score: number;
      masteryLevel: string;
    }>;

    const rawWeaknesses = profile?.weaknesses;
    const weaknesses = ((typeof rawWeaknesses === "string" ? JSON.parse(rawWeaknesses) : rawWeaknesses) || []) as string[];

    // Generate new plan with Gemini AI
    const aiPlan = await generateLearningPlan({
      studentName: user?.name || "Student",
      subjectName: subject?.name || "Mathematics",
      topicMastery: topicMastery.map(t => ({
        topicName: t.topicName,
        masteryLevel: t.masteryLevel,
        score: t.score,
      })),
      weaknesses: weaknesses.length > 0 ? weaknesses : topicMastery.filter(t => t.score < 50).map(t => t.topicName),
    });

    // Format plan items with priority, reason, activity, isCompleted
    const formattedItems = aiPlan.items.map((item, idx) => ({
      order: item.order || idx + 1,
      topic: item.topicName,
      activity: item.activities?.[0] || item.objectives?.[0] || `Master ${item.topicName} fundamentals`,
      durationMinutes: item.estimatedMinutes || 15,
      priority: item.priority || (idx === 0 ? "critical" : idx <= 2 ? "high" : "medium"),
      reason: weaknesses.includes(item.topicName)
        ? `Identified knowledge deficit: Key blocker for curriculum progress.`
        : `Targeted practice to reinforce ${item.topicName}.`,
      isCompleted: false,
    }));

    // Archive existing active plans
    await prisma.learningPlan.updateMany({
      where: { userId, ...(subject ? { subjectId: subject.id } : {}), status: "active" },
      data: { status: "archived" },
    });

    // Create new active plan
    const newPlan = await prisma.learningPlan.create({
      data: {
        userId,
        subjectId: subject?.id || "unknown",
        title: aiPlan.title || `${subject?.name || "Subject"} 7-Day Mastery Pathway`,
        estimatedDuration: aiPlan.estimatedDuration || "1.5 hours total (10-15 mins/day)",
        status: "active",
        items: JSON.stringify(formattedItems),
        aiOutput: JSON.stringify(aiPlan),
      },
    });

    return NextResponse.json({
      plan: {
        id: newPlan.id,
        title: newPlan.title,
        estimatedDuration: newPlan.estimatedDuration,
        status: newPlan.status,
        items: formattedItems,
        createdAt: newPlan.createdAt,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("[PLAN_POST]", error);
    return NextResponse.json({ error: "Failed to generate learning plan" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { planId, order, isCompleted } = await request.json();

    const plan = await prisma.learningPlan.findFirst({
      where: { id: planId, userId },
    });

    if (!plan) return NextResponse.json({ error: "Plan not found" }, { status: 404 });

    const items = (typeof plan.items === "string" ? JSON.parse(plan.items) : plan.items) as Array<{
      order: number;
      topic: string;
      activity: string;
      durationMinutes: number;
      priority: string;
      reason: string;
      isCompleted?: boolean;
    }>;

    const updatedItems = items.map(item => {
      if (item.order === order) {
        return { ...item, isCompleted: !!isCompleted };
      }
      return item;
    });

    await prisma.learningPlan.update({
      where: { id: planId },
      data: { items: JSON.stringify(updatedItems) },
    });

    return NextResponse.json({ success: true, items: updatedItems });
  } catch (error) {
    console.error("[PLAN_PATCH]", error);
    return NextResponse.json({ error: "Failed to update plan task" }, { status: 500 });
  }
}
