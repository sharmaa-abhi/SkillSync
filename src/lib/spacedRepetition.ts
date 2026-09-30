/**
 * SkillSync AI — Spaced Repetition Engine
 * Powered by the Ebbinghaus Forgetting Curve & SuperMemo-2 (SM-2) algorithms.
 */

export interface SpacedCard {
  id: string;
  topicName: string;
  subjectName: string;
  repetitionNumber: number; // n
  intervalDays: number; // I(n)
  easinessFactor: number; // EF, default 2.5
  stability: number; // S in days
  lastReviewedAt: string;
  nextReviewDate: string;
  retentionRate: number; // R(t) in %
  forgettingRisk: "low" | "medium" | "critical";
  keyConcept: string;
}

/**
 * Calculates current retention percentage according to Ebbinghaus exponential decay:
 * R = e^(-t / S) * 100
 * where t is elapsed days since last review, and S is memory stability.
 */
export function calculateRetention(lastReviewedDate: Date, stabilityDays: number = 3): number {
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - lastReviewedDate.getTime());
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  // Decay formula with minimum baseline of 20%
  const S = Math.max(1, stabilityDays);
  const retention = Math.exp(-elapsedDays / S) * 100;
  return Math.min(100, Math.max(15, Math.round(retention)));
}

/**
 * Determines forgetting risk category from retention rate
 */
export function getForgettingRisk(retentionRate: number): "low" | "medium" | "critical" {
  if (retentionRate >= 80) return "low";
  if (retentionRate >= 50) return "medium";
  return "critical";
}

/**
 * SuperMemo SM-2 algorithm: Computes new interval, easiness factor, and next due date.
 * @param quality Score from 0 (blackout) to 5 (flawless recall)
 */
export function calculateNextSM2Interval(
  repetitionNumber: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): {
  newRepetitionNumber: number;
  newIntervalDays: number;
  newEasinessFactor: number;
  newStability: number;
  nextReviewDate: Date;
} {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculate new Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newRep = repetitionNumber;
  let newInterval = 1;

  if (q >= 3) {
    // Correct response: advance repetition schedule
    if (newRep === 0) {
      newInterval = 1;
    } else if (newRep === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEF);
    }
    newRep += 1;
  } else {
    // Incorrect response: lapse back to day 1
    newRep = 0;
    newInterval = 1;
  }

  // Memory stability is proportional to the new interval
  const newStability = Math.max(1, Math.round(newInterval * 0.8));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newRepetitionNumber: newRep,
    newIntervalDays: newInterval,
    newEasinessFactor: Number(newEF.toFixed(2)),
    newStability,
    nextReviewDate,
  };
}

/**
 * Builds default active review cards from user topic mastery
 */
export function generateTopicReviewCards(
  topics: Array<{ topicName: string; score: number }>,
  subjectName: string = "Mathematics"
): SpacedCard[] {
  return topics.map((t, idx) => {
    // Stagger simulated last reviewed dates for realistic retention curve display
    const daysAgo = (idx + 1) * 2;
    const lastReviewed = new Date();
    lastReviewed.setDate(lastReviewed.getDate() - daysAgo);

    const stability = t.score >= 70 ? 7 : t.score >= 40 ? 4 : 2;
    const retentionRate = calculateRetention(lastReviewed, stability);
    const risk = getForgettingRisk(retentionRate);

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + (retentionRate < 60 ? 0 : 2));

    const keyConcepts: Record<string, string> = {
      // Mathematics
      Factorisation: "Middle-term trinomial splitting & Difference of Two Squares identity",
      "Quadratic Equations": "Discriminant Δ = b² - 4ac & Quadratic Formula roots",
      "Algebraic Manipulation": "Distributive law expansion & GCF extraction",
      Polynomials: "Factor Theorem & Remainder Theorem roots",
      "Coordinate Geometry": "Parabola vertex coordinates (h, k) & axis of symmetry",
      // Python Programming
      "Python Basics & Syntax": "Dynamic typing, duck typing, and PEP 8 style conventions",
      "Control Flow & Loops": "Loop invariants, break/continue semantics, and comprehension syntax",
      "Functions & Scope": "LEGB scope resolution, closures, *args, and **kwargs keyword arguments",
      "Data Structures (Lists, Dictionaries, Sets)": "O(1) dictionary hash lookups, list mutation semantics, and set uniqueness",
      "Object-Oriented Programming (OOP)": "Inheritance, encapsulation with dunder methods, and super() dispatch",
      "File Handling & Exceptions": "Context managers with `with` statement and exception hierarchy handling",
      "Modules & Libraries": "Virtual environments, sys.path import resolution, and pip package management",
      // Database Management Systems
      "SQL Fundamentals": "Relational algebra, SELECT filtering, and GROUP BY aggregation semantics",
      "Indexing & Query Optimization": "B-Tree vs Hash index structures, execution plans, and sargable queries",
      "Transactions & Concurrency": "ACID guarantees, two-phase locking (2PL), and isolation levels (dirty reads to serializable)",
      "Normalization & Normal Forms": "Functional dependencies, Boyce-Codd (BCNF), and 3NF lossless decompositions",
      "ER Modeling & Schema Design": "Entity-Relationship constraints, cardinalities, and primary/foreign key mappings",
      // Operating Systems
      "Processes & Threads": "PCB structures, kernel context switching, and user vs kernel threads",
      "CPU Scheduling Algorithms": "Preemptive vs non-preemptive scheduling, Round Robin quantum tuning, and SJF",
      "Process Synchronization & Deadlocks": "Peterson's algorithm, semaphores, mutexes, and Banker's safe sequence",
      "Memory Management & Paging": "MMU virtual-to-physical address translation, TLB hits, and LRU page replacement",
      "File Systems & Disk Scheduling": "Inode file representation, directory structures, and SSTF / SCAN elevator algorithms",
      // Computer Networks
      "OSI & TCP/IP Models": "7-layer vs 4-layer encapsulation, protocol headers, and PDU transitions",
      "IP Addressing & Subnetting": "IPv4 CIDR notation, subnet masks, usable host ranges (2^h - 2), and NAT",
      "Routing Protocols & Algorithms": "Dijkstra link-state (OSPF) vs Bellman-Ford distance vector (RIP)",
      "Transport Layer (TCP vs UDP)": "Three-way handshake, sequence/ACK numbering, sliding window, and UDP multiplexing",
      "Application Layer Protocols (HTTP, DNS)": "HTTP/1.1 vs HTTP/2 multiplexing, DNS resolution hierarchy, and TLS handshake",
      // Data Structures & Algorithms
      "Arrays & Strings": "Contiguous memory layout, two-pointer techniques, and sliding window patterns",
      "Linked Lists": "Node pointer manipulation, fast/slow pointer cycle detection, and reversal",
      "Stacks & Queues": "LIFO/FIFO invariants, monotonic stacks, and circular buffer queues",
      "Trees & Binary Search Trees": "BST search invariants, in-order/pre-order traversals, and balance factors",
      "Sorting & Searching Algorithms": "Divide-and-conquer mergesort/quicksort and binary search lower/upper bounds",
      "Graph Algorithms & Traversals": "BFS shortest paths, DFS topological sort, and cycle detection in DAGs",
    };

    return {
      id: `card_${t.topicName.toLowerCase().replace(/\W+/g, "_")}`,
      topicName: t.topicName,
      subjectName,
      repetitionNumber: t.score >= 70 ? 3 : 1,
      intervalDays: stability,
      easinessFactor: t.score >= 70 ? 2.5 : 2.1,
      stability,
      lastReviewedAt: lastReviewed.toISOString(),
      nextReviewDate: nextDue.toISOString(),
      retentionRate,
      forgettingRisk: risk,
      keyConcept: keyConcepts[t.topicName] || `Core foundation & problem patterns for ${t.topicName}`,
    };
  });
}
