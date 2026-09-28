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

export type SkillStatus = "mastered" | "practicing" | "learning" | "weak" | "not_started";

export interface SkillNode {
  id: string;
  name: string;
  levelTag: "Goal" | "Foundation" | "Prerequisite" | "Concept" | "Milestone";
  status: SkillStatus;
  masteryScore: number;
  estimatedMinutes: number;
  x: number; // 2D layout coordinate X
  y: number; // 2D layout coordinate Y
  prerequisites: string[]; // Upstream node IDs
  nextSkills: string[]; // Downstream node IDs
  isPrerequisiteGap?: boolean;
  description: string;
  whyItMatters: string;
  diagnosticNotes: string;
  keyFormulas?: string[];
}

export interface EdgeDefinition {
  from: string;
  to: string;
  status: "satisfied" | "blocking" | "active" | "locked";
  label?: string;
}

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
    levelTag: "Foundation",
    status: "mastered",
    masteryScore: 88,
    estimatedMinutes: 15,
    x: 120,
    y: 160,
    prerequisites: [],
    nextSkills: ["recursion-bst"],
    description: "Big-O, Big-Omega, Big-Theta, and Master Theorem for divide-and-conquer.",
    whyItMatters: "Crucial for evaluating runtime performance and scalable engineering decisions.",
    diagnosticNotes: "Demonstrated 88% accuracy in asymptotic recurrence comparisons.",
    keyFormulas: ["Master Theorem: T(n) = aT(n/b) + O(n^d)", "O(1) < O(log n) < O(n) < O(n log n) < O(n²)"],
  },
  {
    id: "recursion-bst",
    name: "Binary Search Trees",
    levelTag: "Concept",
    status: "practicing",
    masteryScore: 74,
    estimatedMinutes: 20,
    x: 380,
    y: 90,
    prerequisites: ["asymptotic"],
    nextSkills: ["dp-opt"],
    description: "BST invariant, balanced AVL rotations, inorder traversal, and predecessor/successor logic.",
    whyItMatters: "Foundation for logarithmic search, associative containers, and index trees.",
    diagnosticNotes: "Understands BST search; AVL double rotations need review.",
    keyFormulas: ["Inorder: Left -> Root -> Right", "Balance Factor: Height(L) - Height(R)"],
  },
  {
    id: "dp-opt",
    name: "Dynamic Programming",
    levelTag: "Prerequisite",
    status: "weak",
    masteryScore: 32,
    estimatedMinutes: 30,
    x: 640,
    y: 160,
    prerequisites: ["asymptotic"],
    nextSkills: ["graph-algo"],
    isPrerequisiteGap: true,
    description: "Optimal substructure, overlapping subproblems, memoization, and state transitions.",
    whyItMatters: "Essential for advanced optimization problems, interview prep, and graph shortest paths.",
    diagnosticNotes: "Prerequisite gap: Struggled to formulate recurrence relations and 2D table state transitions.",
    keyFormulas: ["dp[i] = min(dp[i - coin] + 1)", "Knapsack: dp[i][w] = max(dp[i-1][w], val + dp[i-1][w-wt])"],
  },
  {
    id: "graph-algo",
    name: "Graph Algorithms",
    levelTag: "Milestone",
    status: "learning",
    masteryScore: 50,
    estimatedMinutes: 30,
    x: 880,
    y: 160,
    prerequisites: ["dp-opt"],
    nextSkills: [],
    description: "BFS, DFS, topological sorting, Dijkstra shortest paths, and minimum spanning trees.",
    whyItMatters: "Powers recommendation engines, routing, dependency resolution, and network flow.",
    diagnosticNotes: "Blocked until Dynamic Programming & State transition fundamentals are fortified.",
    keyFormulas: ["Dijkstra: dist[v] = min(dist[v], dist[u] + weight(u,v))"],
  },
];

export const DSA_EDGES: EdgeDefinition[] = [
  { from: "asymptotic", to: "recursion-bst", status: "satisfied", label: "Satisfied (88%)" },
  { from: "recursion-bst", to: "dp-opt", status: "blocking", label: "⚠️ Prerequisite Gap" },
  { from: "dp-opt", to: "graph-algo", status: "locked", label: "Locked Milestone" },
];

export type SupportedSubject = "Maths" | "DBMS" | "OS" | "CN" | "DSA" | string;

export function getSubjectGraphData(subject: string) {
  const norm = subject.toLowerCase();
  if (norm.includes("os") || norm.includes("operat")) {
    return { skills: OS_SKILLS, edges: OS_EDGES, defaultSelected: "deadlocks" };
  }
  if (norm.includes("cn") || norm.includes("network")) {
    return { skills: CN_SKILLS, edges: CN_EDGES, defaultSelected: "ip-subnet" };
  }
  if (norm.includes("dsa") || norm.includes("data struct") || norm.includes("algorithm")) {
    return { skills: DSA_SKILLS, edges: DSA_EDGES, defaultSelected: "dp-opt" };
  }
  if (norm.includes("dbms") || norm.includes("data") || norm.includes("sql")) {
    return { skills: DBMS_SKILLS, edges: DBMS_EDGES, defaultSelected: "normalization" };
  }
  return { skills: MATH_SKILLS, edges: MATH_EDGES, defaultSelected: "factorisation" };
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
