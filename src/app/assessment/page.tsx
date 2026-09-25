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

function AssessmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const subjectIdParam = searchParams.get("subjectId");

  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<number>(Date.now());

  useEffect(() => {
    async function startAssessment() {
      try {
        setLoading(true);
        // First get default subject if not provided
        let targetSubjectId = subjectIdParam;
        if (!targetSubjectId) {
          const subRes = await fetch("/api/subjects");
          const subData = await subRes.json();
          if (subData.subjects && subData.subjects.length > 0) {
            targetSubjectId = subData.subjects[0].id;
          }
        }

        if (!targetSubjectId) {
          setError("No subjects available.");
          setLoading(false);
          return;
        }

        const res = await fetch("/api/assessment/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subjectId: targetSubjectId }),
        });

        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to start assessment.");
          setLoading(false);
          return;
        }

        setAssessmentId(data.assessment.id);
        // Take a clean diagnostic set (e.g. 10 questions across topics)
        setQuestions(data.assessment.questions.slice(0, 10));
        setStartTime(Date.now());
      } catch (err) {
        setError("Network error starting assessment. Please refresh.");
      } finally {
        setLoading(false);
      }
    }

    startAssessment();
  }, [subjectIdParam]);

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

      // Route to results page
      router.push(`/assessment/results?assessmentId=${assessmentId}`);
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
        <p className="text-xs text-slate-500 mt-1">Calibrating DBMS core topics for your profile...</p>
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 max-w-md w-full text-center">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-900">Assessment Error</h3>
          <p className="text-xs text-slate-600 mt-2 mb-4">{error || "No questions found."}</p>
          <button
            onClick={() => router.push("/onboarding")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold"
          >
            Return to Onboarding
          </button>
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
            <h1 className="text-sm font-bold text-slate-900">Diagnostic Assessment</h1>
            <p className="text-[11px] text-slate-500">Database Management Systems</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium">
            <Timer className="w-3.5 h-3.5 text-slate-400" />
            <span>Diagnostic Mode</span>
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
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
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
                  className={`w-full flex items-start gap-3.5 p-3.5 rounded-xl border text-left text-sm transition-all ${
                    checked
                      ? "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-medium ring-2 ring-indigo-600/15"
                      : "border-slate-200 hover:border-slate-300 hover:bg-slate-50/60 text-slate-800"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 transition-colors ${
                      checked
                        ? "bg-indigo-600 text-white"
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Previous
            </button>

            {currentIndex === questions.length - 1 ? (
              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading & Analyzing...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Assessment</span>
                    <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-all shadow-sm"
              >
                Next
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
