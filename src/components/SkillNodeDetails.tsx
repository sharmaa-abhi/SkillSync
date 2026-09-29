"use client";

import React from "react";
import Link from "next/link";
import { SkillNode, SkillStatus } from "@/components/SkillGraph";
import {
  X,
  Sparkles,
  HelpCircle,
  ShieldAlert,
  ArrowRight,
  Brain,
  Code2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  Clock,
  Layers,
} from "lucide-react";

interface SkillNodeDetailsProps {
  node: SkillNode | null;
  onClose: () => void;
  onPractice?: (node: SkillNode) => void;
}

export default function SkillNodeDetails({ node, onClose, onPractice }: SkillNodeDetailsProps) {
  if (!node) return null;

  const isGap = node.isPrerequisiteGap || node.status === "weak";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-5 animate-scale-in">
        {/* Top Header */}
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-mono">
                {node.levelTag}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  isGap
                    ? "bg-rose-100 text-rose-800 border-rose-200"
                    : node.status === "mastered"
                    ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                    : "bg-indigo-100 text-indigo-800 border-indigo-200"
                }`}
              >
                {isGap ? "PREREQUISITE GAP" : node.status.toUpperCase().replace("_", " ")}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">{node.name}</h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mastery and Confidence Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Mastery Score</span>
            <span className="text-xl font-extrabold font-mono text-slate-900">{node.masteryScore}%</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Confidence</span>
            <span className="text-sm font-extrabold text-indigo-700">{node.confidence || "Medium"}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Importance</span>
            <span className="text-sm font-extrabold text-slate-800">{node.importance || "Core"}</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-center">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Estimated Study</span>
            <span className="text-sm font-extrabold text-slate-800">{node.estimatedMinutes} mins</span>
          </div>
        </div>

        {/* 1. What it means */}
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Brain className="w-4 h-4 text-indigo-600" />
            Concept Overview (What It Means)
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {node.description}
          </p>
        </div>

        {/* 2. Why it matters */}
        <div className="space-y-1">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-amber-500" />
            Educational Impact (Why It Matters)
          </h4>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-amber-50/50 p-3.5 rounded-2xl border border-amber-100">
            {node.whyItMatters}
          </p>
        </div>

        {/* 3. Real-world usage */}
        {node.practicalUsage && (
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-emerald-600" />
              Real-World Industry Usage
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-emerald-50/50 p-3.5 rounded-2xl border border-emerald-100">
              {node.practicalUsage}
            </p>
          </div>
        )}

        {/* 4. Code Example */}
        {node.codeExample && (
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Working Code Example
            </h4>
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-4 overflow-hidden">
              <pre className="text-xs font-mono text-indigo-200 overflow-x-auto whitespace-pre leading-relaxed">
                {node.codeExample}
              </pre>
            </div>
          </div>
        )}

        {/* 5. Common Mistakes */}
        {node.commonMistakes && node.commonMistakes.length > 0 && (
          <div className="space-y-1">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              Common Mistakes & Pitfalls
            </h4>
            <div className="bg-rose-50/50 p-3.5 rounded-2xl border border-rose-100 space-y-1.5">
              {node.commonMistakes.map((mistake, idx) => (
                <div key={idx} className="flex items-start gap-2 text-xs text-rose-900">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{mistake}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Practice Recommendation */}
        {node.practiceRecommendation && (
          <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100 text-xs text-purple-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
            <div>
              <strong className="block font-bold">Recommendation:</strong>
              <span>{node.practiceRecommendation}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-slate-100">
          <Link
            href={`/practice?topic=${encodeURIComponent(node.name)}`}
            onClick={onClose}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200 cursor-pointer"
          >
            <HelpCircle className="w-4 h-4" />
            <span>Practice {node.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href={`/tutor?topic=${encodeURIComponent(node.name)}`}
            onClick={onClose}
            className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Ask Socratic AI Coach</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
