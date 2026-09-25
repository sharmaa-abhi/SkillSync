"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ChevronRight,
  BookOpen,
  HelpCircle,
  TrendingUp,
  X,
  ShieldAlert,
} from "lucide-react";

export type SkillStatus = "mastered" | "practicing" | "learning" | "weak" | "not_started";

export interface SkillNode {
  id: string;
  name: string;
  category: "foundation" | "core" | "advanced" | "milestone";
  status: SkillStatus;
  masteryScore: number;
  estimatedMinutes: number;
  prerequisites: string[]; // Node IDs
  nextSkills: string[];
  isPrerequisiteGap?: boolean;
  description: string;
  whyItMatters: string;
  diagnosticNotes?: string;
}

interface SkillGraphProps {
  subject?: "Maths" | "DBMS";
  compact?: boolean; // For dashboard preview
  onSelectNode?: (node: SkillNode) => void;
}

export const MATH_SKILLS: SkillNode[] = [
  {
    id: "alg-manip",
    name: "Algebraic Manipulation",
    category: "foundation",
    status: "mastered",
    masteryScore: 84,
    estimatedMinutes: 10,
    prerequisites: [],
    nextSkills: ["factorisation"],
    description: "Expanding brackets, collecting like terms, and isolating variables.",
    whyItMatters: "Essential ground-level mechanics required for all higher algebraic problem solving.",
    diagnosticNotes: "Demonstrated 84% accuracy in diagnostic. Strong foundation.",
  },
  {
    id: "factorisation",
    name: "Factorisation",
    category: "foundation",
    status: "weak",
    masteryScore: 38,
    estimatedMinutes: 12,
    prerequisites: ["alg-manip"],
    nextSkills: ["quad-eq"],
    isPrerequisiteGap: true,
    description: "Factoring out GCF, grouping, difference of two squares, and monic trinomial factoring.",
    whyItMatters: "Direct prerequisite for solving quadratic equations by factoring and completing the square.",
    diagnosticNotes: "Critical prerequisite gap! Missed 3 of 4 questions involving trinomial factor decomposition.",
  },
  {
    id: "quad-eq",
    name: "Quadratic Equations",
    category: "core",
    status: "practicing",
    masteryScore: 72,
    estimatedMinutes: 15,
    prerequisites: ["factorisation"],
    nextSkills: ["polynomials"],
    description: "Standard form ax² + bx + c = 0, discriminant test, and quadratic formula application.",
    whyItMatters: "Current learning focus. Foundational benchmark for high school & entrance mathematics.",
    diagnosticNotes: "Understands formula application, but gets blocked when factoring standard forms.",
  },
  {
    id: "polynomials",
    name: "Polynomial Functions",
    category: "core",
    status: "learning",
    masteryScore: 55,
    estimatedMinutes: 15,
    prerequisites: ["quad-eq"],
    nextSkills: ["coord-geo"],
    description: "Roots, degree, remainder theorem, and polynomial long division.",
    whyItMatters: "Extends quadratic concepts into higher-degree models used in calculus.",
    diagnosticNotes: "Scheduled next after factorisation prerequisite is cleared.",
  },
  {
    id: "coord-geo",
    name: "Coordinate Geometry",
    category: "advanced",
    status: "not_started",
    masteryScore: 0,
    estimatedMinutes: 20,
    prerequisites: ["polynomials"],
    nextSkills: [],
    description: "Parabolas, vertex form, axis of symmetry, and intercepts on the Cartesian plane.",
    whyItMatters: "Visualizes quadratic and polynomial relationships geometrically.",
    diagnosticNotes: "Locked until quadratic equations reach 80% mastery.",
  },
];

export const DBMS_SKILLS: SkillNode[] = [
  {
    id: "er-model",
    name: "ER Modeling",
    category: "foundation",
    status: "mastered",
    masteryScore: 82,
    estimatedMinutes: 10,
    prerequisites: [],
    nextSkills: ["rel-model"],
    description: "Entities, attributes, relationships, and cardinalities.",
    whyItMatters: "Foundation of all relational database architecture.",
    diagnosticNotes: "Diagnostic score: 82%. Strong conceptual grounding.",
  },
  {
    id: "rel-model",
    name: "Relational Algebra",
    category: "foundation",
    status: "mastered",
    masteryScore: 78,
    estimatedMinutes: 10,
    prerequisites: ["er-model"],
    nextSkills: ["normalization"],
    description: "Select, Project, Cartesian product, Joins, and Union operations.",
    whyItMatters: "Mathematical backbone for SQL query generation.",
    diagnosticNotes: "Solid accuracy in basic operations.",
  },
  {
    id: "normalization",
    name: "Normalization (1NF-BCNF)",
    category: "core",
    status: "weak",
    masteryScore: 35,
    estimatedMinutes: 15,
    prerequisites: ["rel-model"],
    nextSkills: ["transactions"],
    isPrerequisiteGap: true,
    description: "Functional dependencies, candidate keys, 2NF partial dependencies, 3NF transitive dependencies.",
    whyItMatters: "Critical design discipline to prevent insertion, update, and deletion anomalies.",
    diagnosticNotes: "Prerequisite gap: Unable to isolate partial dependencies in compound key relations.",
  },
  {
    id: "transactions",
    name: "Transactions & ACID",
    category: "core",
    status: "practicing",
    masteryScore: 68,
    estimatedMinutes: 15,
    prerequisites: ["normalization"],
    nextSkills: ["concurrency"],
    description: "Atomicity, Consistency, Isolation levels (Read Uncommitted to Serializable), and Durability.",
    whyItMatters: "Ensures mission-critical reliability for enterprise databases.",
    diagnosticNotes: "Struggles with Phantom Read vs Non-repeatable Read anomalies.",
  },
  {
    id: "concurrency",
    name: "Concurrency Control",
    category: "advanced",
    status: "not_started",
    masteryScore: 0,
    estimatedMinutes: 20,
    prerequisites: ["transactions"],
    nextSkills: [],
    description: "2-Phase Locking (2PL), deadlocks, wait-for graphs, and timestamp ordering.",
    whyItMatters: "High-scale multi-user database consistency.",
    diagnosticNotes: "Locked until Normalization & Transactions prerequisites reach 75%.",
  },
];

export default function SkillGraph({
  subject = "Maths",
  compact = false,
  onSelectNode,
}: SkillGraphProps) {
  const skills = subject === "Maths" ? MATH_SKILLS : DBMS_SKILLS;
  const [selectedNode, setSelectedNode] = useState<SkillNode | null>(skills[1]); // default to factorisation / weak node
  const [filter, setFilter] = useState<"all" | "weak" | "active">("all");

  const handleNodeClick = (node: SkillNode) => {
    setSelectedNode(node);
    if (onSelectNode) onSelectNode(node);
  };

  const getStatusColor = (status: SkillStatus, isGap?: boolean) => {
    if (isGap || status === "weak") {
      return {
        bg: "bg-rose-50",
        border: "border-rose-300 ring-4 ring-rose-500/10",
        text: "text-rose-700",
        badge: "bg-rose-100 text-rose-800 border-rose-200",
        nodeBg: "bg-gradient-to-br from-rose-500 to-rose-600 text-white",
      };
    }
    switch (status) {
      case "mastered":
        return {
          bg: "bg-emerald-50",
          border: "border-emerald-200",
          text: "text-emerald-700",
          badge: "bg-emerald-100 text-emerald-800 border-emerald-200",
          nodeBg: "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white",
        };
      case "practicing":
        return {
          bg: "bg-indigo-50",
          border: "border-indigo-300 ring-4 ring-indigo-500/15",
          text: "text-indigo-700",
          badge: "bg-indigo-100 text-indigo-800 border-indigo-200",
          nodeBg: "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white",
        };
      case "learning":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          badge: "bg-amber-100 text-amber-800 border-amber-200",
          nodeBg: "bg-gradient-to-br from-amber-500 to-amber-600 text-white",
        };
      default:
        return {
          bg: "bg-slate-50",
          border: "border-slate-200",
          text: "text-slate-600",
          badge: "bg-slate-100 text-slate-700 border-slate-200",
          nodeBg: "bg-slate-300 text-slate-700",
        };
    }
  };

  const filteredSkills = skills.filter((s) => {
    if (filter === "weak") return s.status === "weak" || s.isPrerequisiteGap;
    if (filter === "active") return s.status === "practicing" || s.status === "learning";
    return true;
  });

  return (
    <div className={`bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden ${compact ? "p-5" : "p-6 sm:p-8"}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                Knowledge & Prerequisite Skill Graph
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {subject} Track
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Visual dependency mapping showing foundational prerequisites, gaps, and next milestones.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        {!compact && (
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-lg transition-all ${filter === "all" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              All Skills ({skills.length})
            </button>
            <button
              onClick={() => setFilter("weak")}
              className={`px-3 py-1 rounded-lg flex items-center gap-1 transition-all ${filter === "weak" ? "bg-rose-50 text-rose-700 shadow-2xs font-bold" : "text-slate-500 hover:text-slate-800"}`}
            >
              <AlertTriangle className="w-3 h-3 text-rose-500" />
              <span>Gaps Only</span>
            </button>
            <button
              onClick={() => setFilter("active")}
              className={`px-3 py-1 rounded-lg transition-all ${filter === "active" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-500 hover:text-slate-800"}`}
            >
              In Progress
            </button>
          </div>
        )}
      </div>

      {/* Main Graph Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-6">
        {/* Node Graph Column */}
        <div className={`${compact ? "lg:col-span-12" : "lg:col-span-7"} space-y-4`}>
          {/* Prerequisite Legend */}
          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pb-2">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Mastered (80%+)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" /> Practicing (Focus)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" /> Prerequisite Gap (Blocked)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Locked / Next
            </span>
          </div>

          {/* Sequential Dependency Chain */}
          <div className="relative pl-6 space-y-3 before:absolute before:left-3 before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-200">
            {filteredSkills.map((node, index) => {
              const styles = getStatusColor(node.status, node.isPrerequisiteGap);
              const isSelected = selectedNode?.id === node.id;

              return (
                <div key={node.id} className="relative">
                  {/* Step Connector Marker */}
                  <div
                    className={`absolute -left-[18px] top-4 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs transition-transform duration-200 ${
                      isSelected ? "scale-125 ring-4 ring-indigo-200" : ""
                    } ${styles.nodeBg}`}
                  >
                    {node.status === "mastered" ? "✓" : index + 1}
                  </div>

                  {/* Card Container */}
                  <div
                    onClick={() => handleNodeClick(node)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${styles.bg} ${
                      isSelected ? "border-indigo-600 shadow-md ring-2 ring-indigo-600/20 translate-x-1" : "hover:border-slate-300 hover:shadow-xs"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-slate-900">{node.name}</h4>
                          {node.isPrerequisiteGap && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 flex items-center gap-1 animate-pulse">
                              <ShieldAlert className="w-3 h-3 text-rose-600" />
                              Prerequisite Gap
                            </span>
                          )}
                          {node.status === "practicing" && (
                            <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 text-[10px] font-bold border border-indigo-200">
                              Current Focus
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 mt-1 line-clamp-1">{node.description}</p>
                      </div>

                      {/* Score Badge */}
                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900">
                          {node.masteryScore}%
                        </span>
                        <span className="text-[10px] block text-slate-400 capitalize">
                          {node.status.replace("_", " ")}
                        </span>
                      </div>
                    </div>

                    {/* Prerequisite Linkage Footnote */}
                    {node.prerequisites.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                        <span>
                          Prereq:{" "}
                          <strong className="text-slate-700">
                            {skills.find((s) => s.id === node.prerequisites[0])?.name || node.prerequisites[0]}
                          </strong>
                        </span>
                        <span className="text-indigo-600 font-medium hover:underline flex items-center gap-0.5">
                          Inspect <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspector Drawer Column (Full View Only) */}
        {!compact && selectedNode && (
          <div className="lg:col-span-5 bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Skill Inspector
              </span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(selectedNode.status, selectedNode.isPrerequisiteGap).badge}`}>
                {selectedNode.status.toUpperCase()}
              </span>
            </div>

            <div>
              <h4 className="text-lg font-bold text-slate-900">{selectedNode.name}</h4>
              <p className="text-xs text-slate-600 mt-1">{selectedNode.description}</p>
            </div>

            {/* Diagnostic Alert Box */}
            {selectedNode.isPrerequisiteGap && (
              <div className="p-3.5 rounded-xl bg-rose-100/70 border border-rose-200 text-rose-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs text-rose-800">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Prerequisite Gap Detected</span>
                </div>
                <p className="text-xs text-rose-700 leading-snug">
                  {selectedNode.diagnosticNotes}
                </p>
              </div>
            )}

            {/* Mastery Meter */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Mastery Level</span>
                <span className="font-mono text-slate-900 font-bold">{selectedNode.masteryScore}%</span>
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    selectedNode.masteryScore >= 70
                      ? "bg-emerald-500"
                      : selectedNode.masteryScore >= 40
                      ? "bg-indigo-600"
                      : "bg-rose-500"
                  }`}
                  style={{ width: `${Math.max(selectedNode.masteryScore, 5)}%` }}
                />
              </div>
            </div>

            {/* Why This Skill Matters */}
            <div className="p-3 rounded-xl bg-white border border-slate-200/80 space-y-1">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                Educational Impact
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                {selectedNode.whyItMatters}
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="space-y-2 pt-2">
              <Link
                href={`/tutor?topic=${encodeURIComponent(selectedNode.name)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Teach Me via AI Tutor ({selectedNode.estimatedMinutes} min)</span>
              </Link>
              <Link
                href={`/practice?topic=${encodeURIComponent(selectedNode.name)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
              >
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Practice 5 Targeted Questions</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
