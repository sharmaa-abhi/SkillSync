"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
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
  Check,
  Brain,
  ShieldAlert,
  Target,
} from "lucide-react";

export default function LearningPlan() {
  const {
    activeSubject,
    activeSubjectConfig,
    learningPlan,
    togglePlanItem,
    knowledgeState,
    aiTutorContext,
    triggerAdaptiveRecalibration,
  } = useSubjectContext();

  const [isRegenerating, setIsRegenerating] = useState(false);

  const completedCount = learningPlan.items.filter((item) => item.isCompleted).length;
  const progressPercent = learningPlan.items.length > 0
    ? Math.round((completedCount / learningPlan.items.length) * 100)
    : 0;

  const handleRegenerate = () => {
    setIsRegenerating(true);
    triggerAdaptiveRecalibration("Re-sequence Learning Plan Roadmap");
    setTimeout(() => {
      setIsRegenerating(false);
    }, 1000);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. Plan Overview Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BookOpen className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Personalized Learning Pathway
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-500">
              Calibrated dynamically for <strong className="text-slate-800">{activeSubjectConfig.label}</strong> based on identified prerequisite gaps.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start lg:self-auto">
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-xs font-bold text-indigo-700 transition-colors cursor-pointer disabled:opacity-60"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRegenerating ? "animate-spin" : ""}`} />
              <span>{isRegenerating ? "Adapting Plan..." : "Re-sequence Plan"}</span>
            </button>
          </div>
        </div>

        {/* Diagnostic Context Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Current Level</span>
            <span className="text-sm font-extrabold text-slate-800">
              {activeSubjectConfig.level || "Beginner → Intermediate"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Known Concepts</span>
            <span className="text-sm font-extrabold text-emerald-800 truncate block">
              {aiTutorContext.knownConcepts.slice(0, 2).join(", ") || "Foundations Solid"}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
            <span className="text-[10px] font-bold uppercase text-rose-700 block">Prerequisite Gaps</span>
            <span className="text-sm font-extrabold text-rose-800 truncate block">
              {aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultPrerequisiteGap}
            </span>
          </div>
          <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
            <span className="text-[10px] font-bold uppercase text-indigo-700 block">Estimated Effort</span>
            <span className="text-sm font-extrabold text-indigo-900">
              {learningPlan.estimatedDuration}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-700">Curriculum Completion</span>
            <span className="font-mono text-indigo-600">
              {completedCount} of {learningPlan.items.length} Tasks ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 3. Task Sequence Roadmap */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-400 px-1">
          Adaptive Task Sequence (Dependency Order)
        </h3>

        <div className="space-y-3">
          {learningPlan.items.map((item) => {
            const isCompleted = !!item.isCompleted;
            return (
              <div
                key={item.order}
                className={`p-5 rounded-3xl border transition-all duration-200 bg-white ${
                  item.priority === "critical"
                    ? "border-rose-200 shadow-rose-100/50"
                    : item.priority === "high"
                    ? "border-amber-200 shadow-amber-100/50"
                    : "border-slate-200/90 shadow-slate-100/50"
                } ${isCompleted ? "opacity-75 bg-slate-50/80" : "shadow-sm"}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Checkbox & Task Details */}
                  <div className="flex items-start gap-3.5">
                    <button
                      type="button"
                      onClick={() => togglePlanItem(item.order)}
                      className={`w-6 h-6 rounded-xl flex items-center justify-center border transition-all flex-shrink-0 mt-1 cursor-pointer ${
                        isCompleted
                          ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                          : "border-slate-300 hover:border-indigo-500 bg-white"
                      }`}
                      title={isCompleted ? "Mark incomplete" : "Mark completed"}
                    >
                      {isCompleted && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                          Step {item.order}
                        </span>
                        <span className="text-sm font-bold text-slate-900">{item.topic}</span>
                        <span
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                            item.priority === "critical"
                              ? "bg-rose-100 text-rose-800 border border-rose-200"
                              : item.priority === "high"
                              ? "bg-amber-100 text-amber-800 border border-amber-200"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {item.priority === "critical" ? "⚠️ CRITICAL GAP" : item.priority.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.durationMinutes} mins
                        </span>
                      </div>

                      <h4 className={`text-base font-extrabold mt-1 tracking-tight ${isCompleted ? "line-through text-slate-400" : "text-slate-900"}`}>
                        {item.activity}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                        <strong className="text-slate-700">Rationale:</strong> {item.reason}
                      </p>
                    </div>
                  </div>

                  {/* Right: Direct Actions */}
                  <div className="flex items-center gap-2 self-start sm:self-center flex-shrink-0">
                    <Link
                      href={`/practice?topic=${encodeURIComponent(item.topic)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors shadow-2xs"
                    >
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Practice</span>
                    </Link>
                    <Link
                      href={`/tutor?topic=${encodeURIComponent(item.topic)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                      <span>AI Coach</span>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
