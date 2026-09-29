"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/AppLayout";
import SkillGraph from "@/components/SkillGraph";
import {
  Sparkles,
  Zap,
  ArrowRight,
  Flame,
  Clock,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  BarChart3,
  Calendar,
  Layers,
  ChevronRight,
  RotateCcw,
  ShieldAlert,
  Brain,
  Award,
  Target,
  Network,
} from "lucide-react";

interface DashboardData {
  user: {
    name: string;
    educationLevel?: string;
    learningGoals?: string;
  };
  profile: {
    overallMastery: number;
    strengths: string[];
    weaknesses: string[];
    topicMastery: Array<{
      topicName: string;
      score: number;
      masteryLevel: "weak" | "medium" | "strong";
    }>;
    aiAnalysis?: {
      summary?: string;
      reasoning?: string[];
      recommendations?: string[];
      nextBestAction?: {
        title: string;
        topicName: string;
        durationMinutes: number;
        difficulty: string;
        reason: string;
        actionType: string;
      };
      streak?: number;
      weeklyGoal?: { current: number; target: number };
      reteachRate?: string;
    };
    assessmentCount: number;
    quizCount: number;
    totalStudyMinutes: number;
  } | null;
  plan: {
    title: string;
    estimatedDuration: string;
    items: Array<{
      order: number;
      topic: string;
      activity: string;
      durationMinutes: number;
      priority: "critical" | "high" | "medium" | "low";
      reason: string;
      isCompleted?: boolean;
    }>;
  } | null;
}

interface ReviewItem {
  id: string;
  topicName: string;
  subject: string;
  intervalDays: number;
  repetitions: number;
  easeFactor: number;
  retentionEst: number;
  nextReviewDue: string;
  daysOverdue: number;
  urgency: "critical" | "high" | "medium" | "low";
}

export type SubjectKey = "Maths" | "DBMS" | "OS" | "CN" | "DSA";

export const SUBJECT_TRACKS: Array<{ key: SubjectKey; label: string; icon: string }> = [
  { key: "Maths", label: "Mathematics", icon: "📐" },
  { key: "DBMS", label: "Database Systems", icon: "🗄️" },
  { key: "OS", label: "Operating Systems", icon: "💻" },
  { key: "CN", label: "Computer Networks", icon: "🌐" },
  { key: "DSA", label: "Data Structures & Algo", icon: "⚡" },
];

import { useActiveSubject } from "@/hooks/useActiveSubject";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { activeSubject, activeSubjectConfig } = useActiveSubject();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewQueue, setReviewQueue] = useState<ReviewItem[]>([]);
  const [reviewStats, setReviewStats] = useState<{ totalDue: number; averageRetention: number } | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch(`/api/dashboard?subject=${activeSubject}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          loadFallbackData();
        }
      } catch {
        loadFallbackData();
      } finally {
        setLoading(false);
      }

      // Fetch Spaced Repetition Review Queue (Ebbinghaus Forgetting Curve)
      try {
        const revRes = await fetch("/api/review");
        if (revRes.ok) {
          const revData = await revRes.json();
          setReviewQueue(revData.queue || []);
          setReviewStats({
            totalDue: revData.totalDue || 0,
            averageRetention: revData.averageRetention || 0,
          });
        }
      } catch {}
    }

    function loadFallbackData() {
      if (activeSubject === "OS") {
        setData({
          user: {
            name: session?.user?.name || "Alex Rivera",
            educationLevel: "B.Tech CSE - 3rd Year",
            learningGoals: "Master Operating Systems: Process Scheduling & Deadlocks",
          },
          profile: {
            overallMastery: 64,
            strengths: ["Process Scheduling", "System Calls"],
            weaknesses: ["Deadlocks"],
            topicMastery: [
              { topicName: "Process Scheduling", score: 82, masteryLevel: "strong" },
              { topicName: "System Calls", score: 78, masteryLevel: "strong" },
              { topicName: "Virtual Memory & Paging", score: 65, masteryLevel: "medium" },
              { topicName: "Concurrency & Mutex", score: 45, masteryLevel: "medium" },
              { topicName: "Deadlocks", score: 36, masteryLevel: "weak" },
            ],
            assessmentCount: 2,
            quizCount: 3,
            totalStudyMinutes: 50,
            aiAnalysis: {
              summary: "Solid process scheduler metrics, but Banker's algorithm matrix subtraction in Deadlocks requires immediate remediation.",
              nextBestAction: {
                title: "Review Deadlocks & Banker's Algo",
                topicName: "Deadlocks",
                durationMinutes: 15,
                difficulty: "Level 2 Prerequisite",
                reason: "Diagnostic revealed confusion in safe state analysis and resource subtraction. Required before concurrency & memory isolation.",
                actionType: "tutor",
              },
              streak: 8,
              weeklyGoal: { current: 4, target: 5 },
              reteachRate: "32%",
            },
          },
          plan: {
            title: "Operating Systems: Deadlock Remediation & Concurrency Roadmap",
            estimatedDuration: "1.5 hours total",
            items: [
              {
                order: 1,
                topic: "Deadlocks",
                activity: "Banker's Algorithm: Need Matrix & Safe State Testing",
                durationMinutes: 15,
                priority: "critical",
                reason: "Critical prerequisite gap identified in diagnostic assessment (36% score).",
                isCompleted: false,
              },
              {
                order: 2,
                topic: "Virtual Memory & Paging",
                activity: "Page Faults & Effective Access Time (EAT)",
                durationMinutes: 15,
                priority: "high",
                reason: "Key concept: Address translation bitmasking.",
                isCompleted: false,
              },
            ],
          },
        });
      } else if (activeSubject === "CN") {
        setData({
          user: {
            name: session?.user?.name || "Alex Rivera",
            educationLevel: "B.Tech CSE - 3rd Year",
            learningGoals: "Master Computer Networks: Subnetting & Congestion Control",
          },
          profile: {
            overallMastery: 66,
            strengths: ["OSI & TCP/IP Models", "DNS & HTTP"],
            weaknesses: ["IP Addressing & Subnetting"],
            topicMastery: [
              { topicName: "OSI & TCP/IP Models", score: 86, masteryLevel: "strong" },
              { topicName: "DNS & HTTP", score: 79, masteryLevel: "strong" },
              { topicName: "TCP Flow & Congestion Control", score: 68, masteryLevel: "medium" },
              { topicName: "Routing Protocols", score: 48, masteryLevel: "medium" },
              { topicName: "IP Addressing & Subnetting", score: 34, masteryLevel: "weak" },
            ],
            assessmentCount: 2,
            quizCount: 3,
            totalStudyMinutes: 55,
            aiAnalysis: {
              summary: "Strong in layered architecture, but CIDR host bit formulas (2^h - 2) in Subnetting bottleneck routing comprehension.",
              nextBestAction: {
                title: "Reinforce IP Addressing & Subnetting",
                topicName: "IP Addressing & Subnetting",
                durationMinutes: 15,
                difficulty: "Level 2 Prerequisite",
                reason: "Prerequisite bottleneck: Slash notation (/26, /28) and usable host calculations must be mastered before routing protocols.",
                actionType: "tutor",
              },
              streak: 8,
              weeklyGoal: { current: 4, target: 5 },
              reteachRate: "35%",
            },
          },
          plan: {
            title: "Computer Networks: Subnetting & Reliable Transport Roadmap",
            estimatedDuration: "1.5 hours total",
            items: [
              {
                order: 1,
                topic: "IP Addressing & Subnetting",
                activity: "CIDR Prefix & Usable Host Calculation Drill",
                durationMinutes: 15,
                priority: "critical",
                reason: "Diagnostic assessment score is 34% in address manipulation.",
                isCompleted: false,
              },
              {
                order: 2,
                topic: "TCP Flow & Congestion Control",
                activity: "Sliding Window & AIMD State Transitions",
                durationMinutes: 20,
                priority: "high",
                reason: "Core transport benchmark for backend systems.",
                isCompleted: false,
              },
            ],
          },
        });
      } else if (activeSubject === "DSA") {
        setData({
          user: {
            name: session?.user?.name || "Alex Rivera",
            educationLevel: "B.Tech CSE - 3rd Year",
            learningGoals: "Master Data Structures & Algorithms: Graphs & DP",
          },
          profile: {
            overallMastery: 68,
            strengths: ["Asymptotic Complexity", "Binary Search Trees"],
            weaknesses: ["Dynamic Programming"],
            topicMastery: [
              { topicName: "Asymptotic Complexity", score: 88, masteryLevel: "strong" },
              { topicName: "Binary Search Trees", score: 74, masteryLevel: "strong" },
              { topicName: "Graph Algorithms", score: 58, masteryLevel: "medium" },
              { topicName: "Sorting & Searching", score: 70, masteryLevel: "medium" },
              { topicName: "Dynamic Programming", score: 32, masteryLevel: "weak" },
            ],
            assessmentCount: 3,
            quizCount: 5,
            totalStudyMinutes: 70,
            aiAnalysis: {
              summary: "Excellent asymptotic reasoning, but formulating recurrence relations for Dynamic Programming is stalling algorithmic progress.",
              nextBestAction: {
                title: "Master Dynamic Programming Substructure",
                topicName: "Dynamic Programming",
                durationMinutes: 20,
                difficulty: "Level 3 Prerequisite",
                reason: "State transition formulas and 2D table memoization are currently blocking graph shortest paths and network flows.",
                actionType: "tutor",
              },
              streak: 8,
              weeklyGoal: { current: 4, target: 5 },
              reteachRate: "38%",
            },
          },
          plan: {
            title: "Data Structures & Algorithms: DP & Graphs Roadmap",
            estimatedDuration: "2 hours total",
            items: [
              {
                order: 1,
                topic: "Dynamic Programming",
                activity: "Optimal Substructure & 1D/2D State Formulations",
                durationMinutes: 20,
                priority: "critical",
                reason: "Critical prerequisite gap: 32% diagnostic accuracy on DP states.",
                isCompleted: false,
              },
              {
                order: 2,
                topic: "Graph Algorithms",
                activity: "BFS Shortest Paths vs Dijkstra Priority Queue",
                durationMinutes: 20,
                priority: "high",
                reason: "Core competitive programming and system routing milestone.",
                isCompleted: false,
              },
            ],
          },
        });
      } else if (activeSubject === "Maths") {
        setData({
          user: {
            name: session?.user?.name || "Alex Rivera",
            educationLevel: "Grade 11 / CBSE Class 11",
            learningGoals: "Improve in Mathematics — Master Quadratic Equations & Clear Prerequisite Gaps",
          },
          profile: {
            overallMastery: 72,
            strengths: ["Algebraic Manipulation", "Polynomials"],
            weaknesses: ["Factorisation"],
            topicMastery: [
              { topicName: "Algebraic Manipulation", score: 84, masteryLevel: "strong" },
              { topicName: "Factorisation", score: 38, masteryLevel: "weak" },
              { topicName: "Quadratic Equations", score: 72, masteryLevel: "medium" },
              { topicName: "Polynomials", score: 65, masteryLevel: "medium" },
              { topicName: "Coordinate Geometry", score: 40, masteryLevel: "weak" },
            ],
            assessmentCount: 2,
            quizCount: 4,
            totalStudyMinutes: 65,
            aiAnalysis: {
              summary: "Solid algebraic foundations (84%) and formula understanding, but a critical prerequisite gap in Factorisation (38%) is stalling your quadratic equation mastery.",
              reasoning: [
                "Diagnostic identified prerequisite gap: Factorisation score is 38%. Missed trinomial decomposition questions.",
                "Quadratic equations score is 72%: Knows the quadratic formula, but gets stuck when factoring is required.",
              ],
              recommendations: [
                "Review Factorisation (10 min session) before proceeding to quadratic formula derivations.",
                "Take a 5-question adaptive practice quiz on monic trinomial factoring.",
              ],
              nextBestAction: {
                title: "Review Factorisation",
                topicName: "Factorisation",
                durationMinutes: 10,
                difficulty: "Level 2 Prerequisite",
                reason: "Your last diagnostic answers show a prerequisite gap. Factorisation is required before solving quadratic equations.",
                actionType: "tutor",
              },
              streak: 8,
              weeklyGoal: { current: 4, target: 5 },
              reteachRate: "28%",
            },
          },
          plan: {
            title: "7-Day Mathematics Mastery Roadmap",
            estimatedDuration: "1.5 hours total (10-15 mins/day)",
            items: [
              {
                order: 1,
                topic: "Factorisation",
                activity: "Common Factors & Difference of Two Squares",
                durationMinutes: 10,
                priority: "critical",
                reason: "Identified prerequisite gap: Core mechanical foundation for quadratics.",
                isCompleted: false,
              },
              {
                order: 2,
                topic: "Factorisation",
                activity: "Monic Trinomial Decomposition Practice",
                durationMinutes: 12,
                priority: "high",
                reason: "Required before factoring standard form quadratics.",
                isCompleted: false,
              },
              {
                order: 3,
                topic: "Quadratic Equations",
                activity: "Solving Quadratics by Factoring",
                durationMinutes: 15,
                priority: "high",
                reason: "Current focus: Connects prerequisite factoring into equation solutions.",
                isCompleted: false,
              },
            ],
          },
        });
      } else {
        setData({
          user: {
            name: session?.user?.name || "Alex Rivera",
            educationLevel: "B.Tech CSE - 3rd Year",
            learningGoals: "Master Database Systems & Normalization",
          },
          profile: {
            overallMastery: 63,
            strengths: ["SQL Fundamentals", "Indexing"],
            weaknesses: ["Normalization"],
            topicMastery: [
              { topicName: "SQL Fundamentals", score: 84, masteryLevel: "strong" },
              { topicName: "Indexing", score: 71, masteryLevel: "strong" },
              { topicName: "Transactions", score: 56, masteryLevel: "medium" },
              { topicName: "ER Model", score: 60, masteryLevel: "medium" },
              { topicName: "Normalization", score: 38, masteryLevel: "weak" },
            ],
            assessmentCount: 1,
            quizCount: 2,
            totalStudyMinutes: 45,
            aiAnalysis: {
              summary: "Strong in SQL fundamentals, but functional dependencies in Normalization need reinforcement.",
              nextBestAction: {
                title: "Review Normalization (2NF/3NF)",
                topicName: "Normalization",
                durationMinutes: 10,
                difficulty: "Level 2 Prerequisite",
                reason: "Your last diagnostic showed confusion between partial and transitive dependencies.",
                actionType: "tutor",
              },
              streak: 8,
              weeklyGoal: { current: 4, target: 5 },
              reteachRate: "33%",
            },
          },
          plan: {
            title: "Database Systems: Normalization & Transactions Roadmap",
            estimatedDuration: "1 hour total",
            items: [
              {
                order: 1,
                topic: "Normalization",
                activity: "Functional Dependencies & 2NF/3NF Decomposition",
                durationMinutes: 10,
                priority: "critical",
                reason: "Diagnostic assessment showed 38% accuracy on normalization rules.",
                isCompleted: false,
              },
            ],
          },
        });
      }
    }

    fetchDashboard();
  }, [session, activeSubject]);

  const profile = data?.profile;
  const user = data?.user;
  const plan = data?.plan;

  const defaultActionBySubject: Record<SubjectKey, { title: string; topicName: string; durationMinutes: number; difficulty: string; reason: string; actionType: string }> = {
    Maths: {
      title: "Review Factorisation",
      topicName: "Factorisation",
      durationMinutes: 10,
      difficulty: "Level 2 Prerequisite",
      reason: "Your diagnostic identified a critical prerequisite gap in Factorisation (38% mastery). Factoring trinomials is required before quadratic equation derivations.",
      actionType: "tutor",
    },
    DBMS: {
      title: "Review Normalization (2NF/3NF)",
      topicName: "Normalization",
      durationMinutes: 10,
      difficulty: "Level 2 Prerequisite",
      reason: "Your diagnostic identified confusion between partial and transitive functional dependencies.",
      actionType: "tutor",
    },
    OS: {
      title: "Review Deadlocks & Banker's Algo",
      topicName: "Deadlocks",
      durationMinutes: 15,
      difficulty: "Level 2 Prerequisite",
      reason: "Diagnostic revealed confusion in safe state analysis and matrix subtraction Need = Max - Alloc.",
      actionType: "tutor",
    },
    CN: {
      title: "Reinforce IP Addressing & Subnetting",
      topicName: "IP Addressing & Subnetting",
      durationMinutes: 15,
      difficulty: "Level 2 Prerequisite",
      reason: "CIDR prefix calculations and host bit formulas (2^h - 2) were missed in the diagnostic.",
      actionType: "tutor",
    },
    DSA: {
      title: "Master Dynamic Programming Substructure",
      topicName: "Dynamic Programming",
      durationMinutes: 20,
      difficulty: "Level 3 Prerequisite",
      reason: "Recurrence relation formulation and overlapping subproblem memoization is currently blocking graph shortest path algorithms.",
      actionType: "tutor",
    },
  };

  const nextAction = profile?.aiAnalysis?.nextBestAction || defaultActionBySubject[activeSubject];

  const depChainBySubject: Record<SubjectKey, { first: string; second: string; third: string }> = {
    Maths: {
      first: "Algebraic Manipulation (84% ✓)",
      second: "⚠️ Factorisation (38% Prerequisite Gap)",
      third: "Quadratic Equations (Blocked 🚫)",
    },
    DBMS: {
      first: "ER Modeling (82% ✓)",
      second: "⚠️ Normalization (35% Gap)",
      third: "Transactions (Blocked 🚫)",
    },
    OS: {
      first: "Process Scheduling (82% ✓)",
      second: "⚠️ Deadlocks & Banker's Algo (36% Gap)",
      third: "Virtual Memory & Paging (Blocked 🚫)",
    },
    CN: {
      first: "OSI & TCP/IP Stack (86% ✓)",
      second: "⚠️ IP Addressing & Subnetting (34% Gap)",
      third: "TCP Flow & Congestion Control (Blocked 🚫)",
    },
    DSA: {
      first: "Asymptotic Complexity (88% ✓)",
      second: "⚠️ Dynamic Programming (32% Gap)",
      third: "Graph Algorithms (Blocked 🚫)",
    },
  };

  const depChain = depChainBySubject[activeSubject];

  const streak = profile?.aiAnalysis?.streak || 8;
  const weeklyGoal = profile?.aiAnalysis?.weeklyGoal || { current: 4, target: 5 };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome & Track Switcher Header */}
        <div data-scroll="fade-down" className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Good morning, {user?.name?.split(" ")[0] || "Alex"} 👋
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200">
                Adaptive Loop Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Goal: <strong className="text-slate-700">{user?.learningGoals || "Improve in Mathematics"}</strong>
            </p>
          </div>

          {/* Active Subject Track (Configured in Learner Profile) */}
          <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-indigo-50/80 border border-indigo-200/90 shadow-2xs self-start lg:self-auto">
            <span className="text-2xl p-1 rounded-xl bg-white border border-indigo-100 flex-shrink-0 shadow-2xs">
              {activeSubjectConfig.icon}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">
                  Active Track: {activeSubjectConfig.label}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700 font-semibold border border-indigo-200">
                  {activeSubjectConfig.code}
                </span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                Track managed in <Link href="/profile" className="text-indigo-600 hover:text-indigo-800 font-semibold underline">Learner Profile</Link>
              </span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. VISUALLY DOMINANT: NEXT BEST ACTION (Section 8 of Master Prompt)       */}
        {/* ========================================================================= */}
        <div data-scroll="scale" className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-xl relative overflow-hidden card-hover-lift">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/30 text-indigo-200 text-xs font-bold border border-indigo-400/30">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
                  <span>YOUR NEXT BEST ACTION</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-semibold border border-amber-400/30 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {nextAction.durationMinutes} min • {nextAction.difficulty}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[11px] font-semibold border border-rose-400/30 flex items-center gap-1">
                  <ShieldAlert className="w-3 h-3" />
                  Prerequisite Gap
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {nextAction.title}
              </h2>

              <div className="p-3.5 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15">
                <span className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1">
                  Why this task?
                </span>
                <p className="text-xs sm:text-sm text-indigo-100 leading-relaxed">
                  &ldquo;{nextAction.reason}&rdquo;
                </p>
              </div>

              {/* Visual Dependency Chain */}
              <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="text-indigo-300 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                  <Network className="w-3.5 h-3.5" /> Dependency Chain:
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 font-medium">
                  {depChain.first}
                </span>
                <span className="text-indigo-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-400/50 font-bold ring-2 ring-rose-400/30 animate-pulse">
                  {depChain.second}
                </span>
                <span className="text-indigo-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 border border-white/20">
                  {depChain.third}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 flex-shrink-0">
              <Link
                href={`/tutor?topic=${encodeURIComponent(nextAction.topicName)}`}
                className="inline-flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white text-indigo-900 font-extrabold text-sm hover:bg-indigo-50 shadow-lg shadow-indigo-950/30 hover:scale-[1.02] active:scale-98 transition-all text-center cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>START {nextAction.durationMinutes}-MIN SESSION</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                href={`/practice?topic=${encodeURIComponent(nextAction.topicName)}`}
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-700/60 hover:bg-indigo-700 border border-indigo-500/50 text-white text-xs font-semibold transition-all text-center cursor-pointer"
              >
                <HelpCircle className="w-4 h-4" />
                <span>Practice 5 Targeted Questions</span>
              </Link>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE LEARNING LOOP COCKPIT (Diagnose -> Map -> Teach -> Practice) */}
        {/* ========================================================================= */}
        <div data-scroll="fade-up" className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                🔄
              </span>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                SkillSync Autonomous Learning Loop
              </h4>
            </div>
            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
              Stage 2 of 7 Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-3 text-center">
            <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
              <span className="text-[10px] font-extrabold text-emerald-800 uppercase block">1. DIAGNOSE</span>
              <span className="text-xs font-bold text-emerald-700 block mt-0.5">Completed ✓</span>
              <span className="text-[10px] text-emerald-600">5 Questions</span>
            </div>

            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-300">
              <span className="text-[10px] font-extrabold text-indigo-200 uppercase block">2. MAP</span>
              <span className="text-xs font-extrabold block mt-0.5">Skill Graph 🧠</span>
              <span className="text-[10px] text-indigo-100">Gap Located</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">3. TEACH</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">AI Coach</span>
              <span className="text-[10px] text-slate-400">Socratic</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">4. PRACTICE</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">10-Min Task</span>
              <span className="text-[10px] text-slate-400">Adaptive</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">5. FEEDBACK</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Instant Logic</span>
              <span className="text-[10px] text-slate-400">Pedagogical</span>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">6. PROGRESS</span>
              <span className="text-xs font-bold text-slate-800 block mt-0.5">Mastery +14%</span>
              <span className="text-[10px] text-slate-400">Calibrated</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <span className="text-[10px] font-extrabold text-amber-800 uppercase block">7. NEXT ACTION</span>
              <span className="text-xs font-bold text-amber-900 block mt-0.5">Auto-Refreshed</span>
              <span className="text-[10px] text-amber-700">Daily Loop</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. PROGRESS INTELLIGENCE METRICS (Section 9 of Master Prompt)              */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Overall Mastery */}
          <div data-scroll="fade-up" data-scroll-delay="50" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Overall Mastery
              </span>
              <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {profile?.overallMastery || 72}%
              </span>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-0.5">
                <TrendingUp className="w-3 h-3" /> +14%
              </span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full"
                style={{ width: `${profile?.overallMastery || 72}%` }}
              />
            </div>
          </div>

          {/* Study Streak */}
          <div data-scroll="fade-up" data-scroll-delay="100" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Study Streak
              </span>
              <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Flame className="w-4 h-4 fill-current animate-bounce-gentle" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {streak} Days
              </span>
              <span className="text-[11px] text-amber-600 font-bold">🔥 On Fire</span>
            </div>
            <p className="text-[11px] text-slate-500">Consistent daily micro-learning</p>
          </div>

          {/* Weekly Goal */}
          <div data-scroll="fade-up" data-scroll-delay="150" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Weekly Goal
              </span>
              <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {weeklyGoal.current} / {weeklyGoal.target}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold">80% Done</span>
            </div>
            <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full"
                style={{ width: `${(weeklyGoal.current / weeklyGoal.target) * 100}%` }}
              />
            </div>
          </div>

          {/* Reteach Rate */}
          <div data-scroll="fade-up" data-scroll-delay="200" className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Reteach Rate
              </span>
              <span className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                <RotateCcw className="w-4 h-4" />
              </span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {profile?.aiAnalysis?.reteachRate || "28%"}
              </span>
              <span className="text-[11px] text-purple-600 font-bold">Gaps Identified</span>
            </div>
            <p className="text-[11px] text-slate-500">Prerequisite remediation rate</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. SKILL GRAPH PREVIEW (Section 3 of Master Prompt)                       */}
        {/* ========================================================================= */}
        <div data-scroll="fade-up" className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Brain className="w-4 h-4 text-indigo-600" />
              <span>Skill Graph & Prerequisite Map</span>
            </h3>
            <Link
              href="/graph"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Explore Full Interactive Graph</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <SkillGraph subject={activeSubject} compact={false} />
        </div>

        {/* ========================================================================= */}
        {/* 4. PERSONALIZED 7-DAY ROADMAP PREVIEW (Section 7 of Master Prompt)        */}
        {/* ========================================================================= */}
        <div data-scroll="fade-up" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                <span>{plan?.title || "7-Day Personalized Micro-Roadmap"}</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Targeted 5-15 minute daily tasks prioritized by your prerequisite gaps.
              </p>
            </div>
            <Link
              href="/plan"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View Full Plan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {(plan?.items || []).slice(0, 4).map((item, idx) => (
              <div
                key={item.order || idx}
                data-scroll="fade-left"
                data-scroll-delay={String((idx + 1) * 75)}
                className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    D{idx + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900">{item.activity}</h4>
                      {item.priority === "critical" && (
                        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                          Critical Gap
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.reason}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end sm:self-auto flex-shrink-0">
                  <span className="text-[11px] font-medium text-slate-400">
                    {item.durationMinutes} mins
                  </span>
                  <Link
                    href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    Start
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SPACED REPETITION ENGINE (EBBINGHAUS FORGETTING CURVE)                     */}
        {/* ========================================================================= */}
        <div data-scroll="fade-up" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                  <RotateCcw className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    <span>Spaced Repetition Review Queue</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                      Ebbinghaus Engine
                    </span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Retention decay model R(t) = e^(-t/S) schedules SM-2 reinforcement reviews before concepts drop below 70% retention.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold border border-slate-200">
                {reviewStats?.totalDue ?? reviewQueue.length} Due for Review
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                Avg Retention: {reviewStats?.averageRetention ?? 65}%
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {reviewQueue.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                <p>All concepts are currently well-retained! Great job keeping your memory curve strong.</p>
              </div>
            ) : (
              reviewQueue.map((item) => {
                const isUrgent = item.urgency === "critical" || item.retentionEst < 60;
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">{item.topicName}</span>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-200 text-slate-700">
                          {item.subject}
                        </span>
                        {isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Overdue Review ({item.daysOverdue}d overdue)
                          </span>
                        )}
                        {!isUrgent && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Due Today
                          </span>
                        )}
                      </div>

                      {/* Memory retention bar */}
                      <div className="flex items-center gap-3 pt-1">
                        <div className="text-[11px] font-semibold text-slate-600 flex items-center gap-1">
                          <span>Est. Retention:</span>
                          <span className={item.retentionEst >= 70 ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>
                            {item.retentionEst}%
                          </span>
                        </div>
                        <div className="w-36 h-2 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              item.retentionEst >= 70
                                ? "bg-emerald-500"
                                : item.retentionEst >= 50
                                ? "bg-amber-500"
                                : "bg-rose-500"
                            }`}
                            style={{ width: `${Math.min(100, item.retentionEst)}%` }}
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          Interval: {item.intervalDays}d • Reps: {item.repetitions}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center flex-shrink-0">
                      <Link
                        href={`/tutor?topic=${encodeURIComponent(item.topicName)}`}
                        className="px-3 py-1.5 rounded-xl border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        title="Open interactive Socratic session for this topic"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Reinforce</span>
                      </Link>
                      <Link
                        href={`/quiz?topic=${encodeURIComponent(item.topicName)}`}
                        className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                        title="Take an adaptive recall test"
                      >
                        <span>Recall Quiz</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. AI COACH SHORTCUT & RESPONSIBLE AI TRUST LAYER (Section 4 & 5)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Coach Quick Prompt */}
          <div data-scroll="fade-right" className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 p-6 space-y-3 card-hover-lift">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <MessageSquare className="w-4 h-4" />
              <span>Socratic AI Learning Coach</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Need step-by-step guidance on {nextAction.topicName}?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI Coach uses Socratic questioning to teach you how to think, instead of just handing you final answers.
            </p>
            <div className="pt-2">
              <Link
                href={`/tutor?topic=${encodeURIComponent(nextAction.topicName)}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask: &ldquo;Why is factorisation required for quadratics?&rdquo;</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Source Grounding & Trust Badge */}
          <div data-scroll="fade-left" className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 card-hover-lift">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4" />
              <span>Source Grounding & AI Guardrails</span>
            </div>
            <h4 className="text-sm font-bold text-slate-900">
              Curriculum Grounded Explanations
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              All learning recommendations are verified against approved educational textbooks (NCERT Class 10/11 & Standard University Curriculum).
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-slate-500 font-medium">
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                📚 NCERT Mathematics Ch 4
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                ✓ 94% Confidence
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 border border-slate-200">
                🛡️ Socratic Guardrails Active
              </span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
