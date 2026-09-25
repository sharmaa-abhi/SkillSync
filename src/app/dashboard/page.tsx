"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import AppLayout from "@/components/AppLayout";
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
  Loader2,
  RotateCcw,
} from "lucide-react";

interface DashboardData {
  user: {
    name: string;
    educationLevel?: string;
    learningGoals?: string;
    preferredStyle?: string;
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
      priority: "high" | "medium" | "low";
      reason: string;
    }>;
  } | null;
  progress: Array<{
    overallMastery: number;
    trigger: string;
    createdAt: string;
  }>;
  recentActivity: Array<{
    type: "assessment" | "quiz";
    subject?: string;
    score?: number;
    date?: string;
  }>;
}

export default function DashboardPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          loadFallbackData();
        }
      } catch (err) {
        console.error("Dashboard fetch error", err);
        loadFallbackData();
      } finally {
        setLoading(false);
      }
    }

    function loadFallbackData() {
      setData({
        user: {
          name: session?.user?.name || "Alex Rivera",
          educationLevel: "B.Tech CSE - 3rd Year",
          learningGoals: "Master Database Systems & Normalization",
        },
        profile: {
          overallMastery: 63,
          strengths: ["SQL Fundamentals", "Indexing"],
          weaknesses: ["Normalization", "Transactions"],
          topicMastery: [
            { topicName: "SQL Fundamentals", score: 84, masteryLevel: "strong" },
            { topicName: "Indexing", score: 71, masteryLevel: "strong" },
            { topicName: "Transactions", score: 56, masteryLevel: "medium" },
            { topicName: "ER Model", score: 60, masteryLevel: "medium" },
            { topicName: "Normalization", score: 42, masteryLevel: "weak" },
          ],
          assessmentCount: 1,
          quizCount: 2,
          totalStudyMinutes: 45,
          aiAnalysis: {
            summary: "You are strong in SQL fundamentals but need more practice with normalization and transactions.",
            reasoning: [
              "You missed 3 of 5 normalization questions, specifically functional dependencies.",
              "Transactions need review regarding ACID isolation levels and dirty reads.",
            ],
            recommendations: [
              "Review 2NF vs 3NF functional dependencies.",
              "Complete a 5-question adaptive quiz on Normalization.",
            ],
          },
        },
        plan: {
          title: "Database Systems: Normalization & Transactions Mastery",
          estimatedDuration: "25 mins",
          items: [
            {
              order: 1,
              topic: "Normalization",
              activity: "Functional Dependencies & 2NF/3NF Decomposition",
              durationMinutes: 10,
              priority: "high",
              reason: "Diagnostic assessment showed 42% accuracy on normalization rules.",
            },
            {
              order: 2,
              topic: "Normalization",
              activity: "Adaptive Practice Quiz (5 Questions)",
              durationMinutes: 5,
              priority: "high",
              reason: "Reinforce newly acquired decomposition rules with immediate feedback.",
            },
            {
              order: 3,
              topic: "Transactions",
              activity: "ACID Isolation Levels & Concurrency Anomalies",
              durationMinutes: 10,
              priority: "medium",
              reason: "Current transactions mastery is 56% (medium).",
            },
          ],
        },
        progress: [
          { overallMastery: 50, trigger: "diagnostic", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
          { overallMastery: 63, trigger: "assessment", createdAt: new Date(Date.now() - 86400000).toISOString() },
        ],
        recentActivity: [
          { type: "quiz", score: 75, date: new Date(Date.now() - 3600000 * 3).toISOString() },
          { type: "assessment", subject: "Database Management Systems", score: 63, date: new Date(Date.now() - 86400000).toISOString() },
        ],
      });
    }

    fetchDashboard();
  }, [session]);

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-7 w-48 skeleton rounded-lg" />
              <div className="h-4 w-72 skeleton rounded-md" />
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-32 skeleton rounded-xl" />
              <div className="h-9 w-28 skeleton rounded-xl" />
            </div>
          </div>
          <div className="h-44 w-full skeleton rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 skeleton rounded-2xl" />
            ))}
          </div>
          <div className="h-64 w-full skeleton rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  const profile = data?.profile;
  const plan = data?.plan;
  const user = data?.user;
  const topics = profile?.topicMastery || [];
  const primaryWeakTopic = topics.find((t) => t.masteryLevel === "weak") || topics[0] || { topicName: "Normalization", score: 42 };

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-down">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Good morning, {user?.name?.split(" ")[0] || "Student"} 👋
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Here is your adaptive learning plan based on your latest performance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/assessment"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm interactive-btn"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
              <span>Retake Diagnostic</span>
            </Link>

            <Link
              href="/practice"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-700 shadow-sm shadow-indigo-100 interactive-btn"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>Adaptive Quiz</span>
            </Link>
          </div>
        </div>

        {/* Primary Recommendation Card: "Your next best step" */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white shadow-lg relative overflow-hidden card-hover-lift animate-fade-in-up delay-75">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[11px] font-semibold border border-indigo-400/20">
                <Sparkles className="w-3 h-3 text-indigo-300 animate-pulse" />
                <span>Your Next Best Step</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Master {primaryWeakTopic.topicName} Fundamentals
              </h2>
              <p className="text-xs sm:text-sm text-indigo-200 leading-relaxed">
                Your diagnostic assessment identified {primaryWeakTopic.topicName} ({primaryWeakTopic.score}% mastery)
                as the highest-leverage area to improve. Start with a 10-minute AI Tutor session.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <Link
                href={`/tutor?topic=${encodeURIComponent(primaryWeakTopic.topicName)}`}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 shadow-md interactive-btn text-center"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Continue Learning</span>
              </Link>

              <Link
                href="/practice"
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-indigo-700/80 hover:bg-indigo-700 border border-indigo-500/50 text-white text-xs font-semibold interactive-btn text-center"
              >
                <HelpCircle className="w-4 h-4" />
                <span>5-min Quiz</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Progress Overview Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in-up delay-150">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Flame className="w-5 h-5 fill-current animate-bounce-gentle" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Study Streak
              </span>
              <span className="text-lg font-bold text-slate-900">4 Days 🔥</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Learning Time
              </span>
              <span className="text-lg font-bold text-slate-900">{profile?.totalStudyMinutes || 45} mins</span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Mastered Topics
              </span>
              <span className="text-lg font-bold text-slate-900">
                {topics.filter((t) => t.masteryLevel === "strong").length} / {topics.length || 7}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-sm flex items-center gap-3.5 card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Overall Mastery
              </span>
              <span className="text-lg font-bold text-slate-900">{profile?.overallMastery || 63}%</span>
            </div>
          </div>
        </div>

        {/* Weak Topics Section */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 animate-fade-in-up delay-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Topic Mastery Status</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Continuously recalculated as you complete assessments and quizzes.
              </p>
            </div>
            <Link href="/profile" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
              View Profile
              <ChevronRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {topics.map((t) => {
              const isWeak = t.masteryLevel === "weak" || t.score < 50;
              const isMedium = t.masteryLevel === "medium" || (t.score >= 50 && t.score < 70);
              const isStrong = t.masteryLevel === "strong" || t.score >= 70;

              return (
                <div
                  key={t.topicName}
                  className={`p-4 rounded-xl border transition-all duration-300 card-hover-lift ${
                    isWeak
                      ? "border-rose-200 bg-rose-50/40 hover:border-rose-300"
                      : isMedium
                      ? "border-amber-200 bg-amber-50/30 hover:border-amber-300"
                      : "border-slate-200 bg-white hover:border-indigo-200"
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{t.topicName}</h4>
                      <span
                        className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          isWeak
                            ? "bg-rose-100 text-rose-700"
                            : isMedium
                            ? "bg-amber-100 text-amber-800"
                            : "bg-emerald-100 text-emerald-800"
                        }`}
                      >
                        {isWeak ? "Needs attention" : isMedium ? "Improving" : "Strong"}
                      </span>
                    </div>
                    <span className="font-mono text-sm font-extrabold text-slate-800">
                      {t.score}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ease-out ${
                        isWeak ? "bg-rose-500" : isMedium ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100/80 flex items-center justify-between text-xs">
                    <Link
                      href={`/tutor?topic=${encodeURIComponent(t.topicName)}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium text-[11px] flex items-center gap-1 transition-colors"
                    >
                      Ask Tutor
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                    <Link
                      href="/practice"
                      className="text-slate-500 hover:text-slate-700 text-[11px] transition-colors"
                    >
                      Practice
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recommended Learning & Recent Activity Dual Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in-up delay-300">
          {/* Actionable Recommendations (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Today's Personalized Learning Plan</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Generated by AI to optimize your study time.
                </p>
              </div>
              <Link href="/plan" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                View Full Plan
              </Link>
            </div>

            <div className="space-y-3">
              {(plan?.items?.slice(0, 3) || []).map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{item.activity}</h4>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            item.priority === "high"
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">{item.reason}</p>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-semibold text-slate-600 block">
                      {item.durationMinutes} min
                    </span>
                    <Link
                      href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                      className="text-indigo-600 hover:text-indigo-700 text-xs font-semibold mt-1 inline-block"
                    >
                      Start
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity (1 col) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Recent Activity</h3>
            <p className="text-xs text-slate-500 mb-4">Your adaptive learning milestones.</p>

            <div className="space-y-3">
              {data?.recentActivity && data.recentActivity.length > 0 ? (
                data.recentActivity.map((act, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
                    <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {act.type === "assessment" ? (
                        <BarChart3 className="w-3.5 h-3.5" />
                      ) : (
                        <HelpCircle className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-900 truncate">
                        {act.type === "assessment" ? "Diagnostic Assessment" : "Adaptive Practice Quiz"}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Score: <span className="font-bold text-indigo-600">{act.score}%</span>
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-4 text-center">No recent activity yet</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

function RefreshCwIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  );
}
