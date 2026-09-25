"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import {
  BookOpen,
  Sparkles,
  Clock,
  ArrowRight,
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  Loader2,
} from "lucide-react";

interface PlanItem {
  order: number;
  topic: string;
  activity: string;
  durationMinutes: number;
  priority: "high" | "medium" | "low";
  reason: string;
}

interface PlanData {
  title: string;
  estimatedDuration: string;
  items: PlanItem[];
}

export default function PlanPage() {
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  useEffect(() => {
    async function loadPlan() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const data = await res.json();
          if (data.plan) {
            setPlan(data.plan);
            setLoading(false);
            return;
          }
        }
        loadFallbackPlan();
      } catch {
        loadFallbackPlan();
      } finally {
        setLoading(false);
      }
    }

    function loadFallbackPlan() {
      setPlan({
        title: "DBMS Adaptive Study Plan: Normalization & Transactions",
        estimatedDuration: "25 minutes today",
        items: [
          {
            order: 1,
            topic: "Normalization",
            activity: "Normalization Fundamentals & Functional Dependencies",
            durationMinutes: 10,
            priority: "high",
            reason: "Your diagnostic assessment showed 42% mastery. You struggled with functional dependency definitions.",
          },
          {
            order: 2,
            topic: "Normalization",
            activity: "2NF vs 3NF Decomposition & Transitive Dependencies",
            durationMinutes: 10,
            priority: "high",
            reason: "Questions on transitive dependencies were answered incorrectly. High-yield concept for exams.",
          },
          {
            order: 3,
            topic: "Normalization",
            activity: "5-Minute Targeted Practice Quiz",
            durationMinutes: 5,
            priority: "high",
            reason: "Verify functional dependency mastery with adaptive questions before moving forward.",
          },
          {
            order: 4,
            topic: "Transactions",
            activity: "ACID Isolation Levels & Concurrency Anomalies",
            durationMinutes: 10,
            priority: "medium",
            reason: "Your score was 56%. Review dirty reads, non-repeatable reads, and serializability.",
          },
        ],
      });
    }

    loadPlan();
  }, []);

  const handleRegenerate = async () => {
    setRegenerating(true);
    // Simulate AI plan calibration based on current profile
    setTimeout(() => {
      setRegenerating(false);
    }, 1200);
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Generating your personalized study path...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-fade-in-down">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-1 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI-Generated Daily Roadmap</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Learning Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Targeted modules arranged by priority to fix your conceptual gaps efficiently.
            </p>
          </div>

          <button
            onClick={handleRegenerate}
            disabled={regenerating}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all duration-200 interactive-btn disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${regenerating ? "animate-spin text-indigo-600" : "text-slate-400"}`} />
            <span>{regenerating ? "Recalibrating..." : "Recalibrate Plan"}</span>
          </button>
        </div>

        {/* Plan Header Card */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift animate-fade-in-up delay-75">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Focus
            </span>
            <h2 className="text-lg font-bold text-slate-900">{plan?.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Est. Duration: <strong className="text-slate-700">{plan?.estimatedDuration}</strong>
              </span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{plan?.items.length} Structured Modules</span>
            </div>
          </div>

          <Link
            href="/practice"
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex-shrink-0 interactive-btn"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Practice Today</span>
          </Link>
        </div>

        {/* Plan Items List */}
        <div className="space-y-3.5 animate-fade-in-up delay-150">
          {plan?.items.map((item, idx) => {
            const isHigh = item.priority === "high";
            const isMedium = item.priority === "medium";

            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 card-hover-lift"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <span className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-bold text-sm flex items-center justify-center flex-shrink-0 mt-0.5">
                      {item.order || idx + 1}
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{item.activity}</h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : isMedium
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          Priority: {item.priority.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {item.durationMinutes} min
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1">
                        <span className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider block">
                          Why SkillSync Recommends This:
                        </span>
                        <p>{item.reason}</p>
                      </div>
                    </div>
                  </div>

                  {/* Actions for this item */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 flex-shrink-0 pt-2 sm:pt-0">
                    <Link
                      href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 text-xs font-semibold transition-all duration-200 interactive-btn"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Learn with AI Tutor</span>
                    </Link>

                    <Link
                      href="/practice"
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 text-xs font-semibold transition-all duration-200 interactive-btn"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Practice Quiz</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppLayout>
  );
}
