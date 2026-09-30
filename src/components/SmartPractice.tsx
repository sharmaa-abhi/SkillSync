"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
import Confetti from "@/components/Confetti";
import {
  HelpCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldCheck,
  Target,
  Brain,
  Award,
  AlertTriangle,
} from "lucide-react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  explanation: string;
  correctAnswer: number;
}

// Subject-Specific Question Banks
const PRACTICE_QUESTION_BANK: Record<string, Record<string, QuizQuestion[]>> = {
  Python: {
    "Functions & Scope": [
      {
        id: "py-fn-1",
        topic: "Functions & Scope",
        difficulty: "medium",
        question: "What will the following Python function output when invoked three times consecutively?\n\ndef append_to(element, target_list=[]):\n    target_list.append(element)\n    return target_list\n\nprint(append_to(1))\nprint(append_to(2))\nprint(append_to(3))",
        options: [
          "[1] then [1, 2] then [1, 2, 3] (Mutable default argument persists across invocations)",
          "[1] then [2] then [3] (A new list is initialized on each invocation)",
          "TypeError: mutable default arguments are forbidden in Python 3",
          "[1] then [2, 1] then [3, 2, 1] (LIFO evaluation)",
        ],
        correctAnswer: 0,
        explanation: "In Python, default parameter expressions are evaluated ONCE when the function definition is executed, NOT each time the function is called. Therefore, mutable defaults like lists or dicts are shared across calls!",
      },
      {
        id: "py-fn-2",
        topic: "Functions & Scope",
        difficulty: "hard",
        question: "According to Python's LEGB scope resolution rule, in what order does the interpreter search for a variable name?",
        options: [
          "Local → Enclosing functions → Global (module) → Built-in",
          "Local → Global → Enclosing → Built-in",
          "Global → Local → Enclosing → Built-in",
          "Built-in → Global → Enclosing → Local",
        ],
        correctAnswer: 0,
        explanation: "LEGB stands for Local, Enclosing (outer nested functions), Global (module level), and Built-in namespace. Python traverses outward in this exact hierarchical order.",
      },
      {
        id: "py-fn-3",
        topic: "Functions & Scope",
        difficulty: "easy",
        question: "Which keyword is used to modify a variable defined in the enclosing (outer non-global) function scope?",
        options: ["nonlocal", "global", "outer", "super"],
        correctAnswer: 0,
        explanation: "The 'nonlocal' keyword allows nested functions to rebind variables in an outer enclosing scope that is not global.",
      },
    ],
    "Lambda Functions": [
      {
        id: "py-lam-1",
        topic: "Lambda Functions",
        difficulty: "medium",
        question: "Given a list of tuples `students = [('Alex', 88), ('Bob', 95), ('Charlie', 78)]`, which lambda expression correctly sorts the students in descending order of grade?",
        options: [
          "sorted(students, key=lambda s: s[1], reverse=True)",
          "sorted(students, key=lambda s: s[0], reverse=True)",
          "students.sort(lambda s: s[1])",
          "filter(lambda s: s[1] > 80, students)",
        ],
        correctAnswer: 0,
        explanation: "`key=lambda s: s[1]` extracts the second element (grade) as the sorting criterion, and `reverse=True` orders elements from highest to lowest.",
      },
      {
        id: "py-lam-2",
        topic: "Lambda Functions",
        difficulty: "hard",
        question: "What is a key syntactic limitation of lambda functions in Python compared to standard `def` functions?",
        options: [
          "A lambda function can only contain a single expression and cannot contain statements like assignments or loops",
          "Lambda functions cannot accept default argument values",
          "Lambda functions cannot be passed as arguments to other functions",
          "Lambda functions do not support variable-length *args or **kwargs",
        ],
        correctAnswer: 0,
        explanation: "Python lambdas are restricted to a single expression whose evaluated value is implicitly returned. They cannot contain statements (such as `return`, `assert`, `while`, or assignment `=` before the walrus operator).",
      },
    ],
    "Loops & Iteration": [
      {
        id: "py-loop-1",
        topic: "Loops & Iteration",
        difficulty: "easy",
        question: "What does `range(2, 10, 3)` generate when converted to a list in Python?",
        options: ["[2, 5, 8]", "[2, 5, 8, 11]", "[2, 3, 4, 5, 6, 7, 8, 9]", "[5, 8]"],
        correctAnswer: 0,
        explanation: "range(start, stop, step) starts at 2, increments by 3: 2, 2+3=5, 5+3=8. The next value 11 is >= stop (10), so iteration halts.",
      },
    ],
  },
  DSA: {
    "Binary Search Trees": [
      {
        id: "dsa-bst-1",
        topic: "Binary Search Trees",
        difficulty: "medium",
        question: "Which invariant property fundamentally defines a Binary Search Tree (BST) for any given node N with key K?",
        options: [
          "All keys in N's left subtree are strictly < K, and all keys in N's right subtree are strictly > K",
          "N's left child is strictly < K, but children of the left child may exceed K",
          "The height of N's left subtree is equal to the height of its right subtree",
          "Every node in the tree has either 0 or exactly 2 children",
        ],
        correctAnswer: 0,
        explanation: "The BST invariant is a GLOBAL subtree property: EVERY node in the left subtree must be less than the root, and EVERY node in the right subtree must be greater.",
      },
      {
        id: "dsa-bst-2",
        topic: "Binary Search Trees",
        difficulty: "hard",
        question: "When deleting a node with TWO children from a Binary Search Tree, with which node should its key be replaced to preserve the BST invariant?",
        options: [
          "Either its In-Order Successor (smallest in right subtree) or In-Order Predecessor (largest in left subtree)",
          "Its immediate right child",
          "The deepest leaf node in the entire tree",
          "The tree root node",
        ],
        correctAnswer: 0,
        explanation: "The in-order successor has at most one child and is greater than all nodes in the left subtree while smaller than all other nodes in the right subtree, preserving the invariant.",
      },
      {
        id: "dsa-bst-3",
        topic: "Binary Search Trees",
        difficulty: "easy",
        question: "Which tree traversal algorithm on a Binary Search Tree produces values in monotonically ascending sorted order?",
        options: ["In-Order Traversal (Left, Root, Right)", "Pre-Order Traversal (Root, Left, Right)", "Post-Order Traversal (Left, Right, Root)", "Level-Order Traversal (BFS)"],
        correctAnswer: 0,
        explanation: "Because Left < Root < Right in a BST, an In-Order traversal recursively visits Left, then Root, then Right, outputting keys in ascending order.",
      },
    ],
    "Dynamic Programming": [
      {
        id: "dsa-dp-1",
        topic: "Dynamic Programming",
        difficulty: "hard",
        question: "Which two core structural properties are strictly required for a problem to be solvable via Dynamic Programming?",
        options: [
          "Optimal Substructure and Overlapping Subproblems",
          "Greedy Choice Property and Linearity",
          "Convexity and Independent Randomness",
          "Divide-and-Conquer without overlapping subproblems",
        ],
        correctAnswer: 0,
        explanation: "Optimal substructure means an optimal solution to the problem contains optimal solutions to subproblems; overlapping subproblems means the same sub-instances are reused repeatedly.",
      },
    ],
    "Arrays & Dynamic Arrays": [
      {
        id: "dsa-arr-1",
        topic: "Arrays & Dynamic Arrays",
        difficulty: "medium",
        question: "What is the amortized time complexity of appending an element to a Dynamic Array (e.g. C++ std::vector or Python list) using geometric doubling?",
        options: ["O(1) Amortized", "O(n) Amortized", "O(log n) Amortized", "O(n²) Amortized"],
        correctAnswer: 0,
        explanation: "Although individual resizing resizes take O(n) time, geometric capacity doubling spreads that cost over N appends, achieving O(1) amortized cost per append.",
      },
    ],
  },
  Maths: {
    "Factorisation": [
      {
        id: "math-fact-1",
        topic: "Factorisation",
        difficulty: "easy",
        question: "What is the completely factored form of $x^2 - 25$?",
        options: ["$(x - 5)(x + 5)$", "$(x - 5)^2$", "$(x + 5)^2$", "$x(x - 25)$"],
        correctAnswer: 0,
        explanation: "Difference of two squares identity: $a^2 - b^2 = (a - b)(a + b)$. Here $a = x$ and $b = 5$.",
      },
      {
        id: "math-fact-2",
        topic: "Factorisation",
        difficulty: "medium",
        question: "Which pair of factors correctly factorizes the monic quadratic $x^2 + 7x + 12$?",
        options: ["$(x + 3)(x + 4)$", "$(x + 2)(x + 6)$", "$(x + 1)(x + 12)$", "$(x - 3)(x - 4)$"],
        correctAnswer: 0,
        explanation: "We seek two numbers multiplying to $12$ and adding to $7$. The pair is $3$ and $4$: $(x + 3)(x + 4)$.",
      },
      {
        id: "math-fact-3",
        topic: "Factorisation",
        difficulty: "easy",
        question: "Factor out the Greatest Common Factor (GCF) from $6x^3 + 18x^2$:",
        options: ["$6x^2(x + 3)$", "$6x(x^2 + 3)$", "$3x^2(2x + 6)$", "$x^2(6x + 18)$"],
        correctAnswer: 0,
        explanation: "The GCD of 6 and 18 is 6, and the lowest variable power is $x^2$. Factoring gives $6x^2(x + 3)$.",
      },
    ],
    "Quadratic Equations": [
      {
        id: "math-quad-1",
        topic: "Quadratic Equations",
        difficulty: "easy",
        question: "What are the roots of the equation $(x - 4)(x + 2) = 0$?",
        options: ["$x = 4$ or $x = -2$", "$x = -4$ or $x = 2$", "$x = 4$ or $x = 2$", "$x = -4$ or $x = -2$"],
        correctAnswer: 0,
        explanation: "By the Zero-Product Property: $x - 4 = 0 \\implies x = 4$, or $x + 2 = 0 \\implies x = -2$. Notice the sign flip!",
      },
      {
        id: "math-quad-2",
        topic: "Quadratic Equations",
        difficulty: "medium",
        question: "What is the value of the discriminant $\\Delta = b^2 - 4ac$ for $x^2 - 6x + 9 = 0$?",
        options: ["$0$ (one real repeated root)", "$72$ (two distinct real roots)", "$-36$ (complex roots)", "$12$"],
        correctAnswer: 0,
        explanation: "$\\Delta = (-6)^2 - 4(1)(9) = 36 - 36 = 0$. When discriminant is zero, the parabola touches the x-axis at one repeated root.",
      },
    ],
    "Algebraic Manipulation": [
      {
        id: "math-alg-1",
        topic: "Algebraic Manipulation",
        difficulty: "easy",
        question: "What is the expanded form of $3(2x - 5)$?",
        options: ["$6x - 15$", "$6x - 5$", "$5x - 15$", "$6x + 15$"],
        correctAnswer: 0,
        explanation: "Distribute 3 across both terms inside parentheses: $3 \\times 2x = 6x$, and $3 \\times (-5) = -15$.",
      },
    ],
    "Polynomials": [
      {
        id: "math-poly-1",
        topic: "Polynomials",
        difficulty: "medium",
        question: "According to the Factor Theorem, if $(x - 2)$ is a factor of polynomial $P(x)$, which condition must hold?",
        options: ["$P(2) = 0$", "$P(2) = 2$", "$P(-2) = 0$", "$P(2) > 0$"],
        correctAnswer: 0,
        explanation: "The Factor Theorem states that $(x - c)$ is a factor of $P(x)$ if and only if the remainder $P(c) = 0$.",
      },
    ],
    "Coordinate Geometry": [
      {
        id: "math-coord-1",
        topic: "Coordinate Geometry",
        difficulty: "medium",
        question: "What is the vertex of the parabola defined by $y = (x - 3)^2 + 4$?",
        options: ["$(3, 4)$", "$(-3, 4)$", "$(3, -4)$", "$(4, 3)$"],
        correctAnswer: 0,
        explanation: "In vertex form $y = a(x - h)^2 + k$, the vertex is $(h, k)$. Here $h = 3$ and $k = 4$, so the vertex is $(3, 4)$.",
      },
    ],
  },
  DBMS: {
    "Normalization": [
      {
        id: "dbms-norm-1",
        topic: "Normalization",
        difficulty: "medium",
        question: "Which normal form specifically requires the complete elimination of partial functional dependencies on composite candidate keys?",
        options: [
          "Second Normal Form (2NF)",
          "First Normal Form (1NF)",
          "Third Normal Form (3NF)",
          "Boyce-Codd Normal Form (BCNF)",
        ],
        correctAnswer: 0,
        explanation: "2NF requires 1NF compliance plus all non-prime attributes being fully functionally dependent on the entire candidate key.",
      },
      {
        id: "dbms-norm-2",
        topic: "Normalization",
        difficulty: "hard",
        question: "In Third Normal Form (3NF), for every non-trivial functional dependency $X \\to Y$, which condition must be satisfied?",
        options: [
          "Either $X$ is a superkey OR $Y$ is a prime attribute (part of a candidate key)",
          "$X$ must strictly be a superkey in all cases",
          "$Y$ cannot be part of any candidate key",
          "$X$ and $Y$ must be single atomic attributes",
        ],
        correctAnswer: 0,
        explanation: "3NF permits $X \\to Y$ if $X$ is a superkey OR if $Y$ is a prime attribute. BCNF tightens this by demanding $X$ must always be a superkey.",
      },
    ],
    "Concurrency Control": [
      {
        id: "dbms-concurr-1",
        topic: "Concurrency Control",
        difficulty: "hard",
        question: "What fundamental property distinguishes Strict Two-Phase Locking (Strict 2PL) from standard 2PL?",
        options: [
          "Strict 2PL holds all exclusive (write) locks until the transaction commits or aborts, preventing cascading aborts",
          "Strict 2PL prevents deadlocks unconditionally",
          "Strict 2PL acquires all shared and exclusive locks before execution begins",
          "Strict 2PL allows locks to be released during the growing phase",
        ],
        correctAnswer: 0,
        explanation: "Strict 2PL holds exclusive locks until transaction completion, ensuring recoverability and eliminating cascading rollbacks.",
      },
    ],
    "Transactions": [
      {
        id: "dbms-trans-1",
        topic: "Transactions",
        difficulty: "medium",
        question: "Which mechanism enables database management systems to guarantee the Atomicity and Durability (A and D in ACID) properties across system crashes?",
        options: [
          "Write-Ahead Logging (WAL) and Redo/Undo logs",
          "Two-Phase Locking (2PL)",
          "B+ Tree Clustering",
          "Query Optimization Plans",
        ],
        correctAnswer: 0,
        explanation: "Write-Ahead Logging records all modifications to persistent storage before buffer pages are written, enabling Redo/Undo recovery after crashes.",
      },
    ],
    "SQL Queries": [
      {
        id: "dbms-sql-1",
        topic: "SQL Queries",
        difficulty: "easy",
        question: "In the logical execution order of an SQL SELECT query, which clause is evaluated immediately after the WHERE clause?",
        options: ["GROUP BY", "HAVING", "SELECT", "ORDER BY"],
        correctAnswer: 0,
        explanation: "Logical SQL evaluation order is: FROM $\\to$ WHERE $\\to$ GROUP BY $\\to$ HAVING $\\to$ SELECT $\\to$ ORDER BY $\\to$ LIMIT.",
      },
    ],
    "ER Model": [
      {
        id: "dbms-er-1",
        topic: "ER Model",
        difficulty: "easy",
        question: "In relational database design, how is a Many-to-Many (M:N) relationship between two entities represented in tables?",
        options: [
          "A junction (associative) table containing foreign keys referencing both primary keys",
          "Adding a foreign key column to only one of the original entity tables",
          "A single merged table containing nullable columns",
          "A composite index on the primary table",
        ],
        correctAnswer: 0,
        explanation: "An M:N relationship requires a junction table with foreign keys to both participating entities, forming a composite primary key.",
      },
    ],
  },
  OS: {
    "Deadlocks": [
      {
        id: "os-dead-1",
        topic: "Deadlocks",
        difficulty: "medium",
        question: "Which of the following is NOT one of the four necessary Coffman conditions required for a deadlock to occur?",
        options: [
          "Preemption Allowed (Kernel preemption of resources)",
          "Mutual Exclusion",
          "Hold and Wait",
          "Circular Wait",
        ],
        correctAnswer: 0,
        explanation: "'No preemption' is a required Coffman condition. If preemption is allowed, resources can be forcibly reclaimed, breaking deadlocks.",
      },
      {
        id: "os-dead-2",
        topic: "Deadlocks",
        difficulty: "hard",
        question: "In Dijkstra's Banker's Algorithm for deadlock avoidance, what criteria defines a 'safe state'?",
        options: [
          "There exists at least one safe sequence $\\langle P_1, P_2, \\dots, P_n \\rangle$ such that all processes can finish with available resources",
          "All resources are currently fully allocated to running processes",
          "No process currently holds more than one resource type",
          "The resource allocation graph has at least one directed cycle",
        ],
        correctAnswer: 0,
        explanation: "A system is in a safe state if there exists a sequence in which every process can obtain its maximum needed resources and run to completion.",
      },
    ],
    "Process Scheduling": [
      {
        id: "os-sched-1",
        topic: "Process Scheduling",
        difficulty: "medium",
        question: "In Round Robin CPU scheduling, if the time quantum is chosen to be extremely large (approaching infinity), the scheduling algorithm behaves identically to which policy?",
        options: [
          "First-Come, First-Served (FCFS)",
          "Shortest Job First (SJF)",
          "Multilevel Feedback Queue",
          "Shortest Remaining Time First (SRTF)",
        ],
        correctAnswer: 0,
        explanation: "With an infinite time quantum, no process is ever preempted before completion; processes run in arrival order, identical to FCFS.",
      },
    ],
    "Virtual Memory & Paging": [
      {
        id: "os-vm-1",
        topic: "Virtual Memory & Paging",
        difficulty: "medium",
        question: "What hardware/software event is triggered when the CPU attempts to access a virtual memory address whose page table entry has the present/valid bit set to 0?",
        options: [
          "Page Fault Trap to OS Kernel",
          "Kernel Panic / Immediate Crash",
          "Translation Lookaside Buffer (TLB) Flush",
          "Segmentation Fault Signal (SIGSEGV)",
        ],
        correctAnswer: 0,
        explanation: "An invalid present bit triggers a page fault trap to the OS kernel, prompting it to load the missing page from disk into a physical frame.",
      },
    ],
    "Concurrency & Mutex": [
      {
        id: "os-mutex-1",
        topic: "Concurrency & Mutex",
        difficulty: "medium",
        question: "What property of counting semaphores' wait() (P) and signal() (V) operations prevents race conditions in critical sections?",
        options: [
          "Atomic execution without interruption",
          "Non-preemptive OS kernel enforcement",
          "Fixed process ID scheduling",
          "Spinlock polling loops only",
        ],
        correctAnswer: 0,
        explanation: "wait() and signal() execute atomically, ensuring no two threads can simultaneously test and decrement the semaphore value.",
      },
    ],
  },
  CN: {
    "IP Addressing & Subnetting": [
      {
        id: "cn-sub-1",
        topic: "IP Addressing & Subnetting",
        difficulty: "medium",
        question: "How many usable host IP addresses are available in an IPv4 subnet configured with a /26 CIDR prefix?",
        options: ["62", "64", "30", "126"],
        correctAnswer: 0,
        explanation: "A /26 subnet has $32 - 26 = 6$ host bits. Total addresses = $2^6 = 64$. Subtracting network ID and broadcast address gives $64 - 2 = 62$ usable hosts.",
      },
      {
        id: "cn-sub-2",
        topic: "IP Addressing & Subnetting",
        difficulty: "easy",
        question: "What is the dotted decimal subnet mask corresponding to a /24 prefix length?",
        options: ["255.255.255.0", "255.255.0.0", "255.255.255.128", "255.255.255.192"],
        correctAnswer: 0,
        explanation: "/24 indicates 24 consecutive leading 1s: 11111111.11111111.11111111.00000000 = 255.255.255.0.",
      },
    ],
    "TCP Flow & Congestion Control": [
      {
        id: "cn-tcp-1",
        topic: "TCP Flow & Congestion Control",
        difficulty: "medium",
        question: "Which mechanism in TCP prevents a fast sender from overflowing a slower receiver's memory buffer?",
        options: [
          "Flow Control using the Receive Window (rwnd) field in the TCP header",
          "Congestion Control using the congestion window (cwnd)",
          "Three-way Handshake SYN packet timing",
          "Slow Start threshold doubling",
        ],
        correctAnswer: 0,
        explanation: "TCP Flow Control uses the rwnd header field advertised by the receiver so the sender never exceeds the receiver's available buffer capacity.",
      },
    ],
    "OSI & TCP/IP Layering": [
      {
        id: "cn-osi-1",
        topic: "OSI & TCP/IP Layering",
        difficulty: "easy",
        question: "What is the standard protocol data unit (PDU) name for data formatted at the Transport Layer (Layer 4) in the Internet stack?",
        options: ["Segment", "Packet", "Frame", "Bit"],
        correctAnswer: 0,
        explanation: "Transport layer units are called Segments (TCP) or Datagrams (UDP); Network layer units are Packets; Link layer units are Frames.",
      },
    ],
    "Routing Protocols & NAT": [
      {
        id: "cn-route-1",
        topic: "Routing Protocols & NAT",
        difficulty: "medium",
        question: "Which shortest-path algorithm is fundamentally employed by the OSPF (Open Shortest Path First) link-state routing protocol?",
        options: [
          "Dijkstra's Algorithm",
          "Bellman-Ford Distance Vector Algorithm",
          "Floyd-Warshall All-Pairs Algorithm",
          "Spanning Tree Algorithm (STP)",
        ],
        correctAnswer: 0,
        explanation: "OSPF floods link-state advertisements and each router runs Dijkstra's algorithm to compute the shortest path tree from itself to all destinations.",
      },
    ],
  },
};

export default function SmartPractice() {
  const {
    activeSubject,
    activeSubjectConfig,
    currentTopic,
    knowledgeState,
    recordPracticeResult,
    aiTutorContext,
  } = useSubjectContext();

  // Find relevant question pool for active subject
  const subjectPool = PRACTICE_QUESTION_BANK[activeSubject] || PRACTICE_QUESTION_BANK.Python;
  const questions: QuizQuestion[] = useMemo(() => {
    // Priority: Questions from weak concepts or current topic
    const weakTopic = aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultWeaknesses[0] || Object.keys(subjectPool)[0];
    const prioritizedQuestions = subjectPool[weakTopic] || [];
    const otherQuestions = Object.entries(subjectPool)
      .filter(([k]) => k !== weakTopic)
      .flatMap(([, qs]) => qs);

    const merged = [...prioritizedQuestions, ...otherQuestions];
    return merged.length > 0 ? merged : subjectPool[Object.keys(subjectPool)[0]] || [];
  }, [activeSubject, aiTutorContext, activeSubjectConfig, subjectPool]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<string | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const currentQ = questions[currentIndex] || questions[0];
  const isCorrect = selectedOption === currentQ?.correctAnswer;

  const handleSubmit = async () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setAdaptiveFeedback(
        `🎉 Correct! +8% mastery added to ${currentQ.topic}. Prerequisite graph updated.`
      );
    } else {
      setAdaptiveFeedback(
        `⚠️ Review Needed: -5% adjustment on ${currentQ.topic}. Flagged for AI Coach reinforcement.`
      );
    }

    // Propagate evidence to central SubjectContext
    await recordPracticeResult(currentQ.topic, isCorrect, currentQ.id);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAdaptiveFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop for continuous practice
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {showConfetti && <Confetti />}

      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. Practice Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Targeted Adaptive Practice
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Questions calibrated specifically for <strong className="text-slate-800">{activeSubjectConfig.label}</strong> targeting identified knowledge gaps.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              Score: <span className="font-mono text-indigo-600">{totalCorrect}/{totalAnswered}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Adaptive Notification */}
        {adaptiveFeedback && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between animate-scale-in ${
              isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <span>{adaptiveFeedback}</span>
            <Link
              href={`/tutor?topic=${encodeURIComponent(currentQ.topic)}`}
              className="underline text-indigo-600 hover:text-indigo-800 font-extrabold text-[11px]"
            >
              Discuss with AI Coach →
            </Link>
          </div>
        )}
      </div>

      {/* 3. Question Card */}
      {currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {currentQ.topic}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  currentQ.difficulty === "hard"
                    ? "bg-rose-100 text-rose-800"
                    : currentQ.difficulty === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Target Concept for {activeSubjectConfig.shortLabel}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentQ.correctAnswer;
              let btnClass = "border-slate-200 hover:border-indigo-300 bg-white text-slate-800";

              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  btnClass = "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                } else if (isSelected) {
                  btnClass = "border-rose-500 bg-rose-50/80 text-rose-950 font-bold ring-2 ring-rose-500/20";
                } else {
                  btnClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                }
              } else if (isSelected) {
                btnClass = "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/20";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm space-y-1.5 animate-scale-in">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                Conceptual Explanation:
              </span>
              <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              href={`/tutor?topic=${encodeURIComponent(currentQ.topic)}`}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask AI Coach for Hint</span>
            </Link>

            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-200 disabled:opacity-40 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-200 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
