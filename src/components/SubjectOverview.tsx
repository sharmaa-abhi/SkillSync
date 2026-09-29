"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
import SkillGraph, { SkillNode } from "@/components/SkillGraph";
import SkillNodeDetails from "@/components/SkillNodeDetails";
import {
  Sparkles,
  ArrowRight,
  Target,
  ShieldAlert,
  Clock,
  CheckCircle2,
  BookOpen,
  HelpCircle,
  TrendingUp,
  Brain,
  Zap,
  RotateCcw,
  Flame,
  Award,
  Layers,
} from "lucide-react";

export default function SubjectOverview() {
  const {
    activeSubject,
    activeSubjectConfig,
    currentTopic,
    knowledgeState,
    learningPlan,
    progressData,
    aiTutorContext,
  } = useSubjectContext();

  const [selectedNodeModal, setSelectedNodeModal] = useState<SkillNode | null>(null);

  const topicList = Object.values(knowledgeState);
  const nextTopic = activeSubjectConfig.defaultNextTopic || activeSubjectConfig.topics[2]?.name || "Advanced Concepts";
  const prerequisiteGap = aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultPrerequisiteGap;
  const coveragePercent = activeSubjectConfig.defaultKnowledgeCoverage || progressData.overallMastery;
  const recommendedToday = activeSubjectConfig.defaultRecommendedToday || `Practice ${currentTopic} questions`;

  // Spaced repetition queue for active subject
  const dueItems = topicList.filter((t) => t.score < 70).slice(0, 3);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. Primary Subject-Specific Action & Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card A: Continue Active Subject */}
        <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-md shadow-indigo-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-indigo-200 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Continue Learning</span>
              <span className="text-xl">{activeSubjectConfig.icon}</span>
            </div>
            <h3 className="text-xl font-extrabold tracking-tight mb-1">
              Continue {activeSubjectConfig.shortLabel}
            </h3>
            <p className="text-xs text-indigo-100 line-clamp-2 leading-relaxed">
              Current Topic: <strong className="text-white underline">{currentTopic}</strong>
            </p>
            <div className="mt-2 text-[11px] text-indigo-200">
              Next: <span className="font-semibold text-white">{nextTopic}</span>
            </div>
          </div>

          <div className="pt-4 mt-2 border-t border-indigo-500/40 flex items-center justify-between">
            <Link
              href={`/practice?topic=${encodeURIComponent(currentTopic)}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-indigo-700 font-extrabold text-xs hover:bg-indigo-50 transition-colors shadow-2xs"
            >
              <span>Practice Now</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/tutor?topic=${encodeURIComponent(currentTopic)}`}
              className="text-xs text-indigo-200 hover:text-white font-semibold"
            >
              AI Coach →
            </Link>
          </div>
        </div>

        {/* Card B: Knowledge Coverage */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Knowledge Coverage</span>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold font-mono text-slate-900">
                {progressData.overallMastery}%
              </span>
              <span className="text-xs font-bold text-emerald-600">+12% this week</span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full transition-all duration-700"
                style={{ width: `${Math.max(10, progressData.overallMastery)}%` }}
              />
            </div>
          </div>
          <div className="pt-3 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
            <span>Confidence: <strong className="text-slate-800">High</strong></span>
            <span>Target: <strong className="text-indigo-600">85% Mastery</strong></span>
          </div>
        </div>

        {/* Card C: Prerequisite Gap Alert */}
        <div className="p-5 rounded-3xl bg-rose-50/70 border border-rose-200/90 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Prerequisite Gap
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-rose-200/80 text-rose-900 font-bold">
                HIGH PRIORITY
              </span>
            </div>
            <h4 className="text-base font-extrabold text-rose-950 truncate">
              {prerequisiteGap}
            </h4>
            <p className="text-xs text-rose-700 mt-1 leading-snug">
              Diagnostic identified conceptual confusion. Remediate to unlock {nextTopic}.
            </p>
          </div>
          <div className="pt-3 border-t border-rose-200/70 flex items-center justify-between">
            <Link
              href={`/practice?topic=${encodeURIComponent(prerequisiteGap || "")}`}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1"
            >
              <span>Remediate Gap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href={`/tutor?topic=${encodeURIComponent(prerequisiteGap || "")}`}
              className="text-[11px] text-rose-600 hover:underline"
            >
              Socratic Hint →
            </Link>
          </div>
        </div>

        {/* Card D: Recommended Today */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <span>Recommended Today</span>
              <Sparkles className="w-4 h-4 text-amber-500" />
            </div>
            <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2">
              {recommendedToday}
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Calibrated by the AI Coach based on your recent practice errors.
            </p>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-slate-500 text-[11px]">
              <Clock className="w-3.5 h-3.5" /> 15 mins
            </span>
            <Link
              href={`/practice?topic=${encodeURIComponent(currentTopic)}`}
              className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              Start Session →
            </Link>
          </div>
        </div>
      </div>

      {/* 3. Skill Graph Section (Partial Knowledge Model) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              {activeSubjectConfig.label} Skill Graph — Partial Knowledge Model
            </h2>
            <p className="text-xs text-slate-500">
              Interactive topology representing your actual mastery, gaps, and prerequisites. Click any node to inspect practical knowledge.
            </p>
          </div>
          <Link
            href="/graph"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            Full Graph View →
          </Link>
        </div>

        <SkillGraph
          subject={activeSubject}
          compact={false}
          onSelectNode={(node) => setSelectedNodeModal(node)}
        />
      </div>

      {/* 4. Two-Column Subject Deep Dive: Active Learn Plan & Topic Mastery Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Subject Learning Plan */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-indigo-600" />
                Adaptive Learning Plan for {activeSubjectConfig.shortLabel}
              </h3>
              <p className="text-xs text-slate-500">
                Personalized task sequence based on prerequisite dependencies and current partial knowledge.
              </p>
            </div>
            <Link href="/plan" className="text-xs font-bold text-indigo-600 hover:underline">
              View All Plan Details →
            </Link>
          </div>

          <div className="space-y-2.5">
            {learningPlan.items.slice(0, 4).map((item) => (
              <div
                key={item.order}
                className={`p-3.5 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                  item.priority === "critical"
                    ? "bg-rose-50/50 border-rose-200"
                    : item.priority === "high"
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-slate-50/80 border-slate-200/80"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono flex-shrink-0 mt-0.5 ${
                      item.priority === "critical"
                        ? "bg-rose-600 text-white"
                        : "bg-indigo-600 text-white"
                    }`}
                  >
                    {item.order}
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{item.topic}</span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          item.priority === "critical"
                            ? "bg-rose-100 text-rose-800"
                            : item.priority === "high"
                            ? "bg-amber-100 text-amber-800"
                            : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {item.priority}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 leading-snug">{item.activity}</p>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Why: {item.reason}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/practice?topic=${encodeURIComponent(item.topic)}`}
                  className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-indigo-50 hover:border-indigo-200 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors flex-shrink-0 shadow-2xs"
                >
                  Practice
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Topic Mastery & Spaced Repetition */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600" />
              {activeSubjectConfig.shortLabel} Mastery Breakdown
            </h3>
            <span className="text-xs font-mono font-bold text-slate-500">
              {topicList.length} Topics
            </span>
          </div>

          <div className="space-y-3">
            {topicList.slice(0, 6).map((t) => (
              <div key={t.topicName} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800 truncate max-w-[160px]">{t.topicName}</span>
                  <span className="font-mono text-slate-900 font-bold">{t.score}%</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      t.score >= 70
                        ? "bg-emerald-500"
                        : t.score >= 40
                        ? "bg-indigo-600"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.max(t.score, 6)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Spaced Review Due Queue */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Spaced Repetition Due (Retention Boost)
            </span>
            {dueItems.map((item) => (
              <div
                key={item.topicName}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
              >
                <div className="truncate">
                  <strong className="block text-slate-800 font-semibold truncate">{item.topicName}</strong>
                  <span className="text-[10px] text-slate-400">Retention risk: High</span>
                </div>
                <Link
                  href={`/practice?topic=${encodeURIComponent(item.topicName)}`}
                  className="px-2.5 py-1 text-[11px] font-bold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                >
                  Review
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Node Details Modal (when clicked from graph) */}
      <SkillNodeDetails
        node={selectedNodeModal}
        onClose={() => setSelectedNodeModal(null)}
      />
    </div>
  );
}
