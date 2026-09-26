"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Timer,
  Check,
  Loader2,
  Sparkles,
} from "lucide-react";

interface Question {
  id: string;
  text: string;
  options: string[];
  topicName: string;
}

interface Subject {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectIdParam = searchParams.get("subjectId");

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  // Fetch available subjects
  useEffect(() => {
    async function loadSubjectsAndStart() {
      try {
        setLoading(true);
        const subRes = await fetch("/api/subjects");
        const subData = await subRes.json();
        const available: Subject[] = subData.subjects || [];
        setSubjects(available);

        // Find target subject: prioritize subjectIdParam, or "Mathematics", or first subject
        let target = available.find((s) => s.id === subjectIdParam);
        if (!target) {
          target = available.find((s) => s.name.toLowerCase().includes("math")) || available[0];
        }

        if (target) {
          setSelectedSubject(target);
          await initAssessmentForSubject(target.id);
        } else {
          setError("No learning subjects configured.");
          setLoading(false);
        }
      } catch {
        setError("Network error loading assessment. Please refresh.");
        setLoading(false);
      }
    }

    loadSubjectsAndStart();
  }, [subjectIdParam]);

  const initAssessmentForSubject = async (subId: string) => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/assessment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subjectId: subId }),
      });

      if (res.status === 401) {
        setError("Please sign in to take your diagnostic assessment.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to start assessment.");
        setLoading(false);
        return;
      }

      setAssessmentId(data.assessment.id);
      // Select 5 targeted adaptive questions across foundational prerequisites & current focus
      const fullList = data.assessment.questions || [];
      const selected = fullList.slice(0, 5);
      setQuestions(selected.length > 0 ? selected : fullList);
      setCurrentIndex(0);
      setSelectedAnswers({});
      setStartTime(Date.now());
    } catch {
      setError("Network error starting assessment.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (optionIndex: number) => {
    if (!questions[currentIndex]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: optionIndex,
    }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleSubmit = async () => {
    if (!assessmentId) return;
    setSubmitting(true);
    setError(null);

    const timeTakenSeconds = Math.round((Date.now() - startTime) / 1000);

    const formattedAnswers = questions.map((q) => ({
      questionId: q.id,
      selectedOption: selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : null,
    }));

    try {
      const res = await fetch("/api/assessment/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId,
          answers: formattedAnswers,
          timeTakenSeconds,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit assessment.");
        setSubmitting(false);
        return;
      }

      // Route to results page with subject param
      const subName = selectedSubject?.name || "Mathematics";
      router.push(`/assessment/results?assessmentId=${assessmentId}&subject=${encodeURIComponent(subName)}`);
    } catch {
      setError("Network error submitting assessment.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4 animate-bounce">
          <Sparkles className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900">Preparing Diagnostic Assessment</h3>
        <p className="text-xs text-slate-500 mt-1">
          Calibrating {selectedSubject?.name || "curriculum"} topics for your profile...
        </p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    const isAuthError = error?.toLowerCase().includes("sign in") || error?.toLowerCase().includes("unauthorized");
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">
            {isAuthError ? "Sign In Required" : "Assessment Error"}
          </h3>
          <p className="text-xs text-slate-600 mt-2 mb-4">{error || "No questions found."}</p>
          <div className="flex items-center justify-center gap-2">
            {isAuthError ? (
              <>
                <button
                  onClick={() => router.push("/login?callbackUrl=/assessment")}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  onClick={() => router.push("/login?demo=true")}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  1-Click Demo
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/dashboard")}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Return to Dashboard
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.keys(selectedAnswers).length;
  const progressPercent = ((currentIndex + 1) / questions.length) * 100;
  const isSelected = selectedAnswers[currentQ?.id] !== undefined;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold text-slate-900">Diagnostic Assessment</h1>
              {subjects.length > 1 && (
                <select
                  value={selectedSubject?.id || ""}
                  onChange={(e) => {
                    const found = subjects.find((s) => s.id === e.target.value);
                    if (found) {
                      setSelectedSubject(found);
                      initAssessmentForSubject(found.id);
                    }
                  }}
                  className="text-[11px] bg-slate-100 hover:bg-slate-200 font-semibold text-slate-700 rounded-md px-1.5 py-0.5 border-0 focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <p className="text-[11px] text-slate-500">{selectedSubject?.name || "Mathematics — High-Yield Algebra & Quadratics"}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span>5-Question Adaptive Mode</span>
          </div>
          <div className="text-xs font-semibold text-slate-700 font-mono">
            {answeredCount} / {questions.length} Answered
          </div>
        </div>
      </header>

      {/* Main Assessment Container */}
      <main className="max-w-3xl w-full mx-auto p-4 sm:p-6 my-auto">
        {/* Progress bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center text-xs font-medium text-slate-500 mb-2">
            <span>
              Question <strong className="text-slate-900 font-semibold">{currentIndex + 1}</strong> of {questions.length}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold border border-indigo-100">
              {currentQ.topicName}
            </span>
          </div>
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
            <div
              className="bg-indigo-600 h-full transition-all duration-200"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div key={currentQ.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 animate-fade-in-up">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-6">
            {currentQ.text}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option, optIdx) => {
              const checked = selectedAnswers[currentQ.id] === optIdx;
              const optionLetters = ["A", "B", "C", "D"];
              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(optIdx)}
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left text-sm transition-all duration-200 interactive-btn ${
                    checked
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium ring-2 ring-indigo-600/15 translate-x-1"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      checked
                        ? "bg-indigo-600 text-white animate-pop shadow-xs"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    {optionLetters[optIdx]}
                  </span>
                  <span className="pt-0.5 leading-relaxed">{option}</span>
                </button>
              );
            })}
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 interactive-btn"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-100 interactive-btn disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Answers...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Diagnostic</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all duration-200 shadow-md shadow-indigo-100 interactive-btn"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Quick Navigator Numbers */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-1.5">
          {questions.map((q, idx) => {
            const isAnswered = selectedAnswers[q.id] !== undefined;
            const isCurrent = currentIndex === idx;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => setCurrentIndex(idx)}
                className={`w-7 h-7 rounded-lg text-xs font-mono font-bold transition-all ${
                  isCurrent
                    ? "ring-2 ring-indigo-600 bg-indigo-600 text-white"
                    : isAnswered
                    ? "bg-indigo-100 text-indigo-800"
                    : "bg-white border border-slate-200 text-slate-500 hover:bg-slate-100"
                }`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[11px] text-slate-400">
        SkillSync AI • Adaptive Diagnostic Assessment
      </footer>
    </div>
  );
}

export default function AssessmentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <AssessmentContent />
    </Suspense>
  );
}
