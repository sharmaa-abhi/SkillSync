"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { useActiveSubject } from "@/hooks/useActiveSubject";
import {
  HelpCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Loader2,
  Award,
  ChevronRight,
  Clock,
  ShieldCheck,
  Target,
} from "lucide-react";
import Confetti from "@/components/Confetti";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  explanation: string;
  correctAnswer: number;
}

interface QuestionResult {
  questionId: string;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  topic: string;
}

interface ProfileUpdate {
  previousMastery: number;
  newMastery: number;
  topicChanges: Array<{
    topicName: string;
    previousScore: number;
    newScore: number;
    change: number;
  }>;
}

// Comprehensive multi-subject practice questions bank
const ALL_PRACTICE_QUESTIONS: Record<string, QuizQuestion[]> = {
  // Mathematics
  Factorisation: [
    {
      id: "math_f1",
      question: "Factor completely: x² - 16",
      options: ["(x - 4)(x + 4)", "(x - 4)²", "(x + 4)²", "x(x - 16)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Factorisation",
      explanation: "Difference of squares formula: a² - b² = (a - b)(a + b). Here a = x, b = 4, yielding (x - 4)(x + 4).",
    },
    {
      id: "math_f2",
      question: "Which of the following is the factored form of the quadratic trinomial x² + 7x + 12?",
      options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x - 3)(x - 4)"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Factorisation",
      explanation: "Find two numbers multiplying to 12 and adding to 7: 3 * 4 = 12, and 3 + 4 = 7. Thus (x + 3)(x + 4).",
    },
    {
      id: "math_f3",
      question: "Factor out the greatest common factor (GCF) from: 4x³ + 12x²",
      options: ["4x²(x + 3)", "4x(x² + 3x)", "x²(4x + 12)", "2x²(2x + 6)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Factorisation",
      explanation: "The GCD of 4 and 12 is 4, and the highest common power of x is x². Factoring out 4x² gives 4x²(x + 3).",
    },
    {
      id: "math_f4",
      question: "Factor the quadratic expression: 2x² + 5x + 2",
      options: ["(2x + 1)(x + 2)", "(2x + 2)(x + 1)", "(2x - 1)(x - 2)", "(x + 4)(2x + 1)"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "Factorisation",
      explanation: "ac = 4. The pair adding to 5 is 4 and 1: 2x² + 4x + x + 2 = 2x(x + 2) + 1(x + 2) = (2x + 1)(x + 2).",
    },
  ],
  "Quadratic Equations": [
    {
      id: "math_q1",
      question: "What are the solutions to (x - 3)(x + 4) = 0?",
      options: ["x = 3 or x = -4", "x = -3 or x = 4", "x = 3 or x = 4", "x = -3 or x = -4"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Quadratic Equations",
      explanation: "By the zero-product property, either x - 3 = 0 (x = 3) or x + 4 = 0 (x = -4).",
    },
    {
      id: "math_q2",
      question: "What is the discriminant of 2x² - 4x + 1 = 0?",
      options: ["8", "24", "-8", "16"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Quadratic Equations",
      explanation: "Discriminant = b² - 4ac = (-4)² - 4(2)(1) = 16 - 8 = 8.",
    },
    {
      id: "math_q3",
      question: "If a quadratic equation has discriminant Δ = 0, what does it mean?",
      options: ["One repeated real root", "Two distinct real roots", "Two complex roots", "No solution exists"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Quadratic Equations",
      explanation: "When Δ = 0, ±√0 = 0, so the quadratic formula produces exactly one repeated real root.",
    },
  ],
  "Algebraic Manipulation": [
    {
      id: "math_am1",
      question: "Expand and simplify: 3(2x - 4) - 2(x + 5)",
      options: ["4x - 22", "4x - 2", "4x + 2", "4x - 14"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Algebraic Manipulation",
      explanation: "3(2x - 4) = 6x - 12. -2(x + 5) = -2x - 10. Combining: (6x - 2x) + (-12 - 10) = 4x - 22.",
    },
    {
      id: "math_am2",
      question: "Simplify the algebraic fraction: (x² - 9) / (x + 3)",
      options: ["x - 3", "x + 3", "x - 9", "1 / (x - 3)"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Algebraic Manipulation",
      explanation: "Factor numerator: (x - 3)(x + 3) / (x + 3) = x - 3 for x ≠ -3.",
    },
  ],
  Polynomials: [
    {
      id: "math_p1",
      question: "According to the Remainder Theorem, what is the remainder when P(x) = x³ - 2x² + 4 is divided by (x - 2)?",
      options: ["4", "0", "8", "-4"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Polynomials",
      explanation: "Remainder = P(2) = (2)³ - 2(2)² + 4 = 8 - 8 + 4 = 4.",
    },
  ],
  "Coordinate Geometry": [
    {
      id: "math_cg1",
      question: "What is the coordinates of the vertex of the parabola y = 2(x - 3)² + 5?",
      options: ["(3, 5)", "(-3, 5)", "(3, -5)", "(-3, -5)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Coordinate Geometry",
      explanation: "In vertex form y = a(x - h)² + k, the vertex is (h, k) = (3, 5).",
    },
  ],

  // Database Systems (DBMS)
  Normalization: [
    {
      id: "db_norm1",
      question: "A relational table is in Second Normal Form (2NF) if and only if it is in 1NF and:",
      options: ["No non-prime attribute is partially dependent on any candidate key", "No transitive dependencies exist", "Every determinant is a candidate key", "Multi-valued dependencies are resolved"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Normalization",
      explanation: "2NF eliminates partial dependencies: every non-prime attribute must depend on the whole candidate key.",
    },
    {
      id: "db_norm2",
      question: "Which normal form requires that for every functional dependency X -> Y, X must be a superkey?",
      options: ["Boyce-Codd Normal Form (BCNF)", "Third Normal Form (3NF)", "Second Normal Form (2NF)", "Fourth Normal Form (4NF)"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "Normalization",
      explanation: "BCNF is stricter than 3NF: the left-hand side determinant X must always be a superkey without exception.",
    },
    {
      id: "db_norm3",
      question: "Transitive dependency (A -> B and B -> C, where C is non-prime) is eliminated in:",
      options: ["Third Normal Form (3NF)", "Second Normal Form (2NF)", "First Normal Form (1NF)", "Fifth Normal Form (5NF)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Normalization",
      explanation: "3NF is designed specifically to eliminate transitive dependencies among non-prime attributes.",
    },
  ],
  "ER Model": [
    {
      id: "db_er1",
      question: "In an Entity-Relationship (ER) diagram, what does a double rectangle represent?",
      options: ["Weak entity set", "Relationship set", "Multivalued attribute", "Derived attribute"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "ER Model",
      explanation: "A double rectangle represents a weak entity set that cannot be uniquely identified by its own attributes alone.",
    },
    {
      id: "db_er2",
      question: "How is a multi-valued attribute represented in standard Chen ER notation?",
      options: ["Double ellipse", "Dashed ellipse", "Double diamond", "Dotted rectangle"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "ER Model",
      explanation: "A double ellipse denotes multivalued attributes (e.g. phone numbers or skills).",
    },
  ],
  "SQL Queries": [
    {
      id: "db_sql1",
      question: "Which SQL clause is used to filter the groups produced by a GROUP BY clause?",
      options: ["HAVING", "WHERE", "ORDER BY", "FILTER"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "SQL Queries",
      explanation: "WHERE filters rows before aggregation, while HAVING filters aggregated group results.",
    },
  ],
  Transactions: [
    {
      id: "db_tx1",
      question: "Which ACID property guarantees that all operations of a transaction execute completely or none do?",
      options: ["Atomicity", "Consistency", "Isolation", "Durability"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Transactions",
      explanation: "Atomicity enforces the all-or-nothing guarantee of transaction execution.",
    },
  ],
  Indexing: [
    {
      id: "db_idx1",
      question: "How many clustered indexes can a single relational table typically have?",
      options: ["Exactly 1", "Up to 16", "Unlimited", "Zero"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Indexing",
      explanation: "A clustered index defines the physical order of data rows on disk, so a table can only have one clustered index.",
    },
  ],
  "Concurrency Control": [
    {
      id: "db_cc1",
      question: "In Two-Phase Locking (2PL), what occurs during the shrinking phase?",
      options: ["Locks may only be released, not acquired", "Locks may only be acquired, not released", "Deadlocks are automatically aborted", "Transactions commit unconditionally"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Concurrency Control",
      explanation: "In 2PL, the growing phase acquires locks, and the shrinking phase exclusively releases locks.",
    },
  ],

  // Operating Systems (OS)
  "Process Scheduling": [
    {
      id: "os_ps1",
      question: "In Round Robin CPU scheduling, if the time quantum is made extremely large, it becomes equivalent to:",
      options: ["First-Come, First-Served (FCFS)", "Shortest Job First (SJF)", "Priority Preemptive", "Multilevel Queue"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Process Scheduling",
      explanation: "With an infinite time quantum, no process is preempted and jobs run to completion in arrival order (FCFS).",
    },
    {
      id: "os_ps2",
      question: "Which scheduling algorithm is mathematically proven to achieve minimum average waiting time?",
      options: ["Shortest Job First (SJF)", "Round Robin", "Priority Scheduling", "First-Come, First-Served"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Process Scheduling",
      explanation: "SJF (or Shortest Remaining Time First) is optimal for minimizing average waiting time by serving short bursts first.",
    },
    {
      id: "os_ps3",
      question: "What is the primary drawback of the Shortest Job First (SJF) algorithm in real-world operating systems?",
      options: ["CPU burst lengths of incoming jobs cannot be known in advance", "It causes massive context switch overhead", "It cannot be implemented with queues", "It requires hardware timer interrupts"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Process Scheduling",
      explanation: "The OS cannot predict the exact future CPU burst of interactive user programs, requiring exponential averaging estimates.",
    },
  ],
  Deadlocks: [
    {
      id: "os_dl1",
      question: "Which of the following is NOT one of the four necessary Coffman conditions for a deadlock?",
      options: ["Mutual Exclusion", "Hold and Wait", "Preemption Allowed", "Circular Wait"],
      correctAnswer: 2,
      difficulty: "medium",
      topic: "Deadlocks",
      explanation: "No preemption is the condition required for deadlock. If preemption is allowed, deadlocks cannot persist.",
    },
    {
      id: "os_dl2",
      question: "In Dijkstra's Banker's Algorithm, how is the Need matrix calculated for process Pi?",
      options: ["Need[i] = Max[i] - Allocation[i]", "Need[i] = Allocation[i] - Max[i]", "Need[i] = Available + Allocation[i]", "Need[i] = Max[i] - Available"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Deadlocks",
      explanation: "The Need matrix indicates remaining resource requirements: Need[i] = Max[i] - Allocation[i].",
    },
    {
      id: "os_dl3",
      question: "If a Resource Allocation Graph (RAG) contains a cycle and every resource type has only a single instance, then:",
      options: ["A deadlock definitely exists", "A deadlock may or may not exist", "The system is guaranteed in a safe state", "Paging is required"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "Deadlocks",
      explanation: "With single-instance resource types, a cycle in the RAG is both necessary and sufficient for a deadlock.",
    },
  ],
  "Virtual Memory & Paging": [
    {
      id: "os_vm1",
      question: "What hardware component is responsible for translating virtual addresses into physical addresses?",
      options: ["Memory Management Unit (MMU)", "Direct Memory Access (DMA)", "Arithmetic Logic Unit (ALU)", "Interrupt Controller"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Virtual Memory & Paging",
      explanation: "The MMU performs runtime virtual-to-physical address translation via page tables and TLB caches.",
    },
    {
      id: "os_vm2",
      question: "Belady's Anomaly describes the counter-intuitive phenomenon where increasing page frames causes more page faults in:",
      options: ["FIFO page replacement", "LRU page replacement", "Optimal page replacement", "Clock replacement"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Virtual Memory & Paging",
      explanation: "Belady's anomaly occurs in FIFO because FIFO does not possess the stack property exhibited by LRU and Optimal algorithms.",
    },
  ],
  "Concurrency & Mutex": [
    {
      id: "os_cm1",
      question: "What is a race condition in concurrent programming?",
      options: ["When multiple threads access shared data concurrently and the outcome depends on execution timing", "When two processes run on the same CPU clock frequency", "When a thread exceeds its allocated time slice", "When network latency exceeds packet timeout"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Concurrency & Mutex",
      explanation: "A race condition occurs when concurrent threads manipulate shared state without synchronization.",
    },
  ],

  // Computer Networks (CN)
  "IP Addressing & Subnetting": [
    {
      id: "cn_sub1",
      question: "How many usable host IP addresses are available in a /28 IPv4 subnet?",
      options: ["14", "16", "30", "32"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "IP Addressing & Subnetting",
      explanation: "32 - 28 = 4 host bits. 2^4 - 2 = 16 - 2 = 14 usable hosts.",
    },
    {
      id: "cn_sub2",
      question: "What is the subnet mask representation of a /26 network prefix?",
      options: ["255.255.255.192", "255.255.255.128", "255.255.255.224", "255.255.255.240"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "IP Addressing & Subnetting",
      explanation: "/26 has 2 bits in the 4th octet: 128 + 64 = 192 -> 255.255.255.192.",
    },
    {
      id: "cn_sub3",
      question: "What is the broadcast address for the network 192.168.1.64/26?",
      options: ["192.168.1.127", "192.168.1.255", "192.168.1.128", "192.168.1.65"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "IP Addressing & Subnetting",
      explanation: "/26 block size is 64. The range is 192.168.1.64 to 192.168.1.127. The last address is the broadcast.",
    },
  ],
  "OSI & TCP/IP Layering": [
    {
      id: "cn_osi1",
      question: "At which layer of the OSI model does a standard network router primarily operate?",
      options: ["Network Layer (Layer 3)", "Data Link Layer (Layer 2)", "Transport Layer (Layer 4)", "Application Layer (Layer 7)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "OSI & TCP/IP Layering",
      explanation: "Routers inspect IP packet headers and forward traffic across subnets at Layer 3 (Network Layer).",
    },
    {
      id: "cn_osi2",
      question: "Which Protocol Data Unit (PDU) name corresponds to the Transport Layer?",
      options: ["Segment", "Packet", "Frame", "Bit"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "OSI & TCP/IP Layering",
      explanation: "Transport layer units are Segments (TCP) or Datagrams (UDP). Network is Packets, Data Link is Frames.",
    },
  ],
  "TCP vs UDP Flow & Congestion": [
    {
      id: "cn_tcp1",
      question: "What sequence of flags is exchanged during the TCP 3-way handshake?",
      options: ["SYN, SYN-ACK, ACK", "SYN, ACK, FIN", "ACK, SYN, SYN-ACK", "SYN-ACK, ACK, SYN"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "TCP vs UDP Flow & Congestion",
      explanation: "Client sends SYN, server responds with SYN-ACK, and client finishes with ACK.",
    },
  ],
  "Routing Protocols & NAT": [
    {
      id: "cn_rt1",
      question: "Which algorithm forms the routing foundation of Open Shortest Path First (OSPF)?",
      options: ["Dijkstra's Shortest Path First algorithm", "Bellman-Ford Distance Vector algorithm", "Floyd-Warshall all-pairs algorithm", "Kruskal's Minimum Spanning Tree"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Routing Protocols & NAT",
      explanation: "OSPF is a link-state routing protocol that applies Dijkstra's SPF algorithm to the link-state database.",
    },
  ],

  // Data Structures & Algorithms (DSA)
  "Dynamic Programming": [
    {
      id: "dsa_dp1",
      question: "Which two core attributes must an optimization problem exhibit to be solvable via Dynamic Programming?",
      options: ["Optimal Substructure & Overlapping Subproblems", "Greedy Choice & Independence", "Divide & Conquer & Linearity", "Monotonicity & Convexity"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Dynamic Programming",
      explanation: "Optimal substructure ensures the global optimum consists of local sub-optima, while overlapping subproblems enable memoization reuse.",
    },
    {
      id: "dsa_dp2",
      question: "What is the time complexity of the 0/1 Knapsack problem with n items and capacity W using DP?",
      options: ["O(n * W)", "O(2^n)", "O(n log W)", "O(n + W)"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Dynamic Programming",
      explanation: "The pseudo-polynomial DP table has dimensions (n+1) x (W+1), requiring O(n*W) operations.",
    },
    {
      id: "dsa_dp3",
      question: "In the Longest Common Subsequence (LCS) problem for strings of length m and n, what is the standard 2D DP time complexity?",
      options: ["O(m * n)", "O(m + n)", "O(m log n)", "O(2^(m+n))"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Dynamic Programming",
      explanation: "Comparing each character pair takes constant time per entry in an m x n table, yielding O(m*n).",
    },
  ],
  "Graph Algorithms & Traversals": [
    {
      id: "dsa_gr1",
      question: "Breadth-First Search (BFS) on an unweighted graph traverses nodes in which order?",
      options: ["Shortest path / level-by-level using a FIFO Queue", "Deepest path first using a LIFO Stack", "Topological order using recursion", "Minimum spanning tree order using a Heap"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Graph Algorithms & Traversals",
      explanation: "BFS explores all immediate neighbors level-by-level utilizing a FIFO queue.",
    },
    {
      id: "dsa_gr2",
      question: "Dijkstra's shortest path algorithm fails to compute correct distances on graphs with:",
      options: ["Negative weight edges", "Cycles with positive weights", "Multiple connected components", "Directed edges"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Graph Algorithms & Traversals",
      explanation: "Dijkstra greedily marks nodes as finalized; negative weights can later provide a shorter path, breaking the greedy invariant. Bellman-Ford must be used instead.",
    },
  ],
  "Binary Search Trees & Heaps": [
    {
      id: "dsa_bst1",
      question: "What is the worst-case search time complexity in a standard unbalanced Binary Search Tree (BST)?",
      options: ["O(n)", "O(log n)", "O(1)", "O(n log n)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Binary Search Trees & Heaps",
      explanation: "If inserted in sorted order, an unbalanced BST degrades into a linked list of height n, yielding O(n) search time.",
    },
  ],
  "Asymptotic Complexity Analysis": [
    {
      id: "dsa_asy1",
      question: "According to the Master Theorem, what is the asymptotic solution to T(n) = 2T(n/2) + O(n)?",
      options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Asymptotic Complexity Analysis",
      explanation: "Here a = 2, b = 2, f(n) = O(n). Since log_b(a) = log_2(2) = 1, f(n) = Θ(n^1). By Case 2, T(n) = O(n log n) (Merge Sort recurrence).",
    },
  ],
};

function PracticeContent() {
  const searchParams = useSearchParams();
  const { activeSubject, activeSubjectConfig } = useActiveSubject();

  // Find initial topic: prioritize search param if it matches active subject, else first weakness/topic
  const topicParam = searchParams.get("topic");

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [quizId, setQuizId] = useState<string>("smart-quiz-1");
  const [targetTopic, setTargetTopic] = useState<string>(activeSubjectConfig.topics[0]?.name || "Factorisation");
  const [difficultyPreference, setDifficultyPreference] = useState<"adaptive" | "easy" | "medium" | "hard">("adaptive");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [score, setScore] = useState<number>(0);
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  // Sync target topic with active subject changes
  useEffect(() => {
    const validTopics = activeSubjectConfig.topics.map((t) => t.name.toLowerCase());
    let selectedTopic = activeSubjectConfig.topics[0]?.name || "Factorisation";

    if (topicParam && validTopics.includes(topicParam.toLowerCase())) {
      const match = activeSubjectConfig.topics.find((t) => t.name.toLowerCase() === topicParam.toLowerCase());
      if (match) selectedTopic = match.name;
    } else if (activeSubjectConfig.defaultWeaknesses.length > 0) {
      selectedTopic = activeSubjectConfig.defaultWeaknesses[0];
    }

    setTargetTopic(selectedTopic);
    loadQuestions(selectedTopic, difficultyPreference);
  }, [activeSubject, topicParam]);

  const loadQuestions = async (topic: string, diffPref: "adaptive" | "easy" | "medium" | "hard" = "adaptive") => {
    setLoading(true);
    try {
      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          topicName: topic,
          subject: activeSubjectConfig.key,
          subjectId: activeSubjectConfig.key,
          difficultyPreference: diffPref,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.quiz && data.quiz.questions?.length > 0) {
          setQuizId(data.quiz.id);
          setQuestions(data.quiz.questions);
          setTargetTopic(topic);
          setCurrentIndex(0);
          setSelectedAnswers({});
          setCompleted(false);
          setProfileUpdate(null);
          setSecondsElapsed(0);
          setLoading(false);
          return;
        }
      }
      loadFallbackQuestions(topic);
    } catch {
      loadFallbackQuestions(topic);
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackQuestions = (topic: string) => {
    const topicPool =
      ALL_PRACTICE_QUESTIONS[topic] ||
      ALL_PRACTICE_QUESTIONS[activeSubjectConfig.topics[0]?.name] ||
      ALL_PRACTICE_QUESTIONS["Factorisation"];

    setQuestions(topicPool);
    setTargetTopic(topic);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCompleted(false);
    setProfileUpdate(null);
    setSecondsElapsed(0);
  };

  useEffect(() => {
    if (completed) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [completed]);

  const handleSelectOption = (idx: number) => {
    if (!questions[currentIndex]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: idx,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);

    try {
      const answersPayload = questions.map((q) => ({
        questionId: q.id,
        selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1,
      }));

      const res = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "submit",
          quizId,
          subject: activeSubjectConfig.key,
          answers: answersPayload,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setScore(data.result.score);
        setResults(data.result.results);
        if (data.profileUpdate) {
          setProfileUpdate(data.profileUpdate);
        }
        setCompleted(true);
        setSubmitting(false);
        return;
      }
    } catch (err) {
      console.error("Quiz submission API error, using local fallback", err);
    }

    // Local fallback calculation if API was offline
    const evaluationResults: QuestionResult[] = questions.map((q) => {
      const selected = selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1;
      return {
        questionId: q.id,
        selectedOption: selected,
        correctAnswer: q.correctAnswer,
        isCorrect: selected === q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
      };
    });

    const correctCount = evaluationResults.filter((r) => r.isCorrect).length;
    const finalScore = Math.round((correctCount / questions.length) * 100);

    setScore(finalScore);
    setResults(evaluationResults);

    const prevOverall = activeSubjectConfig.defaultOverallMastery;
    const newOverall = Math.min(100, prevOverall + (finalScore >= 80 ? 6 : 3));

    setProfileUpdate({
      previousMastery: prevOverall,
      newMastery: newOverall,
      topicChanges: [
        {
          topicName: targetTopic,
          previousScore: 45,
          newScore: Math.min(100, 45 + (finalScore >= 80 ? 25 : 15)),
          change: finalScore >= 80 ? 25 : 15,
        },
      ],
    });

    setCompleted(true);
    setSubmitting(false);
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Calibrating adaptive questions for {activeSubjectConfig.label}...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {completed && score >= 70 && <Confetti />}

      {/* Header Info */}
      <div data-scroll="fade-down" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 card-hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Smart Practice: {targetTopic}
              </h1>
              {activeSubjectConfig.defaultWeaknesses.includes(targetTopic) && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                  Targeting Prerequisite Gap
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Difficulty adapts in real-time. Practice questions are specifically calibrated for {activeSubjectConfig.label}.
            </p>
          </div>

          {!completed && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              {/* Difficulty selector */}
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-[11px] font-semibold text-slate-600">
                {(["adaptive", "easy", "medium", "hard"] as const).map((diff) => (
                  <button
                    key={diff}
                    type="button"
                    onClick={() => {
                      setDifficultyPreference(diff);
                      loadQuestions(targetTopic, diff);
                    }}
                    className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer ${
                      difficultyPreference === diff
                        ? "bg-white text-indigo-700 shadow-xs font-bold"
                        : "hover:text-slate-900"
                    }`}
                  >
                    {diff === "adaptive" ? "⚡ Adaptive" : diff}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {Math.floor(secondsElapsed / 60)}:
                  {String(secondsElapsed % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Locked Active Subject Track Badge & Topics of This Subject ONLY */}
        <div className="pt-3 mt-3 border-t border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm">{activeSubjectConfig.icon}</span>
              <span className="text-xs font-bold text-slate-800">
                Active Subject: {activeSubjectConfig.label}
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                {activeSubjectConfig.code}
              </span>
            </div>
            <span className="text-[10px] text-slate-400">
              Change subject in <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">Learner Profile</Link>
            </span>
          </div>

          {/* Active Subject Topics Only */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex-shrink-0">
              Topics:
            </span>
            {activeSubjectConfig.topics.map((item) => {
              const isSelected = targetTopic.toLowerCase() === item.name.toLowerCase();
              const isWeak = activeSubjectConfig.defaultWeaknesses.includes(item.name);
              return (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => loadQuestions(item.name, difficultyPreference)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-xs font-bold"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  <span>{item.label}</span>
                  {isWeak && (
                    <span className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? "bg-indigo-700 text-white" : "bg-rose-100 text-rose-700"}`}>
                      Weak
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Active Quiz Question */}
      {!completed && currentQ && (
        <div data-scroll="scale" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Progress Bar & Question Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize text-[10px] font-bold">
                Difficulty: {currentQ.difficulty}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-150 cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold shadow-xs"
                      : "border-slate-200/90 hover:border-slate-300 hover:bg-slate-50 text-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs uppercase ${
                        isSelected
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation & Submit Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className={`px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer ${
                currentIndex === 0
                  ? "opacity-40 cursor-not-allowed text-slate-400"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                disabled={selectedAnswers[currentQ.id] === undefined}
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className={`px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-1.5 ${
                  selectedAnswers[currentQ.id] === undefined ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting || selectedAnswers[currentQ.id] === undefined}
                onClick={handleSubmitQuiz}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm cursor-pointer flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recalculating Mastery...</span>
                  </>
                ) : (
                  <>
                    <Award className="w-4 h-4" />
                    <span>Submit & Update Profile</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Quiz Completed Results */}
      {completed && (
        <div data-scroll="fade-up" className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 card-hover-lift">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-6">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold inline-flex items-center gap-1 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Quiz Evaluated & Closed-Loop Profile Updated
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Performance Summary: {targetTopic}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Subject Track: <strong>{activeSubjectConfig.label}</strong> ({activeSubjectConfig.code})
                </p>
              </div>

              <div className="text-center sm:text-right p-4 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  Accuracy Score
                </span>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono text-indigo-600">
                  {score}%
                </span>
              </div>
            </div>

            {/* Closed-Loop Profile Recalculation Card */}
            {profileUpdate && (
              <div data-scroll="scale" className="p-4 rounded-xl bg-gradient-to-r from-indigo-50/70 to-purple-50/70 border border-indigo-100 text-xs space-y-3">
                <div className="flex items-center gap-2 font-bold text-indigo-900">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Real-Time Mastery Recalculation Applied</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px] block">{targetTopic} Topic Mastery</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm line-through text-slate-400">
                        {profileUpdate.topicChanges[0]?.previousScore}%
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-base font-bold text-emerald-600">
                        {profileUpdate.topicChanges[0]?.newScore}%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        +{profileUpdate.topicChanges[0]?.change}%
                      </span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg bg-white border border-indigo-100 shadow-2xs">
                    <span className="text-slate-500 text-[11px] block">Overall Subject Mastery</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-mono text-sm line-through text-slate-400">
                        {profileUpdate.previousMastery}%
                      </span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-mono text-base font-bold text-indigo-600">
                        {profileUpdate.newMastery}%
                      </span>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        +{profileUpdate.newMastery - profileUpdate.previousMastery}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => loadQuestions(targetTopic, difficultyPreference)}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Again</span>
              </button>
              <Link
                href={`/tutor?topic=${encodeURIComponent(targetTopic)}`}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                <span>Coach Me with AI Tutor</span>
              </Link>
              <Link
                href="/graph"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Inspect Skill Graph
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>

          {/* Question-by-Question Pedagogical Review */}
          <div data-scroll="fade-up" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Pedagogical Explanations</span>
            </h3>

            <div className="space-y-4">
              {results.map((res, i) => (
                <div
                  key={res.questionId}
                  data-scroll="fade-up"
                  data-scroll-delay={String((i + 1) * 75)}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    res.isCorrect ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {res.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800">
                        Q{i + 1}: {questions[i]?.question}
                      </span>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        <strong className="text-slate-700">Explanation: </strong>
                        {res.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading Smart Practice Session...</p>
          </div>
        }
      >
        <PracticeContent />
      </Suspense>
    </AppLayout>
  );
}
