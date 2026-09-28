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

  const prompt = `You are the SkillSync Socratic AI Learning Coach. You are tutoring a ${input.educationLevel} student on the topic "${input.topicName}".

ROLE & PEDAGOGY:
${modeInstructions}

LANGUAGE & TONE:
${languageInstructions}

GENERAL CONSTRAINTS:
- Keep the response concise, punchy, and under 250 words.
- Format equations cleanly using standard readable math notation or LaTeX-style delimiters (e.g. $ax^2 + bx + c = 0$ or $(x - 2)(x + 3)$).
- Use bullet points and bold highlights for readability.
- Be encouraging, respectful, and pedagogically sound.

STUDENT LEARNING CONTEXT:
- Topic: ${input.topicName}
- Current Mastery: ${input.masteryLevel} (${input.score}%)
- Student's Stated Question/Input: ${input.studentMessage}
${historyText ? `\nRecent conversation:\n${historyText}` : ""}

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

  if (language === "hi") {
    if (mode === "analogy") {
      return `**${topic}** को एक उदाहरण से समझें:\n\nजैसे किसी मशीन के पुर्ज़ों को अलग-अलग करके उसकी बनावट को समझा जाता है, वैसे ही गणित में हम व्यंजक को उसके मूल घटकों में तोड़ते हैं।\n\nक्या आप बता सकते हैं कि आपके दिए गए प्रश्न में कौन सा घटक दोनों पदों में उभयनिष्ठ (common) है?`;
    }
    if (mode === "practice") {
      return `यहाँ **${topic}** के लिए एक अभ्यास प्रश्न है:\n\n**प्रश्न:** $x^2 + 7x + 12$ के गुणनखंड ज्ञात कीजिए।\n\n**संकेत:** ऐसी दो संख्याएँ सोचिए जिनका गुणनफल 12 और योग 7 हो। आपका पहला कदम क्या होगा?`;
    }
    return `**${topic}** को समझने के लिए एक मुख्य सिद्धांत याद रखें:\n\nजब भी हम किसी समस्या को हल करते हैं, सबसे पहले यह देखें कि क्या कोई पद उभयनिष्ठ है या कोई सर्वसमिका लागू हो रही है।\n\nआप इस प्रश्न में सबसे पहले किस पद पर ध्यान केंद्रित करना चाहेंगे?`;
  }

  if (language === "hinglish") {
    if (mode === "analogy") {
      return `**${topic}** ko ek simple example se samajhte hain:\n\nJaise kisi team me har player ka specific role hota hai, waise hi algebraic terms me numbers aur variables ke specific patterns hote hain. Jab hum unhe group karte hain, toh solution bahut simple ho jata hai!\n\nAapko is expression me sabse pehle kaun sa pattern ya common factor dikh raha hai?`;
    }
    if (mode === "practice") {
      return `Chaliye **${topic}** par ek practice problem solve karte hain!\n\n**Problem:** Factorize $x^2 + 5x + 6 = 0$.\n\n**Nudge:** Hamein aisi 2 numbers chahiye jinka product 6 ho aur sum 5 ho. Aapke hisaab se kaun se numbers fit honge?`;
    }
    return `Great effort! **${topic}** me sabse zaroori step yeh identify karna hota hai ki expression ka structure kaisa hai.\n\nKya aap mujhe bata sakte hain ki aapne is problem me pehla step kya try kiya tha? Main wahi se guide karta hoon!`;
  }

  // English fallbacks
  switch (mode) {
    case "analogy":
      return `Think of **${topic}** like assembling furniture with modular Lego blocks:\n\nInstead of dealing with one large, complicated structure all at once, you find the identical connecting pieces (common factors) and separate them into neat, predictable units.\n\nLooking at your expression, what "matching pieces" do you notice across the terms?`;
    case "step_by_step":
      return `Let's break down **${topic}** into 3 manageable steps:\n\n1. **Inspect for Common Factors**: Look at all numerical coefficients and variable powers.\n2. **Identify the Pattern**: Determine if it matches standard forms (like $(a+b)^2$, difference of squares, or quadratic trinomials).\n3. **Group and Simplify**: Factor out terms systematically.\n\nWhich of these 3 steps would you like to execute first on your problem?`;
    case "practice":
      return `Here is a calibrated practice problem for **${topic}** (Mastery: ${input.score}%):\n\n> **Solve/Factor:** $x^2 + 8x + 15 = 0$\n\n**Coaching Nudge:** Look for two integers that multiply to $15$ and add up to $8$.\n\nWhat pair of numbers comes to mind first?`;
    case "review":
      return `### ⚡ Quick Review: ${topic}\n\n- **Core Definition**: Decomposing an expression into products of simpler factors.\n- **Golden Rule**: Always check for a Greatest Common Factor (GCF) *first* before attempting quadratic splitting or formulas.\n- **Common Trap**: Watch your negative signs when factoring negatives out of parentheses!\n\nReady to test this with a fast diagnostic question?`;
    case "socratic":
    default:
      return `That's a thoughtful question about **${topic}**!\n\nTo build your intuition here: if you were to expand an expression like $(x + 2)(x + 3)$, what would the middle term look like?\n\nWorking backwards from that expansion is the secret to factoring. What do you observe?`;
  }
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  topic: string;
}

export async function generateQuiz(
  topics: { topicName: string; mastery: number }[],
  questionCount: number = 5
): Promise<QuizQuestion[]> {
  const prompt = `You are an educational quiz generator. Create ${questionCount} multiple-choice questions.

RULES:
- Questions must test understanding, not memorization
- Each question has exactly 4 options with 1 correct answer
- Match difficulty to the student's mastery level
- Include clear explanations

TOPICS & MASTERY:
${topics.map(t => `- ${t.topicName}: ${t.mastery}% mastery (${t.mastery <= 40 ? "easy questions" : t.mastery <= 70 ? "medium questions" : "hard questions"})`).join("\n")}

Respond ONLY with valid JSON array:
[{"id": "q1", "question": "string", "options": ["a","b","c","d"], "correctAnswer": 0, "explanation": "string", "difficulty": "easy|medium|hard", "topic": "string"}]`;

  try {
    const text = await callGemini(prompt);
    const parsed = extractJSON(text) as QuizQuestion[];
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error("Invalid quiz");
    return parsed.map((q, i) => ({ ...q, id: q.id || `q${i + 1}` }));
  } catch {
    // Fallback: return a basic set of questions
    return topics.slice(0, questionCount).map((t, i) => ({
      id: `q${i + 1}`,
      question: `Which concept is fundamental to understanding ${t.topicName}?`,
      options: [
        `Core principle of ${t.topicName}`,
        `Advanced ${t.topicName} technique`,
        `${t.topicName} is not related to databases`,
        `${t.topicName} optimization method`,
      ],
      correctAnswer: 0,
      explanation: `The core principles form the foundation of ${t.topicName}.`,
      difficulty: t.mastery <= 40 ? "easy" : "medium",
      topic: t.topicName,
    }));
  }
}
