"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
  X,
  ShieldAlert,
  Network,
  GitCommit,
  Layers,
  Lock,
  RefreshCw,
  Info,
} from "lucide-react";

export type SkillStatus = "mastered" | "practicing" | "partially_known" | "learning" | "weak" | "prerequisite_gap" | "not_started";

export interface SkillNode {
  id: string;
  name: string;
  subjectId?: string;
  levelTag: "Goal" | "Foundation" | "Prerequisite" | "Concept" | "Milestone";
  status: SkillStatus;
  masteryScore: number;
  confidence?: "Low" | "Medium" | "High";
  importance?: "Foundational" | "Core" | "High" | "Critical";
  estimatedMinutes: number;
  x: number; // 2D layout coordinate X
  y: number; // 2D layout coordinate Y
  prerequisites: string[]; // Upstream node IDs
  nextSkills: string[]; // Downstream node IDs
  isPrerequisiteGap?: boolean;
  description: string;
  whyItMatters: string;
  practicalUsage?: string;
  codeExample?: string;
  commonMistakes?: string[];
  practiceRecommendation?: string;
  diagnosticNotes: string;
  keyFormulas?: string[];
}

export interface EdgeDefinition {
  from: string;
  to: string;
  status: "satisfied" | "blocking" | "active" | "locked";
  label?: string;
}

export const PYTHON_SKILLS: SkillNode[] = [
  {
    id: "py-vars",
    name: "Variables & Data Types",
    subjectId: "sub_python",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 92,
    confidence: "High",
    importance: "Foundational",
    estimatedMinutes: 10,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["py-cond"],
    description: "Primitive types (int, float, str, bool), type casting, mutability, and string interpolation.",
    whyItMatters: "The atomic bedrock of all data representation and memory allocation in Python.",
    practicalUsage: "Parsing REST JSON payloads, database model entities, environment config, and math transformations.",
    codeExample: `# Strongly-typed Python variable annotations
user_id: int = 1042
score: float = 94.5
user_name: str = "Alex"
tags: list[str] = ["student", "python3"]

# Formatting with f-strings
summary = f"Student {user_name} (ID: {user_id}) achieved {score:.1f}%"`,
    commonMistakes: [
      "Assuming numbers/strings are mutable in-place.",
      "Assigning to Python built-in names (e.g. naming a variable 'list' or 'str').",
    ],
    practiceRecommendation: "Solid mastery confirmed (92%). Prerequisite ready for downstream control flow.",
    diagnosticNotes: "Demonstrated 92% baseline accuracy. Clear understanding of immutability and casting.",
    keyFormulas: ["type(x) inspection", "isinstance(val, expected_type)", "f\"{val:.2f}\" format specifier"],
  },
  {
    id: "py-cond",
    name: "Conditions & Branching",
    subjectId: "sub_python",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 85,
    confidence: "High",
    importance: "Foundational",
    estimatedMinutes: 12,
    x: 280,
    y: 160,
    prerequisites: ["py-vars"],
    nextSkills: ["py-loops"],
    description: "Boolean logic, if/elif/else statements, comparison operators, and short-circuit evaluation.",
    whyItMatters: "Directs program execution flow based on dynamic data state and security policies.",
    practicalUsage: "API authorization checks, input validation guards, workflow routing, and defensive null handling.",
    codeExample: `def can_access_exam(student: dict) -> bool:
    if not student.get("is_enrolled"):
        return False
    elif student.get("mastery", 0) >= 70:
        return True
    return False`,
    commonMistakes: [
      "Using '==' instead of 'is' when checking against singleton None.",
      "Forgetting indentation boundaries causing accidental block leaks.",
    ],
    practiceRecommendation: "Branching mechanics fully stable. Move directly to iteration patterns.",
    diagnosticNotes: "85% accuracy on conditional logic tests. Sound comprehension of truthy/falsy values.",
    keyFormulas: ["x if condition else y", "bool(empty_container) == False", "x is not None"],
  },
  {
    id: "py-loops",
    name: "Loops & Iteration",
    subjectId: "sub_python",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 78,
    confidence: "Medium",
    importance: "Core",
    estimatedMinutes: 15,
    x: 440,
    y: 160,
    prerequisites: ["py-cond"],
    nextSkills: ["py-funcs"],
    description: "for loops, while loops, range generator, enumerate, and break/continue execution controls.",
    whyItMatters: "Powers repetitive processing over sequences, database result sets, and batch pipelines.",
    practicalUsage: "ETL data transformations, crawling paginated endpoints, processing CSV records, and retry mechanisms.",
    codeExample: `# Clean iteration with enumerate and range
topics = ["Variables", "Loops", "Functions", "Lambda"]
for idx, topic in enumerate(topics, start=1):
    print(f"Step {idx}: {topic}")

# Safe retry loop
max_attempts = 3
for attempt in range(max_attempts):
    if ping_server():
        break
else:
    notify_ops_failure()`,
    commonMistakes: [
      "Mutating a list while actively iterating over it (causes skipped elements).",
      "Off-by-one errors with range(start, stop) where stop is exclusive.",
    ],
    practiceRecommendation: "Practice dictionary comprehension iteration and zip() parallel loops.",
    diagnosticNotes: "78% accuracy. Demonstrated good range() handling; minor hesitation on while-else syntax.",
    keyFormulas: ["range(start, stop, step)", "enumerate(iterable, start=0)", "for item in zip(a, b)"],
  },
  {
    id: "py-funcs",
    name: "Functions & Scope",
    subjectId: "sub_python",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 58,
    confidence: "Medium",
    importance: "Critical",
    estimatedMinutes: 20,
    x: 600,
    y: 160,
    prerequisites: ["py-loops"],
    nextSkills: ["py-lambda", "py-oop"],
    description: "def declarations, positional & keyword arguments, default values, return tuples, and LEGB scope.",
    whyItMatters: "Encapsulates reusable business logic, eliminates duplication, and enforces clean modular architecture.",
    practicalUsage: "FastAPI endpoint handlers, microservice utilities, data processing filters, and test fixtures.",
    codeExample: `def calculate_total(
    prices: list[float], 
    tax_rate: float = 0.08, 
    discount: float = 0.0
) -> float:
    \"\"\"Calculates order total with applicable discount and tax.\"\"\"
    subtotal = sum(prices)
    discounted = subtotal * (1.0 - discount)
    total = discounted * (1.0 + tax_rate)
    return round(total, 2)`,
    commonMistakes: [
      "CRITICAL: Using mutable default arguments like def append_item(val, items=[]).",
      "Confusing local variable scope with module-level global variables without 'global' keyword.",
    ],
    practiceRecommendation: "Practice keyword-only arguments and return tuple unpacking immediately.",
    diagnosticNotes: "58% mastery: Partial knowledge demonstrated. Correctly wrote signatures but fell into mutable default trap.",
    keyFormulas: ["def func(*args, **kwargs)", "LEGB: Local -> Enclosing -> Global -> Built-in"],
  },
  {
    id: "py-lambda",
    name: "Lambda & Closures",
    subjectId: "sub_python",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 30,
    confidence: "Low",
    importance: "Critical",
    estimatedMinutes: 20,
    x: 760,
    y: 160,
    prerequisites: ["py-funcs"],
    nextSkills: ["py-oop"],
    isPrerequisiteGap: true,
    description: "Anonymous lambda expressions, map(), filter(), sorted key projections, and lexical closures.",
    whyItMatters: "Essential for functional transformations, Pandas/NumPy pipelines, and event-driven callbacks.",
    practicalUsage: "Custom multi-attribute sorting, event listeners, inline data transforms, and higher-order decorators.",
    codeExample: `# Multi-attribute custom sorting with lambda
students = [
    {"name": "Alex", "grade": 88, "age": 20},
    {"name": "Maya", "grade": 95, "age": 19},
    {"name": "Jordan", "grade": 88, "age": 21},
]
# Sort descending by grade, then ascending by age
sorted_students = sorted(
    students, 
    key=lambda s: (-s["grade"], s["age"])
)

# Inline filter with lambda
passing = list(filter(lambda s: s["grade"] >= 90, students))`,
    commonMistakes: [
      "Attempting statements (e.g. assignments, print or loops) inside lambda bodies (only expressions allowed).",
      "Late-binding closures inside loop indices leading to identical evaluated captured values.",
    ],
    practiceRecommendation: "High-priority gap! Complete 5 targeted exercises on sorted() key callbacks.",
    diagnosticNotes: "Prerequisite gap (30% score): Struggled with map/filter syntax and tuple key sorting.",
    keyFormulas: ["lambda args: expr", "sorted(iterable, key=lambda x: ...)", "list(map(lambda x: ..., data))"],
  },
  {
    id: "py-oop",
    name: "Object-Oriented Programming",
    subjectId: "sub_python",
    levelTag: "Milestone",
    status: "not_started",
    masteryScore: 0,
    confidence: "Low",
    importance: "Core",
    estimatedMinutes: 30,
    x: 920,
    y: 110,
    prerequisites: ["py-funcs", "py-lambda"],
    nextSkills: ["py-errors"],
    description: "Classes, __init__ constructor, instance methods, self reference, inheritance, and encapsulation.",
    whyItMatters: "Structures enterprise application domain models, ORMs (SQLAlchemy, Django), and neural networks.",
    practicalUsage: "Creating custom domain models, API client wrappers, simulator entities, and PyTorch nn.Module architectures.",
    codeExample: `class LearningProfile:
    def __init__(self, student_name: str, active_subject: str):
        self.student_name = student_name
        self.active_subject = active_subject
        self._mastery_scores: dict[str, float] = {}

    def update_mastery(self, topic: str, score: float) -> None:
        self._mastery_scores[topic] = min(100.0, max(0.0, score))

    @property
    def overall_mastery(self) -> float:
        if not self._mastery_scores:
            return 0.0
        return sum(self._mastery_scores.values()) / len(self._mastery_scores)`,
    commonMistakes: [
      "Forgetting 'self' as first parameter in method signatures.",
      "Accidentally creating shared class variables instead of instance attributes inside __init__.",
    ],
    practiceRecommendation: "Currently locked. Address the Lambda & Functions prerequisite gap first.",
    diagnosticNotes: "Not yet started in curriculum progression.",
    keyFormulas: ["class Derived(Base):", "super().__init__()", "@property & @setter"],
  },
  {
    id: "py-errors",
    name: "Error & Exception Handling",
    subjectId: "sub_python",
    levelTag: "Milestone",
    status: "not_started",
    masteryScore: 0,
    confidence: "Low",
    importance: "High",
    estimatedMinutes: 20,
    x: 920,
    y: 220,
    prerequisites: ["py-funcs"],
    nextSkills: [],
    description: "try/except/else/finally blocks, custom exception classes, raising errors, and context managers.",
    whyItMatters: "Prevents crashes, provides informative diagnostics, and ensures secure database connection teardown.",
    practicalUsage: "Handling network dropouts, database rollbacks, input validation, and file descriptor cleanup.",
    codeExample: `class DiagnosticError(Exception):
    \"\"\"Raised when student assessment state is corrupt.\"\"\"
    pass

try:
    with open("results.json", "r") as f:
        data = json.load(f)
except FileNotFoundError:
    data = {"status": "unassessed", "mastery": 0}
except json.JSONDecodeError as err:
    raise DiagnosticError(f"Corrupt assessment format: {err}") from err
finally:
    logger.info("Assessment read operation terminated.")`,
    commonMistakes: [
      "Catching naked 'except:' which swallows KeyboardInterrupt and system exits.",
      "Masking the original exception stacktrace by re-raising without 'from err'.",
    ],
    practiceRecommendation: "Unlocks after completing OOP and class inheritance basics.",
    diagnosticNotes: "Scheduled for next milestone once prerequisite functions are mastered.",
    keyFormulas: ["try -> except -> else -> finally", "raise CustomError() from err"],
  },
];

export const PYTHON_EDGES: EdgeDefinition[] = [
  { from: "py-vars", to: "py-cond", status: "satisfied", label: "Mastered (92%)" },
  { from: "py-cond", to: "py-loops", status: "satisfied", label: "Mastered (85%)" },
  { from: "py-loops", to: "py-funcs", status: "satisfied", label: "Practicing (78%)" },
  { from: "py-funcs", to: "py-lambda", status: "blocking", label: "⚠️ Prerequisite Gap (30%)" },
  { from: "py-lambda", to: "py-oop", status: "locked", label: "Locked (Prereq Needed)" },
  { from: "py-funcs", to: "py-errors", status: "locked", label: "Next Milestone" },
];

export const MATH_SKILLS: SkillNode[] = [
  {
    id: "alg-manip",
    name: "Algebraic Manipulation",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 84,
    estimatedMinutes: 10,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["factorisation"],
    description: "Expanding brackets, collecting like terms, and isolating algebraic variables.",
    whyItMatters: "Essential ground-level mechanics required for all higher algebraic problem solving.",
    diagnosticNotes: "Demonstrated 84% accuracy in baseline diagnostic. Strong, stable foundation.",
    keyFormulas: ["a(b + c) = ab + ac", "(a + b)² = a² + 2ab + b²"],
  },
  {
    id: "factorisation",
    name: "Factorisation",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 38,
    estimatedMinutes: 10,
    x: 380,
    y: 160,
    prerequisites: ["alg-manip"],
    nextSkills: ["quad-eq"],
    isPrerequisiteGap: true,
    description: "Factoring out GCF, grouping, difference of two squares, and splitting the middle term.",
    whyItMatters: "Direct prerequisite for solving quadratic equations by factoring. Bottlenecks your progress.",
    diagnosticNotes: "Critical prerequisite gap! Missed 3 of 4 trinomial factor decomposition questions.",
    keyFormulas: ["x² - y² = (x - y)(x + y)", "ax² + bx + c = (px + q)(rx + s)"],
  },
  {
    id: "quad-eq",
    name: "Quadratic Equations",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 72,
    estimatedMinutes: 15,
    x: 640,
    y: 160,
    prerequisites: ["factorisation"],
    nextSkills: ["polynomials", "coord-geo"],
    description: "Standard form ax² + bx + c = 0, discriminant test, and quadratic formula application.",
    whyItMatters: "Current active learning focus. Core benchmark for high school & entrance mathematics.",
    diagnosticNotes: "Understands formula application, but gets blocked when factoring standard forms.",
    keyFormulas: ["x = (-b ± √(b² - 4ac)) / 2a", "Δ = b² - 4ac"],
  },
  {
    id: "polynomials",
    name: "Polynomial Functions",
    levelTag: "Concept",
    status: "learning",
    masteryScore: 55,
    estimatedMinutes: 12,
    x: 880,
    y: 90,
    prerequisites: ["quad-eq"],
    nextSkills: [],
    description: "Roots, degree, remainder theorem, and polynomial division.",
    whyItMatters: "Extends quadratic concepts into higher-degree models used in calculus.",
    diagnosticNotes: "Scheduled next after factorisation prerequisite gap is cleared.",
    keyFormulas: ["P(x) = (x - a)Q(x) + R", "P(a) = 0 ↔ (x - a) is factor"],
  },
  {
    id: "coord-geo",
    name: "Coordinate Geometry",
    levelTag: "Milestone",
    status: "not_started",
    masteryScore: 0,
    estimatedMinutes: 20,
    x: 880,
    y: 230,
    prerequisites: ["quad-eq"],
    nextSkills: [],
    description: "Parabolas, vertex form, axis of symmetry, and intercepts on the Cartesian plane.",
    whyItMatters: "Capstone milestone: connects algebraic quadratic roots to graphical geometric intercepts.",
    diagnosticNotes: "Locked until quadratic equations reach 80% mastery.",
    keyFormulas: ["y = a(x - h)² + k", "Vertex = (-b/2a, -Δ/4a)"],
  },
];

export const MATH_EDGES: EdgeDefinition[] = [
  { from: "alg-manip", to: "factorisation", status: "satisfied", label: "Satisfied (84%)" },
  { from: "factorisation", to: "quad-eq", status: "blocking", label: "⚠️ Prerequisite Gap (Blocks Progress)" },
  { from: "quad-eq", to: "polynomials", status: "active", label: "Active Pathway" },
  { from: "quad-eq", to: "coord-geo", status: "locked", label: "Locked Milestone" },
];

export const DBMS_SKILLS: SkillNode[] = [
  {
    id: "er-model",
    name: "ER Modeling",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 82,
    estimatedMinutes: 10,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["rel-model"],
    description: "Entities, attributes, relationships, and cardinalities.",
    whyItMatters: "Foundation of all relational database architecture.",
    diagnosticNotes: "Diagnostic score: 82%. Strong conceptual grounding.",
    keyFormulas: ["1:1, 1:N, M:N Relationships"],
  },
  {
    id: "rel-model",
    name: "Relational Algebra",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 78,
    estimatedMinutes: 10,
    x: 380,
    y: 160,
    prerequisites: ["er-model"],
    nextSkills: ["normalization"],
    description: "Select (σ), Project (π), Cartesian product (×), Joins (⨝).",
    whyItMatters: "Mathematical backbone for SQL query optimization.",
    diagnosticNotes: "Solid accuracy in basic operations.",
    keyFormulas: ["σ_{condition}(R)", "π_{attributes}(R)"],
  },
  {
    id: "normalization",
    name: "Normalization (1NF-BCNF)",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 35,
    estimatedMinutes: 15,
    x: 640,
    y: 160,
    prerequisites: ["rel-model"],
    nextSkills: ["transactions"],
    isPrerequisiteGap: true,
    description: "Functional dependencies, candidate keys, 2NF partial dependencies, 3NF transitive dependencies.",
    whyItMatters: "Critical design discipline to prevent insertion, update, and deletion anomalies.",
    diagnosticNotes: "Prerequisite gap: Unable to isolate partial dependencies in compound key relations.",
    keyFormulas: ["X → Y Functional Dependency", "3NF: X is superkey or Y is prime"],
  },
  {
    id: "transactions",
    name: "Transactions & ACID",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 68,
    estimatedMinutes: 15,
    x: 880,
    y: 90,
    prerequisites: ["normalization"],
    nextSkills: ["concurrency"],
    description: "Atomicity, Consistency, Isolation levels, and Durability.",
    whyItMatters: "Ensures mission-critical reliability for enterprise applications.",
    diagnosticNotes: "Struggles with Phantom Read vs Non-repeatable Read anomalies.",
    keyFormulas: ["ACID Properties", "Serializability Criterion"],
  },
  {
    id: "concurrency",
    name: "Concurrency Control",
    levelTag: "Milestone",
    status: "not_started",
    masteryScore: 0,
    estimatedMinutes: 20,
    x: 880,
    y: 230,
    prerequisites: ["transactions"],
    nextSkills: [],
    description: "2-Phase Locking (2PL), deadlocks, wait-for graphs, and timestamp ordering.",
    whyItMatters: "High-scale multi-user consistency milestone.",
    diagnosticNotes: "Locked until Normalization & Transactions prerequisites reach 75%.",
    keyFormulas: ["Growing & Shrinking Phase", "Wait-Die / Wound-Wait"],
  },
];

export const DBMS_EDGES: EdgeDefinition[] = [
  { from: "er-model", to: "rel-model", status: "satisfied", label: "Satisfied (82%)" },
  { from: "rel-model", to: "normalization", status: "blocking", label: "⚠️ Prerequisite Gap" },
  { from: "normalization", to: "transactions", status: "active", label: "Active Pathway" },
  { from: "transactions", to: "concurrency", status: "locked", label: "Locked Milestone" },
];

export const OS_SKILLS: SkillNode[] = [
  {
    id: "proc-sched",
    name: "Process Scheduling",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 82,
    estimatedMinutes: 15,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["deadlocks"],
    description: "Preemptive vs non-preemptive algorithms: FCFS, SJF, Round Robin, and Priority Scheduling.",
    whyItMatters: "CPU utilization and multiprogramming foundation.",
    diagnosticNotes: "Demonstrated 82% accuracy in baseline scheduler metrics.",
    keyFormulas: ["Turnaround Time = Completion - Arrival", "Waiting Time = Turnaround - Burst"],
  },
  {
    id: "deadlocks",
    name: "Deadlocks & Banker's Algo",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 36,
    estimatedMinutes: 20,
    x: 380,
    y: 160,
    prerequisites: ["proc-sched"],
    nextSkills: ["virt-mem"],
    isPrerequisiteGap: true,
    description: "Four Coffman conditions, resource allocation graphs, and safe state matrix analysis.",
    whyItMatters: "Direct prerequisite for concurrency synchronization and distributed systems.",
    diagnosticNotes: "Prerequisite gap: Struggled with Banker's Algorithm matrix subtraction Need = Max - Alloc.",
    keyFormulas: ["Need[i][j] = Max[i][j] - Allocation[i][j]", "Work = Work + Allocation[i]"],
  },
  {
    id: "virt-mem",
    name: "Virtual Memory & Paging",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 65,
    estimatedMinutes: 20,
    x: 640,
    y: 160,
    prerequisites: ["deadlocks"],
    nextSkills: ["concurrency-os"],
    description: "MMU address translation, page tables, page faults, and LRU replacement.",
    whyItMatters: "Core benchmark for operating systems memory isolation.",
    diagnosticNotes: "Understands paging, but page fault effective access time calculation needs practice.",
    keyFormulas: ["EAT = (1-p)*Access + p*Fault_Overhead", "Virtual Address = Page # + Offset"],
  },
  {
    id: "concurrency-os",
    name: "Concurrency & Mutex",
    levelTag: "Milestone",
    status: "learning",
    masteryScore: 45,
    estimatedMinutes: 25,
    x: 880,
    y: 160,
    prerequisites: ["virt-mem"],
    nextSkills: [],
    description: "Critical section problem, Peterson's algorithm, mutex locks, and counting semaphores.",
    whyItMatters: "Essential for multithreaded systems programming and backend scale.",
    diagnosticNotes: "Path unlocked once Deadlock prerequisite gap is cleared.",
    keyFormulas: ["wait(S): S <= 0 block, S--", "signal(S): S++"],
  },
];

export const OS_EDGES: EdgeDefinition[] = [
  { from: "proc-sched", to: "deadlocks", status: "satisfied", label: "Satisfied (82%)" },
  { from: "deadlocks", to: "virt-mem", status: "blocking", label: "⚠️ Prerequisite Gap" },
  { from: "virt-mem", to: "concurrency-os", status: "active", label: "Active Pathway" },
];

export const CN_SKILLS: SkillNode[] = [
  {
    id: "osi-tcp",
    name: "OSI & TCP/IP Stack",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 86,
    estimatedMinutes: 15,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["ip-subnet"],
    description: "7-layer vs 4-layer architecture, encapsulation, and protocol headers.",
    whyItMatters: "The bedrock of all network communications and protocol design.",
    diagnosticNotes: "Solid understanding of OSI layer boundaries and PDUs.",
    keyFormulas: ["Encapsulation: Data -> Segment -> Packet -> Frame"],
  },
  {
    id: "ip-subnet",
    name: "IP Addressing & Subnetting",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 34,
    estimatedMinutes: 25,
    x: 380,
    y: 160,
    prerequisites: ["osi-tcp"],
    nextSkills: ["tcp-flow"],
    isPrerequisiteGap: true,
    description: "IPv4/IPv6 CIDR prefixes, subnet masks, network IDs, and host range calculation.",
    whyItMatters: "Prerequisite bottleneck: Blocks packet routing and transport protocol mastery.",
    diagnosticNotes: "Prerequisite gap: Struggled with binary host bits and slash notation (/26, /28).",
    keyFormulas: ["Hosts = 2^(32 - prefix) - 2", "Network ID = IP AND Subnet Mask"],
  },
  {
    id: "tcp-flow",
    name: "TCP Flow & Congestion Control",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 68,
    estimatedMinutes: 20,
    x: 640,
    y: 160,
    prerequisites: ["ip-subnet"],
    nextSkills: ["routing-proto"],
    description: "Three-way handshake, sliding window, slow start, congestion avoidance, and AIMD.",
    whyItMatters: "Core protocol reliability layer for web applications and microservices.",
    diagnosticNotes: "Understands handshake; requires reinforcement on AIMD additive increase / mult decrease.",
    keyFormulas: ["Window = min(cwnd, rwnd)", "Slow Start: cwnd *= 2 each RTT"],
  },
  {
    id: "routing-proto",
    name: "Routing Protocols (OSPF/BGP)",
    levelTag: "Milestone",
    status: "learning",
    masteryScore: 40,
    estimatedMinutes: 30,
    x: 880,
    y: 160,
    prerequisites: ["tcp-flow"],
    nextSkills: [],
    description: "Distance Vector (Bellman-Ford) vs Link State (Dijkstra) and autonomous system BGP peering.",
    whyItMatters: "Internet-scale routing and topology management.",
    diagnosticNotes: "Milestone queued after IP Subnetting prerequisite remediation.",
    keyFormulas: ["Bellman-Ford: Dx(y) = min_v { c(x,v) + Dv(y) }"],
  },
];

export const CN_EDGES: EdgeDefinition[] = [
  { from: "osi-tcp", to: "ip-subnet", status: "satisfied", label: "Satisfied (86%)" },
  { from: "ip-subnet", to: "tcp-flow", status: "blocking", label: "⚠️ Prerequisite Gap" },
  { from: "tcp-flow", to: "routing-proto", status: "active", label: "Active Pathway" },
];

export const DSA_SKILLS: SkillNode[] = [
  {
    id: "asymptotic",
    name: "Asymptotic Complexity",
    subjectId: "sub_dsa",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 88,
    confidence: "High",
    importance: "Foundational",
    estimatedMinutes: 15,
    x: 80,
    y: 160,
    prerequisites: [],
    nextSkills: ["arrays-ptrs", "dp-opt"],
    description: "Big-O, Big-Omega, Big-Theta, and Master Theorem for divide-and-conquer recurrence relations.",
    whyItMatters: "Crucial for evaluating runtime performance and scalable engineering decisions.",
    practicalUsage: "Benchmarking database queries, designing high-throughput caching algorithms, and passing technical interviews.",
    codeExample: `// Master Theorem Recurrence Analysis
// T(n) = 2T(n/2) + O(n) => a=2, b=2, d=1
// Since log_b(a) = log_2(2) = 1 == d
// Result: T(n) = O(n log n) (e.g. Merge Sort)`,
    commonMistakes: [
      "Assuming O(1) space when recursive call stacks consume O(depth) memory.",
      "Treating best-case or average-case bounds as strict upper-bound Big-O.",
    ],
    practiceRecommendation: "Mastered with 88% confidence. Foundation ready for non-linear structures.",
    diagnosticNotes: "Demonstrated 88% accuracy in asymptotic recurrence comparisons and amortized loops.",
    keyFormulas: ["Master Theorem: T(n) = aT(n/b) + O(n^d)", "O(1) < O(log n) < O(n) < O(n log n) < O(n²)"],
  },
  {
    id: "arrays-ptrs",
    name: "Arrays & Dynamic Arrays",
    subjectId: "sub_dsa",
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 90,
    confidence: "High",
    importance: "Foundational",
    estimatedMinutes: 15,
    x: 230,
    y: 160,
    prerequisites: ["asymptotic"],
    nextSkills: ["linked-lists", "bst-trees"],
    description: "Contiguous memory layout, dynamic array geometric doubling O(1) amortized, and two-pointer sweeps.",
    whyItMatters: "The most cache-friendly data structure in computer hardware; underpins modern vectors and tensors.",
    practicalUsage: "High-frequency trading buffers, tabular columnar stores (Parquet), and machine learning matrix batches.",
    codeExample: `function twoSumSorted(arr: number[], target: number): [number, number] | null {
  let left = 0, right = arr.length - 1;
  while (left < right) {
    const sum = arr[left] + arr[right];
    if (sum === target) return [left, right];
    else if (sum < target) left++;
    else right--;
  }
  return null;
}`,
    commonMistakes: [
      "Forgetting that inserting or deleting at index 0 shifts all elements in O(n) time.",
      "Buffer overflow or off-by-one index mistakes when scanning boundaries.",
    ],
    practiceRecommendation: "High mastery (90%). Strong foundation in contiguous memory layout.",
    diagnosticNotes: "Demonstrated 90% accuracy in sliding window and two-pointer array manipulation.",
    keyFormulas: ["Address(A[i]) = Base + (i * ElementSize)", "Geometric doubling: Amortized O(1) append"],
  },
  {
    id: "linked-lists",
    name: "Linked Lists",
    subjectId: "sub_dsa",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 74,
    confidence: "Medium",
    importance: "Core",
    estimatedMinutes: 20,
    x: 380,
    y: 160,
    prerequisites: ["arrays-ptrs"],
    nextSkills: ["stacks-queues", "bst-trees"],
    description: "Singly and doubly linked lists, pointer manipulation, Sentinel dummy nodes, and Floyd's cycle detection.",
    whyItMatters: "Powers constant-time splice and insertion operations, LRU cache node chaining, and kernel free lists.",
    practicalUsage: "Building LRU / LFU cache eviction policies, undo/redo buffers, and dynamic memory chunk management.",
    codeExample: `class ListNode<T> {
  val: T;
  next: ListNode<T> | null = null;
  constructor(val: T) { this.val = val; }
}

function hasCycle(head: ListNode<number> | null): boolean {
  let slow = head, fast = head;
  while (fast && fast.next) {
    slow = slow!.next;
    fast = fast.next.next;
    if (slow === fast) return true; // Cycle detected
  }
  return false;
}`,
    commonMistakes: [
      "Dereferencing null pointers when traversing past tail (fast.next.next when fast.next is null).",
      "Losing reference to downstream sublists when re-wiring pointers.",
    ],
    practiceRecommendation: "Practice reversing a linked list in-place with 3 pointers.",
    diagnosticNotes: "74% mastery: Good grasp of basic pointers; occasionally drops head pointers in multi-node swaps.",
    keyFormulas: ["Floyd Cycle: slow += 1, fast += 2", "Reverse List: next = curr.next; curr.next = prev; prev = curr; curr = next"],
  },
  {
    id: "stacks-queues",
    name: "Stacks & Queues",
    subjectId: "sub_dsa",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 70,
    confidence: "Medium",
    importance: "Core",
    estimatedMinutes: 20,
    x: 520,
    y: 160,
    prerequisites: ["linked-lists"],
    nextSkills: ["graph-algo"],
    description: "LIFO (Last In First Out) and FIFO (First In First Out) semantics, monotonic stacks, and circular buffers.",
    whyItMatters: "Underpins compiler syntax evaluation, expression parsing, call stacks, and BFS graph scheduling.",
    practicalUsage: "Message brokers (Kafka/RabbitMQ queues), browser forward/back history, and monotonic next greater element queries.",
    codeExample: `// Valid Parentheses check with LIFO Stack
function isValidParentheses(s: string): boolean {
  const stack: string[] = [];
  const map: Record<string, string> = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (map[char]) {
      if (stack.pop() !== map[char]) return false;
    } else {
      stack.push(char);
    }
  }
  return stack.length === 0;
}`,
    commonMistakes: [
      "Popping from an empty stack without checking emptiness.",
      "Using an array as a queue with array.shift() which runs in O(n) rather than O(1).",
    ],
    practiceRecommendation: "Practice Monotonic Stack patterns for histogram water trapping.",
    diagnosticNotes: "70% mastery: Confident with standard push/pop; monotonic stack edge conditions need reinforcement.",
    keyFormulas: ["LIFO: Push/Pop O(1)", "FIFO: Enqueue/Dequeue O(1) via Ring Buffer or Doubly Linked List"],
  },
  {
    id: "bst-trees",
    name: "Binary Search Trees",
    subjectId: "sub_dsa",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 38,
    confidence: "Low",
    importance: "Critical",
    estimatedMinutes: 25,
    x: 660,
    y: 110,
    prerequisites: ["arrays-ptrs", "linked-lists"],
    nextSkills: ["heaps-pq", "graph-algo"],
    isPrerequisiteGap: true,
    description: "BST invariant (Left < Root < Right), in-order traversal, successor/predecessor deletion, and AVL rotations.",
    whyItMatters: "Direct prerequisite for logarithmic search, database index B-Trees, and self-balancing sets.",
    practicalUsage: "Relational database index engines (B+ Trees), Linux kernel CFS scheduler Red-Black trees, and spatial KD-trees.",
    codeExample: `class TreeNode {
  val: number;
  left: TreeNode | null = null;
  right: TreeNode | null = null;
  constructor(val: number) { this.val = val; }
}

// Inorder traversal yields sorted order
function inorder(root: TreeNode | null, result: number[] = []): number[] {
  if (!root) return result;
  inorder(root.left, result);
  result.push(root.val); // Visit Root
  inorder(root.right, result);
  return result;
}`,
    commonMistakes: [
      "Checking only local parent-child condition instead of the global BST invariant (every left node < all ancestors).",
      "Handling the 2-child deletion case incorrectly without finding the in-order successor.",
    ],
    practiceRecommendation: "Critical prerequisite gap! Solve 4 targeted problems on BST validation and in-order traversal.",
    diagnosticNotes: "Prerequisite gap (38% score): Diagnostic revealed confusion between binary trees vs BST invariants.",
    keyFormulas: ["BST invariant: Max(LeftSubtree) < Root < Min(RightSubtree)", "Inorder Traversal: Left -> Root -> Right (Sorted)"],
  },
  {
    id: "heaps-pq",
    name: "Heaps & Priority Queues",
    subjectId: "sub_dsa",
    levelTag: "Concept",
    status: "learning",
    masteryScore: 42,
    confidence: "Low",
    importance: "Core",
    estimatedMinutes: 25,
    x: 800,
    y: 90,
    prerequisites: ["bst-trees"],
    nextSkills: ["graph-algo"],
    description: "Min-heap and max-heap array representation, bottom-up O(n) heapify, sift-up/down, and top-K streaming.",
    whyItMatters: "Essential for Dijkstra's shortest path, event simulators, and k-way stream merging.",
    practicalUsage: "Task scheduling priority schedulers, streaming top-K trending metrics, and Huffman coding compression.",
    codeExample: `// Array-based Binary Heap index formulas
// Parent(i) = Math.floor((i - 1) / 2)
// LeftChild(i) = 2 * i + 1
// RightChild(i) = 2 * i + 2

function siftDown(heap: number[], n: number, i: number) {
  let smallest = i;
  const left = 2 * i + 1, right = 2 * i + 2;
  if (left < n && heap[left] < heap[smallest]) smallest = left;
  if (right < n && heap[right] < heap[smallest]) smallest = right;
  if (smallest !== i) {
    [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
    siftDown(heap, n, smallest);
  }
}`,
    commonMistakes: [
      "Assuming a binary heap is sorted like a BST (heaps only guarantee root is extremum).",
      "Thinking building a heap takes O(n log n) instead of linear O(n) bottom-up heapify.",
    ],
    practiceRecommendation: "Recommended after clearing the Binary Search Tree prerequisite gap.",
    diagnosticNotes: "42% score: Partially remembers parent-child indexing; needs practice on sift-down logic.",
    keyFormulas: ["Parent(i) = (i - 1) // 2", "Heapify All: O(n) linear time", "Extract Min: O(log n)"],
  },
  {
    id: "dp-opt",
    name: "Dynamic Programming",
    subjectId: "sub_dsa",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 32,
    confidence: "Low",
    importance: "Critical",
    estimatedMinutes: 30,
    x: 660,
    y: 220,
    prerequisites: ["asymptotic"],
    nextSkills: ["graph-algo"],
    isPrerequisiteGap: true,
    description: "Optimal substructure, overlapping subproblems, memoization vs tabulation, and state transition equations.",
    whyItMatters: "Essential for combinatorial optimization, string DNA sequence alignment, and algorithmic interview prep.",
    practicalUsage: "Resource allocation knapsack algorithms, text diffing (Levenshtein distance), and compiler instruction scheduling.",
    codeExample: `// 0/1 Knapsack State Transition (Memoization)
function knapsack(weights: number[], values: number[], capacity: number): number {
  const memo = new Map<string, number>();
  function solve(i: number, w: number): number {
    if (i >= weights.length || w <= 0) return 0;
    const key = \`\${i}-\${w}\`;
    if (memo.has(key)) return memo.get(key)!;
    
    // Choice 1: Skip item
    let ans = solve(i + 1, w);
    // Choice 2: Include item if capacity allows
    if (weights[i] <= w) {
      ans = Math.max(ans, values[i] + solve(i + 1, w - weights[i]));
    }
    memo.set(key, ans);
    return ans;
  }
  return solve(0, capacity);
}`,
    commonMistakes: [
      "Trying greedy solutions when overlapping subproblem constraints require global DP optimization.",
      "Off-by-one errors when initializing base cases in 2D tabulation tables.",
    ],
    practiceRecommendation: "Formulate recurrence relations on paper before attempting code implementation.",
    diagnosticNotes: "Prerequisite gap (32% score): Struggles to formulate state transition equations.",
    keyFormulas: ["Optimal Substructure: Solution(N) = optimal(Solution(N-k))", "dp[i] = min(dp[i - coin] + 1)"],
  },
  {
    id: "graph-algo",
    name: "Graph Algorithms",
    subjectId: "sub_dsa",
    levelTag: "Milestone",
    status: "not_started",
    masteryScore: 20,
    confidence: "Low",
    importance: "High",
    estimatedMinutes: 30,
    x: 940,
    y: 160,
    prerequisites: ["bst-trees", "stacks-queues"],
    nextSkills: [],
    description: "Adjacency lists, BFS shortest path, DFS connected components, Topological Sorting, and Dijkstra.",
    whyItMatters: "Powers social network graphs, GPS pathfinding, package build dependency resolution, and network routing.",
    practicalUsage: "Google Maps routing (Dijkstra/A*), social recommendation follower networks, and Web crawlers.",
    codeExample: `// Breadth-First Search (BFS) using FIFO Queue
function bfs(adjList: Map<number, number[]>, start: number): number[] {
  const visited = new Set<number>([start]);
  const queue: number[] = [start];
  const order: number[] = [];

  while (queue.length > 0) {
    const node = queue.shift()!;
    order.push(node);
    for (const neighbor of adjList.get(node) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  return order;
}`,
    commonMistakes: [
      "Forgetting to mark nodes visited upon queue entry, leading to duplicate node processing and cycles.",
      "Using an adjacency matrix for sparse graphs (wasting O(V²) memory).",
    ],
    practiceRecommendation: "Locked until Binary Search Trees and DP fundamentals are reinforced.",
    diagnosticNotes: "Milestone queued after BST prerequisite gap is resolved.",
    keyFormulas: ["BFS uses FIFO Queue -> Shortest Path in unweighted graphs", "Dijkstra: dist[v] = min(dist[v], dist[u] + w(u,v))"],
  },
];

export const DSA_EDGES: EdgeDefinition[] = [
  { from: "asymptotic", to: "arrays-ptrs", status: "satisfied", label: "Satisfied (88%)" },
  { from: "arrays-ptrs", to: "linked-lists", status: "satisfied", label: "Satisfied (90%)" },
  { from: "linked-lists", to: "stacks-queues", status: "satisfied", label: "Satisfied (74%)" },
  { from: "arrays-ptrs", to: "bst-trees", status: "blocking", label: "⚠️ Prerequisite Gap (38%)" },
  { from: "bst-trees", to: "heaps-pq", status: "locked", label: "Locked (Prereq Needed)" },
  { from: "asymptotic", to: "dp-opt", status: "blocking", label: "⚠️ Weak Gap (32%)" },
  { from: "bst-trees", to: "graph-algo", status: "locked", label: "Locked Milestone" },
];

export type SupportedSubject = "Python" | "DSA" | "Maths" | "DBMS" | "OS" | "CN" | string;

export function getSubjectGraphData(subject: string) {
  const norm = (subject || "").toLowerCase();
  if (norm.includes("python") || norm === "py" || norm.includes("py-101")) {
    return { skills: PYTHON_SKILLS, edges: PYTHON_EDGES, defaultSelected: "py-funcs" };
  }
  if (norm.includes("dsa") || norm.includes("data struct") || norm.includes("algorithm") || norm.includes("tree")) {
    return { skills: DSA_SKILLS, edges: DSA_EDGES, defaultSelected: "bst-trees" };
  }
  if (norm.includes("os") || norm.includes("operat")) {
    return { skills: OS_SKILLS, edges: OS_EDGES, defaultSelected: "deadlocks" };
  }
  if (norm.includes("cn") || norm.includes("network")) {
    return { skills: CN_SKILLS, edges: CN_EDGES, defaultSelected: "ip-subnet" };
  }
  if (norm.includes("dbms") || norm.includes("data") || norm.includes("sql")) {
    return { skills: DBMS_SKILLS, edges: DBMS_EDGES, defaultSelected: "normalization" };
  }
  if (norm.includes("math")) {
    return { skills: MATH_SKILLS, edges: MATH_EDGES, defaultSelected: "factorisation" };
  }
  return { skills: PYTHON_SKILLS, edges: PYTHON_EDGES, defaultSelected: "py-funcs" };
}

interface SkillGraphProps {
  subject?: SupportedSubject;
  compact?: boolean;
  onSelectNode?: (node: SkillNode) => void;
}

export default function SkillGraph({
  subject = "Maths",
  compact = false,
  onSelectNode,
}: SkillGraphProps) {
  const graphData = getSubjectGraphData(subject);
  const [skillsList, setSkillsList] = useState<SkillNode[]>(graphData.skills);
  const edges = graphData.edges;

  // Sync when subject prop changes
  React.useEffect(() => {
    const nextData = getSubjectGraphData(subject);
    setSkillsList(nextData.skills);
    setSelectedNodeId(nextData.defaultSelected);
  }, [subject]);

  const [selectedNodeId, setSelectedNodeId] = useState<string>(graphData.defaultSelected);
  const [viewMode, setViewMode] = useState<"network" | "tree">("network");
  const [filter, setFilter] = useState<"all" | "weak" | "active">("all");

  const selectedNode = skillsList.find((s) => s.id === selectedNodeId) || skillsList[1];

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNodeId(node.id);
    if (onSelectNode) onSelectNode(node);
  };

  // Interactive judge simulation: toggle mastery of weak prerequisite
  const handleSimulateMastery = (nodeId: string) => {
    setSkillsList((prev) =>
      prev.map((node) => {
        if (node.id === nodeId) {
          const isNowMastered = node.masteryScore < 70;
          return {
            ...node,
            status: isNowMastered ? "mastered" : "weak",
            masteryScore: isNowMastered ? 82 : 38,
            isPrerequisiteGap: !isNowMastered,
            diagnosticNotes: isNowMastered
              ? "Prerequisite cleared! Successfully mastered monic trinomials with 82% accuracy."
              : "Critical prerequisite gap! Missed 3 of 4 trinomial factor decomposition questions.",
          };
        }
        return node;
      })
    );
  };

  const getStatusColor = (status: SkillStatus, isGap?: boolean) => {
    if (isGap || status === "weak") {
      return {
        bg: "bg-rose-50",
        border: "border-rose-400",
        ring: "ring-4 ring-rose-500/20",
        text: "text-rose-700",
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        svgFill: "#f43f5e",
        svgStroke: "#e11d48",
      };
    }
    switch (status) {
      case "mastered":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-300",
          ring: "ring-2 ring-emerald-500/15",
          text: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          svgFill: "#10b981",
          svgStroke: "#059669",
        };
      case "practicing":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-400",
          ring: "ring-4 ring-indigo-500/20",
          text: "text-indigo-700",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
          svgFill: "#6366f1",
          svgStroke: "#4f46e5",
        };
      case "learning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-300",
          ring: "ring-2 ring-amber-500/15",
          text: "text-amber-700",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          svgFill: "#f59e0b",
          svgStroke: "#d97706",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-300",
          ring: "",
          text: "text-slate-500",
          badge: "bg-slate-100 text-slate-600 border-slate-200",
          svgFill: "#94a3b8",
          svgStroke: "#64748b",
        };
    }
  };

  const filteredSkills = skillsList.filter((s) => {
    if (filter === "weak") return s.status === "weak" || s.isPrerequisiteGap;
    if (filter === "active") return s.status === "practicing" || s.status === "learning";
    return true;
  });

  return (
    <div className={`bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden ${compact ? "p-4 sm:p-5" : "p-6 sm:p-8"}`}>
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-xs">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Visual Knowledge & Skill Graph
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {subject}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Visual topology mapping prerequisite dependencies. Red halo marks learning bottlenecks.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode Toggle & Filters */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {/* View Mode (Network vs Tree) */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-bold text-slate-700">
            <button
              type="button"
              onClick={() => setViewMode("network")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "network" ? "bg-white text-indigo-700 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>2D Network</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("tree")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === "tree" ? "bg-white text-indigo-700 shadow-2xs font-extrabold" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Hierarchy Tree</span>
            </button>
          </div>

          {/* Filters */}
          {!compact && (
            <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setFilter("all")}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filter === "all" ? "bg-white text-slate-900 shadow-2xs font-bold" : "text-slate-500"
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setFilter("weak")}
                className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all cursor-pointer ${
                  filter === "weak" ? "bg-rose-50 text-rose-700 shadow-2xs font-extrabold" : "text-slate-500"
                }`}
              >
                <AlertTriangle className="w-3 h-3 text-rose-500" />
                <span>Gaps Only</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main View Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* GRAPH VIEWPORT (Left/Center Column) */}
        <div className={`${compact ? "lg:col-span-12" : "lg:col-span-7"} space-y-4`}>
          {/* Status Legend */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered (80%+)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 ring-2 ring-indigo-300" /> Focus (Practicing)
              </span>
              <span className="flex items-center gap-1.5 font-bold text-rose-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Prerequisite Gap (Blocked)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Locked Milestone
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">Click node to inspect</span>
          </div>

          {/* VIEW 1: 2D VISUAL NETWORK GRAPH (SVG TOPOLOGY) */}
          {viewMode === "network" ? (
            <div className="relative w-full rounded-2xl border border-slate-200 bg-gradient-to-b from-slate-50/70 via-white to-indigo-50/30 p-2 sm:p-4 overflow-x-auto shadow-inner min-h-[340px]">
              <svg
                viewBox="0 0 1020 320"
                className="w-full min-w-[700px] h-[310px] select-none"
              >
                <defs>
                  {/* Directed Arrow Markers */}
                  <marker
                    id="arrow-emerald"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#10b981" />
                  </marker>
                  <marker
                    id="arrow-rose"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#f43f5e" />
                  </marker>
                  <marker
                    id="arrow-indigo"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                  </marker>
                  <marker
                    id="arrow-slate"
                    viewBox="0 0 10 10"
                    refX="24"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
                  </marker>
                </defs>

                {/* Grid guidelines */}
                <line x1="50" y1="160" x2="970" y2="160" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="4 4" />

                {/* EDGES (Connection Curves) */}
                {edges.map((edge, idx) => {
                  const fromNode = skillsList.find((s) => s.id === edge.from);
                  const toNode = skillsList.find((s) => s.id === edge.to);
                  if (!fromNode || !toNode) return null;

                  const isBlocking = edge.status === "blocking" || fromNode.isPrerequisiteGap;
                  const isSatisfied = edge.status === "satisfied";
                  const isLocked = edge.status === "locked";

                  const strokeColor = isBlocking
                    ? "#f43f5e"
                    : isSatisfied
                    ? "#10b981"
                    : isLocked
                    ? "#cbd5e1"
                    : "#6366f1";

                  const strokeWidth = isBlocking ? 3.5 : isSatisfied ? 2.5 : 2;
                  const markerId = isBlocking
                    ? "url(#arrow-rose)"
                    : isSatisfied
                    ? "url(#arrow-emerald)"
                    : isLocked
                    ? "url(#arrow-slate)"
                    : "url(#arrow-indigo)";

                  // Curved Bézier path calculation
                  const dx = toNode.x - fromNode.x;
                  const dy = toNode.y - fromNode.y;
                  const cx1 = fromNode.x + dx * 0.5;
                  const cy1 = fromNode.y;
                  const cx2 = fromNode.x + dx * 0.5;
                  const cy2 = toNode.y;
                  const pathData = `M ${fromNode.x} ${fromNode.y} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${toNode.x} ${toNode.y}`;

                  // Midpoint for badge
                  const midX = (fromNode.x + toNode.x) / 2;
                  const midY = (fromNode.y + toNode.y) / 2;

                  return (
                    <g key={idx} className="transition-all duration-300">
                      <path
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        strokeDasharray={isLocked ? "6 6" : isBlocking ? "8 4" : "none"}
                        markerEnd={markerId}
                        className={isBlocking ? "animate-pulse" : ""}
                      />

                      {/* Edge Label Badge */}
                      {edge.label && (
                        <g transform={`translate(${midX}, ${midY - 14})`}>
                          <rect
                            x="-70"
                            y="-9"
                            width="140"
                            height="18"
                            rx="9"
                            fill={isBlocking ? "#ffe4e6" : isSatisfied ? "#ecfdf5" : "#f8fafc"}
                            stroke={isBlocking ? "#f43f5e" : isSatisfied ? "#a7f3d0" : "#e2e8f0"}
                            strokeWidth="1"
                          />
                          <text
                            x="0"
                            y="3"
                            textAnchor="middle"
                            fontSize="9"
                            fontWeight="bold"
                            fill={isBlocking ? "#9f1239" : isSatisfied ? "#065f46" : "#475569"}
                          >
                            {edge.label}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* NODES (Interactive Pins) */}
                {skillsList.map((node) => {
                  const isSelected = selectedNodeId === node.id;
                  const colors = getStatusColor(node.status, node.isPrerequisiteGap);
                  const isGap = node.isPrerequisiteGap;

                  return (
                    <g
                      key={node.id}
                      transform={`translate(${node.x}, ${node.y})`}
                      onClick={() => handleNodeClick(node)}
                      className="cursor-pointer group"
                    >
                      {/* Pulsing Aura for Prerequisite Gap or Current Focus */}
                      {isGap && (
                        <circle
                          r="38"
                          fill="#f43f5e"
                          opacity="0.18"
                          className="animate-ping"
                        />
                      )}
                      {node.status === "practicing" && (
                        <circle
                          r="36"
                          fill="#6366f1"
                          opacity="0.15"
                          className="animate-pulse"
                        />
                      )}

                      {/* Selection Ring */}
                      {isSelected && (
                        <circle
                          r="35"
                          fill="none"
                          stroke="#4f46e5"
                          strokeWidth="3.5"
                          strokeDasharray="4 2"
                        />
                      )}

                      {/* Node Outer Circle */}
                      <circle
                        r="28"
                        fill={isGap ? "#fff1f2" : "#ffffff"}
                        stroke={colors.svgStroke}
                        strokeWidth={isSelected ? 4 : 2.5}
                        className="transition-transform duration-200 group-hover:scale-110 shadow-md"
                      />

                      {/* Node Icon / Symbol */}
                      {node.status === "mastered" ? (
                        <text
                          y="5"
                          textAnchor="middle"
                          fontSize="18"
                          fontWeight="bold"
                          fill="#059669"
                        >
                          ✓
                        </text>
                      ) : isGap ? (
                        <text
                          y="5"
                          textAnchor="middle"
                          fontSize="16"
                          fontWeight="bold"
                          fill="#e11d48"
                        >
                          ⚠️
                        </text>
                      ) : node.status === "not_started" ? (
                        <text
                          y="4"
                          textAnchor="middle"
                          fontSize="14"
                          fill="#94a3b8"
                        >
                          🔒
                        </text>
                      ) : (
                        <text
                          y="5"
                          textAnchor="middle"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="monospace"
                          fill={colors.svgStroke}
                        >
                          {node.masteryScore}%
                        </text>
                      )}

                      {/* Tag pill above node */}
                      <g transform="translate(0, -36)">
                        <rect
                          x="-32"
                          y="-8"
                          width="64"
                          height="16"
                          rx="8"
                          fill={isGap ? "#ffe4e6" : "#f1f5f9"}
                          stroke={isGap ? "#fda4af" : "#e2e8f0"}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="3"
                          textAnchor="middle"
                          fontSize="8"
                          fontWeight="bold"
                          fill={isGap ? "#be123c" : "#475569"}
                          letterSpacing="0.5"
                        >
                          {node.levelTag.toUpperCase()}
                        </text>
                      </g>

                      {/* Node Title & Mastery beneath */}
                      <text
                        x="0"
                        y="42"
                        textAnchor="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill="#0f172a"
                        className="group-hover:fill-indigo-600 transition-colors"
                      >
                        {node.name.length > 18 ? node.name.substring(0, 16) + "…" : node.name}
                      </text>
                      <text
                        x="0"
                        y="54"
                        textAnchor="middle"
                        fontSize="10"
                        fontWeight="600"
                        fill={isGap ? "#e11d48" : node.status === "mastered" ? "#059669" : "#64748b"}
                      >
                        {isGap ? "PREREQUISITE GAP" : `${node.masteryScore}% Mastery`}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          ) : (
            /* VIEW 2: HIERARCHY TREE VIEW (Goal -> Skill -> Concept -> Prerequisite -> Milestone) */
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-indigo-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Goal Hierarchy Root:
                  </span>
                  <strong className="text-sm font-bold">
                    {subject === "Maths" ? "Improve High-School Mathematics" : "Master Relational Databases"}
                  </strong>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-full bg-white/20 text-white font-mono">
                  72% Track Progress
                </span>
              </div>

              <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
                {filteredSkills.map((node, idx) => {
                  const isSelected = selectedNodeId === node.id;
                  const colors = getStatusColor(node.status, node.isPrerequisiteGap);
                  return (
                    <div
                      key={node.id}
                      onClick={() => handleNodeClick(node)}
                      className={`relative p-4 rounded-2xl border transition-all duration-200 cursor-pointer ${colors.bg} ${
                        isSelected ? "border-indigo-600 ring-2 ring-indigo-600/20 translate-x-1 shadow-sm" : "hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <span
                            className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 ${
                              node.isPrerequisiteGap
                                ? "bg-rose-600 text-white shadow-xs animate-bounce-gentle"
                                : node.status === "mastered"
                                ? "bg-emerald-600 text-white"
                                : "bg-slate-200 text-slate-700"
                            }`}
                          >
                            {node.status === "mastered" ? "✓" : idx + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                                {node.levelTag}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900">{node.name}</h4>
                              {node.isPrerequisiteGap && (
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1 animate-pulse">
                                  <ShieldAlert className="w-3 h-3" />
                                  Prerequisite Gap
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-600 mt-1 line-clamp-1">{node.description}</p>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <span className="text-xs font-mono font-bold text-slate-900 block">
                            {node.masteryScore}%
                          </span>
                          <span className="text-[10px] text-slate-400 capitalize">
                            {node.status.replace("_", " ")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* NODE INSPECTOR HUD (Right Column) */}
        {!compact && selectedNode && (
          <div className="lg:col-span-5 bg-gradient-to-b from-slate-50 to-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 space-y-4 shadow-sm animate-scale-in">
            {/* HUD Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Concept Inspector
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 text-[10px] font-mono font-bold">
                  {selectedNode.levelTag}
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedNode.status, selectedNode.isPrerequisiteGap).badge}`}>
                {selectedNode.isPrerequisiteGap ? "PREREQUISITE GAP" : selectedNode.status.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 className="text-xl font-extrabold text-slate-900 tracking-tight">{selectedNode.name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{selectedNode.description}</p>
            </div>

            {/* Prerequisite Alert Box if Weak */}
            {selectedNode.isPrerequisiteGap ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5 shadow-2xs">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>Prerequisite Gap Identified</span>
                </div>
                <p className="text-xs text-rose-700 leading-snug">
                  {selectedNode.diagnosticNotes}
                </p>
                <div className="pt-1 flex items-center justify-between text-[11px] text-rose-800">
                  <span>Blocks Next Concept:</span>
                  <strong className="underline">
                    {skillsList.find((s) => s.id === selectedNode.nextSkills[0])?.name || "Next Milestone"}
                  </strong>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-slate-100/70 border border-slate-200/80 text-xs text-slate-700">
                <span className="font-bold block mb-0.5 text-slate-800">Diagnostic Calibrated:</span>
                <p>{selectedNode.diagnosticNotes}</p>
              </div>
            )}

            {/* Mastery Meter */}
            <div className="space-y-1.5 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-600">Mastery Level</span>
                <span className="font-mono text-slate-900 text-sm">{selectedNode.masteryScore}%</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedNode.masteryScore >= 70
                      ? "bg-emerald-500"
                      : selectedNode.masteryScore >= 40
                      ? "bg-indigo-600"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(selectedNode.masteryScore, 5)}%` }}
                />
              </div>
            </div>

            {/* Key Formulas or Rules */}
            {selectedNode.keyFormulas && selectedNode.keyFormulas.length > 0 && (
              <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs space-y-1">
                <span className="font-extrabold text-indigo-900 text-[10px] uppercase tracking-wider block">
                  Core Formulas / Rules:
                </span>
                <div className="space-y-1">
                  {selectedNode.keyFormulas.map((f, i) => (
                    <code key={i} className="block text-[11px] font-mono text-indigo-800 bg-white px-2 py-1 rounded-md border border-indigo-100">
                      {f}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {/* Why This Skill Matters */}
            <div className="p-3 rounded-2xl bg-white border border-slate-200/80 text-xs space-y-1">
              <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider block">
                Educational Impact:
              </span>
              <p className="text-slate-600 leading-relaxed">{selectedNode.whyItMatters}</p>
            </div>

            {/* Practical Real-World Usage */}
            {selectedNode.practicalUsage && (
              <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100 text-xs space-y-1">
                <span className="font-extrabold text-emerald-900 text-[10px] uppercase tracking-wider block">
                  Real-World Industry Usage:
                </span>
                <p className="text-emerald-800 leading-relaxed">{selectedNode.practicalUsage}</p>
              </div>
            )}

            {/* Code / Practical Example */}
            {selectedNode.codeExample && (
              <div className="p-3 rounded-2xl bg-slate-900 text-slate-100 text-xs space-y-1.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                    Working Example:
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Code Snippet</span>
                </div>
                <pre className="p-2.5 rounded-xl bg-slate-950 text-indigo-200 font-mono text-[11px] overflow-x-auto leading-relaxed border border-slate-800 whitespace-pre">
                  {selectedNode.codeExample}
                </pre>
              </div>
            )}

            {/* Common Mistakes */}
            {selectedNode.commonMistakes && selectedNode.commonMistakes.length > 0 && (
              <div className="p-3 rounded-2xl bg-amber-50/60 border border-amber-100 text-xs space-y-1.5">
                <span className="font-extrabold text-amber-900 text-[10px] uppercase tracking-wider block">
                  Common Pitfalls & Mistakes:
                </span>
                <ul className="space-y-1 list-disc list-inside text-amber-800 text-[11px]">
                  {selectedNode.commonMistakes.map((m, idx) => (
                    <li key={idx} className="leading-snug">{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Practice Recommendation */}
            {selectedNode.practiceRecommendation && (
              <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs space-y-1">
                <span className="font-extrabold text-purple-900 text-[10px] uppercase tracking-wider block">
                  Practice Recommendation:
                </span>
                <p className="text-purple-800 leading-relaxed font-medium">{selectedNode.practiceRecommendation}</p>
              </div>
            )}

            {/* Judge Interactive Simulator Button */}
            {selectedNode.isPrerequisiteGap && (
              <button
                type="button"
                onClick={() => handleSimulateMastery(selectedNode.id)}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-xs font-bold transition-all cursor-pointer"
                title="Click to simulate completing this prerequisite in practice"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-700" />
                <span>Simulate Remediating Prerequisite Gap (+44%)</span>
              </button>
            )}

            {/* Direct Action Triggers */}
            <div className="space-y-2 pt-1">
              <Link
                href={`/tutor?topic=${encodeURIComponent(selectedNode.name)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Teach Me via AI Coach ({selectedNode.estimatedMinutes} min)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href={`/practice?topic=${encodeURIComponent(selectedNode.name)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 transition-all cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Practice Adaptive Questions</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
