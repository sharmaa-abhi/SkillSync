"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import SkillGraph, { MATH_SKILLS, DBMS_SKILLS } from "@/components/SkillGraph";
import Link from "next/link";
import {
  Brain,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Target,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

export default function SkillGraphPage() {
  const [subject, setSubject] = useState<"Maths" | "DBMS">("Maths");

  const skills = subject === "Maths" ? MATH_SKILLS : DBMS_SKILLS;
  const weakSkills = skills.filter((s) => s.status === "weak" || s.isPrerequisiteGap);
  const masteredSkills = skills.filter((s) => s.status === "mastered");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Header with Subject Switcher */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 card-hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Brain className="w-5 h-5" />
                </span>
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Knowledge & Prerequisite Skill Graph
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Visualizing how foundational prerequisites unlock advanced mastery. Red highlights indicate blockers.
              </p>
            </div>

            {/* Subject Toggle */}
            <div className="flex items-center gap-2 p-1.5 bg-slate-100 rounded-xl">
              <button
                type="button"
                onClick={() => setSubject("Maths")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subject === "Maths"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                📐 Mathematics (Demo)
              </button>
              <button
                type="button"
                onClick={() => setSubject("DBMS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  subject === "DBMS"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🗄️ Database Systems
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Concepts
              </span>
              <span className="text-xl font-extrabold font-mono text-slate-800">
                {skills.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Mastered
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {masteredSkills.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-rose-50/50 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Prerequisite Gaps
              </span>
              <span className="text-xl font-extrabold font-mono text-rose-700">
                {weakSkills.length}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                Current Focus
              </span>
              <span className="text-xs font-bold text-indigo-900 truncate block mt-1">
                {subject === "Maths" ? "Quadratic Equations" : "Transactions"}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Graph Component */}
        <SkillGraph subject={subject} />

        {/* Action Callout based on Prerequisite Gap */}
        {weakSkills.length > 0 && (
          <div className="bg-gradient-to-r from-rose-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Prerequisite Gap Detected</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Clear {weakSkills[0].name} to Unlock {subject === "Maths" ? "Quadratic Mastery" : "Transactions"}
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your last diagnostic discovered an foundational gap in {weakSkills[0].name}.
                  Spending 10 minutes with the Socratic AI Coach will unblock your progress.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href={`/tutor?topic=${encodeURIComponent(weakSkills[0].name)}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Review {weakSkills[0].name} (10 min)</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
