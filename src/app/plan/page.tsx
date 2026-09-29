"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { useActiveSubject } from "@/hooks/useActiveSubject";
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
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  isCompleted?: boolean;
}

interface PlanData {
  id?: string;
  title: string;
  estimatedDuration: string;
  items: PlanItem[];
}

export default function PlanPage() {
  const { activeSubject, activeSubjectConfig } = useActiveSubject();
  const [plan, setPlan] = useState<PlanData | null>(null);
  const [completedOrders, setCompletedOrders] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);

  async function loadPlan(subjectKey = activeSubject) {
    try {
      // First try dedicated /api/plan route with active subject
      const res = await fetch(`/api/plan?subject=${encodeURIComponent(subjectKey)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.plan && data.plan.items?.length > 0) {
          setPlan(data.plan);
          const initialCompleted: Record<number, boolean> = {};
          data.plan.items.forEach((item: PlanItem) => {
            if (item.isCompleted) initialCompleted[item.order] = true;
          });
          setCompletedOrders(initialCompleted);
          setLoading(false);
          return;
        }
      }

      // Fallback to dashboard plan if needed
      const dashRes = await fetch(`/api/dashboard?subject=${encodeURIComponent(subjectKey)}`);
      if (dashRes.ok) {
        const data = await dashRes.json();
        if (data.plan && data.plan.items?.length > 0) {
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

  function loadFallbackPlan(cfg = activeSubjectConfig) {
    const topics = cfg?.topics || [];
    const items: PlanItem[] = topics.map((t, idx) => ({
      order: idx + 1,
      topic: t.name,
      activity: `${t.name} Core Concepts & Fluency Drills`,
      durationMinutes: t.estimatedMinutes || 15,
      priority: t.masteryLevel === "weak" ? "critical" : t.masteryLevel === "medium" ? "high" : "medium",
      reason: t.keyConcept ? `Foundational concept: ${t.keyConcept}` : `Essential track requirement for ${cfg.label}.`,
      isCompleted: false,
    }));

    if (items.length < 7) {
      items.push({
        order: items.length + 1,
        topic: topics[0]?.name || cfg.label,
        activity: `Adaptive Milestone Practice & Skill Graph Update`,
        durationMinutes: 20,
        priority: "high",
        reason: `Verifies whether prerequisite gaps in ${cfg.label} have shifted to Mastered.`,
        isCompleted: false,
      });
    }

    setPlan({
      title: `7-Day ${cfg.label} Mastery Roadmap`,
      estimatedDuration: `~${items.reduce((acc, i) => acc + i.durationMinutes, 0)} mins total (15-20 mins/day)`,
      items,
    });
  }

  useEffect(() => {
    loadPlan(activeSubject);
  }, [activeSubject]);

  const toggleTaskCompletion = async (order: number) => {
    const newStatus = !completedOrders[order];
    setCompletedOrders((prev) => ({
      ...prev,
      [order]: newStatus,
    }));

    if (plan?.id) {
      try {
        await fetch("/api/plan", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            planId: plan.id,
            order,
            isCompleted: newStatus,
          }),
        });
      } catch (err) {
        console.error("Failed to persist task status", err);
      }
    }
  };

  const handleRegenerate = async () => {
    setRegenerating(true);
    try {
      const res = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject: activeSubject }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.plan) {
          setPlan(data.plan);
          setCompletedOrders({});
        }
      } else {
        await loadPlan(activeSubject);
      }
    } catch (e) {
      console.error("Plan regeneration failed", e);
    } finally {
      setRegenerating(false);
    }
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
        <div data-scroll="fade-down" className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI-Generated Daily Roadmap</span>
              </div>

              {/* Locked Active Track Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-xs">
                <span className="text-sm">{activeSubjectConfig.icon}</span>
                <span className="font-bold text-slate-800">{activeSubjectConfig.label}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 font-semibold">
                  {activeSubjectConfig.code}
                </span>
                <span className="text-slate-300">|</span>
                <Link
                  href="/profile"
                  className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5"
                  title="Subject track is configured in Learner Profile"
                >
                  <span>Profile</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Personalized Learning Plan
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Targeted modules in {activeSubjectConfig.label} arranged by priority to fix your conceptual gaps efficiently.
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
        <div data-scroll="scale" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Active Focus
              </span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                {Object.values(completedOrders).filter(Boolean).length} / {plan?.items.length || 7} Days Completed
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900">{plan?.title}</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500 pt-0.5">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Est. Duration: <strong className="text-slate-700">{plan?.estimatedDuration}</strong>
              </span>
              <span>•</span>
              <span className="text-indigo-600 font-semibold">{plan?.items.length} Structured Micro-Sessions</span>
            </div>

            {/* Progress bar */}
            <div className="w-full max-w-md bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
              <div
                className="bg-emerald-500 h-full transition-all duration-300 rounded-full"
                style={{
                  width: `${((Object.values(completedOrders).filter(Boolean).length) / (plan?.items.length || 7)) * 100}%`,
                }}
              />
            </div>
          </div>

          <Link
            href="/practice"
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-100 transition-all flex-shrink-0 interactive-btn"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>Start Today's Session</span>
          </Link>
        </div>

        {/* Plan Items List */}
        <div className="space-y-3.5">
          {plan?.items.map((item, idx) => {
            const isCompleted = !!completedOrders[item.order || idx + 1];
            const isCritical = item.priority === "critical";
            const isHigh = item.priority === "high";
            const isMedium = item.priority === "medium";

            return (
              <div
                key={idx}
                data-scroll="fade-up"
                data-scroll-delay={String(((idx % 4) + 1) * 75)}
                className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs p-5 card-hover-lift ${
                  isCompleted
                    ? "border-emerald-200 bg-emerald-50/20"
                    : isCritical
                    ? "border-rose-200/90 ring-1 ring-rose-100"
                    : "border-slate-200/90"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    {/* Completion checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleTaskCompletion(item.order || idx + 1)}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 transition-all cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Mark as completed"}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 fill-current" />
                      ) : (
                        <span className="font-mono font-bold text-xs">D{item.order || idx + 1}</span>
                      )}
                    </button>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          DAY {item.order || idx + 1}
                        </span>
                        <h3
                          className={`text-base font-bold text-slate-900 ${
                            isCompleted ? "line-through text-slate-400" : ""
                          }`}
                        >
                          {item.activity}
                        </h3>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isCritical
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : isHigh
                              ? "bg-rose-50 text-rose-700 border border-rose-100"
                              : isMedium
                              ? "bg-amber-50 text-amber-700 border border-amber-100"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {isCritical ? "PREREQUISITE GAP" : `Priority: ${item.priority.toUpperCase()}`}
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
                      <span>Learn with AI Coach</span>
                    </Link>

                    <Link
                      href={`/practice?topic=${encodeURIComponent(item.topic)}`}
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
