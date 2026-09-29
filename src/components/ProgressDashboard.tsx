"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
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
  Clock,
  ShieldAlert,
  Brain,
  HelpCircle,
} from "lucide-react";

export default function ProgressDashboard() {
  const {
    activeSubject,
    activeSubjectConfig,
    knowledgeState,
    progressData,
    aiTutorContext,
    completedTopics,
  } = useSubjectContext();

  const topicList = Object.values(knowledgeState);
  const strongTopics = topicList.filter((t) => t.score >= 70);
  const weakTopics = topicList.filter((t) => t.score < 50 || t.isPrerequisiteGap);
  const intermediateTopics = topicList.filter((t) => t.score >= 50 && t.score < 70);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. Top Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Overall Mastery */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Overall Track Mastery</span>
            <Award className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {progressData.overallMastery}%
            </span>
            <span className="text-xs font-bold text-emerald-600">+8% growth</span>
          </div>
          <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full"
              style={{ width: `${Math.max(10, progressData.overallMastery)}%` }}
            />
          </div>
        </div>

        {/* Learning Streak */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Daily Streak</span>
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {progressData.streakDays}
            </span>
            <span className="text-xs text-slate-500">Days Active</span>
          </div>
          <p className="text-[11px] text-slate-400">Consistency multiplier active (1.2x)</p>
        </div>

        {/* Study Minutes */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Time Dedicated</span>
            <Clock className="w-4 h-4 text-purple-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {progressData.studyMinutes}
            </span>
            <span className="text-xs text-slate-500">Minutes</span>
          </div>
          <p className="text-[11px] text-slate-400">Target: 90 mins / week</p>
        </div>

        {/* Topics Mastered */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Mastered Topics</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900">
              {strongTopics.length}
            </span>
            <span className="text-xs text-slate-500">of {topicList.length} Concepts</span>
          </div>
          <p className="text-[11px] text-slate-400">{weakTopics.length} prerequisite gaps</p>
        </div>
      </div>

      {/* 3. Subject-Specific Topic Mastery Progress */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h3 className="text-lg font-extrabold text-slate-900 tracking-tight">
                {activeSubjectConfig.label} — Topic Mastery Breakdown
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Live proficiency scores per concept, connected to Skill Graph nodes and practice diagnostics.
            </p>
          </div>
          <Link
            href="/graph"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 self-start sm:self-auto"
          >
            <span>View in Skill Graph</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Mastery Bars */}
        <div className="space-y-4">
          {topicList.map((t) => {
            const isGap = t.isPrerequisiteGap || t.score < 40;
            return (
              <div key={t.topicName} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900">{t.topicName}</span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        t.score >= 70
                          ? "bg-emerald-100 text-emerald-800"
                          : isGap
                          ? "bg-rose-100 text-rose-800 border border-rose-200"
                          : "bg-indigo-100 text-indigo-800"
                      }`}
                    >
                      {t.score >= 70 ? "Mastered" : isGap ? "⚠️ Prerequisite Gap" : "In Progress"}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-extrabold text-slate-900">
                      {t.score}%
                    </span>
                    <Link
                      href={`/practice?topic=${encodeURIComponent(t.topicName)}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      Practice →
                    </Link>
                  </div>
                </div>

                {/* Meter */}
                <div className="w-full h-2.5 bg-slate-200/80 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      t.score >= 70
                        ? "bg-emerald-500"
                        : t.score >= 50
                        ? "bg-indigo-600"
                        : "bg-rose-500"
                    }`}
                    style={{ width: `${Math.max(t.score, 6)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Strong vs Weak Competencies Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Proven Strengths */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-emerald-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Proven Strengths ({strongTopics.length})</span>
          </div>
          <div className="space-y-2">
            {strongTopics.map((t) => (
              <div
                key={t.topicName}
                className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 text-xs"
              >
                <strong className="text-emerald-950 font-bold">{t.topicName}</strong>
                <span className="font-mono font-bold text-emerald-700">{t.score}%</span>
              </div>
            ))}
            {strongTopics.length === 0 && (
              <p className="text-xs text-slate-400">Complete practice assessments to build strengths.</p>
            )}
          </div>
        </div>

        {/* Targeted Deficits & Prerequisite Gaps */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-700 font-extrabold text-sm pb-2 border-b border-slate-100">
            <ShieldAlert className="w-4 h-4 text-rose-600" />
            <span>Prerequisite Gaps & Deficits ({weakTopics.length})</span>
          </div>
          <div className="space-y-2">
            {weakTopics.map((t) => (
              <div
                key={t.topicName}
                className="flex items-center justify-between p-3 rounded-xl bg-rose-50/50 border border-rose-100 text-xs"
              >
                <div>
                  <strong className="text-rose-950 font-bold block">{t.topicName}</strong>
                  <span className="text-[10px] text-rose-600 font-semibold">
                    Blocks downstream milestones
                  </span>
                </div>
                <Link
                  href={`/practice?topic=${encodeURIComponent(t.topicName)}`}
                  className="px-2.5 py-1 rounded-lg bg-rose-600 text-white font-bold text-[11px] hover:bg-rose-700 transition-colors shadow-2xs"
                >
                  Remediate
                </Link>
              </div>
            ))}
            {weakTopics.length === 0 && (
              <p className="text-xs text-emerald-600 font-semibold">Zero prerequisite gaps! Outstanding work.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
