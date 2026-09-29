"use client";

import React, { useState } from "react";
import AppLayout from "@/components/AppLayout";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
import SkillGraph, { SkillNode } from "@/components/SkillGraph";
import SkillNodeDetails from "@/components/SkillNodeDetails";
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
import { useSubjectContext } from "@/context/SubjectContext";

export default function SkillGraphPage() {
  const { activeSubject, activeSubjectConfig, skillGraph, aiTutorContext } = useSubjectContext();
  const [selectedNodeModal, setSelectedNodeModal] = useState<SkillNode | null>(null);

  const skills = skillGraph.skills;
  const weakSkills = skills.filter((s) => s.status === "weak" || s.isPrerequisiteGap);
  const masteredSkills = skills.filter((s) => s.status === "mastered");

  return (
    <AppLayout>
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* Global Active Subject Header */}
        <ActiveSubjectHeader />

        {/* Header with Metrics Bar */}
        <div data-scroll="fade-down" className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Brain className="w-5 h-5" />
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Knowledge & Prerequisite Skill Graph
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Visualizing how foundational prerequisites unlock advanced mastery for <strong className="text-slate-800">{activeSubjectConfig.label}</strong>.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Mastered
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block" /> Practicing
              </span>
              <span className="flex items-center gap-1 font-bold text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" /> Prerequisite Gap
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-100">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Concepts
              </span>
              <span className="text-xl font-extrabold font-mono text-slate-800">
                {skills.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Mastered
              </span>
              <span className="text-xl font-extrabold font-mono text-emerald-700">
                {masteredSkills.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-rose-50/50 border border-rose-100">
              <span className="text-[11px] font-bold text-rose-700 uppercase tracking-wider block">
                Prerequisite Gaps
              </span>
              <span className="text-xl font-extrabold font-mono text-rose-700">
                {weakSkills.length}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider block">
                Current Focus
              </span>
              <span className="text-xs font-bold text-indigo-900 truncate block mt-1">
                {activeSubjectConfig.defaultCurrentTopic || activeSubjectConfig.topics[1]?.name || activeSubjectConfig.label}
              </span>
            </div>
          </div>
        </div>

        {/* Skill Graph Component */}
        <div>
          <SkillGraph
            subject={activeSubject}
            onSelectNode={(node) => setSelectedNodeModal(node)}
          />
        </div>

        {/* Prerequisite Remediation Action Banner */}
        {weakSkills.length > 0 && (
          <div className="bg-gradient-to-r from-rose-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2 max-w-xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-200 border border-rose-400/30 text-xs font-semibold">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  <span>Prerequisite Gap Detected</span>
                </div>
                <h3 className="text-xl font-bold tracking-tight">
                  Clear {weakSkills[0].name} to Unlock Downstream Milestones
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Diagnostic calibrated an active prerequisite deficit in {weakSkills[0].name}.
                  Spending 10 minutes with the Socratic AI Coach will unblock your progress.
                </p>
              </div>

              <div className="flex-shrink-0 flex items-center gap-3">
                <Link
                  href={`/tutor?topic=${encodeURIComponent(weakSkills[0].name)}`}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white text-slate-900 hover:bg-indigo-50 font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Review {weakSkills[0].name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Node Details Slide-Over / Modal */}
        <SkillNodeDetails
          node={selectedNodeModal}
          onClose={() => setSelectedNodeModal(null)}
        />
      </div>
    </AppLayout>
  );
}
