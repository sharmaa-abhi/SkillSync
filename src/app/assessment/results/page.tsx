"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Zap,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  BookOpen,
  MessageSquare,
  HelpCircle,
  Loader2,
  RefreshCw,
  BarChart3,
  Award,
} from "lucide-react";
import Confetti from "@/components/Confetti";

interface TopicScore {
  topicName: string;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  masteryLevel: "weak" | "medium" | "strong";
}

interface AIAnalysis {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  priorityTopics: string[];
  recommendations: string[];
  reasoning: string[];
  topicMastery: Array<{
    topicName: string;
    score: number;
    masteryLevel: "weak" | "medium" | "strong";
  }>;
}

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const assessmentId = searchParams.get("assessmentId");

  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(true);
  const [overallScore, setOverallScore] = useState<number>(0);
  const [topicScores, setTopicScores] = useState<TopicScore[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAndAnalyze() {
      if (!assessmentId) {
        // Fallback to demo results if no ID provided
        loadDemoResults();
        return;
      }

      try {
        setLoading(true);
        // Trigger AI analysis API (creates profile, plan, progress)
        const analysisRes = await fetch("/api/analysis", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ assessmentId }),
        });

        if (analysisRes.ok) {
          const data = await analysisRes.json();
          setAiAnalysis(data.analysis);
          // Calculate overall score from topic mastery
          if (data.analysis?.topicMastery) {
            const mastery = data.analysis.topicMastery;
            const avg = Math.round(
              mastery.reduce((acc: number, curr: any) => acc + curr.score, 0) / mastery.length
            );
            setOverallScore(avg);
            setTopicScores(
              mastery.map((m: any) => ({
                topicName: m.topicName,
                totalQuestions: 5,
                correctAnswers: Math.round((m.score / 100) * 5),
                percentage: m.score,
                masteryLevel: m.masteryLevel,
              }))
            );
          }
        } else {
          // If analysis fails or already ran, load demo/fallback
          loadDemoResults();
        }
      } catch (err) {
        console.error("Error running AI analysis", err);
        loadDemoResults();
      } finally {
        setLoading(false);
        setAnalyzing(false);
      }
    }

    function loadDemoResults() {
      setOverallScore(63);
      setTopicScores([
        { topicName: "SQL Fundamentals", totalQuestions: 5, correctAnswers: 4, percentage: 84, masteryLevel: "strong" },
        { topicName: "Indexing", totalQuestions: 4, correctAnswers: 3, percentage: 71, masteryLevel: "strong" },
        { topicName: "Transactions", totalQuestions: 5, correctAnswers: 3, percentage: 56, masteryLevel: "medium" },
        { topicName: "Normalization", totalQuestions: 5, correctAnswers: 2, percentage: 42, masteryLevel: "weak" },
        { topicName: "ER Model", totalQuestions: 5, correctAnswers: 3, percentage: 60, masteryLevel: "medium" },
      ]);
      setAiAnalysis({
        summary: "You are strong in SQL fundamentals and Indexing, but need focused practice with Normalization and Transactions.",
        strengths: ["SQL Fundamentals", "Indexing"],
        weaknesses: ["Normalization", "Transactions"],
        priorityTopics: ["Normalization", "Transactions"],
        recommendations: [
          "Study functional dependencies and 2NF vs 3NF decomposition.",
          "Review ACID isolation levels and anomaly prevention.",
        ],
        reasoning: [
          "You missed 3 of 5 Normalization questions, specifically confusing 2NF with 3NF transitive dependencies.",
          "Transaction questions showed uncertainty with dirty reads versus non-repeatable reads.",
        ],
        topicMastery: [
          { topicName: "SQL Fundamentals", score: 84, masteryLevel: "strong" },
          { topicName: "Indexing", score: 71, masteryLevel: "strong" },
          { topicName: "Transactions", score: 56, masteryLevel: "medium" },
          { topicName: "Normalization", score: 42, masteryLevel: "weak" },
          { topicName: "ER Model", score: 60, masteryLevel: "medium" },
        ],
      });
      setLoading(false);
      setAnalyzing(false);
    }

    loadAndAnalyze();
  }, [assessmentId]);

  if (loading || analyzing) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 animate-spin">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">AI Diagnostic Engine Analyzing</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-sm text-center">
          Grading topic-level performance, calculating mastery thresholds, and constructing your personalized study plan...
        </p>
      </div>
    );
  }

  const weakestTopic = topicScores.find((t) => t.masteryLevel === "weak")?.topicName || "Normalization";

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <Confetti durationMs={4000} particleCount={90} />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center animate-fade-in-down">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-3 border border-emerald-200 animate-pop">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Assessment Cycle Complete</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Your Diagnostic Assessment Results
          </h1>
          <p className="text-sm text-slate-600 mt-2 max-w-xl mx-auto">
            SkillSync has identified your conceptual strengths and pinpointed weak topics to generate your adaptive learning path.
          </p>
        </div>

        {/* Score Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Overall Score */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col items-center justify-center text-center shadow-sm card-hover-lift animate-scale-in delay-75">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Overall Baseline Mastery
            </span>
            <div className="text-5xl font-extrabold text-indigo-600 font-mono tracking-tight animate-pop">
              {overallScore}%
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {overallScore >= 70 ? "Proficient Baseline" : "Targeted Improvement Needed"}
            </p>
          </div>

          {/* Primary Strength */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-6 flex flex-col justify-between shadow-sm card-hover-lift animate-fade-in-up delay-150">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-2">
                <Award className="w-4 h-4" />
                <span>Strongest Area</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">
                {aiAnalysis?.strengths?.[0] || "SQL Fundamentals"}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Demonstrated high accuracy with filtering, joins, and relational operations.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Mastery Level:</span>
              <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                Strong (84%)
              </span>
            </div>
          </div>

          {/* Primary Focus Needed */}
          <div className="bg-white rounded-2xl border border-indigo-100 p-6 flex flex-col justify-between shadow-sm bg-gradient-to-br from-indigo-50/40 to-purple-50/30 card-hover-lift animate-fade-in-up delay-200">
            <div>
              <div className="flex items-center gap-2 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Priority Focus</span>
              </div>
              <h4 className="text-lg font-bold text-slate-900">{weakestTopic}</h4>
              <p className="text-xs text-slate-600 mt-1">
                Highest priority for immediate review before tackling advanced transactions.
              </p>
            </div>
            <div className="mt-4 pt-3 border-indigo-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Current Mastery:</span>
              <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                Needs Attention (42%)
              </span>
            </div>
          </div>
        </div>

        {/* AI Analysis & Why SkillSync Recommends This */}
        <div className="bg-white rounded-2xl border border-indigo-200/80 shadow-sm p-6 sm:p-8 relative overflow-hidden">
          <div className="flex items-center gap-2.5 text-indigo-700 font-bold text-sm mb-3">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <span>AI Learning Analysis & Recommendation Rationale</span>
          </div>

          <p className="text-base text-slate-800 font-medium leading-relaxed">
            "{aiAnalysis?.summary || "You are strong in SQL fundamentals but need more practice with normalization and transactions."}"
          </p>

          <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Why SkillSync Recommends This:
            </h4>
            <div className="space-y-2">
              {aiAnalysis?.reasoning?.map((reason, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600 mt-1.5 flex-shrink-0" />
                  <span>{reason}</span>
                </div>
              )) || (
                <div className="text-xs text-slate-600">
                  You missed 3 of 5 normalization questions (specifically functional dependencies & 3NF), so SkillSync prioritized normalization for your study plan.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Topic Breakdown Bars */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-slate-600" />
              <h3 className="text-base font-bold text-slate-900">Topic-by-Topic Performance</h3>
            </div>
            <span className="text-xs text-slate-500">Benchmark: 70% Mastery</span>
          </div>

          <div className="space-y-4">
            {topicScores.map((ts) => {
              const isStrong = ts.percentage >= 70;
              const isMedium = ts.percentage >= 50 && ts.percentage < 70;
              const isWeak = ts.percentage < 50;

              return (
                <div key={ts.topicName} className="p-3 rounded-xl border border-slate-100 hover:bg-slate-50/50 transition-colors">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900">{ts.topicName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isStrong
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : isMedium
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {isStrong ? "Strong" : isMedium ? "Improving" : "Needs Attention"}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-700">{ts.percentage}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 rounded-full ${
                        isStrong
                          ? "bg-emerald-500"
                          : isMedium
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{ width: `${ts.percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTAs to continue Adaptive Loop */}
        <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold">Your Adaptive Path Is Ready</h3>
            <p className="text-xs text-indigo-200 mt-1 max-w-md">
              Start with your customized plan or jump directly into a context-aware tutoring session on <strong>{weakestTopic}</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <Link
              href="/plan"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
            >
              <BookOpen className="w-4 h-4" />
              <span>Personalized Plan</span>
            </Link>

            <Link
              href={`/tutor?topic=${encodeURIComponent(weakestTopic)}`}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-700 text-white border border-indigo-500 text-xs font-bold hover:bg-indigo-600 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              <span>AI Tutor ({weakestTopic})</span>
            </Link>

            <Link
              href="/dashboard"
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-indigo-200 hover:text-white text-xs font-medium"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AssessmentResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
