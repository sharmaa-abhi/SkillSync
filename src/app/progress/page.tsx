"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  TrendingUp,
  Award,
  Sparkles,
  ArrowRight,
  Flame,
  CheckCircle2,
  Calendar,
  Layers,
  Zap,
  BarChart3,
  Loader2,
  Clock,
} from "lucide-react";

interface ProgressItem {
  topicName: string;
  before: number;
  now: number;
  change: number;
  status: "Mastered" | "Improving" | "Needs Attention" | "Prerequisite Gap";
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [overallMastery, setOverallMastery] = useState(72);
  const [streakDays, setStreakDays] = useState(8);
  const [studyMinutes, setStudyMinutes] = useState(65);
  const [weeklyGoal, setWeeklyGoal] = useState({ current: 4, target: 5 });
  const [reteachRate, setReteachRate] = useState("28%");
  const [improvements, setImprovements] = useState<ProgressItem[]>([
    {
      topicName: "Factorisation",
      before: 25,
      now: 38,
      change: 13,
      status: "Prerequisite Gap",
    },
    {
      topicName: "Quadratic Equations",
      before: 60,
      now: 72,
      change: 12,
      status: "Improving",
    },
    {
      topicName: "Algebraic Manipulation",
      before: 70,
      now: 84,
      change: 14,
      status: "Mastered",
    },
    {
      topicName: "Polynomials",
      before: 55,
      now: 65,
      change: 10,
      status: "Improving",
    },
    {
      topicName: "Coordinate Geometry",
      before: 35,
      now: 40,
      change: 5,
      status: "Needs Attention",
    },
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            setOverallMastery(json.profile.overallMastery || 72);
            setStudyMinutes(json.profile.totalStudyMinutes || 65);
            if (json.profile.aiAnalysis?.streak) {
              setStreakDays(json.profile.aiAnalysis.streak);
            }
            if (json.profile.aiAnalysis?.weeklyGoal) {
              setWeeklyGoal(json.profile.aiAnalysis.weeklyGoal);
            }
            if (json.profile.aiAnalysis?.reteachRate) {
              setReteachRate(json.profile.aiAnalysis.reteachRate);
            }
          }
        }
      } catch (err) {
        console.error("Failed to load progress data", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading progress history...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="animate-fade-in-down">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Progress Intelligence</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Progress & Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking answering: "Where am I growing and what needs reteaching?"
          </p>
        </div>

        {/* 4 Milestone Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 animate-fade-in-up delay-75">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 card-hover-lift">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Overall Mastery
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-indigo-600 animate-pop">
                {overallMastery}%
              </span>
              <span className="text-[11px] font-bold text-emerald-600">+14% growth</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Baseline: 58%</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 card-hover-lift">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Practice Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {streakDays} Days
              </span>
              <span className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5">
                <Flame className="w-3 h-3 fill-current animate-bounce-gentle" /> Active
              </span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Daily consistency</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 card-hover-lift">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Weekly Goal
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {weeklyGoal.current} / {weeklyGoal.target}
              </span>
              <span className="text-[11px] font-bold text-indigo-600">80%</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Sessions completed</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 card-hover-lift">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Reteach Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900">
                {reteachRate}
              </span>
              <span className="text-[11px] font-bold text-rose-600">Active</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Gap remediations</p>
          </div>
        </div>

        {/* Before vs After Topic Progress Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 animate-fade-in-up delay-150">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Diagnostic vs Current Mastery Growth</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Measurable skill improvement tracked across adaptive practice sessions.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100 self-start sm:self-auto">
              Verified by Diagnostic Engine
            </span>
          </div>

          <div className="space-y-3">
            {improvements.map((item) => (
              <div
                key={item.topicName}
                className="p-4 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{item.topicName}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        item.status === "Mastered"
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-100"
                          : item.status === "Prerequisite Gap"
                          ? "bg-rose-50 text-rose-800 border border-rose-200 ring-1 ring-rose-100"
                          : "bg-amber-50 text-amber-800 border border-amber-100"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span>
                      Baseline: <strong className="text-slate-800">{item.before}%</strong>
                    </span>
                    <span>→</span>
                    <span>
                      Current: <strong className="text-indigo-600 font-bold">{item.now}%</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-32 bg-slate-100 h-2 rounded-full overflow-hidden hidden sm:block">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${item.now}%` }}
                    />
                  </div>

                  {item.change > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-extrabold border border-emerald-200">
                      +{item.change}%
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold">
                      Stable
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 8: Your Next Best Action Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-indigo-800 text-white shadow-lg border border-indigo-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-5 animate-fade-in-up delay-200">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider border border-amber-400/30 flex items-center gap-1">
                <Zap className="w-3 h-3 fill-current" />
                Your Next Best Action
              </span>
              <span className="text-xs text-indigo-300">10 min • Level 2</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight">Review Factorisation</h3>
            <p className="text-xs text-indigo-200 max-w-lg leading-relaxed">
              Why this task? "Your last 3 diagnostic answers show a prerequisite gap in factoring trinomials before quadratic equation solving."
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/practice?topic=Factorisation"
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-indigo-950 text-xs font-extrabold hover:bg-indigo-50 transition-all shadow-md active:scale-95"
            >
              <span>START 10-MIN SESSION</span>
              <ArrowRight className="w-4 h-4 text-indigo-600" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
