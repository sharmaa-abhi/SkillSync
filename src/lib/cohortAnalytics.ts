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
  // Mathematics
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
  "Coordinate Geometry": {
    topicName: "Coordinate Geometry",
    subjectName: "Mathematics",
    cohortAverageScore: 52,
    cohortStruggleRate: 60,
    averageTimeToMasteryMinutes: 45,
    commonPrerequisiteBottleneck: "Slope formula & Cartesian distance equation",
    recommendedPreparationMinutes: 20,
  },

  // Python Programming
  "Python Basics & Syntax": {
    topicName: "Python Basics & Syntax",
    subjectName: "Python Programming",
    cohortAverageScore: 82,
    cohortStruggleRate: 22,
    averageTimeToMasteryMinutes: 20,
    recommendedPreparationMinutes: 10,
  },
  "Control Flow & Loops": {
    topicName: "Control Flow & Loops",
    subjectName: "Python Programming",
    cohortAverageScore: 71,
    cohortStruggleRate: 35,
    averageTimeToMasteryMinutes: 30,
    commonPrerequisiteBottleneck: "Nested while/for loops & break-else invariants",
    recommendedPreparationMinutes: 15,
  },
  "Functions & Scope": {
    topicName: "Functions & Scope",
    subjectName: "Python Programming",
    cohortAverageScore: 48,
    cohortStruggleRate: 67,
    averageTimeToMasteryMinutes: 50,
    commonPrerequisiteBottleneck: "LEGB variable scoping & mutable default arguments",
    recommendedPreparationMinutes: 25,
  },
  "Data Structures (Lists, Dictionaries, Sets)": {
    topicName: "Data Structures (Lists, Dictionaries, Sets)",
    subjectName: "Python Programming",
    cohortAverageScore: 68,
    cohortStruggleRate: 40,
    averageTimeToMasteryMinutes: 35,
    commonPrerequisiteBottleneck: "Dictionary hashing & list shallow vs deep copy",
    recommendedPreparationMinutes: 15,
  },
  "Object-Oriented Programming (OOP)": {
    topicName: "Object-Oriented Programming (OOP)",
    subjectName: "Python Programming",
    cohortAverageScore: 44,
    cohortStruggleRate: 74,
    averageTimeToMasteryMinutes: 65,
    commonPrerequisiteBottleneck: "Class inheritance, dunder methods, and super() initialization",
    recommendedPreparationMinutes: 30,
  },
  "File Handling & Exceptions": {
    topicName: "File Handling & Exceptions",
    subjectName: "Python Programming",
    cohortAverageScore: 63,
    cohortStruggleRate: 45,
    averageTimeToMasteryMinutes: 30,
    commonPrerequisiteBottleneck: "Context manager protocols & try-except-finally ordering",
    recommendedPreparationMinutes: 15,
  },
  "Modules & Libraries": {
    topicName: "Modules & Libraries",
    subjectName: "Python Programming",
    cohortAverageScore: 75,
    cohortStruggleRate: 25,
    averageTimeToMasteryMinutes: 20,
    recommendedPreparationMinutes: 10,
  },

  // Database Management Systems
  "SQL Fundamentals": {
    topicName: "SQL Fundamentals",
    subjectName: "Database Management Systems",
    cohortAverageScore: 80,
    cohortStruggleRate: 25,
    averageTimeToMasteryMinutes: 25,
    recommendedPreparationMinutes: 10,
  },
  "Indexing & Query Optimization": {
    topicName: "Indexing & Query Optimization",
    subjectName: "Database Management Systems",
    cohortAverageScore: 58,
    cohortStruggleRate: 59,
    averageTimeToMasteryMinutes: 45,
    commonPrerequisiteBottleneck: "B-Tree index leaf scans vs table full scans",
    recommendedPreparationMinutes: 20,
  },
  "Transactions & Concurrency": {
    topicName: "Transactions & Concurrency",
    subjectName: "Database Management Systems",
    cohortAverageScore: 49,
    cohortStruggleRate: 68,
    averageTimeToMasteryMinutes: 55,
    commonPrerequisiteBottleneck: "ACID isolation levels (dirty read vs phantom read)",
    recommendedPreparationMinutes: 25,
  },
  "Normalization & Normal Forms": {
    topicName: "Normalization & Normal Forms",
    subjectName: "Database Management Systems",
    cohortAverageScore: 43,
    cohortStruggleRate: 76,
    averageTimeToMasteryMinutes: 60,
    commonPrerequisiteBottleneck: "Transitive dependencies & 3NF/BCNF canonical covers",
    recommendedPreparationMinutes: 30,
  },
  "ER Modeling & Schema Design": {
    topicName: "ER Modeling & Schema Design",
    subjectName: "Database Management Systems",
    cohortAverageScore: 66,
    cohortStruggleRate: 42,
    averageTimeToMasteryMinutes: 35,
    commonPrerequisiteBottleneck: "Many-to-many junction tables & foreign key cascades",
    recommendedPreparationMinutes: 15,
  },

  // Operating Systems
  "Processes & Threads": {
    topicName: "Processes & Threads",
    subjectName: "Operating Systems",
    cohortAverageScore: 76,
    cohortStruggleRate: 30,
    averageTimeToMasteryMinutes: 25,
    recommendedPreparationMinutes: 10,
  },
  "CPU Scheduling Algorithms": {
    topicName: "CPU Scheduling Algorithms",
    subjectName: "Operating Systems",
    cohortAverageScore: 65,
    cohortStruggleRate: 42,
    averageTimeToMasteryMinutes: 35,
    commonPrerequisiteBottleneck: "Gantt chart turnaround and waiting time calculations",
    recommendedPreparationMinutes: 15,
  },
  "Process Synchronization & Deadlocks": {
    topicName: "Process Synchronization & Deadlocks",
    subjectName: "Operating Systems",
    cohortAverageScore: 44,
    cohortStruggleRate: 72,
    averageTimeToMasteryMinutes: 55,
    commonPrerequisiteBottleneck: "Resource allocation matrix subtraction & Banker's algorithm",
    recommendedPreparationMinutes: 25,
  },
  "Memory Management & Paging": {
    topicName: "Memory Management & Paging",
    subjectName: "Operating Systems",
    cohortAverageScore: 49,
    cohortStruggleRate: 66,
    averageTimeToMasteryMinutes: 50,
    commonPrerequisiteBottleneck: "Address translation bitmask arithmetic & TLB miss handling",
    recommendedPreparationMinutes: 25,
  },
  "File Systems & Disk Scheduling": {
    topicName: "File Systems & Disk Scheduling",
    subjectName: "Operating Systems",
    cohortAverageScore: 64,
    cohortStruggleRate: 44,
    averageTimeToMasteryMinutes: 35,
    recommendedPreparationMinutes: 15,
  },

  // Computer Networks
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
    commonPrerequisiteBottleneck: "Binary host bit calculation (2^h - 2) and CIDR prefixes",
    recommendedPreparationMinutes: 30,
  },
  "Routing Protocols & Algorithms": {
    topicName: "Routing Protocols & Algorithms",
    subjectName: "Computer Networks",
    cohortAverageScore: 50,
    cohortStruggleRate: 65,
    averageTimeToMasteryMinutes: 50,
    commonPrerequisiteBottleneck: "Dijkstra link state vs Bellman-Ford count-to-infinity",
    recommendedPreparationMinutes: 25,
  },
  "Transport Layer (TCP vs UDP)": {
    topicName: "Transport Layer (TCP vs UDP)",
    subjectName: "Computer Networks",
    cohortAverageScore: 68,
    cohortStruggleRate: 38,
    averageTimeToMasteryMinutes: 30,
    commonPrerequisiteBottleneck: "TCP 3-way handshake & sequence/ACK arithmetic",
    recommendedPreparationMinutes: 15,
  },
  "Application Layer Protocols (HTTP, DNS)": {
    topicName: "Application Layer Protocols (HTTP, DNS)",
    subjectName: "Computer Networks",
    cohortAverageScore: 72,
    cohortStruggleRate: 32,
    averageTimeToMasteryMinutes: 25,
    recommendedPreparationMinutes: 10,
  },

  // Data Structures & Algorithms
  "Arrays & Strings": {
    topicName: "Arrays & Strings",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 77,
    cohortStruggleRate: 28,
    averageTimeToMasteryMinutes: 25,
    recommendedPreparationMinutes: 10,
  },
  "Linked Lists": {
    topicName: "Linked Lists",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 64,
    cohortStruggleRate: 46,
    averageTimeToMasteryMinutes: 35,
    commonPrerequisiteBottleneck: "Pointer dereferencing & two-pointer cycle detection",
    recommendedPreparationMinutes: 20,
  },
  "Stacks & Queues": {
    topicName: "Stacks & Queues",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 67,
    cohortStruggleRate: 41,
    averageTimeToMasteryMinutes: 30,
    recommendedPreparationMinutes: 15,
  },
  "Trees & Binary Search Trees": {
    topicName: "Trees & Binary Search Trees",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 49,
    cohortStruggleRate: 69,
    averageTimeToMasteryMinutes: 55,
    commonPrerequisiteBottleneck: "Recursive invariants & BST property preservation",
    recommendedPreparationMinutes: 25,
  },
  "Sorting & Searching Algorithms": {
    topicName: "Sorting & Searching Algorithms",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 60,
    cohortStruggleRate: 52,
    averageTimeToMasteryMinutes: 40,
    commonPrerequisiteBottleneck: "Binary search boundary conditions and partition invariants",
    recommendedPreparationMinutes: 20,
  },
  "Graph Algorithms & Traversals": {
    topicName: "Graph Algorithms & Traversals",
    subjectName: "Data Structures & Algorithms",
    cohortAverageScore: 45,
    cohortStruggleRate: 73,
    averageTimeToMasteryMinutes: 60,
    commonPrerequisiteBottleneck: "DFS/BFS state tracking and visited set cycle guards",
    recommendedPreparationMinutes: 30,
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
