import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      where: { isActive: true },
      include: { topics: { orderBy: { order: "asc" }, select: { id: true, name: true, description: true, order: true, difficulty: true } } },
    });

    return NextResponse.json({ subjects });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
