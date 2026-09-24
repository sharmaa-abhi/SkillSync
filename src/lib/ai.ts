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
}

export async function tutorRespond(input: TutorInput): Promise<string> {
  const historyText = input.conversationHistory
    .slice(-8)
    .map(m => `${m.role === "student" ? "Student" : "Tutor"}: ${m.content}`)
    .join("\n");

  const prompt = `You are a patient, knowledgeable ${input.topicName} tutor for a ${input.educationLevel} student.

RULES:
- Teach concepts step by step, don't just give answers
- Use simple examples the student can relate to
- Break complex ideas into digestible parts
- Ask checking questions to verify understanding
- Be encouraging but honest about areas needing work
- Keep responses focused and under 300 words

CONTEXT:
Topic: ${input.topicName}
Student's mastery: ${input.masteryLevel} (${input.score}%)
${historyText ? `\nConversation so far:\n${historyText}` : ""}

Student's message: ${input.studentMessage}

Respond as the tutor:`;

  try {
    return await callGemini(prompt);
  } catch {
    return `I'd be happy to help you with ${input.topicName}! Let me explain the key concepts step by step. Could you tell me specifically what part you're finding difficult?`;
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
