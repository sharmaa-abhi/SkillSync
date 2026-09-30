"use client";

import React, { useState, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { useActiveSubject } from "@/hooks/useActiveSubject";
import { SubjectKey } from "@/lib/activeSubject";
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
  Check,
  Layers,
  ArrowRight,
} from "lucide-react";

interface ProfileData {
  user: {
    id?: string;
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
  const { activeSubject, activeSubjectConfig, setActiveSubject, allSubjects } = useActiveSubject();

  const [data, setData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [highContrast, setHighContrast] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [subjectSwitchSuccess, setSubjectSwitchSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("skillsync_lang") as "en" | "hi";
      if (savedLang) setLanguage(savedLang);
      const savedContrast = localStorage.getItem("skillsync_contrast") === "true";
      setHighContrast(savedContrast);
    }
  }, []);

  const loadData = async (subjectKey: SubjectKey) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard?subject=${subjectKey}`);
      if (res.ok) {
        const json = await res.json();
        if (json.profile && json.profile.topicMastery?.length > 0) {
          setData(json);
          setLoading(false);
          return;
        }
      }
      loadFallbackForSubject(subjectKey);
    } catch {
      loadFallbackForSubject(subjectKey);
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackForSubject = (subjectKey: SubjectKey) => {
    const config = allSubjects.find((s) => s.key === subjectKey) || activeSubjectConfig;
    setData({
      user: {
        name: "Alex Rivera",
        email: "alex@skillsync.ai",
        educationLevel: "B.Tech CSE - 3rd Year",
        learningGoals: config.defaultGoal,
        preferredStyle: "Micro-learning (5-15 min sessions) • Socratic AI Explanations & Visual Graphs",
        createdAt: new Date().toISOString(),
      },
      profile: {
        overallMastery: config.defaultOverallMastery,
        strengths: config.defaultStrengths,
        weaknesses: config.defaultWeaknesses,
        topicMastery: config.topics.map((t) => ({
          topicName: t.name,
          score: t.defaultScore,
          masteryLevel: t.masteryLevel,
        })),
        assessmentCount: 2,
        quizCount: 4,
        totalStudyMinutes: 65,
        aiAnalysis: {
          summary: `Current diagnostic indicates solid foundational mastery in ${config.label}, with targeted prerequisite remediation prioritized for ${config.defaultWeaknesses.join(" and ")}.`,
        },
      },
    });
  };

  useEffect(() => {
    loadData(activeSubject);
  }, [activeSubject]);

  const handleSelectSubject = (key: SubjectKey) => {
    if (key === activeSubject) return;
    setActiveSubject(key);
    const chosen = allSubjects.find((s) => s.key === key);
    setSubjectSwitchSuccess(`Active subject locked to ${chosen?.label || key}. All practice quizzes, tutor sessions, and learning plans across the platform are now aligned.`);
    setTimeout(() => {
      setSubjectSwitchSuccess(null);
    }, 4500);
  };

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

  if (loading && !data) {
    return (
      <AppLayout>
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
          <p className="text-xs text-slate-500 font-medium">Loading learner profile...</p>
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
        <div data-scroll="fade-down" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 card-hover-lift">
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
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-mono" title={`User ID: ${user?.id || "N/A"}`}>
                    ID: {user?.id ? (user.id.length > 14 ? `${user.id.slice(0, 10)}...` : user.id) : "alex-rivera-9421"}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{user?.educationLevel || "B.Tech CSE - 3rd Year"}</p>
                <p className="text-[11px] text-slate-400 mt-1">{user?.email || "alex@skillsync.ai"}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 border-t sm:border-t-0 sm:border-l border-slate-100 pt-4 sm:pt-0 sm:pl-6">
              <div className="text-center">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Overall Mastery
                </span>
                <span className="text-3xl font-extrabold font-mono text-indigo-600 animate-pop">
                  {profile?.overallMastery || activeSubjectConfig.defaultOverallMastery}%
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

        {/* ============================================================== */}
        {/* TARGET ACTIVE SUBJECT TRACK (SINGLE SELECTION SOURCE OF TRUTH) */}
        {/* ============================================================== */}
        <div data-scroll="fade-up" className="bg-white rounded-2xl border border-indigo-100 shadow-sm p-6 sm:p-7 space-y-4 bg-gradient-to-b from-indigo-50/20 to-white card-hover-lift">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                    Target Learning Subject Track
                    <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-200">
                      Single Active Selection
                    </span>
                  </h2>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Select your primary active subject track below. <strong>Smart Practice quizzes, AI Tutor guidance, Skill Graph, and Personalized Plans</strong> across the entire app will automatically lock and adapt to this choice.
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Current Active:
              </span>
              <span className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 ${activeSubjectConfig.badgeBg} ${activeSubjectConfig.badgeText} border ${activeSubjectConfig.badgeBorder} shadow-2xs`}>
                <span>{activeSubjectConfig.icon}</span>
                <span>{activeSubjectConfig.label}</span>
              </span>
            </div>
          </div>

          {/* Switch feedback notification */}
          {subjectSwitchSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{subjectSwitchSuccess}</span>
            </div>
          )}

          {/* 5 Subjects Single Selection Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {allSubjects.map((sub) => {
              const isSelected = activeSubject === sub.key;
              return (
                <button
                  key={sub.key}
                  type="button"
                  onClick={() => handleSelectSubject(sub.key)}
                  className={`p-4 rounded-xl text-left transition-all duration-200 cursor-pointer border relative flex flex-col justify-between ${
                    isSelected
                      ? "bg-indigo-50/60 border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm"
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1 rounded-lg bg-slate-50 border border-slate-100 flex-shrink-0">
                          {sub.icon}
                        </span>
                        <div>
                          <h3 className="text-xs font-bold text-slate-900 leading-tight">
                            {sub.label}
                          </h3>
                          <span className="text-[10px] font-mono text-slate-400 font-semibold block">
                            {sub.code}
                          </span>
                        </div>
                      </div>

                      {isSelected ? (
                        <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold shadow-2xs">
                          <Check className="w-3 h-3" />
                          Active
                        </span>
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center mt-1 group-hover:border-slate-400">
                          <span className="w-2 h-2 rounded-full bg-transparent" />
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mt-1">
                      {sub.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-400 font-medium">
                    <span>{sub.topics.length} Core Topics</span>
                    <span className={isSelected ? "text-indigo-600 font-bold" : "text-slate-500"}>
                      {isSelected ? "Locked Active Track ✓" : "Click to Select"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            <span>
              <strong>Tip:</strong> You can switch your active subject anytime using the &quot;Switch Subject&quot; button in the header, the sidebar switcher, or right here in your Learner Profile.
            </span>
          </div>
        </div>

        {/* Learning Goals, Multilingual & Accessibility Preferences */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div data-scroll="fade-up" data-scroll-delay="50" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2 card-hover-lift">
            <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Current Learning Goal</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 leading-snug">
              {activeSubjectConfig.defaultGoal}
            </p>
            <p className="text-xs text-slate-500 pt-1">
              AI Coach & adaptive quiz engine calibrate problem difficulty toward this goal.
            </p>
          </div>

          <div data-scroll="fade-up" data-scroll-delay="100" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-2 card-hover-lift">
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
          <div data-scroll="fade-up" data-scroll-delay="150" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-3 card-hover-lift">
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

        {/* Strengths & Weaknesses Grid for Active Subject */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Strengths */}
          <div data-scroll="fade-right" className="bg-white rounded-2xl border border-emerald-100 shadow-sm p-6 bg-gradient-to-br from-emerald-50/20 to-white card-hover-lift">
            <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-4">
              <Award className="w-4 h-4" />
              <span>Demonstrated Strengths ({activeSubjectConfig.shortLabel})</span>
            </div>
            <div className="space-y-2.5">
              {(profile?.strengths?.length ? profile.strengths : activeSubjectConfig.defaultStrengths).map((s) => (
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
          <div data-scroll="fade-left" className="bg-white rounded-2xl border border-rose-100 shadow-sm p-6 bg-gradient-to-br from-rose-50/20 to-white card-hover-lift">
            <div className="flex items-center gap-2 text-rose-700 font-bold text-xs uppercase tracking-wider mb-4">
              <AlertTriangle className="w-4 h-4" />
              <span>Focus Areas / Prerequisite Gaps ({activeSubjectConfig.shortLabel})</span>
            </div>
            <div className="space-y-2.5">
              {(profile?.weaknesses?.length ? profile.weaknesses : activeSubjectConfig.defaultWeaknesses).map((w) => (
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

        {/* Detailed Topic Mastery Breakdown for Active Subject */}
        <div data-scroll="fade-up" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Comprehensive Mastery Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Weighted composite score from diagnostic assessments and adaptive quizzes for {activeSubjectConfig.label}.
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
              {activeSubjectConfig.icon} {activeSubjectConfig.label}
            </span>
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
