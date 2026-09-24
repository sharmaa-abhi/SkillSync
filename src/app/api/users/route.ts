import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { educationLevel, learningGoals, preferredStyle } = await request.json();

    const user = await prisma.user.update({
      where: { id: (session.user as { id: string }).id },
      data: {
        educationLevel,
        learningGoals,
        preferredStyle,
        onboardingCompleted: true,
      },
      select: { id: true, name: true, educationLevel: true, learningGoals: true, preferredStyle: true, onboardingCompleted: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: { id: true, email: true, name: true, educationLevel: true, learningGoals: true, preferredStyle: true, onboardingCompleted: true, createdAt: true },
    });

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 });
  }
}
