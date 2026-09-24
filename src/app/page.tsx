"use client";
import Link from "next/link";
import { ArrowRight, Brain, Target, TrendingUp, Zap, BookOpen, BarChart3 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-sm border-b border-border z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-lg text-text-primary">LearnLoop AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
              Log in
            </Link>
            <Link href="/register" className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            AI-Powered Adaptive Learning
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary leading-tight tracking-tight mb-6">
            Learn what you need.
            <br />
            <span className="text-brand-600">Not what everyone else gets.</span>
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto mb-10 leading-relaxed">
            LearnLoop AI analyzes your strengths and weaknesses to create a learning path
            that adapts to what you actually understand — not a one-size-fits-all course.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-all shadow-sm hover:shadow-md">
              Start Learning <ArrowRight className="w-4 h-4" />
            </Link>
            <a href="#how-it-works" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-text-secondary hover:text-text-primary border border-border rounded-xl transition-colors">
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-surface-elevated px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-3">How LearnLoop Works</h2>
            <p className="text-text-secondary">Your learning adapts every step of the way</p>
          </div>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: Target, title: "Assess", desc: "Take a diagnostic assessment to identify your knowledge gaps", color: "text-brand-500" },
              { icon: Brain, title: "Analyze", desc: "AI identifies your strengths, weaknesses, and learning patterns", color: "text-purple-500" },
              { icon: BookOpen, title: "Learn", desc: "Get a personalized plan with an AI tutor who knows your context", color: "text-blue-500" },
              { icon: Zap, title: "Practice", desc: "Adaptive quizzes target exactly where you need improvement", color: "text-amber-500" },
              { icon: TrendingUp, title: "Improve", desc: "Watch your profile update and get new recommendations", color: "text-green-500" },
            ].map((step, i) => (
              <div key={i} className="relative text-center">
                <div className={`w-14 h-14 rounded-2xl bg-white border border-border flex items-center justify-center mx-auto mb-4 shadow-sm`}>
                  <step.icon className={`w-6 h-6 ${step.color}`} />
                </div>
                <h3 className="font-semibold text-text-primary mb-1">{step.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{step.desc}</p>
                {i < 4 && (
                  <div className="hidden md:block absolute top-7 -right-3 w-6">
                    <ArrowRight className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-text-primary mb-3">Built for Real Learning</h2>
            <p className="text-text-secondary">Not another generic AI chatbot</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Brain, title: "AI That Knows You", desc: "Your tutor understands your mastery level, recent mistakes, and learning goals — every response is personalized." },
              { icon: BarChart3, title: "Visual Progress", desc: "Track your improvement across topics over time. See exactly where you've grown and what's next." },
              { icon: Target, title: "Adaptive Difficulty", desc: "Questions match your skill level. Struggle with normalization? Get easier questions until you build confidence." },
            ].map((f, i) => (
              <div key={i} className="p-6 rounded-2xl border border-border bg-white hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <h3 className="font-semibold text-text-primary mb-2">{f.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto text-center bg-brand-600 rounded-3xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to learn smarter?</h2>
          <p className="text-brand-100 mb-8">Start with a 5-minute assessment and get your personalized learning plan.</p>
          <Link href="/register" className="inline-flex items-center gap-2 px-6 py-3 text-base font-medium text-brand-600 bg-white hover:bg-brand-50 rounded-xl transition-colors shadow-sm">
            Get Started Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-sm text-text-muted">
          <span>© 2026 LearnLoop AI</span>
          <span>Built for AI × Education Hackathon</span>
        </div>
      </footer>
    </div>
  );
}
