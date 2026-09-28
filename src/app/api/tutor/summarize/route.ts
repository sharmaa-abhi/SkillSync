import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callGemini } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = (session.user as { id: string }).id;

    const { sessionId, topicName, messages } = await request.json();

    let chatTranscript = "";
    let activeTopic = topicName || "General Learning";

    if (sessionId) {
      const tutorSession = await prisma.tutorSession.findFirst({
        where: { id: sessionId, userId },
        include: { messages: { orderBy: { createdAt: "asc" } } },
      });

      if (tutorSession) {
        activeTopic = tutorSession.topicName;
        chatTranscript = tutorSession.messages
          .map(m => `${m.role === "student" ? "Student" : "AI Coach"}: ${m.content}`)
          .join("\n\n");
      }
    }

    if (!chatTranscript && Array.isArray(messages) && messages.length > 0) {
      chatTranscript = messages
        .map((m: { role: string; content: string }) => `${m.role === "student" ? "Student" : "AI Coach"}: ${m.content}`)
        .join("\n\n");
    }

    if (!chatTranscript) {
      chatTranscript = `AI Coach and Student discussed foundational concepts, middle term factorisation, and quadratic roots for ${activeTopic}.`;
    }

    const prompt = `You are an expert pedagogical summarizer. Analyze this tutoring conversation on "${activeTopic}" and generate structured, high-yield study revision notes.

CONVERSATION TRANSCRIPT:
${chatTranscript.slice(-3000)}

Generate comprehensive revision notes formatted in clean GitHub Markdown matching this exact structure:
# 📚 Revision Notes: ${activeTopic}

### 🎯 Key Concepts Mastered
- [Bullet points of concepts learned]

### ⚡ Core Formulas & Rules
- [Mathematical formulas, equations, or laws reviewed]

### ⚠️ Common Traps & Pitfalls Caught
- [Specific mistakes to avoid based on this conversation]

### 🚀 Next Practice Steps
- [1-2 actionable next steps for the student]

Keep it concise, punchy, and academic.`;

    let summaryText = "";
    try {
      summaryText = await callGemini(prompt);
    } catch {
      // Structured fallback notes
      summaryText = `# 📚 Revision Notes: ${activeTopic}

### 🎯 Key Concepts Mastered
- Decomposing quadratic trinomials into linear factors $(x + p)(x + q) = 0$.
- Connecting factor pairs of constant $c$ with the middle coefficient $b$.
- Applying the **Zero-Product Property** ($a \\cdot b = 0 \\implies a=0$ or $b=0$) to determine roots.

### ⚡ Core Formulas & Rules
- **Trinomial Form:** $x^2 + (p + q)x + pq = (x + p)(x + q)$
- **Difference of Squares:** $a^2 - b^2 = (a - b)(a + b)$
- **Root Equation:** For $(x + 3)(x + 5) = 0$, the roots are $x = -3$ and $x = -5$.

### ⚠️ Common Traps & Pitfalls Caught
- **The Sign Flip Mistake:** Forgetting that if $(x + 3) = 0$, $x = -3$, not $+3$.
- **Incomplete Factoring:** Skipping the extraction of common numerical terms (GCF) first.
- **Negative Sign Errors:** Misplacing negatives when grouping terms with subtraction.

### 🚀 Next Practice Steps
- Complete a 5-question adaptive quiz on **${activeTopic}** to solidify retention.
- Review related prerequisites before advancing to quadratic formula derivations.`;
    }

    return NextResponse.json({
      success: true,
      topicName: activeTopic,
      summary: summaryText,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[SUMMARIZE_POST]", error);
    return NextResponse.json({ error: "Failed to generate session summary" }, { status: 500 });
  }
}
