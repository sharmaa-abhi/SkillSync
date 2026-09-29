/**
 * SkillSync AI — Active Subject Track Architecture
 * Single source of truth for the student's active subject track.
 * Configured exclusively in the Learner Profile (/profile).
 */

export type SubjectKey = "Python" | "DSA" | "Maths" | "DBMS" | "OS" | "CN";

export interface SubjectTopic {
  name: string;
  label: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedMinutes: number;
  prerequisites: string[];
  keyConcept: string;
  defaultScore: number;
  masteryLevel: "weak" | "medium" | "strong";
}

export interface SubjectConfig {
  key: SubjectKey;
  label: string;
  shortLabel: string;
  code: string;
  icon: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  description: string;
  defaultGoal: string;
  defaultOverallMastery: number;
  defaultStrengths: string[];
  defaultWeaknesses: string[];
  level?: string;
  defaultCurrentTopic?: string;
  defaultNextTopic?: string;
  defaultPrerequisiteGap?: string;
  defaultKnowledgeCoverage?: number;
  defaultRecommendedToday?: string;
  topics: SubjectTopic[];
}

export const ACTIVE_SUBJECT_STORAGE_KEY = "skillsync_active_subject";
export const ACTIVE_SUBJECT_EVENT = "skillsync_subject_change";

export const SUBJECT_CONFIGS: Record<SubjectKey, SubjectConfig> = {
  Python: {
    key: "Python",
    label: "Python Programming",
    shortLabel: "Python",
    code: "PY-101",
    icon: "🐍",
    color: "emerald",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    description: "Core syntax, control flow, functions, lambdas, scope, error handling, and OOP in Python.",
    defaultGoal: "Master Python Programming — Fortify Function Arguments, Scope & Lambda Closures",
    defaultOverallMastery: 64,
    defaultStrengths: ["Variables & Data Types", "Conditions & Branching"],
    defaultWeaknesses: ["Functions & Scope", "Lambda Functions"],
    level: "Beginner → Intermediate",
    defaultCurrentTopic: "Functions & Scope",
    defaultNextTopic: "Lambda Functions",
    defaultPrerequisiteGap: "Lambda Functions & Closures",
    defaultKnowledgeCoverage: 42,
    defaultRecommendedToday: "Practice function parameters & return values",
    topics: [
      {
        name: "Variables & Data Types",
        label: "Variables & Types",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Everything in Python is an object; immutable vs mutable collections",
        defaultScore: 92,
        masteryLevel: "strong",
      },
      {
        name: "Conditions & Branching",
        label: "Conditions",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: ["Variables & Data Types"],
        keyConcept: "Short-circuit evaluation and truthy/falsy truth tables",
        defaultScore: 85,
        masteryLevel: "strong",
      },
      {
        name: "Loops & Iteration",
        label: "Loops",
        difficulty: "beginner",
        estimatedMinutes: 20,
        prerequisites: ["Conditions & Branching"],
        keyConcept: "for loops, while loops, and range() generator mechanics",
        defaultScore: 78,
        masteryLevel: "medium",
      },
      {
        name: "Functions & Scope",
        label: "Functions",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Loops & Iteration"],
        keyConcept: "def, positional & keyword arguments, and mutable default pitfalls",
        defaultScore: 58,
        masteryLevel: "medium",
      },
      {
        name: "Lambda Functions",
        label: "Lambda Functions",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Functions & Scope"],
        keyConcept: "Anonymous lambda expressions and higher-order map/filter",
        defaultScore: 30,
        masteryLevel: "weak",
      },
      {
        name: "Object-Oriented Programming",
        label: "OOP & Classes",
        difficulty: "advanced",
        estimatedMinutes: 35,
        prerequisites: ["Functions & Scope"],
        keyConcept: "Classes, __init__, self reference, inheritance, and encapsulation",
        defaultScore: 0,
        masteryLevel: "weak",
      },
      {
        name: "Error & Exception Handling",
        label: "Exception Handling",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Functions & Scope"],
        keyConcept: "try, except, else, finally blocks and custom exception raising",
        defaultScore: 0,
        masteryLevel: "weak",
      },
    ],
  },
  Maths: {
    key: "Maths",
    label: "Mathematics",
    shortLabel: "Maths",
    code: "MATH-101",
    icon: "📐",
    color: "indigo",
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-200",
    description: "High-yield foundational algebra: Algebraic Manipulation, Factorisation, and Quadratic Equations.",
    defaultGoal: "Improve in Mathematics — Master Quadratic Equations & Clear Prerequisite Gaps",
    defaultOverallMastery: 72,
    defaultStrengths: ["Algebraic Manipulation", "Polynomials"],
    defaultWeaknesses: ["Factorisation", "Coordinate Geometry"],
    topics: [
      {
        name: "Algebraic Manipulation",
        label: "Algebraic Manipulation",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Distributive law: a(b + c) = ab + ac",
        defaultScore: 84,
        masteryLevel: "strong",
      },
      {
        name: "Factorisation",
        label: "Factorisation",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Algebraic Manipulation"],
        keyConcept: "Splitting middle terms: x² + (p+q)x + pq = (x+p)(x+q)",
        defaultScore: 38,
        masteryLevel: "weak",
      },
      {
        name: "Quadratic Equations",
        label: "Quadratic Equations",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Factorisation"],
        keyConcept: "Roots: x = (-b ± √(b² - 4ac)) / (2a)",
        defaultScore: 72,
        masteryLevel: "medium",
      },
      {
        name: "Polynomials",
        label: "Polynomials",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Algebraic Manipulation"],
        keyConcept: "Factor Theorem: P(c) = 0 implies (x - c) is a factor",
        defaultScore: 65,
        masteryLevel: "medium",
      },
      {
        name: "Coordinate Geometry",
        label: "Coordinate Geometry",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Quadratic Equations"],
        keyConcept: "Vertex form: y = a(x - h)² + k",
        defaultScore: 40,
        masteryLevel: "weak",
      },
    ],
  },

  DBMS: {
    key: "DBMS",
    label: "Database Systems",
    shortLabel: "DBMS",
    code: "CS-202",
    icon: "🗄️",
    color: "amber",
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-700",
    badgeBorder: "border-amber-200",
    description: "Relational database modeling, Normal Forms (1NF–BCNF), indexing, and ACID transactions.",
    defaultGoal: "Master Relational Databases — Eliminate Transitive & Partial Dependencies for Exams",
    defaultOverallMastery: 58,
    defaultStrengths: ["ER Model", "SQL Queries"],
    defaultWeaknesses: ["Normalization", "Concurrency Control"],
    topics: [
      {
        name: "ER Model",
        label: "ER Model",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Entities, attributes, relationships, and cardinalities",
        defaultScore: 78,
        masteryLevel: "strong",
      },
      {
        name: "SQL Queries",
        label: "SQL Queries",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["ER Model"],
        keyConcept: "Aggregations, joins, GROUP BY, and nested subqueries",
        defaultScore: 70,
        masteryLevel: "medium",
      },
      {
        name: "Normalization",
        label: "Normalization",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["ER Model"],
        keyConcept: "Functional dependencies: 1NF, 2NF, 3NF, and BCNF",
        defaultScore: 36,
        masteryLevel: "weak",
      },
      {
        name: "Transactions",
        label: "Transactions",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["SQL Queries"],
        keyConcept: "ACID properties: Atomicity, Consistency, Isolation, Durability",
        defaultScore: 62,
        masteryLevel: "medium",
      },
      {
        name: "Indexing",
        label: "Indexing",
        difficulty: "advanced",
        estimatedMinutes: 25,
        prerequisites: ["SQL Queries"],
        keyConcept: "B-Trees, B+ Trees, clustered vs non-clustered indexes",
        defaultScore: 50,
        masteryLevel: "medium",
      },
      {
        name: "Concurrency Control",
        label: "Concurrency Control",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Transactions"],
        keyConcept: "Two-Phase Locking (2PL), serializability, and deadlock handling",
        defaultScore: 32,
        masteryLevel: "weak",
      },
    ],
  },

  OS: {
    key: "OS",
    label: "Operating Systems",
    shortLabel: "OS",
    code: "CS-301",
    icon: "💻",
    color: "purple",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    description: "Process management, CPU scheduling, Coffman deadlocks, and virtual memory paging.",
    defaultGoal: "Excel in Operating Systems — Master Coffman Deadlock Conditions & MMU Address Translation",
    defaultOverallMastery: 64,
    defaultStrengths: ["Process Scheduling", "Virtual Memory & Paging"],
    defaultWeaknesses: ["Deadlocks", "Concurrency & Mutex"],
    topics: [
      {
        name: "Process Scheduling",
        label: "Process Scheduling",
        difficulty: "beginner",
        estimatedMinutes: 20,
        prerequisites: [],
        keyConcept: "Preemption, FCFS, SJF, Round Robin, and Priority Scheduling",
        defaultScore: 82,
        masteryLevel: "strong",
      },
      {
        name: "Deadlocks",
        label: "Deadlocks",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Process Scheduling"],
        keyConcept: "Four Coffman conditions, Resource Allocation Graphs, and Banker's Algorithm",
        defaultScore: 34,
        masteryLevel: "weak",
      },
      {
        name: "Virtual Memory & Paging",
        label: "Memory & Paging",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Process Scheduling"],
        keyConcept: "MMU address translation, page tables, page faults, and LRU replacement",
        defaultScore: 71,
        masteryLevel: "strong",
      },
      {
        name: "Concurrency & Mutex",
        label: "Concurrency & Mutex",
        difficulty: "advanced",
        estimatedMinutes: 25,
        prerequisites: ["Process Scheduling"],
        keyConcept: "Critical sections, Peterson's algorithm, mutex locks, and semaphores",
        defaultScore: 48,
        masteryLevel: "medium",
      },
    ],
  },

  CN: {
    key: "CN",
    label: "Computer Networks",
    shortLabel: "CN",
    code: "CS-302",
    icon: "🌐",
    color: "cyan",
    badgeBg: "bg-cyan-50",
    badgeText: "text-cyan-700",
    badgeBorder: "border-cyan-200",
    description: "OSI & TCP/IP stack, CIDR IP subnetting, TCP flow/congestion control, and routing protocols.",
    defaultGoal: "Master Computer Networks — Perfect Subnetting Calculations & TCP Window Congestion",
    defaultOverallMastery: 61,
    defaultStrengths: ["OSI & TCP/IP Layering", "TCP vs UDP Flow & Congestion"],
    defaultWeaknesses: ["IP Addressing & Subnetting", "Routing Protocols & NAT"],
    topics: [
      {
        name: "OSI & TCP/IP Layering",
        label: "OSI & Layering",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "7-layer OSI model, encapsulation, decapsulation, and PDU headers",
        defaultScore: 80,
        masteryLevel: "strong",
      },
      {
        name: "IP Addressing & Subnetting",
        label: "Subnetting & CIDR",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["OSI & TCP/IP Layering"],
        keyConcept: "IPv4 classless addressing, CIDR masks, host counts, and subnets",
        defaultScore: 39,
        masteryLevel: "weak",
      },
      {
        name: "TCP vs UDP Flow & Congestion",
        label: "TCP / UDP & Flow",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["OSI & TCP/IP Layering"],
        keyConcept: "Three-way handshake, sliding window, slow start, and congestion avoidance",
        defaultScore: 73,
        masteryLevel: "strong",
      },
      {
        name: "Routing Protocols & NAT",
        label: "Routing & NAT",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["IP Addressing & Subnetting"],
        keyConcept: "Distance Vector (RIP), Link State (OSPF), BGP, and Network Address Translation",
        defaultScore: 42,
        masteryLevel: "medium",
      },
    ],
  },

  DSA: {
    key: "DSA",
    label: "Data Structures & Algorithms",
    shortLabel: "Data Structures",
    code: "CS-201",
    icon: "⚡",
    color: "purple",
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    description: "Asymptotic analysis, Arrays, Linked Lists, Binary Search Trees, Heaps, and Dynamic Programming.",
    defaultGoal: "Crack Technical Interview DSA — Master Binary Search Trees & DP Subproblems",
    defaultOverallMastery: 54,
    defaultStrengths: ["Arrays & Dynamic Arrays", "Asymptotic Complexity Analysis"],
    defaultWeaknesses: ["Binary Search Trees", "Dynamic Programming"],
    level: "Intermediate → Advanced",
    defaultCurrentTopic: "Binary Search Trees",
    defaultNextTopic: "Dynamic Programming",
    defaultPrerequisiteGap: "Binary Search Trees",
    defaultKnowledgeCoverage: 38,
    defaultRecommendedToday: "Practice BST inorder traversal & tree invariants",
    topics: [
      {
        name: "Asymptotic Complexity Analysis",
        label: "Big-O Analysis",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Big-O, Big-Omega, Big-Theta, recursion trees, and Master Theorem",
        defaultScore: 88,
        masteryLevel: "strong",
      },
      {
        name: "Arrays & Dynamic Arrays",
        label: "Arrays & Pointers",
        difficulty: "beginner",
        estimatedMinutes: 20,
        prerequisites: ["Asymptotic Complexity Analysis"],
        keyConcept: "Contiguous memory layout, dynamic array resizing O(1) amortized, and two pointers",
        defaultScore: 90,
        masteryLevel: "strong",
      },
      {
        name: "Linked Lists",
        label: "Linked Lists",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Arrays & Dynamic Arrays"],
        keyConcept: "Singly/doubly linked pointer manipulation and Floyd cycle detection",
        defaultScore: 74,
        masteryLevel: "medium",
      },
      {
        name: "Stacks & Queues",
        label: "Stacks & Queues",
        difficulty: "intermediate",
        estimatedMinutes: 20,
        prerequisites: ["Linked Lists"],
        keyConcept: "LIFO/FIFO invariants, monotonic stacks, and BFS queues",
        defaultScore: 70,
        masteryLevel: "medium",
      },
      {
        name: "Binary Search Trees",
        label: "Trees & BST",
        difficulty: "intermediate",
        estimatedMinutes: 30,
        prerequisites: ["Linked Lists", "Arrays & Dynamic Arrays"],
        keyConcept: "BST invariant (Left < Root < Right), inorder traversal, and AVL balance factors",
        defaultScore: 38,
        masteryLevel: "weak",
      },
      {
        name: "Heaps & Priority Queues",
        label: "Heaps",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Binary Search Trees"],
        keyConcept: "Min/max heap array representation, heapify O(n), and top-K elements",
        defaultScore: 42,
        masteryLevel: "medium",
      },
      {
        name: "Dynamic Programming",
        label: "Dynamic Programming",
        difficulty: "advanced",
        estimatedMinutes: 35,
        prerequisites: ["Asymptotic Complexity Analysis"],
        keyConcept: "Optimal substructure, overlapping subproblems, memoization vs tabulation",
        defaultScore: 32,
        masteryLevel: "weak",
      },
      {
        name: "Graph Algorithms",
        label: "Graph Algorithms",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Binary Search Trees", "Stacks & Queues"],
        keyConcept: "Adjacency lists, BFS, DFS, Dijkstra shortest path, and topological sort",
        defaultScore: 20,
        masteryLevel: "weak",
      },
    ],
  },
};

export const ALL_SUBJECTS = Object.values(SUBJECT_CONFIGS);

export function normalizeSubjectKey(val?: string | null): SubjectKey {
  if (!val) return "Python";
  const normalized = val.trim().toLowerCase();
  if (normalized.includes("python") || normalized === "py" || normalized.includes("py101")) return "Python";
  if (normalized.includes("dsa") || normalized.includes("algo") || normalized.includes("struct") || normalized.includes("tree")) return "DSA";
  if (normalized === "maths" || normalized === "math" || normalized.includes("mathem")) return "Maths";
  if (normalized === "dbms" || normalized.includes("database") || normalized.includes("sql")) return "DBMS";
  if (normalized === "os" || normalized.includes("operat")) return "OS";
  if (normalized === "cn" || normalized.includes("network")) return "CN";
  return "Python";
}

export function getActiveSubjectKey(): SubjectKey {
  if (typeof window === "undefined") return "Python";
  try {
    const saved = localStorage.getItem(ACTIVE_SUBJECT_STORAGE_KEY);
    return normalizeSubjectKey(saved);
  } catch {
    return "Python";
  }
}

export function setActiveSubjectKey(key: SubjectKey): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(ACTIVE_SUBJECT_STORAGE_KEY, key);
    window.dispatchEvent(new CustomEvent(ACTIVE_SUBJECT_EVENT, { detail: key }));
  } catch (err) {
    console.error("Failed to persist active subject to localStorage:", err);
  }
}

export function getSubjectConfig(key?: SubjectKey | string | null): SubjectConfig {
  const resolvedKey = normalizeSubjectKey(key);
  return SUBJECT_CONFIGS[resolvedKey] || SUBJECT_CONFIGS.Maths;
}

export function getTopicsForSubject(key?: SubjectKey | string | null): string[] {
  const config = getSubjectConfig(key);
  return config.topics.map((t) => t.name);
}
