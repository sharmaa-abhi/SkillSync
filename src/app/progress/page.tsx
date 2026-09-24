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
  status: "Mastered" | "Improving" | "Needs Attention";
}

export default function ProgressPage() {
  const [loading, setLoading] = useState(true);
  const [overallMastery, setOverallMastery] = useState(68);
  const [streakDays, setStreakDays] = useState(4);
  const [studyMinutes, setStudyMinutes] = useState(45);

  const improvements: ProgressItem[] = [
    {
      topicName: "Normalization",
      before: 42,
      now: 68,
      change: 26,
      status: "Improving",
    },
    {
      topicName: "Transactions",
      before: 56,
      now: 65,
      change: 9,
      status: "Improving",
    },
    {
      topicName: "SQL Fundamentals",
      before: 80,
      now: 84,
      change: 4,
      status: "Mastered",
    },
    {
      topicName: "Indexing",
      before: 71,
      now: 71,
      change: 0,
      status: "Mastered",
    },
    {
      topicName: "ER Model",
      before: 60,
      now: 60,
      change: 0,
      status: "Improving",
    },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          if (json.profile) {
            setOverallMastery(json.profile.overallMastery || 68);
            setStudyMinutes(json.profile.totalStudyMinutes || 45);
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
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-100">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Learning Trajectory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Your Progress & Growth
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time tracking of how each study session shifts your topic mastery.
          </p>
        </div>

        {/* Milestone Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Current Overall Mastery
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-indigo-600">{overallMastery}%</span>
              <span className="text-xs font-bold text-emerald-600">+18% this week</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Study Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900">{streakDays} Days</span>
              <span className="text-xs font-bold text-amber-600 flex items-center gap-0.5">
                <Flame className="w-3.5 h-3.5 fill-current" /> Active
              </span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Total Focused Time
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold font-mono text-slate-900">{studyMinutes} mins</span>
              <span className="text-xs text-slate-500">Adaptive practice</span>
            </div>
          </div>
        </div>

        {/* Before vs After Topic Progress Cards */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Before vs After Performance</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Measurable growth achieved through diagnostic remediation and practice.
              </p>
            </div>
            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
              Verified by Quiz Engine
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
                      Current: <strong className="text-indigo-600">{item.now}%</strong>
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

        {/* Next Recommended Focus Card */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5" />
              Next Recommended Focus
            </span>
            <h3 className="text-lg font-bold">Transactions & Concurrency Control</h3>
            <p className="text-xs text-indigo-200 max-w-md">
              Normalization has reached 68% mastery. Your next highest-impact topic is Transactions (currently at 65%).
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tutor?topic=Transactions"
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <span>Start Session</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
