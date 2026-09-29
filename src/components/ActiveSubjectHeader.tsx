"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import {
  Sparkles,
  ChevronDown,
  Layers,
  ShieldAlert,
  Target,
  ArrowRight,
  Brain,
  Check,
  Zap,
} from "lucide-react";

interface ActiveSubjectHeaderProps {
  showQuickSwitcher?: boolean;
}

export default function ActiveSubjectHeader({ showQuickSwitcher = true }: ActiveSubjectHeaderProps) {
  const {
    activeSubject,
    activeSubjectConfig,
    setActiveSubject,
    allSubjects,
    currentTopic,
    progressData,
    adaptiveLoop,
    aiTutorContext,
  } = useSubjectContext();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const hasGap = aiTutorContext.prerequisiteGaps.length > 0;
  const primaryGap = aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultPrerequisiteGap;

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-7 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-indigo-50/70 via-purple-50/40 to-transparent rounded-full pointer-events-none -mr-20 -mt-20 blur-2xl" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left: Active Subject & Context */}
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Active Learning Subject
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
              {activeSubjectConfig.code}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {activeSubjectConfig.level || "Beginner → Intermediate"}
            </span>
            {hasGap && (
              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 animate-pulse">
                <ShieldAlert className="w-3 h-3 text-rose-600" />
                <span>Gap: {primaryGap}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-3xl p-2 rounded-2xl bg-slate-50 border border-slate-100 shadow-2xs">
              {activeSubjectConfig.icon}
            </span>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                {activeSubjectConfig.label}
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 max-w-xl">
                {activeSubjectConfig.description}
              </p>
            </div>
          </div>
        </div>

        {/* Right: Quick Switcher & Key Metrics */}
        <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
          {/* Quick Subject Switcher Dropdown */}
          {showQuickSwitcher && (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 font-bold text-xs text-slate-800 transition-all shadow-2xs cursor-pointer group"
              >
                <Layers className="w-4 h-4 text-indigo-600 group-hover:scale-110 transition-transform" />
                <span>Switch Subject</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl p-2 z-50 animate-scale-in">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Curriculum Subjects
                  </div>
                  <div className="space-y-1">
                    {allSubjects.map((sub) => {
                      const isSelected = activeSubject === sub.key;
                      return (
                        <button
                          key={sub.key}
                          type="button"
                          onClick={() => {
                            setActiveSubject(sub.key);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? "bg-indigo-600 text-white shadow-xs"
                              : "text-slate-700 hover:bg-slate-50"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="text-base">{sub.icon}</span>
                            <span className="truncate">{sub.label}</span>
                          </div>
                          {isSelected && <Check className="w-3.5 h-3.5 text-white flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Overall Mastery Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-indigo-50/80 border border-indigo-100 text-indigo-900">
            <span className="text-[11px] font-bold text-indigo-700">Mastery:</span>
            <span className="text-sm font-mono font-extrabold text-indigo-900">
              {progressData.overallMastery}%
            </span>
          </div>

          {/* Current Focus Pill */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-slate-800">
            <Target className="w-3.5 h-3.5 text-indigo-600" />
            <div className="text-[11px]">
              <span className="text-slate-400 font-semibold mr-1">Current:</span>
              <strong className="text-slate-800 font-bold truncate max-w-[140px] inline-block align-bottom">
                {currentTopic}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
