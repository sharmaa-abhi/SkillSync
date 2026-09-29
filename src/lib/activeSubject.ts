/**
 * SkillSync AI — Active Subject Track Architecture
 * Single source of truth for the student's active subject track.
 * Configured exclusively in the Learner Profile (/profile).
 */

export type SubjectKey = "Maths" | "DBMS" | "OS" | "CN" | "DSA";

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
  topics: SubjectTopic[];
}

export const ACTIVE_SUBJECT_STORAGE_KEY = "skillsync_active_subject";
export const ACTIVE_SUBJECT_EVENT = "skillsync_subject_change";

export const SUBJECT_CONFIGS: Record<SubjectKey, SubjectConfig> = {
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
    shortLabel: "DSA",
    code: "CS-201",
    icon: "⚡",
    color: "emerald",
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-200",
    description: "Asymptotic Big-O notation, Dynamic Programming memoization, Graph traversals, and Heaps.",
    defaultGoal: "Crack Technical Interview DSA — Master DP Subproblems & Graph BFS/DFS Cycle Detection",
    defaultOverallMastery: 54,
    defaultStrengths: ["Asymptotic Complexity Analysis", "Binary Search Trees & Heaps"],
    defaultWeaknesses: ["Dynamic Programming", "Graph Algorithms & Traversals"],
    topics: [
      {
        name: "Asymptotic Complexity Analysis",
        label: "Big-O Analysis",
        difficulty: "beginner",
        estimatedMinutes: 15,
        prerequisites: [],
        keyConcept: "Big-O, Big-Omega, Big-Theta, recursion trees, and Master Theorem",
        defaultScore: 79,
        masteryLevel: "strong",
      },
      {
        name: "Binary Search Trees & Heaps",
        label: "BST & Heaps",
        difficulty: "intermediate",
        estimatedMinutes: 25,
        prerequisites: ["Asymptotic Complexity Analysis"],
        keyConcept: "BST balancing, min/max heap properties, priority queues, and heapify",
        defaultScore: 68,
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
        name: "Graph Algorithms & Traversals",
        label: "Graph Algorithms",
        difficulty: "advanced",
        estimatedMinutes: 30,
        prerequisites: ["Binary Search Trees & Heaps"],
        keyConcept: "Adjacency lists, BFS, DFS, Dijkstra shortest path, and topological sort",
        defaultScore: 41,
        masteryLevel: "weak",
      },
    ],
  },
};

export const ALL_SUBJECTS = Object.values(SUBJECT_CONFIGS);

export function normalizeSubjectKey(val?: string | null): SubjectKey {
  if (!val) return "Maths";
  const normalized = val.trim().toLowerCase();
  if (normalized === "maths" || normalized === "math" || normalized.includes("mathem")) return "Maths";
  if (normalized === "dbms" || normalized.includes("database")) return "DBMS";
  if (normalized === "os" || normalized.includes("operat")) return "OS";
  if (normalized === "cn" || normalized.includes("network")) return "CN";
  if (normalized === "dsa" || normalized.includes("algo") || normalized.includes("struct")) return "DSA";
  return "Maths";
}

export function getActiveSubjectKey(): SubjectKey {
  if (typeof window === "undefined") return "Maths";
  try {
    const saved = localStorage.getItem(ACTIVE_SUBJECT_STORAGE_KEY);
    return normalizeSubjectKey(saved);
  } catch {
    return "Maths";
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
