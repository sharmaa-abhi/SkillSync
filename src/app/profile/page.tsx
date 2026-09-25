"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import {
  User,
  Sparkles,
  TrendingUp,
  Award,
  AlertTriangle,
  BookOpen,
  Calendar,
  Clock,
  Target,
  BarChart3,
  CheckCircle2,
  Loader2,
} from "lucide-react";

interface ProfileData {
  user: {
    name: string;
    educationLevel?: string;
    learningGoals?: string;
    preferredStyle?: string;
    email?: string;
    createdAt?: string;
  };
  profile: {
    overallMastery: number;
    strengths: string[];
    weaknesses: string[];
    topicMastery: Array<{
      topicName: string;
      score: number;
      masteryLevel: "weak" | "medium" | "strong";
    }>;
    assessmentCount: number;
    quizCount: number;
    totalStudyMinutes: number;
    aiAnalysis?: {
      summary?: string;
    };
  } | null;
}

export default function ProfilePage() {
  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [fontSize, setFontSize] = useState<"normal" | "large">("normal");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("skillsync_lang") as "en" | "hi";
      if (savedLang) setLanguage(savedLang);
      const savedContrast = localStorage.getItem("skillsync_contrast") === "true";
      setHighContrast(savedContrast);
    }

    async function loadData() {
      try {
        const res = await fetch("/api/dashboard");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        } else {
          loadFallback();
        }
      } catch {
        loadFallback();
      } finally {
        setLoading(false);
      }
    }

    function loadFallback() {
      setData({
        user: {
          name: "Alex Rivera",
          email: "alex@skillsync.ai",
          educationLevel: "Grade 11 / CBSE Class 11",
          learningGoals: "Improve in Mathematics — Master Quadratic Equations & Clear Prerequisite Gaps",
          preferredStyle: "Micro-learning (5-15 min sessions) • Socratic Explanations & Visual Graphs",
          createdAt: new Date().toISOString(),
        },
        profile: {
          overallMastery: 72,
          strengths: ["Algebraic Manipulation", "Polynomials"],
          weaknesses: ["Factorisation", "Coordinate Geometry"],
          topicMastery: [
            { topicName: "Algebraic Manipulation", score: 84, masteryLevel: "strong" },
            { topicName: "Quadratic Equations", score: 72, masteryLevel: "medium" },
            { topicName: "Polynomials", score: 65, masteryLevel: "medium" },
            { topicName: "Coordinate Geometry", score: 40, masteryLevel: "weak" },
            { topicName: "Factorisation", score: 38, masteryLevel: "weak" },
          ],
          assessmentCount: 2,
          quizCount: 4,
          totalStudyMinutes: 65,
          aiAnalysis: {
            summary: "Strong algebra mechanics and formula understanding (72%), but a critical prerequisite gap in Factorisation (38%) is bottlenecking quadratic equation solving.",
          },
        },
      });
    }

    loadData();
  }, []);

  const handleLanguageChange = (newLang: "en" | "hi") => {
    setLanguage(newLang);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_lang", newLang);
      window.dispatchEvent(new CustomEvent("skillsync_language_change", { detail: newLang }));
    }
  };

  const handleContrastToggle = () => {
    const next = !highContrast;
    setHighContrast(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("skillsync_contrast", String(next));
      if (next) {
        document.documentElement.classList.add("high-contrast-mode");
      } else {
        document.documentElement.classList.remove("high-contrast-mode");
      }
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading learning profile...</p>
        </div>
      </AppLayout>
    );
  }

  const user = data?.user;
  const profile = data?.profile;
  const topics = profile?.topicMastery || [];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card Header */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 card-hover-lift animate-scale-in delay-75">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md shadow-indigo-100 animate-float">
                {user?.name?.charAt(0) || "A"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-slate-900">{user?.name || "Alex Rivera"}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                    Active Student
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono">
                    ID: alex-rivera-9421
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.educationLevel || "Grade 11 / CBSE Class 11"}</p>
                <p className="text-[11px] text-slate-400 mt-1">{user?.email || "alex@skillsync.ai"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Overall Mastery
                </span>
                <span className="text-3xl font-extrabold font-mono text-indigo-600 animate-pop">
                  {profile?.overallMastery || 72}%
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Assessments
                </span>
                <span className="text-2xl font-bold text-slate-800 font-mono">
                  {profile?.assessmentCount || 2}
                </span>
              </div>
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Quizzes
                </span>
                <span className="text-2xl font-bold text-slate-800 font-mono">
                  {profile?.quizCount || 4}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Learning Goals, Multilingual & Accessibility Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in-up delay-150">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2 card-hover-lift">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Current Learning Goal</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {user?.learningGoals || "Improve in Mathematics — Master Quadratic Equations"}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              AI Coach & adaptive quiz engine calibrate problem difficulty toward this goal.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2 card-hover-lift">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" />
              <span>Learning Style & Pace</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {user?.preferredStyle || "Micro-learning (5-15 min sessions) • Socratic AI Coach"}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              High-yield micro-sessions designed to avoid cognitive overload.
            </p>
          </div>

          {/* Multilingual & Accessibility Settings Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 card-hover-lift">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>A11y & Language Settings</span>
            </div>
            
            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Language:</span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("en")}
                    className={`px-2 py-0.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      language === "en" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    EN
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLanguageChange("hi")}
                    className={`px-2 py-0.5 rounded-md font-semibold text-xs transition-colors cursor-pointer ${
                      language === "hi" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    हिन्दी
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">High Contrast:</span>
                <button
                  type="button"
                  onClick={handleContrastToggle}
                  className={`px-2.5 py-0.5 rounded-md font-semibold text-xs cursor-pointer ${
                    highContrast ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {highContrast ? "ON" : "OFF"}
                </button>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Text-to-Speech:</span>
                <button
                  type="button"
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`px-2.5 py-0.5 rounded-md font-semibold text-xs cursor-pointer ${
                    ttsEnabled ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {ttsEnabled ? "ACTIVE" : "OFF"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Strengths & Weaknesses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in-up delay-200">
          {/* Strengths */}
          <div className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 bg-gradient-to-br from-emerald-50/20 to-white">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4">
              <Award className="w-4 h-4" />
              <span>Demonstrated Strengths</span>
            </div>
            <div className="space-y-2.5">
              {(profile?.strengths || ["Algebraic Manipulation", "Polynomials"]).map((s) => (
                <div
                  key={s}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-emerald-100 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800">{s}</span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    High Accuracy
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Weaknesses */}
          <div className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 bg-gradient-to-br from-rose-50/20 to-white">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Focus Areas (Prerequisite Gaps)</span>
            </div>
            <div className="space-y-2.5">
              {(profile?.weaknesses?.length ? profile.weaknesses : ["Factorisation", "Coordinate Geometry"]).map((w) => (
                <div
                  key={w}
                  className="flex items-center justify-between p-3 rounded-xl bg-white border border-rose-100 shadow-2xs"
                >
                  <span className="text-xs font-bold text-slate-800">{w}</span>
                  <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                    Targeted Remediation
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Detailed Topic Mastery Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">Comprehensive Mastery Breakdown</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted composite score from diagnostic assessments and adaptive quizzes.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400">High-Yield Mathematics</span>
          </div>

          <div className="space-y-4">
            {topics.map((t) => {
              const isStrong = t.score >= 70;
              const isMedium = t.score >= 50 && t.score < 70;

              return (
                <div key={t.topicName} className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                  <div className="flex justify-between items-center text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{t.topicName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isStrong
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                            : isMedium
                            ? "bg-amber-50 text-amber-700 border border-amber-100"
                            : "bg-rose-50 text-rose-700 border border-rose-100"
                        }`}
                      >
                        {isStrong ? "Strong" : isMedium ? "Competent" : "Needs Attention"}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-slate-800">{t.score}%</span>
                  </div>

                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isStrong ? "bg-emerald-500" : isMedium ? "bg-amber-500" : "bg-rose-500"
                      }`}
                      style={{ width: `${t.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
