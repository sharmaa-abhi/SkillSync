"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import {
  ArrowRight,
  Brain,
  Target,
  TrendingUp,
  Zap,
  BookOpen,
  BarChart3,
  Sparkles,
  CheckCircle2,
  Flame,
  MessageSquare,
  Loader2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [demoLoading, setDemoLoading] = useState(false);

  const handleInstantDemoLogin = async (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (demoLoading) return;
    setDemoLoading(true);

    try {
      const res = await signIn("credentials", {
        email: "alex@skillsync.ai",
        password: "password123",
        redirect: false,
      });

      if (res?.ok && !res?.error) {
        router.push("/dashboard");
        router.refresh();
      } else {
        router.push("/login?demo=true");
      }
    } catch {
      router.push("/login?demo=true");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span className="font-bold text-lg text-slate-900 tracking-tight flex items-center gap-1.5">
              SkillSync <span className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-2 py-0.5 rounded-full border border-indigo-100">AI</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={demoLoading}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 rounded-xl transition-all cursor-pointer disabled:opacity-75"
            >
              {demoLoading ? (
                <Loader2 className="w-3.5 h-3.5 text-indigo-600 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              )}
              <span>Demo Mode</span>
            </button>
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-100"
            >
              Start Learning
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="animate-fade-in-down inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold mb-6 border border-indigo-100 shadow-xs animate-bounce-gentle">
            <Zap className="w-3.5 h-3.5 fill-current text-indigo-600" />
            <span>AI-Powered Adaptive Education Engine</span>
          </div>

          <h1 className="animate-fade-in-up delay-75 text-4xl sm:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight mb-6">
            Learn what you need.
            <br />
            <span className="text-indigo-600 bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 animate-gradient">
              Not what everyone else gets.
            </span>
          </h1>

          <p className="animate-fade-in-up delay-150 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            SkillSync AI adapts your learning path to what you actually understand. Take a fast diagnostic,
            get an AI learning analysis, study with a context-aware tutor, and watch your mastery update in real time.
          </p>

          <div className="animate-fade-in-up delay-200 flex flex-col sm:flex-row items-center justify-center gap-3 mb-14">
            <Link
              href="/register"
              className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-200 hover:shadow-indigo-300"
            >
              <span>Start Learning</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={demoLoading}
              className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 rounded-xl transition-all shadow-2xs cursor-pointer active:scale-98 disabled:opacity-75"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 text-indigo-600 animate-spin" />
                  <span>Logging into Demo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Instant Demo Mode (Alex Rivera)</span>
                </>
              )}
            </button>

            <a
              href="#how-it-works"
              className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 bg-white hover:bg-slate-50 rounded-xl transition-colors"
            >
              See How It Works
            </a>
          </div>

          {/* Product Preview / Adaptive Loop Visual */}
          <div className="animate-fade-in-up delay-300 max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 sm:p-8 text-left card-hover-lift">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-xs font-mono text-slate-400 ml-2">skillsync.ai/dashboard</span>
              </div>
              <div className="animate-pulse-glow flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Adaptive Loop Active
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 card-hover-lift">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                  <Brain className="w-4 h-4" />
                  <span>1. Diagnostic Baseline</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Evaluates conceptual depth, identifying specific misunderstandings in Normalization and Transactions.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span>Score: 68%</span>
                  <span className="text-[10px] text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">Calibrated</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2 card-hover-lift">
                <div className="flex items-center gap-2 text-indigo-700 font-semibold text-xs">
                  <Target className="w-4 h-4" />
                  <span>2. Dynamic Study Plan</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Generates sequential micro-goals prioritized by knowledge gaps, starting with 2NF/3NF dependencies.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-indigo-900">
                  <span>5 Steps Ready</span>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">Optimized</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 card-hover-lift">
                <div className="flex items-center gap-2 text-indigo-600 font-semibold text-xs">
                  <MessageSquare className="w-4 h-4" />
                  <span>3. Context-Aware Tutor</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Tutor knows your exact weak spots and teaches with Socratic counter-examples without giving answers away.
                </p>
                <div className="pt-2 flex items-center gap-2 text-xs font-bold text-slate-800">
                  <span>14 Messages</span>
                  <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Live Feedback</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="how-it-works" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mb-3">
            How the Adaptive Learning Loop Works
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            A self-correcting 5-stage loop designed to move students from surface recall to deep relational mastery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Diagnostic Assessment</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Targeted multi-topic questions analyze conceptual foundation, identifying strong areas and critical knowledge deficits.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Cognitive Gap Analysis</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Gemini 1.5 Flash models synthesize test patterns into explicit cognitive strengths and targeted intervention areas.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Target className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Dynamic Study Plans</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Automated roadmaps order topics by dependency graph, focusing review energy strictly where ROI is highest.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <MessageSquare className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Context-Aware AI Tutor</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The AI tutor understands your past mistakes, student learning style, and targets exact misconceptions.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Flame className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Adaptive Quizzing</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Dynamic practice questions scale in difficulty and re-test weak topics until verified mastery is achieved.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs card-hover-lift">
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-slate-900 mb-1.5">Live Profile Updates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every quiz and session immediately updates your overall mastery score, shifting topics from Weak to Mastered.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-indigo-900 text-white rounded-3xl p-10 sm:p-14 shadow-xl">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight mb-3">
            Ready to experience adaptive learning?
          </h2>
          <p className="text-xs sm:text-sm text-indigo-200 mb-8 max-w-md mx-auto">
            Take your diagnostic assessment now or explore the full interactive demo.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 shadow-md transition-all"
            >
              <span>Get Started Free</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              disabled={demoLoading}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700 text-xs font-semibold transition-all cursor-pointer disabled:opacity-75"
            >
              {demoLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Launching Demo...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <span>Launch Demo Mode</span>
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 text-center text-xs text-slate-400">
        SkillSync AI • Built for AI × Education Hackathon • Adaptive Learning MVP
      </footer>
    </div>
  );
}
