"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Database,
  Brain,
  Code,
  Sparkles,
  BookOpen,
  Target,
  Loader2,
} from "lucide-react";

interface Subject {
  id: string;
  name: string;
  description: string;
  icon: string;
  topics: Array<{ id: string; name: string; difficulty: string }>;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [educationLevel, setEducationLevel] = useState("B.Tech CSE - 3rd Year");
  const [learningGoal, setLearningGoal] = useState("Master Database Systems & High-yield Topics");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [experienceLevel, setExperienceLevel] = useState("Intermediate");
  const [preferredStyle, setPreferredStyle] = useState("Visual & Real-world Examples");

  useEffect(() => {
    if (session?.user?.name) {
      setName(session.user.name);
    }
    // Fetch available subjects
    fetch("/api/subjects")
      .then((res) => res.json())
      .then((data) => {
        if (data.subjects && data.subjects.length > 0) {
          setSubjects(data.subjects);
          setSelectedSubjectId(data.subjects[0].id);
        }
      })
      .catch((err) => console.error("Failed to load subjects", err));
  }, [session]);

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinishOnboarding = async () => {
    setSubmitting(true);
    try {
      await fetch("/api/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          educationLevel,
          learningGoals: learningGoal,
          preferredStyle: `${experienceLevel} — ${preferredStyle}`,
        }),
      });

      // Redirect to diagnostic assessment
      router.push(`/assessment?subjectId=${selectedSubjectId}`);
    } catch (err) {
      console.error("Onboarding failed", err);
      router.push(`/assessment?subjectId=${selectedSubjectId}`);
    } finally {
      setSubmitting(false);
    }
  };

  const steps = [
    { number: "01", title: "About You" },
    { number: "02", title: "Goal" },
    { number: "03", title: "Subject" },
    { number: "04", title: "Style" },
    { number: "05", title: "Diagnostic" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <span className="font-bold text-slate-900 text-lg">SkillSync AI</span>
        </div>
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Student Onboarding
        </span>
      </div>

      {/* Main Card */}
      <div className="max-w-2xl w-full mx-auto my-8">
        {/* Progress Bar & Indicators */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            {steps.map((s, idx) => {
              const stepNum = idx + 1;
              const isActive = currentStep === stepNum;
              const isDone = currentStep > stepNum;
              return (
                <div key={s.number} className="flex flex-col items-center">
                  <span
                    className={`text-xs font-bold font-mono transition-colors ${
                      isActive
                        ? "text-indigo-600"
                        : isDone
                        ? "text-slate-800"
                        : "text-slate-400"
                    }`}
                  >
                    {s.number}
                  </span>
                  <span
                    className={`text-[11px] font-medium hidden sm:block ${
                      isActive ? "text-indigo-600 font-semibold" : "text-slate-500"
                    }`}
                  >
                    {s.title}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-300"
              style={{ width: `${(currentStep / 5) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10">
          {/* Step 1: About You */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Tell us about yourself</h3>
                <p className="text-sm text-slate-500 mt-1">
                  SkillSync tailors explanations and pacing according to your academic context.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    What should we call you?
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Current Academic / Education Level
                  </label>
                  <input
                    type="text"
                    value={educationLevel}
                    onChange={(e) => setEducationLevel(e.target.value)}
                    placeholder="e.g. B.Tech Computer Science - 3rd Year"
                    className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Learning Goal */}
          {currentStep === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-900">What is your primary goal?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Your AI tutor and adaptive practice quizzes will orient around this objective.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {[
                  {
                    title: "Master Database Systems & Normalization",
                    desc: "Deep conceptual clarity, functional dependencies, 1NF to BCNF, transactions.",
                  },
                  {
                    title: "Technical Interview & Placement Prep",
                    desc: "SQL queries, query optimization, indexing, ACID isolation levels.",
                  },
                  {
                    title: "University Semester Exams Prep",
                    desc: "Syllabus coverage, ER modeling, relational algebra, high-scoring explanations.",
                  },
                  {
                    title: "Quick Refresher & Skill Check",
                    desc: "Fast assessment of strengths & targeted practice to patch weak spots.",
                  },
                ].map((item) => (
                  <button
                    key={item.title}
                    type="button"
                    onClick={() => setLearningGoal(item.title)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      learningGoal === item.title
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                      {learningGoal === item.title && (
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Choose Subject */}
          {currentStep === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Choose your focus subject</h3>
                <p className="text-sm text-slate-500 mt-1">
                  Select the domain where you want SkillSync to diagnose your knowledge.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {subjects.map((subj) => (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => setSelectedSubjectId(subj.id)}
                    className={`text-left p-4 rounded-xl border transition-all ${
                      selectedSubjectId === subj.id
                        ? "border-indigo-600 bg-indigo-50/60 ring-2 ring-indigo-600/20"
                        : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg">
                          {subj.icon || "🗄️"}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900">{subj.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{subj.description}</p>
                        </div>
                      </div>
                      {selectedSubjectId === subj.id && (
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {subj.topics?.slice(0, 5).map((t) => (
                        <span
                          key={t.id}
                          className="px-2 py-0.5 bg-white border border-slate-200 text-slate-600 rounded-md text-[10px] font-medium"
                        >
                          {t.name}
                        </span>
                      ))}
                      {subj.topics?.length > 5 && (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-md text-[10px] font-medium">
                          +{subj.topics.length - 5} more
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 4: Experience & Learning Style */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div>
                <h3 className="text-xl font-bold text-slate-900">How do you learn best?</h3>
                <p className="text-sm text-slate-500 mt-1">
                  We adapt question difficulty and tutor explanations to your preferences.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Experience Level
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setExperienceLevel(lvl)}
                      className={`py-2 px-3 text-xs font-semibold rounded-xl border text-center transition-all ${
                        experienceLevel === lvl
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  Preferred Learning Style
                </label>
                <div className="space-y-2">
                  {[
                    { label: "Visual & Real-world Examples", desc: "Diagrams, schema drawings, and industry scenarios" },
                    { label: "Problem-First & Practice Driven", desc: "Challenging questions first, review theory when stuck" },
                    { label: "Deep Conceptual Theory", desc: "Rigorous formal proofs, relational algebra, and edge cases" },
                  ].map((style) => (
                    <button
                      key={style.label}
                      type="button"
                      onClick={() => setPreferredStyle(style.label)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all ${
                        preferredStyle === style.label
                          ? "border-indigo-600 bg-indigo-50/60 font-semibold text-indigo-900"
                          : "border-slate-200 hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      <div className="font-semibold">{style.label}</div>
                      <div className="text-[11px] text-slate-500 font-normal">{style.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Ready for Diagnostic Assessment */}
          {currentStep === 5 && (
            <div className="space-y-6 text-center animate-fadeIn py-4">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                <Brain className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-slate-900">
                  Ready for your Diagnostic Assessment
                </h3>
                <p className="text-sm text-slate-600 max-w-md mx-auto mt-2">
                  This baseline assessment covers <strong>SQL, Normalization, Transactions, Indexing, and ER Models</strong>.
                  It takes ~5–10 minutes and gives SkillSync the data needed to build your personalized path.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Student:</span>
                  <span className="font-semibold text-slate-800">{name || "Student"}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Subject:</span>
                  <span className="font-semibold text-indigo-600">Database Management Systems</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200/60">
                  <span className="text-slate-500">Level:</span>
                  <span className="font-semibold text-slate-800">{experienceLevel}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Diagnostic Topics:</span>
                  <span className="font-semibold text-slate-800">7 Core DBMS Topics</span>
                </div>
              </div>

              <p className="text-[11px] text-slate-400">
                ⚡ No pressure — this is purely diagnostic to find what you know and where you need help.
              </p>
            </div>
          )}

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm shadow-indigo-100"
              >
                Continue
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={handleFinishOnboarding}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-200 disabled:opacity-50"
              >
                {submitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Start Diagnostic Assessment</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400">
        SkillSync AI • Adaptive Learning Engine
      </div>
    </div>
  );
}
