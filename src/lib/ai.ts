import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function callGemini(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-1.5-flash",
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
}

export function extractJSON(text: string): unknown {
  // Try to extract JSON from the response
  const jsonMatch = text.match(/```json\s*([\s\S]*?)```/) ||
                    text.match(/```\s*([\s\S]*?)```/) ||
                    text.match(/(\{[\s\S]*\})/);
  
  if (jsonMatch && jsonMatch[1]) {
    return JSON.parse(jsonMatch[1].trim());
  }
  return JSON.parse(text.trim());
}

export interface AnalysisInput {
  studentName: string;
  educationLevel: string;
  learningGoals: string;
  subjectName: string;
  topicScores: { topicName: string; correct: number; total: number; percentage: number }[];
  overallScore: number;
}

export interface AnalysisOutput {
  overallAssessment: string;
  topicMastery: { topicName: string; masteryLevel: "weak" | "medium" | "strong"; score: number; reasoning: string }[];
  weaknesses: { topicName: string; priority: number; reason: string }[];
  recommendations: string[];
  confidence: number;
}

export async function analyzeLearning(input: AnalysisInput): Promise<AnalysisOutput> {
  const prompt = `You are an expert educational AI that analyzes student assessment results to identify learning gaps and create personalized improvement strategies.

You MUST respond ONLY with valid JSON matching the schema below. No text outside JSON.

CONTEXT:
Student: ${input.educationLevel}
Subject: ${input.subjectName}
Learning Goal: ${input.learningGoals || "Improve understanding"}
Overall Score: ${input.overallScore}%

Assessment Results:
${input.topicScores.map(t => `- ${t.topicName}: ${t.percentage}% (${t.correct}/${t.total} correct)`).join("\n")}

TASK:
1. Classify each topic as weak (0-40%), medium (41-70%), or strong (71-100%)
2. Provide specific reasoning for each classification
3. Order weaknesses by priority (most important first)
4. Give actionable recommendations

REQUIRED JSON SCHEMA:
{
  "overallAssessment": "1-2 sentence summary",
  "topicMastery": [{"topicName": "string", "masteryLevel": "weak|medium|strong", "score": number, "reasoning": "string"}],
  "weaknesses": [{"topicName": "string", "priority": number, "reason": "string"}],
  "recommendations": ["string"],
  "confidence": 0.85
}`;

  try {
    const text = await callGemini(prompt);
    const parsed = extractJSON(text) as AnalysisOutput;
    
    // Validate
    if (!parsed.topicMastery || !Array.isArray(parsed.topicMastery)) {
      throw new Error("Invalid AI response: missing topicMastery");
    }
    if (!parsed.weaknesses || !Array.isArray(parsed.weaknesses)) {
      parsed.weaknesses = [];
    }
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      parsed.recommendations = [];
    }
    if (typeof parsed.confidence !== "number") {
      parsed.confidence = 0.8;
    }

    return parsed;
  } catch {
    // Fallback: generate analysis from raw scores
    return generateFallbackAnalysis(input);
  }
}

function generateFallbackAnalysis(input: AnalysisInput): AnalysisOutput {
  const topicMastery = input.topicScores.map(t => ({
    topicName: t.topicName,
    masteryLevel: (t.percentage <= 40 ? "weak" : t.percentage <= 70 ? "medium" : "strong") as "weak" | "medium" | "strong",
    score: t.percentage,
    reasoning: t.percentage <= 40
      ? `Scored ${t.percentage}% — needs significant improvement.`
      : t.percentage <= 70
      ? `Scored ${t.percentage}% — has a basic understanding but needs more practice.`
      : `Scored ${t.percentage}% — demonstrates strong understanding.`,
  }));

  const weaknesses = topicMastery
    .filter(t => t.masteryLevel === "weak")
    .sort((a, b) => a.score - b.score)
    .map((t, i) => ({
      topicName: t.topicName,
      priority: i + 1,
      reason: `Scored only ${t.score}% — this is a foundational topic that needs immediate attention.`,
    }));

  const strong = topicMastery.filter(t => t.masteryLevel === "strong").map(t => t.topicName);
  const weak = topicMastery.filter(t => t.masteryLevel === "weak").map(t => t.topicName);

  return {
    overallAssessment: `Overall score of ${input.overallScore}%.${strong.length > 0 ? ` Strong in ${strong.join(", ")}.` : ""}${weak.length > 0 ? ` Needs improvement in ${weak.join(", ")}.` : ""}`,
    topicMastery,
    weaknesses,
    recommendations: weak.length > 0
      ? [`Focus on ${weak[0]} first — it's your weakest area.`, ...weak.slice(1).map(w => `Then work on ${w}.`), "Take practice quizzes to reinforce learning."]
      : ["Great job! Review medium-mastery topics to push them to strong."],
    confidence: 0.7,
  };
}

export interface PlanInput {
  studentName: string;
  subjectName: string;
  topicMastery: { topicName: string; masteryLevel: string; score: number }[];
  weaknesses: string[];
}

export interface PlanItem {
  order: number;
  topicName: string;
  priority: "critical" | "high" | "medium" | "low";
  estimatedMinutes: number;
  objectives: string[];
  activities: string[];
}

export async function generateLearningPlan(input: PlanInput): Promise<{ title: string; estimatedDuration: string; items: PlanItem[] }> {
  const prompt = `You are an educational AI that creates personalized study plans.

Respond ONLY with valid JSON.

CONTEXT:
Student: ${input.studentName}
Subject: ${input.subjectName}
Topic Mastery:
${input.topicMastery.map(t => `- ${t.topicName}: ${t.masteryLevel} (${t.score}%)`).join("\n")}
Weak Topics: ${input.weaknesses.join(", ")}

TASK: Create a prioritized study plan focusing on weak topics first.

JSON SCHEMA:
{
  "title": "string",
  "estimatedDuration": "X hours",
  "items": [{"order": 1, "topicName": "string", "priority": "critical|high|medium|low", "estimatedMinutes": number, "objectives": ["string"], "activities": ["string"]}]
}`;

  try {
    const text = await callGemini(prompt);
    const parsed = extractJSON(text) as { title: string; estimatedDuration: string; items: PlanItem[] };
    if (!parsed.items || !Array.isArray(parsed.items)) throw new Error("Invalid plan");
    return parsed;
  } catch {
    // Fallback plan
    const items: PlanItem[] = input.topicMastery
      .filter(t => t.masteryLevel !== "strong")
      .sort((a, b) => a.score - b.score)
      .map((t, i) => ({
        order: i + 1,
        topicName: t.topicName,
        priority: (t.score <= 40 ? "critical" : t.score <= 60 ? "high" : "medium") as PlanItem["priority"],
        estimatedMinutes: t.score <= 40 ? 45 : 30,
        objectives: [`Understand core concepts of ${t.topicName}`, `Practice problems on ${t.topicName}`],
        activities: [`AI Tutor session on ${t.topicName}`, `Practice quiz on ${t.topicName}`],
      }));

    return {
      title: `${input.subjectName} — Personalized Study Plan`,
      estimatedDuration: `${Math.ceil(items.reduce((s, i) => s + i.estimatedMinutes, 0) / 60)} hours`,
      items,
    };
  }
}

export interface TutorInput {
  topicName: string;
  masteryLevel: string;
  score: number;
  educationLevel: string;
  studentName?: string;
  learningGoals?: string;
  preferredStyle?: string;
  overallMastery?: number;
  weaknesses?: string[];
  strengths?: string[];
  recentQuizPerformance?: string;
  curriculumContext?: string;
  conversationHistory: { role: string; content: string }[];
  studentMessage: string;
  mode?: "socratic" | "step_by_step" | "analogy" | "practice" | "review";
  language?: "en" | "hi" | "hinglish";
}

export async function tutorRespond(input: TutorInput): Promise<string> {
  const mode = input.mode || "socratic";
  const language = input.language || "en";

  const historyText = input.conversationHistory
    .slice(-8)
    .map(m => `${m.role === "student" ? "Student" : "Coach"}: ${m.content}`)
    .join("\n");

  const modeInstructions = {
    socratic: `Approach: SOCRATIC INQUIRY.
- Do NOT directly give the solution or final answer.
- Guide the student by asking thoughtful, leading questions.
- Nudge them toward noticing the underlying pattern or next logical deduction.
- If they are stuck or ask for a hint, provide a progressive hint (starting with the smallest nudge).`,
    step_by_step: `Approach: STEP-BY-STEP BREAKDOWN.
- Break the problem or concept into clear, structured, numbered steps (e.g., Step 1, Step 2).
- Present the immediate next step clearly with the reasoning behind it.
- Ask the student to complete or verify that step before proceeding.`,
    analogy: `Approach: INTUITIVE REAL-WORLD ANALOGY.
- Use a vivid, memorable everyday analogy (e.g., cricket, cooking, building blocks, money, gaming) to explain the concept.
- Map the analogy directly to the mathematical/technical elements of the topic.
- Conclude by asking if the metaphor helps clarify the concept.`,
    practice: `Approach: INTERACTIVE PRACTICE PROBLEM.
- Formulate a clean, targeted practice problem calibrated to the student's mastery level (${input.score}%).
- Present the problem clearly.
- Ask the student to attempt the first step and share their thought process.
- Offer immediate encouragement.`,
    review: `Approach: RAPID CONCEPT & EXAM REVIEW.
- Provide a concise cheat-sheet style overview of key formulas, principles, and common pitfalls to avoid in exams.
- Highlight 2-3 golden rules or mnemonics.
- End with a quick 1-line check question.`,
  }[mode];

  const languageInstructions = {
    en: "Language: English. Professional, warm, motivating academic tone.",
    hi: "Language: Hindi (शुद्ध एवं सरल हिन्दी लिपि Devanagari). Use Hindi terms along with English mathematical symbols where appropriate.",
    hinglish: "Language: Hinglish (Natural Indian colloquial mix of Hindi and English written in Latin script, e.g., 'Chaliye isko step-by-step samajhte hain...'). Keep mathematical terms in English.",
  }[language];

  const prompt = `You are the SkillSync Socratic AI Learning Coach. You are tutoring a student with the following comprehensive learning context:

STUDENT LEARNING CONTEXT:
- Student Name: ${input.studentName || "Alex"}
- Education Level: ${input.educationLevel}
- Target Learning Goal: ${input.learningGoals || "Pass with strong conceptual foundation"}
- Preferred Learning Style: ${input.preferredStyle || "Socratic 1-on-1 coaching"}
- Overall Academic Mastery: ${input.overallMastery !== undefined ? `${input.overallMastery}%` : "Not evaluated"}
- Active Topic: ${input.topicName} (Current Mastery: ${input.score}% — ${input.masteryLevel})
- Proven Strengths: ${input.strengths && input.strengths.length > 0 ? input.strengths.join(", ") : "Building foundational competencies"}
- Identified Deficits / Prerequisite Gaps: ${input.weaknesses && input.weaknesses.length > 0 ? input.weaknesses.join(", ") : "None detected"}
${input.recentQuizPerformance ? `- Recent Quiz Performance: ${input.recentQuizPerformance}` : ""}

${input.curriculumContext ? `AUTHORITATIVE CURRICULUM GROUNDING (RAG TEXTBOOK REFERENCE):\n${input.curriculumContext}\n` : ""}

ROLE & PEDAGOGY:
${modeInstructions}

LANGUAGE & TONE:
${languageInstructions}

GENERAL CONSTRAINTS:
- Keep the response concise, punchy, and under 250 words.
- Format equations cleanly using standard readable math notation or LaTeX-style delimiters (e.g. $ax^2 + bx + c = 0$ or $(x - 2)(x + 3)$).
- Use bullet points and bold highlights for readability.
- Be encouraging, respectful, and pedagogically sound.
- If the student has prerequisite weaknesses (${input.weaknesses?.slice(0, 2).join(", ") || "earlier foundational topics"}), help bridge those gaps so they can conquer "${input.topicName}".

CONVERSATION:
${historyText ? `Recent conversation:\n${historyText}\n` : ""}
Student's Latest Message: ${input.studentMessage}

Respond as the AI Coach:`;

  try {
    return await callGemini(prompt);
  } catch {
    return generateFallbackTutorResponse(input, mode, language);
  }
}

function generateFallbackTutorResponse(
  input: TutorInput,
  mode: "socratic" | "step_by_step" | "analogy" | "practice" | "review",
  language: "en" | "hi" | "hinglish"
): string {
  const topic = input.topicName;
  const msg = input.studentMessage.toLowerCase();
  const lastMessages = input.conversationHistory.slice(-4);
  const fullContextText = lastMessages.map(m => m.content).join(" ");

  // Check if there is an active problem in the recent history
  const hasActiveProblem15 = fullContextText.includes("8x + 15") || fullContextText.includes("x^2 + 8x + 15");
  const hasActiveProblem12 = fullContextText.includes("7x + 12") || fullContextText.includes("x^2 + 7x + 12");
  const hasActiveProblem6 = fullContextText.includes("5x + 6") || fullContextText.includes("x^2 + 5x + 6");

  // Check student intent
  const asksForHint = msg.includes("hint") || msg.includes("help") || msg.includes("clue") || msg.includes("stuck");
  const asksForTraps = msg.includes("trap") || msg.includes("mistake") || msg.includes("error") || msg.includes("common");
  const answersFactors = msg.includes("3") && (msg.includes("5") || msg.includes("4"));
  const answersRoots = msg.includes("-3") || msg.includes("-5") || msg.includes("-4");

  // Dynamic context-aware responses in English
  if (language === "en") {
    // Handling active problem: x^2 + 8x + 15 = 0
    if (hasActiveProblem15) {
      if (answersRoots) {
        return `🎉 **Outstanding work!**\n\nYou solved it completely:\n- Factors: $(x + 3)(x + 5) = 0$\n- Roots: **$x = -3$** and **$x = -5$**\n\nNotice how the signs flip when solving $x + 3 = 0 \\implies x = -3$. Ready for another practice challenge or a slightly harder quadratic?`;
      }
      if (answersFactors) {
        return `🎯 **Spot on!** The numbers are indeed **$3$** and **$5$**, because:\n- Product: $3 \\times 5 = 15$\n- Sum: $3 + 5 = 8$\n\nNow, write the expression in factored form: **$(x + 3)(x + 5) = 0$**.\n\nUsing the Zero-Product Property, what are the two solutions for $x$?`;
      }
      if (asksForHint) {
        return `Here is your targeted hint for **$x^2 + 8x + 15 = 0$**:\n\n1. Look at the factor pairs of the constant term $15$:\n   - Pair A: $1 \\times 15$\n   - Pair B: $3 \\times 5$\n\n2. Which of these two pairs adds up to the middle coefficient **$8$**?\n\nGive it a try — what do you get?`;
      }
      if (asksForTraps) {
        return `### ⚠️ Top Traps to Avoid on $x^2 + 8x + 15 = 0$:\n\n1. **The Sign Flip Mistake (Most Common!)**:\n   Students find $(x + 3)(x + 5) = 0$ and wrongly conclude the answers are $+3$ and $+5$.\n   - Remember: $x + 3 = 0 \\implies \\mathbf{x = -3}$\n   - And $x + 5 = 0 \\implies \\mathbf{x = -5}$\n2. **Choosing the Wrong Factor Pair**:\n   Picking $1$ and $15$ because they multiply to $15$, without checking that $1 + 15 = 16 \\neq 8$.\n3. **Dropping the Squared Term**: Forgetting that $x \\cdot x = x^2$.\n\nDoes this make the sign rule clear? What step would you like to take next?`;
      }
    }

    // Handling general hints
    if (asksForHint) {
      return `Here is a progressive hint for **${topic}**:\n\n- To factor a trinomial like $x^2 + bx + c$, look for two numbers $p$ and $q$ where:\n  - $p \\times q = c$ (the constant term)\n  - $p + q = b$ (the middle coefficient)\n\nWhat is the specific equation or problem you want us to test this on?`;
    }

    // Handling general traps
    if (asksForTraps || mode === "review") {
      return `### ⚡ Common Traps & High-Yield Rules: ${topic}\n\n1. **Sign Flip in Roots**: Factored form $(x - p)(x - q) = 0$ gives roots $x = +p$ and $x = +q$. Always solve $x - p = 0$ explicitly.\n2. **Always Check for GCF First**: Before splitting the middle term, factor out any greatest common numerical factor.\n3. **Negative Parentheses**: When factoring out a negative (e.g. $-2x - 6 = -2(x + 3)$), don't forget to change the inside sign to positive!\n\nWould you like an interactive question to test yourself against these traps?`;
    }

    // Default mode handling
    switch (mode) {
      case "analogy":
        return `Think of **${topic}** like assembling furniture with modular Lego blocks:\n\nInstead of dealing with one large, complicated structure all at once, you find the identical connecting pieces (common factors) and separate them into neat, predictable units.\n\nLooking at your expression, what "matching pieces" do you notice across the terms?`;
      case "step_by_step":
        return `Let's break down **${topic}** into 3 manageable steps:\n\n1. **Inspect for Common Factors**: Look at all numerical coefficients and variable powers.\n2. **Identify the Pattern**: Determine if it matches standard forms (like $(a+b)^2$, difference of squares, or quadratic trinomials).\n3. **Group and Simplify**: Factor out terms systematically.\n\nWhich of these 3 steps would you like to execute first on your problem?`;
      case "practice":
        return `Here is a calibrated practice problem for **${topic}** (Mastery: ${input.score}%):\n\n> **Solve/Factor:** $x^2 + 8x + 15 = 0$\n\n**Coaching Nudge:** Look for two integers that multiply to $15$ and add up to $8$.\n\nWhat pair of numbers comes to mind first?`;
      case "socratic":
      default:
        return `That's a thoughtful question about **${topic}**!\n\nTo build your intuition here: if you were to expand an expression like $(x + 2)(x + 3)$, what would the middle term look like?\n\nWorking backwards from that expansion is the secret to factoring. What do you observe?`;
    }
  }

  // Hindi responses
  if (language === "hi") {
    if (hasActiveProblem15 && asksForHint) {
      return `**$x^2 + 8x + 15 = 0$ के लिए संकेत:**\n\n15 के गुणनखंड देखें: $1 \\times 15$ और $3 \\times 5$। इनमें से कौन सी जोड़ी जोड़ने पर मध्य पद **8** देती है?`;
    }
    if (mode === "analogy") {
      return `**${topic}** को एक उदाहरण से समझें:\n\nजैसे किसी मशीन के पुर्ज़ों को अलग-अलग करके उसकी बनावट को समझा जाता है, वैसे ही गणित में हम व्यंजक को उसके मूल घटकों में तोड़ते हैं।\n\nक्या आप बता सकते हैं कि आपके दिए गए प्रश्न में कौन सा घटक दोनों पदों में उभयनिष्ठ (common) है?`;
    }
    if (mode === "practice") {
      return `यहाँ **${topic}** के लिए एक अभ्यास प्रश्न है:\n\n**प्रश्न:** $x^2 + 8x + 15 = 0$ के हल ज्ञात कीजिए।\n\n**संकेत:** ऐसी दो संख्याएँ सोचिए जिनका गुणनफल 15 और योग 8 हो। आपका पहला कदम क्या होगा?`;
    }
    return `**${topic}** को समझने के लिए एक मुख्य सिद्धांत याद रखें:\n\nजब भी हम किसी समस्या को हल करते हैं, सबसे पहले यह देखें कि क्या कोई पद उभयनिष्ठ है या कोई सर्वसमिका लागू हो रही है।\n\nआप इस प्रश्न में सबसे पहले किस पद पर ध्यान केंद्रित करना चाहेंगे?`;
  }

  // Hinglish responses
  if (hasActiveProblem15 && asksForHint) {
    return `**$x^2 + 8x + 15 = 0$ ke liye hint:**\n\n15 ke factors hote hain: $1 \\times 15$ aur $3 \\times 5$.\nIn dono me se kaun sa pair add karke middle term **8** banata hai?\n\nAapko kaun se 2 numbers lagte hain?`;
  }
  if (mode === "analogy") {
    return `**${topic}** ko ek simple example se samajhte hain:\n\nJaise kisi team me har player ka specific role hota hai, waise hi algebraic terms me numbers aur variables ke specific patterns hote hain. Jab hum unhe group karte hain, toh solution bahut simple ho jata hai!\n\nAapko is expression me sabse pehle kaun sa pattern ya common factor dikh raha hai?`;
  }
  if (mode === "practice") {
    return `Chaliye **${topic}** par ek practice problem solve karte hain!\n\n**Problem:** Solve/Factorize $x^2 + 8x + 15 = 0$.\n\n**Nudge:** Hamein aisi 2 numbers chahiye jinka product 15 ho aur sum 8 ho. Aapke hisaab se kaun se numbers fit honge?`;
  }
  return `Great effort! **${topic}** me sabse zaroori step yeh identify karna hota hai ki expression ka structure kaisa hai.\n\nKya aap mujhe bata sakte hain ki aapne is problem me pehla step kya try kiya tha? Main wahi se guide karta hoon!`;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: "easy" | "medium" | "hard";
  topic: string;
}

export async function generateQuiz(
  topics: { topicName: string; mastery: number }[],
  questionCount: number = 5,
  difficultyPreference: "adaptive" | "easy" | "medium" | "hard" = "adaptive"
): Promise<QuizQuestion[]> {
  const difficultyRules = {
    adaptive: `ADAPTIVE SCALING RULE:
- For topics with mastery <= 40%: Generate 'easy' foundational questions testing single-step concepts and definitions.
- For topics with mastery 41% - 70%: Generate 'medium' standard questions requiring balanced application.
- For topics with mastery > 70%: Generate 'hard' multi-step synthesis, edge-case, or tricky questions.`,
    easy: "Generate 'easy' foundational questions testing basic definitions and direct 1-step arithmetic.",
    medium: "Generate 'medium' standard curriculum difficulty questions.",
    hard: "Generate 'hard' challenging questions requiring multi-step proofs, algebraic manipulation, or edge cases.",
  }[difficultyPreference];

  const prompt = `You are an educational assessment AI. Create ${questionCount} high-quality multiple-choice questions for the following topics.

${difficultyRules}

RULES:
- Questions must test conceptual understanding, not rote memorization
- Each question must have exactly 4 options with only 1 correct answer
- The 'correctAnswer' field must be the 0-based index (0, 1, 2, or 3) of the correct option
- Include a clear, step-by-step educational explanation
- Set 'difficulty' explicitly to "easy", "medium", or "hard"

TOPICS & STUDENT MASTERY:
${topics.map(t => `- ${t.topicName}: ${t.mastery}% mastery`).join("\n")}

Respond ONLY with valid JSON array:
[
  {
    "id": "q1",
    "question": "string with LaTeX math like $x^2 - 16$ if needed",
    "options": ["string", "string", "string", "string"],
    "correctAnswer": 0,
    "explanation": "string explaining why the correct option is right and others are traps",
    "difficulty": "easy|medium|hard",
    "topic": "string matching one of the requested topics"
  }
]`;

  try {
    const text = await callGemini(prompt);
    const parsed = extractJSON(text) as QuizQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid quiz response");
    return parsed.map((q, i) => ({
      ...q,
      id: q.id || `q_${i + 1}`,
      difficulty: (q.difficulty === "easy" || q.difficulty === "medium" || q.difficulty === "hard") ? q.difficulty : "medium",
      correctAnswer: typeof q.correctAnswer === "number" && q.correctAnswer >= 0 && q.correctAnswer < 4 ? q.correctAnswer : 0,
    }));
  } catch {
    // Curated high quality adaptive fallbacks
    return generateFallbackQuiz(topics, questionCount, difficultyPreference);
  }
}

function generateFallbackQuiz(
  topics: { topicName: string; mastery: number }[],
  questionCount: number,
  difficultyPref: "adaptive" | "easy" | "medium" | "hard"
): QuizQuestion[] {
  const pool: Record<string, QuizQuestion[]> = {
    Factorisation: [
      {
        id: "f1",
        question: "What is the completely factored form of $x^2 - 25$?",
        options: ["$(x - 5)(x + 5)$", "$(x - 5)^2$", "$(x + 5)^2$", "$x(x - 25)$"],
        correctAnswer: 0,
        explanation: "Difference of two squares identity: $a^2 - b^2 = (a - b)(a + b)$. Here $a = x$ and $b = 5$.",
        difficulty: "easy",
        topic: "Factorisation",
      },
      {
        id: "f2",
        question: "Which pair of factors correctly factorizes $x^2 + 7x + 12$?",
        options: ["$(x + 3)(x + 4)$", "$(x + 2)(x + 6)$", "$(x + 1)(x + 12)$", "$(x - 3)(x - 4)$"],
        correctAnswer: 0,
        explanation: "We seek two numbers multiplying to $12$ and adding to $7$. The pair is $3$ and $4$: $(x + 3)(x + 4)$.",
        difficulty: "medium",
        topic: "Factorisation",
      },
      {
        id: "f3",
        question: "Factor out the Greatest Common Factor (GCF) from $6x^3 + 18x^2$:",
        options: ["$6x^2(x + 3)$", "$6x(x^2 + 3)$", "$3x^2(2x + 6)$", "$x^2(6x + 18)$"],
        correctAnswer: 0,
        explanation: "The GCD of 6 and 18 is 6, and the common power of $x$ is $x^2$. Factoring gives $6x^2(x + 3)$.",
        difficulty: "easy",
        topic: "Factorisation",
      },
      {
        id: "f4",
        question: "Factor the non-monic quadratic: $2x^2 + 7x + 3$",
        options: ["$(2x + 1)(x + 3)$", "$(2x + 3)(x + 1)$", "$(2x - 1)(x - 3)$", "$(x + 1)(2x + 3)$"],
        correctAnswer: 0,
        explanation: "$a \\cdot c = 2 \\times 3 = 6$. The factors of $6$ adding to $7$ are $6$ and $1$. Splitting gives $(2x + 1)(x + 3)$.",
        difficulty: "hard",
        topic: "Factorisation",
      },
      {
        id: "f5",
        question: "Factor by grouping: $x^3 + 4x^2 + 3x + 12$",
        options: ["$(x^2 + 3)(x + 4)$", "$(x^2 + 4)(x + 3)$", "$(x + 3)(x^2 + 12)$", "$(x - 4)(x^2 + 3)$"],
        correctAnswer: 0,
        explanation: "Group terms: $x^2(x + 4) + 3(x + 4) = (x^2 + 3)(x + 4)$.",
        difficulty: "hard",
        topic: "Factorisation",
      },
    ],
    "Quadratic Equations": [
      {
        id: "q1",
        question: "What are the roots of the equation $(x - 4)(x + 2) = 0$?",
        options: ["$x = 4$ or $x = -2$", "$x = -4$ or $x = 2$", "$x = 4$ or $x = 2$", "$x = -4$ or $x = -2$"],
        correctAnswer: 0,
        explanation: "By the zero-product property, either $x - 4 = 0 \\implies x = 4$, or $x + 2 = 0 \\implies x = -2$.",
        difficulty: "easy",
        topic: "Quadratic Equations",
      },
      {
        id: "q2",
        question: "What is the value of the discriminant $\\Delta = b^2 - 4ac$ for $x^2 - 6x + 9 = 0$?",
        options: ["$0$ (one repeated root)", "$72$ (two real roots)", "$-36$ (complex roots)", "$12$"],
        correctAnswer: 0,
        explanation: "$\\Delta = (-6)^2 - 4(1)(9) = 36 - 36 = 0$. A zero discriminant indicates a single real repeated root.",
        difficulty: "medium",
        topic: "Quadratic Equations",
      },
      {
        id: "q3",
        question: "For what values of $k$ does $x^2 + kx + 16 = 0$ have equal real roots?",
        options: ["$k = \\pm 8$", "$k = 4$", "$k = \\pm 16$", "$k = 0$"],
        correctAnswer: 0,
        explanation: "For equal roots, $\\Delta = 0 \\implies k^2 - 4(1)(16) = 0 \\implies k^2 = 64 \\implies k = \\pm 8$.",
        difficulty: "hard",
        topic: "Quadratic Equations",
      },
    ],
  };

  const results: QuizQuestion[] = [];
  const primaryTopic = topics[0]?.topicName || "Factorisation";
  const topicList = pool[primaryTopic] || pool["Factorisation"];

  for (let i = 0; i < Math.min(questionCount, topicList.length); i++) {
    results.push(topicList[i]);
  }

  // If more questions needed, fill from secondary topics
  while (results.length < questionCount) {
    const extra = pool["Quadratic Equations"]?.[results.length % 3];
    if (extra) {
      results.push({ ...extra, id: `extra_${results.length + 1}` });
    } else {
      break;
    }
  }

  return results;
}
