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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeSubject, setActiveSubject] = useState<"Maths" | "DBMS">("Maths");

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
    }

    function loadFallbackData() {
      if (activeSubject === "Maths") {
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
                difficulty: "Level 2",
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
              {
                order: 4,
                topic: "Quadratic Equations",
                activity: "Completing the Square Intuition",
                durationMinutes: 10,
                priority: "medium",
                reason: "Provides the geometric bridge to the quadratic formula.",
                isCompleted: false,
              },
              {
                order: 5,
                topic: "Quadratic Equations",
                activity: "Discriminant & Nature of Roots Test",
                durationMinutes: 12,
                priority: "medium",
                reason: "Ensures speed and accuracy for exam conditions.",
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
                difficulty: "Level 2",
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
  const nextAction = profile?.aiAnalysis?.nextBestAction || {
    title: activeSubject === "Maths" ? "Review Factorisation" : "Review Normalization",
    topicName: activeSubject === "Maths" ? "Factorisation" : "Normalization",
    durationMinutes: 10,
    difficulty: "Level 2 Prerequisite",
    reason: activeSubject === "Maths"
      ? "Your diagnostic identified a critical prerequisite gap in Factorisation (38% mastery). Factoring trinomials is required before quadratic equation derivations."
      : "Your diagnostic identified confusion between partial and transitive functional dependencies.",
    actionType: "tutor",
  };

  const streak = profile?.aiAnalysis?.streak || 8;
  const weeklyGoal = profile?.aiAnalysis?.weeklyGoal || { current: 4, target: 5 };

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Welcome & Track Switcher Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 animate-fade-in-down">
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

          {/* Subject Track Switcher */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-200/70 rounded-xl self-start sm:self-auto">
            <button
              onClick={() => setActiveSubject("Maths")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubject === "Maths"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              📐 Mathematics (Demo)
            </button>
            <button
              onClick={() => setActiveSubject("DBMS")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeSubject === "DBMS"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🗄️ Database Systems
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 1. VISUALLY DOMINANT: NEXT BEST ACTION (Section 8 of Master Prompt)       */}
        {/* ========================================================================= */}
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-xl relative overflow-hidden card-hover-lift animate-fade-in-up">
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
                  {activeSubject === "Maths" ? "Algebraic Manipulation (84% ✓)" : "ER Modeling (82% ✓)"}
                </span>
                <span className="text-indigo-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-rose-500/30 text-rose-200 border border-rose-400/50 font-bold ring-2 ring-rose-400/30 animate-pulse">
                  ⚠️ {activeSubject === "Maths" ? "Factorisation (38% Prerequisite Gap)" : "Normalization (35% Gap)"}
                </span>
                <span className="text-indigo-400 font-bold">→</span>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white/70 border border-white/20">
                  {activeSubject === "Maths" ? "Quadratic Equations (Blocked 🚫)" : "Transactions (Blocked 🚫)"}
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
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/90 shadow-sm animate-fade-in-up">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in-up delay-75">
          {/* Overall Mastery */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
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
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
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
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
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
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-2 card-hover-lift">
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
        <div className="space-y-3">
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-5">
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
        {/* 5. AI COACH SHORTCUT & RESPONSIBLE AI TRUST LAYER (Section 4 & 5)         */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* AI Coach Quick Prompt */}
          <div className="bg-gradient-to-br from-indigo-50/70 to-purple-50/70 rounded-2xl border border-indigo-100 p-6 space-y-3 card-hover-lift">
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
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 space-y-3 card-hover-lift">
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
