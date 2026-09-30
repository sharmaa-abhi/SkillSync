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
  subjectName?: string;
  masteryLevel?: string;
  score: number;
  educationLevel?: string;
  studentName?: string;
  learningGoals?: string;
  preferredStyle?: string;
  overallMastery?: number;
  weaknesses?: string[];
  strengths?: string[];
  knownConcepts?: string[];
  prerequisiteGaps?: string[];
  recentQuizPerformance?: string;
  curriculumContext?: string;
  conversationHistory?: { role: string; content: string }[];
  studentMessage: string;
  mode?: "socratic" | "step_by_step" | "analogy" | "practice" | "review";
  language?: "en" | "hi" | "hinglish";
}

export async function tutorRespond(input: TutorInput): Promise<string> {
  const mode = input.mode || "socratic";
  const language = input.language || "en";

  const historyText = (input.conversationHistory || [])
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

  const combinedStrengths = Array.from(new Set([...(input.strengths || []), ...(input.knownConcepts || [])]));
  const combinedGaps = Array.from(new Set([...(input.weaknesses || []), ...(input.prerequisiteGaps || [])]));

  const prompt = `You are the SkillSync Socratic AI Learning Coach. You are tutoring a student with the following comprehensive learning context:

STUDENT LEARNING CONTEXT:
- Student Name: ${input.studentName || "Alex"}
- Active Subject: ${input.subjectName || "Computer Science / Core Curriculum"}
- Education Level: ${input.educationLevel}
- Target Learning Goal: ${input.learningGoals || "Pass with strong conceptual foundation"}
- Preferred Learning Style: ${input.preferredStyle || "Socratic 1-on-1 coaching"}
- Overall Subject Mastery: ${input.overallMastery !== undefined ? `${input.overallMastery}%` : "Not evaluated"}
- Active Topic: ${input.topicName} (Current Mastery: ${input.score}% — ${input.masteryLevel})
- Proven Strengths / Known Concepts: ${combinedStrengths.length > 0 ? combinedStrengths.join(", ") : "Building foundational competencies"}
- Identified Deficits / Prerequisite Gaps: ${combinedGaps.length > 0 ? combinedGaps.join(", ") : "None detected"}
${input.recentQuizPerformance ? `- Recent Practice Performance: ${input.recentQuizPerformance}` : ""}

${input.curriculumContext ? `AUTHORITATIVE CURRICULUM GROUNDING (RAG TEXTBOOK REFERENCE):\n${input.curriculumContext}\n` : ""}

ROLE & PEDAGOGY:
${modeInstructions}

LANGUAGE & TONE:
${languageInstructions}

GENERAL CONSTRAINTS:
- Keep the response concise, punchy, and under 250 words.
- Format equations or code cleanly using standard readable markdown (e.g. \`def example():\` or $ax^2 + bx + c = 0$).
- Use bullet points and bold highlights for readability.
- Be encouraging, respectful, and pedagogically sound.
- If the student has prerequisite weaknesses (${combinedGaps.slice(0, 2).join(", ") || "earlier foundational topics"}), help bridge those gaps so they can conquer "${input.topicName}".
- Never behave like a generic chatbot; contextualize your answers explicitly to ${input.subjectName || "the active subject"} and the student's demonstrated mastery.

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

export function generateFallbackTutorResponse(
  input: TutorInput,
  mode: "socratic" | "step_by_step" | "analogy" | "practice" | "review",
  language: "en" | "hi" | "hinglish"
): string {
  const topic = input.topicName;
  const msg = input.studentMessage.toLowerCase();
  const subLower = (input.subjectName || "").toLowerCase();
  const topLower = topic.toLowerCase();

  const asksForHint = msg.includes("hint") || msg.includes("help") || msg.includes("clue") || msg.includes("stuck");
  const asksForTraps = msg.includes("trap") || msg.includes("mistake") || msg.includes("error") || msg.includes("common");

  // Determine subject domain
  const isPython = subLower.includes("python") || topLower.includes("function") || topLower.includes("lambda") || topLower.includes("scope") || topLower.includes("loop") || topLower.includes("variable");
  const isDSA = subLower.includes("dsa") || subLower.includes("algo") || subLower.includes("struct") || topLower.includes("tree") || topLower.includes("dynamic") || topLower.includes("graph") || topLower.includes("array") || topLower.includes("heap");
  const isDBMS = subLower.includes("dbms") || subLower.includes("database") || topLower.includes("normal") || topLower.includes("concurr") || topLower.includes("transact") || topLower.includes("sql") || topLower.includes("er model");
  const isOS = subLower.includes("os") || subLower.includes("operat") || topLower.includes("deadlock") || topLower.includes("schedul") || topLower.includes("paging") || topLower.includes("mutex");
  const isCN = subLower.includes("cn") || subLower.includes("network") || topLower.includes("subnet") || topLower.includes("tcp") || topLower.includes("osi") || topLower.includes("routing");

  if (isPython) {
    if (asksForHint) {
      return `Here is your progressive hint for **${topic}** in Python:\n\n- Remember the **LEGB rule**: Python looks for names in Local $\\to$ Enclosing $\\to$ Global $\\to$ Built-in scope.\n- When functions are defined, default parameter expressions evaluate *only once* at definition time, not on each call.\n\nWhat is the specific line of code or behavior you are inspecting?`;
    }
    if (asksForTraps || mode === "review") {
      return `### ⚡ Top Traps to Avoid in ${topic} (Python):\n\n1. **Mutable Default Arguments**: Writing \`def add_item(val, items=[])\` causes all calls to share the *same list object* in memory. Use \`items=None\` instead!\n2. **Unintended Shadowing**: Naming a variable \`list\`, \`str\`, or \`dict\` shadows Python's built-in type constructors.\n3. **Lambda Scope Late Binding**: In loops creating lambdas like \`[lambda: i for i in range(3)]\`, all lambdas evaluate \`i\` to 2 unless defaulted (\`lambda i=i: i\`).\n\nWould you like a quick code puzzle to test your eye for this trap?`;
    }
    if (mode === "analogy") {
      return `Think of **${topic}** like a set of nesting Russian Matryoshka dolls:\n\nYour inner function (the smallest doll) can look outward and read everything inside the outer dolls (Enclosing and Global namespaces), but code outside cannot reach inside without an explicit key (\`nonlocal\` or \`return\`).\n\nHow does this mental model apply to the variable you are trying to access?`;
    }
    if (mode === "step_by_step") {
      return `Let's break down **${topic}** in Python into 3 logical steps:\n\n1. **Examine Variable Binding**: Is the variable assigned inside this function, or read from an outer enclosing block?\n2. **Check Argument Types**: Are parameters passed as immutable primitives (int, str) or mutable references (list, dict)?\n3. **Trace Return State**: Follow the exact object returned by the function invocation.\n\nWhich step would you like us to walk through together?`;
    }
    if (mode === "practice") {
      return `Here is a calibrated practice challenge for **${topic}** (Mastery: ${input.score}%):\n\n\`\`\`python\ndef counter_factory():\n    count = 0\n    def inc():\n        nonlocal count\n        count += 1\n        return count\n    return inc\n\nc1 = counter_factory()\nprint(c1(), c1())\n\`\`\`\n\nWhat will this print, and why is the \`nonlocal\` keyword strictly necessary here?`;
    }
    return `That is a fundamental concept in Python's **${topic}**!\n\nTo build your intuition: when Python executes a \`def\` block, what happens to default argument expressions, and how does the interpreter differentiate between local reassignments and outer scope reads? What have you tried so far?`;
  }

  if (isDSA) {
    if (asksForHint) {
      return `Here is a progressive hint for **${topic}** in DSA:\n\n- For trees: The BST invariant requires that **every single descendant** in the left subtree is $< K$, and in the right subtree is $> K$.\n- For Dynamic Programming: Write down the English definition of your state $dp[i]$ before writing any code or table transitions.\n\nWhat is your current formulation of the subproblem?`;
    }
    if (asksForTraps || mode === "review") {
      return `### ⚡ Top Traps to Avoid in ${topic} (DSA):\n\n1. **Local vs Global Invariant in BSTs**: Only checking if a node is greater than its immediate left child is insufficient; a left descendant can still illegally exceed an ancestor!\n2. **Overlapping Subproblems vs Divide & Conquer**: Mergesort divides into independent subproblems; DP requires overlapping instances where memoization saves exponential recomputation.\n3. **Off-by-One in DP Base Cases**: Forgetting $dp[0]$ initialization or 1-indexed capacity bounds.\n\nWhich of these traps would you like to verify against your solution?`;
    }
    if (mode === "practice") {
      return `Here is a calibrated practice problem for **${topic}** (Mastery: ${input.score}%):\n\n> **Challenge:** You are deleting a node $N$ with TWO children from a Binary Search Tree.\n\nWhich node must take $N$'s place to guarantee the BST invariant remains unbroken across the entire tree, and why?`;
    }
    return `That's an important problem in **${topic}**!\n\nWhen you think about the asymptotic cost and invariant conditions, what is the bottleneck operation? How does changing from an array to a pointer-based tree structure alter the lookup complexity?`;
  }

  if (isDBMS) {
    if (asksForHint) {
      return `Here is a hint for **${topic}** in Database Systems:\n\n- For Normalization: In $X \\to Y$, check if $X$ contains a candidate key (superkey). If not, $Y$ must be a prime attribute (part of some key) for 3NF.\n- For Transactions: Write-Ahead Logging (WAL) ensures changes are durable on disk before buffer pool pages are written.\n\nWhich functional dependency or transaction schedule are you analyzing?`;
    }
    if (asksForTraps || mode === "review") {
      return `### ⚡ Common Traps & High-Yield Rules: ${topic} (DBMS):\n\n1. **Confusing 2NF with 3NF**: 2NF removes partial dependencies on *composite* candidate keys. 3NF removes transitive dependencies ($X \\to Y \\to Z$).\n2. **Aggregate in WHERE clause**: \`WHERE count(*) > 5\` is invalid SQL! Use \`HAVING count(*) > 5\` after \`GROUP BY\`.\n3. **2PL vs Strict 2PL**: Standard 2PL allows releasing read locks before commit; Strict 2PL holds exclusive locks until commit, preventing cascading rollbacks.\n\nWould you like an example dependency set to test your 3NF decomposition?`;
    }
    return `Let's break down **${topic}** from relational principles.\n\nWhen we model relational entities and transactions, our primary goal is eliminating redundant state and preventing anomaly states (dirty reads, loss of updates). What candidate keys exist in your relation?`;
  }

  if (isOS) {
    if (asksForHint) {
      return `Here is a targeted hint for **${topic}** in Operating Systems:\n\n- For Deadlocks: Remember the 4 Coffman conditions: Mutual Exclusion, Hold and Wait, No Preemption, Circular Wait. Breaking *any single one* prevents deadlock.\n- For Paging: Virtual address = Page number + Offset. The page size dictates the number of bits in the offset.\n\nWhich specific condition or memory access is under test?`;
    }
    if (asksForTraps || mode === "review") {
      return `### ⚡ Common Traps & Exam Rules: ${topic} (OS):\n\n1. **Deadlock Prevention vs Avoidance**: Prevention eliminates at least one Coffman condition statically; Avoidance (Banker's Algorithm) evaluates safety dynamically per resource request.\n2. **Round Robin Quantum Extremes**: Extremely small quantum causes high context-switch overhead; extremely large quantum degenerates into FCFS.\n3. **Belady's Anomaly**: FIFO page replacement can experience *more* page faults with *more* physical memory frames!\n\nWould you like a quick Banker's safe-state sequence challenge?`;
    }
    return `Great inquiry on Operating Systems: **${topic}**!\n\nAt the kernel level, how does the OS arbitrate between competing threads or hardware interrupts while guaranteeing state consistency? What trade-off are you observing here?`;
  }

  if (isCN) {
    if (asksForHint) {
      return `Here is your targeted hint for **${topic}** in Computer Networks:\n\n- Subnet host calculation: For a prefix $/n$, host bits $h = 32 - n$. Usable hosts $= 2^h - 2$ (subtracting network ID and broadcast address).\n- TCP Flow Control: Driven by the receiver's \`rwnd\`, whereas Congestion Control is driven by network packet loss/delay via \`cwnd\`.\n\nWhat prefix or header field are you calculating?`;
    }
    return `That's a key question in Networking: **${topic}**!\n\nRemember that layered architecture encapsulates payloads into protocol data units: Segments at Layer 4, Packets at Layer 3, and Frames at Layer 2. What layer is primarily responsible for the behavior you are analyzing?`;
  }

  // Mathematics Fallback (Algebra, Quadratics, Factoring)
  if (language === "hi") {
    return `**${topic}** को समझने के लिए एक मुख्य सिद्धांत याद रखें:\n\nजब भी हम किसी समस्या को हल करते हैं, सबसे पहले यह देखें कि क्या कोई पद उभयनिष्ठ (common) है या कोई सर्वसमिका लागू हो रही है।\n\nआप इस प्रश्न में सबसे पहले किस पद पर ध्यान केंद्रित करना चाहेंगे?`;
  }
  if (language === "hinglish") {
    return `Great effort! **${topic}** me sabse zaroori step yeh identify karna hota hai ki expression ka structure kaisa hai.\n\nKya aap mujhe bata sakte hain ki aapne is problem me pehla step kya try kiya tha? Main wahi se step-by-step guide karta hoon!`;
  }

  // English Maths fallback
  if (asksForHint) {
    return `Here is a progressive hint for **${topic}**:\n\n- To factor a trinomial like $x^2 + bx + c$, look for two numbers $p$ and $q$ where:\n  - $p \\times q = c$ (the constant term)\n  - $p + q = b$ (the middle coefficient)\n\nWhat is the specific equation or problem you want us to test this on?`;
  }
  if (asksForTraps || mode === "review") {
    return `### ⚡ Common Traps & High-Yield Rules: ${topic}\n\n1. **Sign Flip in Roots**: Factored form $(x - p)(x - q) = 0$ gives roots $x = +p$ and $x = +q$. Always solve $x - p = 0$ explicitly.\n2. **Always Check for GCF First**: Before splitting the middle term, factor out any greatest common numerical factor.\n3. **Negative Parentheses**: When factoring out a negative (e.g. $-2x - 6 = -2(x + 3)$), don't forget to change the inside sign to positive!\n\nWould you like an interactive question to test yourself against these traps?`;
  }
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
    // Curated high quality adaptive fallbacks across all subjects
    return generateFallbackQuiz(topics, questionCount, difficultyPreference);
  }
}

export function generateFallbackQuiz(
  topics: { topicName: string; mastery: number }[],
  questionCount: number,
  difficultyPref: "adaptive" | "easy" | "medium" | "hard"
): QuizQuestion[] {
  const pool: Record<string, QuizQuestion[]> = {
    // Mathematics
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
    ],

    // Python Programming
    "Functions & Scope": [
      {
        id: "py_fn_1",
        question: "What will `func(1); print(func(2))` output given `def func(a, b=[]): b.append(a); return b`?",
        options: ["[1, 2] (mutable defaults persist across calls)", "[2] (new list on each call)", "TypeError", "None"],
        correctAnswer: 0,
        explanation: "Default parameters in Python are evaluated once at function definition time, so mutable default arguments persist.",
        difficulty: "medium",
        topic: "Functions & Scope",
      },
      {
        id: "py_fn_2",
        question: "Which keyword modifies a variable in an outer non-global enclosing function in Python?",
        options: ["nonlocal", "global", "outer", "super"],
        correctAnswer: 0,
        explanation: "The nonlocal keyword binds a variable to the nearest enclosing scope that is not global.",
        difficulty: "easy",
        topic: "Functions & Scope",
      },
    ],
    "Lambda Functions": [
      {
        id: "py_lam_1",
        question: "Which lambda correctly sorts a list of pairs `[(1, 'b'), (2, 'a')]` by the second element?",
        options: ["sorted(items, key=lambda x: x[1])", "sorted(items, key=lambda x: x[0])", "items.sort(1)", "filter(lambda x: x[1], items)"],
        correctAnswer: 0,
        explanation: "key=lambda x: x[1] extracts the second element as the comparison key.",
        difficulty: "easy",
        topic: "Lambda Functions",
      },
    ],

    // Data Structures & Algorithms
    "Binary Search Trees": [
      {
        id: "dsa_bst_1",
        question: "Which traversal of a Binary Search Tree (BST) visits nodes in strictly increasing sorted order?",
        options: ["In-order Traversal (Left, Root, Right)", "Pre-order Traversal", "Post-order Traversal", "Level-order (BFS)"],
        correctAnswer: 0,
        explanation: "Because Left < Root < Right, an in-order traversal recursively visits keys in ascending sorted order.",
        difficulty: "easy",
        topic: "Binary Search Trees",
      },
      {
        id: "dsa_bst_2",
        question: "When deleting a node with 2 children from a BST, what replaces it to maintain the invariant?",
        options: ["In-order Successor or In-order Predecessor", "Root of the entire tree", "Deepest leaf node", "Immediate left child"],
        correctAnswer: 0,
        explanation: "The in-order successor is the smallest node in the right subtree and preserves all BST inequalities.",
        difficulty: "medium",
        topic: "Binary Search Trees",
      },
    ],
    "Dynamic Programming": [
      {
        id: "dsa_dp_1",
        question: "Which two core structural properties are strictly required to solve a problem with Dynamic Programming?",
        options: [
          "Optimal Substructure and Overlapping Subproblems",
          "Greedy Choice Property and Divide & Conquer",
          "Linearity and Convexity",
          "Independence of all states",
        ],
        correctAnswer: 0,
        explanation: "Optimal substructure means optimal solutions contain optimal sub-solutions; overlapping subproblems means sub-instances are reused repeatedly.",
        difficulty: "medium",
        topic: "Dynamic Programming",
      },
    ],

    // Database Systems
    Normalization: [
      {
        id: "dbms_norm_1",
        question: "Which normal form specifically requires the complete removal of partial functional dependencies on composite candidate keys?",
        options: ["Second Normal Form (2NF)", "First Normal Form (1NF)", "Third Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
        correctAnswer: 0,
        explanation: "2NF requires 1NF plus eliminating partial dependencies where a non-key attribute depends on part of a composite key.",
        difficulty: "medium",
        topic: "Normalization",
      },
    ],
    "Concurrency Control": [
      {
        id: "dbms_concurr_1",
        question: "What does Strict Two-Phase Locking (Strict 2PL) guarantee that standard 2PL does not?",
        options: ["Freedom from cascading aborts", "Deadlock-free execution", "Higher concurrency throughput", "No lock overhead"],
        correctAnswer: 0,
        explanation: "Strict 2PL holds exclusive locks until transaction commit/abort, ensuring dirty data is never read by other transactions.",
        difficulty: "hard",
        topic: "Concurrency Control",
      },
    ],

    // Operating Systems
    Deadlocks: [
      {
        id: "os_dead_1",
        question: "Which of the following is NOT one of the four necessary Coffman conditions for deadlocks?",
        options: ["Preemption Allowed", "Mutual Exclusion", "Hold and Wait", "Circular Wait"],
        correctAnswer: 0,
        explanation: "No preemption is required for deadlocks; allowing preemption eliminates deadlocks by reclaiming resources.",
        difficulty: "medium",
        topic: "Deadlocks",
      },
    ],
    "Process Scheduling": [
      {
        id: "os_sched_1",
        question: "In Round Robin CPU scheduling, if the time quantum is extremely large, the algorithm behaves identically to:",
        options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Preemptive", "Multilevel Feedback Queue"],
        correctAnswer: 0,
        explanation: "As time quantum approaches infinity, no process is preempted before completing, which matches FCFS exactly.",
        difficulty: "easy",
        topic: "Process Scheduling",
      },
    ],

    // Computer Networks
    "IP Addressing & Subnetting": [
      {
        id: "cn_sub_1",
        question: "How many usable host IP addresses are available in a subnet with a /26 CIDR prefix?",
        options: ["62", "64", "30", "126"],
        correctAnswer: 0,
        explanation: "32 - 26 = 6 host bits. 2^6 = 64 total addresses. Subtracting network ID and broadcast address gives 62 usable hosts.",
        difficulty: "medium",
        topic: "IP Addressing & Subnetting",
      },
    ],
  };

  const results: QuizQuestion[] = [];
  const primaryTopic = topics[0]?.topicName || "Factorisation";
  const matchedPool = Object.keys(pool).find(k => k.toLowerCase() === primaryTopic.toLowerCase() || primaryTopic.toLowerCase().includes(k.toLowerCase()));
  const topicList = (matchedPool ? pool[matchedPool] : null) || pool[primaryTopic] || pool["Factorisation"];

  for (let i = 0; i < Math.min(questionCount, topicList.length); i++) {
    results.push(topicList[i]);
  }

  // If more questions needed, fill from other topics
  const allPoolQuestions = Object.values(pool).flatMap(qs => qs);
  let poolIdx = 0;
  while (results.length < questionCount && poolIdx < allPoolQuestions.length) {
    const candidate = allPoolQuestions[poolIdx];
    if (!results.some(r => r.id === candidate.id)) {
      results.push({ ...candidate, id: `extra_${results.length + 1}` });
    }
    poolIdx++;
  }

  return results;
}
