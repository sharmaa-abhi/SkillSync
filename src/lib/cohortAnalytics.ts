/**
 * SkillSync AI — Cohort Analytics & Predictive Difficulty Engine
 * Analyzes cohort learning curves, historical bottlenecks, and predicts individual student success probabilities.
 */

export interface CohortTopicBenchmark {
  topicName: string;
  subjectName: string;
  cohortAverageScore: number;
  cohortStruggleRate: number; // % of students who face difficulty on first attempt
  averageTimeToMasteryMinutes: number;
  commonPrerequisiteBottleneck?: string;
  recommendedPreparationMinutes: number;
}

export const COHORT_BENCHMARKS: Record<string, CohortTopicBenchmark> = {
  Factorisation: {
    topicName: "Factorisation",
    subjectName: "Mathematics",
    cohortAverageScore: 48,
    cohortStruggleRate: 68,
    averageTimeToMasteryMinutes: 45,
    commonPrerequisiteBottleneck: "Algebraic Manipulation (expanding brackets & GCF)",
    recommendedPreparationMinutes: 20,
  },
  "Quadratic Equations": {
    topicName: "Quadratic Equations",
    subjectName: "Mathematics",
    cohortAverageScore: 56,
    cohortStruggleRate: 62,
    averageTimeToMasteryMinutes: 60,
    commonPrerequisiteBottleneck: "Factorisation of trinomials",
    recommendedPreparationMinutes: 25,
  },
  "Algebraic Manipulation": {
    topicName: "Algebraic Manipulation",
    subjectName: "Mathematics",
    cohortAverageScore: 74,
    cohortStruggleRate: 28,
    averageTimeToMasteryMinutes: 25,
    recommendedPreparationMinutes: 10,
  },
  Polynomials: {
    topicName: "Polynomials",
    subjectName: "Mathematics",
    cohortAverageScore: 59,
    cohortStruggleRate: 51,
    averageTimeToMasteryMinutes: 40,
    commonPrerequisiteBottleneck: "Polynomial long division",
    recommendedPreparationMinutes: 15,
  },
  "Process Scheduling": {
    topicName: "Process Scheduling",
    subjectName: "Operating Systems",
    cohortAverageScore: 65,
    cohortStruggleRate: 42,
    averageTimeToMasteryMinutes: 35,
    recommendedPreparationMinutes: 15,
  },
  Deadlocks: {
    topicName: "Deadlocks",
    subjectName: "Operating Systems",
    cohortAverageScore: 44,
    cohortStruggleRate: 72,
    averageTimeToMasteryMinutes: 55,
    commonPrerequisiteBottleneck: "Resource allocation matrix subtraction",
    recommendedPreparationMinutes: 25,
  },
  "Virtual Memory & Paging": {
    topicName: "Virtual Memory & Paging",
    subjectName: "Operating Systems",
    cohortAverageScore: 49,
    cohortStruggleRate: 66,
    averageTimeToMasteryMinutes: 50,
    commonPrerequisiteBottleneck: "Address translation bitmask arithmetic",
    recommendedPreparationMinutes: 25,
  },
  "OSI & TCP/IP Models": {
    topicName: "OSI & TCP/IP Models",
    subjectName: "Computer Networks",
    cohortAverageScore: 78,
    cohortStruggleRate: 24,
    averageTimeToMasteryMinutes: 20,
    recommendedPreparationMinutes: 10,
  },
  "IP Addressing & Subnetting": {
    topicName: "IP Addressing & Subnetting",
    subjectName: "Computer Networks",
    cohortAverageScore: 46,
    cohortStruggleRate: 71,
    averageTimeToMasteryMinutes: 55,
    commonPrerequisiteBottleneck: "Binary host bit calculation (2^h - 2)",
    recommendedPreparationMinutes: 30,
  },
  "TCP Flow & Congestion Control": {
    topicName: "TCP Flow & Congestion Control",
    subjectName: "Computer Networks",
    cohortAverageScore: 52,
    cohortStruggleRate: 63,
    averageTimeToMasteryMinutes: 45,
    commonPrerequisiteBottleneck: "Sliding window vs AIMD state transitions",
    recommendedPreparationMinutes: 20,
  },
  "Dynamic Programming": {
    topicName: "Dynamic Programming",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 41,
    cohortStruggleRate: 79,
    averageTimeToMasteryMinutes: 75,
    commonPrerequisiteBottleneck: "Recursive state formulation & optimal substructure",
    recommendedPreparationMinutes: 35,
  },
  "Graph Algorithms": {
    topicName: "Graph Algorithms",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 54,
    cohortStruggleRate: 58,
    averageTimeToMasteryMinutes: 50,
    commonPrerequisiteBottleneck: "Queue vs Stack traversal invariants",
    recommendedPreparationMinutes: 25,
  },
};

export interface DifficultyPrediction {
  topicName: string;
  riskLevel: "critical_bottleneck" | "moderate_challenge" | "smooth_progression";
  predictedPassProbability: number; // 0 - 100%
  cohortStruggleRate: number; // e.g. 68%
  cohortAverageScore: number;
  recommendedPrepMinutes: number;
  bottleneckReason?: string;
  advice: string;
}

/**
 * Predicts student difficulty by comparing their current mastery score with cohort benchmarks.
 */
export function predictDifficulty(topicName: string, studentMasteryScore: number): DifficultyPrediction {
  const benchmark = COHORT_BENCHMARKS[topicName] || {
    topicName,
    subjectName: "General",
    cohortAverageScore: 55,
    cohortStruggleRate: 50,
    averageTimeToMasteryMinutes: 40,
    recommendedPreparationMinutes: 20,
  };

  // Predicted pass probability: weighted combination of student mastery (70%) and cohort pass rate (30%)
  const cohortPassRate = 100 - benchmark.cohortStruggleRate;
  const predictedPass = Math.min(98, Math.max(12, Math.round(studentMasteryScore * 0.7 + cohortPassRate * 0.3)));

  let riskLevel: DifficultyPrediction["riskLevel"] = "smooth_progression";
  let advice = "Your mastery is on track with or ahead of cohort expectations.";

  if (studentMasteryScore < 45 || benchmark.cohortStruggleRate > 65) {
    riskLevel = "critical_bottleneck";
    advice = benchmark.commonPrerequisiteBottleneck
      ? `High cohort bottleneck risk (${benchmark.cohortStruggleRate}% struggle rate). Clear ${benchmark.commonPrerequisiteBottleneck} first.`
      : `High cohort bottleneck risk (${benchmark.cohortStruggleRate}% struggle rate). Allocate extra practice time.`;
  } else if (studentMasteryScore < 70) {
    riskLevel = "moderate_challenge";
    advice = `Moderate challenge. Cohort average is ${benchmark.cohortAverageScore}%. Recommend a 15-min Socratic review.`;
  }

  return {
    topicName,
    riskLevel,
    predictedPassProbability: predictedPass,
    cohortStruggleRate: benchmark.cohortStruggleRate,
    cohortAverageScore: benchmark.cohortAverageScore,
    recommendedPrepMinutes: benchmark.recommendedPreparationMinutes,
    bottleneckReason: benchmark.commonPrerequisiteBottleneck,
    advice,
  };
}
