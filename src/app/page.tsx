"use client";

import Link from "next/link";
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
} from "lucide-react";

export default function LandingPage() {
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

            <Link
              href="/login"
              className="interactive-btn w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 border border-indigo-200 rounded-xl transition-colors shadow-2xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Instant Demo Mode (Alex Rivera)</span>
            </Link>

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

            {/* Loop Visual Flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="card-hover-lift p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  1. Diagnostic Assessment
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Normalization</span>
                  <span className="font-mono font-bold text-rose-600">42% (Weak)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-rose-500 h-full w-[42%] transition-all duration-1000 ease-out" />
                </div>
                <p className="text-[11px] text-slate-500">Missed 2NF vs 3NF transitive dependencies.</p>
              </div>

              <div className="card-hover-lift p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 block">
                  2. AI Tutor & Plan
                </span>
                <div className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                  Targeted Decomposition
                </div>
                <p className="text-[11px] text-slate-600 leading-snug">
                  "Let's break down why functional dependency X → Y violates 3NF with a schema diagram."
                </p>
              </div>

              <div className="card-hover-lift p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block">
                  3. Practice & Updated Mastery
                </span>
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-800">Normalization</span>
                  <span className="font-mono font-bold text-emerald-600">68% (+26%)</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-[68%] transition-all duration-1000 ease-out" />
                </div>
                <p className="text-[11px] text-emerald-800 font-medium">Next priority unlocked: Transactions.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white border-y border-slate-200 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
              The 5-Step Continuous Adaptive Loop
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Not a static course. An intelligent cycle that calibrates every time you answer.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              {
                step: "01",
                icon: Target,
                title: "Assess",
                desc: "10-minute diagnostic reveals what you know and pinpoint hidden gaps.",
              },
              {
                step: "02",
                icon: Brain,
                title: "AI Analysis",
                desc: "AI explains why you missed questions and builds your mastery profile.",
              },
              {
                step: "03",
                icon: BookOpen,
                title: "Daily Plan",
                desc: "High-yield topics prioritized so you study what matters most.",
              },
              {
                step: "04",
                icon: MessageSquare,
                title: "AI Tutor",
                desc: "Context-aware explanations tailored specifically to your mistakes.",
              },
              {
                step: "05",
                icon: TrendingUp,
                title: "Adaptive Practice",
                desc: "Score changes in real time, updating your learning profile and next steps.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-slate-50/70 p-5 rounded-2xl border border-slate-200/80 text-left space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-indigo-600">{s.step}</span>
                  <s.icon className="w-4 h-4 text-slate-400" />
                </div>
                <h3 className="text-sm font-bold text-slate-900">{s.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
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
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-800 text-indigo-200 hover:text-white border border-indigo-700 text-xs font-semibold transition-all"
            >
              <span>Launch Demo Mode</span>
            </Link>
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
