"use client";

import React, { useState } from "react";
import { useSubjectContext } from "@/context/SubjectContext";
import {
  Sparkles,
  RefreshCw,
  X,
  ShieldAlert,
  ArrowRight,
  Brain,
  Target,
  CheckCircle2,
  Activity,
  Layers,
} from "lucide-react";

const STAGES = [
  { index: 1, name: "Diagnose", desc: "Diagnostic assessment baseline" },
  { index: 2, name: "Detect Gaps", desc: "Isolate prerequisite deficits" },
  { index: 3, name: "Update Model", desc: "Recalculate Bayesian knowledge" },
  { index: 4, name: "Adapt Plan", desc: "Re-sequence milestone priorities" },
  { index: 5, name: "Generate Practice", desc: "Target weak concept questions" },
  { index: 6, name: "Re-evaluate", desc: "Grade performance evidence" },
  { index: 7, name: "Update Graph", desc: "Propagate node status updates" },
];

export default function AdaptiveLoopStatus() {
  const {
    activeSubject,
    activeSubjectConfig,
    adaptiveLoop,
    triggerAdaptiveRecalibration,
    progressData,
  } = useSubjectContext();

  const [modalOpen, setModalOpen] = useState(false);
  const [isRecalibrating, setIsRecalibrating] = useState(false);

  const handleRecalibrate = () => {
    setIsRecalibrating(true);
    triggerAdaptiveRecalibration("Interactive User Diagnostics Trigger");
    setTimeout(() => {
      setIsRecalibrating(false);
    }, 1200);
  };

  return (
    <>
      {/* Clickable Sidebar Card / Trigger */}
      <div className="px-3 py-1.5">
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="w-full text-left p-3 rounded-2xl bg-gradient-to-b from-indigo-50/80 via-purple-50/50 to-indigo-50/70 border border-indigo-200/90 shadow-2xs hover:border-indigo-300 hover:shadow-xs transition-all duration-300 cursor-pointer group"
        >
          <div className="flex items-center justify-between gap-1 mb-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-950">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 group-hover:rotate-12 transition-transform" />
              <span>Adaptive Loop Active</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-indigo-700 bg-white/80 px-1.5 py-0.5 rounded border border-indigo-100">
              {activeSubjectConfig.shortLabel}
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-tight">
            Calibrated to your {activeSubjectConfig.label} diagnostic & prerequisite gaps.
          </p>
          <div className="mt-2 flex items-center justify-between text-[10px] text-indigo-700 font-semibold pt-1 border-t border-indigo-100/70">
            <span>Stage: {adaptiveLoop.currentStage}</span>
            <span className="underline group-hover:text-indigo-900">View Cycle →</span>
          </div>
        </button>
      </div>

      {/* Interactive Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-xl w-full p-6 sm:p-7 shadow-2xl relative space-y-5 animate-scale-in">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                    <Activity className="w-5 h-5 animate-pulse" />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                      Adaptive Learning Engine
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
                        {activeSubjectConfig.label}
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500">
                      Closed-loop feedback orchestrating personalized learning pathways.
                    </p>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Visual 7-Step Cycle */}
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Continuous 7-Step Loop
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {STAGES.map((s) => {
                  const isActive = adaptiveLoop.currentStage === s.name;
                  return (
                    <div
                      key={s.name}
                      className={`p-2.5 rounded-xl border transition-all text-xs flex items-center gap-2.5 ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-700 shadow-sm font-bold scale-[1.02]"
                          : "bg-slate-50 text-slate-700 border-slate-200/80"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 ${
                          isActive ? "bg-white text-indigo-700" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {s.index}
                      </span>
                      <div className="truncate">
                        <span className="block truncate font-bold">{s.name}</span>
                        <span className={`text-[10px] truncate block ${isActive ? "text-indigo-100" : "text-slate-400"}`}>
                          {s.desc}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Current Subject Detected Gaps */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/90 text-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-rose-900 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  Identified Prerequisite Gaps ({activeSubjectConfig.label}):
                </span>
                <span className="text-[10px] font-mono text-rose-700 font-bold">
                  Targeted for Remediation
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(adaptiveLoop.detectedGaps.length > 0 ? adaptiveLoop.detectedGaps : activeSubjectConfig.defaultWeaknesses).map(
                  (gap, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white border border-rose-200 text-rose-800 text-[11px] font-bold shadow-2xs"
                    >
                      ⚠️ {gap}
                    </span>
                  )
                )}
              </div>
            </div>

            {/* Recent Adaptive Evidence */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-1">
              <span className="font-bold text-slate-700 text-[10px] uppercase tracking-wider block">
                Latest Learning Signal & Recalibration:
              </span>
              <p className="text-slate-800 font-medium">{adaptiveLoop.recentAction}</p>
              <span className="text-[10px] text-slate-400 block pt-0.5">
                Timestamp: {adaptiveLoop.lastRecalibrated} • Overall Track Mastery: {progressData.overallMastery}%
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleRecalibrate}
                disabled={isRecalibrating}
                className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 disabled:opacity-60 cursor-pointer"
              >
                <RefreshCw className={`w-4 h-4 ${isRecalibrating ? "animate-spin" : ""}`} />
                <span>{isRecalibrating ? "Recalibrating Model..." : "Recalibrate Subject Model Now"}</span>
              </button>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="py-3 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
