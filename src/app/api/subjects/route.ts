import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { MULTI_SUBJECT_CATALOG } from "@/lib/curriculumData";

export async function GET() {
  try {
    const dbSubjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: {
        topics: {
          orderBy: { order: "asc" },
          select: { id: true, name: true, description: true, order: true, difficulty: true },
        },
      },
    });

    const existingNames = new Set(dbSubjects.map(s => s.name.toLowerCase()));

    // Merge expanded catalog subjects (OS, Computer Networks, DSA)
    const catalogAdditions = MULTI_SUBJECT_CATALOG.filter(
      cat => !existingNames.has(cat.name.toLowerCase())
    ).map(cat => ({
      id: cat.id,
      name: cat.name,
      description: cat.description,
      icon: cat.icon,
      isActive: true,
      topics: cat.topics.map(t => ({
        id: t.id,
        name: t.name,
        description: t.description,
        order: t.order,
        difficulty: t.difficulty,
      })),
    }));

    const combinedSubjects = [...dbSubjects, ...catalogAdditions];

    return NextResponse.json({ subjects: combinedSubjects });
  } catch {
    // If DB has transient connection issue, return full offline catalog
    return NextResponse.json({
      subjects: MULTI_SUBJECT_CATALOG.map(cat => ({
        id: cat.id,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
        isActive: true,
        topics: cat.topics,
      })),
    });
  }
}
