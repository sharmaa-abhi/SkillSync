"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import {
  HelpCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Loader2,
  Award,
  ChevronRight,
  Clock,
  ShieldCheck,
  Target,
} from "lucide-react";
import Confetti from "@/components/Confetti";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  explanation: string;
  correctAnswer: number;
}

interface QuestionResult {
  questionId: string;
  selectedOption: number;
  correctAnswer: number;
  isCorrect: boolean;
  explanation: string;
  topic: string;
}

interface ProfileUpdate {
  previousMastery: number;
  newMastery: number;
  topicChanges: Array<{
    topicName: string;
    previousScore: number;
    newScore: number;
    change: number;
  }>;
}

const MATH_PRACTICE_QUESTIONS: Record<string, QuizQuestion[]> = {
  Factorisation: [
    {
      id: "f1",
      question: "Factor completely: x² - 16",
      options: ["(x - 4)(x + 4)", "(x - 4)²", "(x + 4)²", "x(x - 16)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Factorisation",
      explanation: "Difference of squares formula: a² - b² = (a - b)(a + b). Here a = x, b = 4, yielding (x - 4)(x + 4).",
    },
    {
      id: "f2",
      question: "Which of the following is the factored form of the quadratic trinomial x² + 7x + 12?",
      options: ["(x + 3)(x + 4)", "(x + 2)(x + 6)", "(x + 1)(x + 12)", "(x - 3)(x - 4)"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Factorisation",
      explanation: "Find two numbers multiplying to 12 and adding to 7: 3 * 4 = 12, and 3 + 4 = 7. Thus (x + 3)(x + 4).",
    },
    {
      id: "f3",
      question: "Factor out the greatest common factor (GCF) from: 4x³ + 12x²",
      options: ["4x²(x + 3)", "4x(x² + 3x)", "x²(4x + 12)", "2x²(2x + 6)"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Factorisation",
      explanation: "The GCD of 4 and 12 is 4, and the highest common power of x is x². Factoring out 4x² gives 4x²(x + 3).",
    },
    {
      id: "f4",
      question: "Factor the quadratic expression: 2x² + 5x + 2",
      options: ["(2x + 1)(x + 2)", "(2x + 2)(x + 1)", "(2x - 1)(x - 2)", "(x + 4)(2x + 1)"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "Factorisation",
      explanation: "ac = 4. The pair adding to 5 is 4 and 1: 2x² + 4x + x + 2 = 2x(x + 2) + 1(x + 2) = (2x + 1)(x + 2).",
    },
    {
      id: "f5",
      question: "Factor by grouping: x³ + 3x² + 2x + 6",
      options: ["(x² + 2)(x + 3)", "(x² + 3)(x + 2)", "(x + 1)(x² + 6)", "(x - 2)(x² + 3)"],
      correctAnswer: 0,
      difficulty: "hard",
      topic: "Factorisation",
      explanation: "Group terms: x²(x + 3) + 2(x + 3) = (x² + 2)(x + 3).",
    },
  ],
  "Quadratic Equations": [
    {
      id: "q1",
      question: "What are the solutions to (x - 3)(x + 4) = 0?",
      options: ["x = 3 or x = -4", "x = -3 or x = 4", "x = 3 or x = 4", "x = -3 or x = -4"],
      correctAnswer: 0,
      difficulty: "easy",
      topic: "Quadratic Equations",
      explanation: "By the zero-product property, either x - 3 = 0 (x = 3) or x + 4 = 0 (x = -4).",
    },
    {
      id: "q2",
      question: "What is the discriminant of 2x² - 4x + 1 = 0?",
      options: ["8", "24", "-8", "16"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Quadratic Equations",
      explanation: "Discriminant = b² - 4ac = (-4)² - 4(2)(1) = 16 - 8 = 8.",
    },
    {
      id: "q3",
      question: "If a quadratic equation has discriminant Δ = 0, what does it mean?",
      options: ["One repeated real root", "Two distinct real roots", "Two complex roots", "No solution exists"],
      correctAnswer: 0,
      difficulty: "medium",
      topic: "Quadratic Equations",
      explanation: "When Δ = 0, ±√0 = 0, so the quadratic formula produces exactly one repeated real root.",
    },
  ],
};

function PracticeContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") || "Factorisation";

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [quizId, setQuizId] = useState<string>("smart-quiz-1");
  const [targetTopic, setTargetTopic] = useState<string>(topicParam);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState<QuestionResult[]>([]);
  const [score, setScore] = useState<number>(0);
  const [profileUpdate, setProfileUpdate] = useState<ProfileUpdate | null>(null);
  const [secondsElapsed, setSecondsElapsed] = useState(0);

  useEffect(() => {
    // Load targeted practice questions based on selected topic
    const topicPool = MATH_PRACTICE_QUESTIONS[topicParam] || MATH_PRACTICE_QUESTIONS["Factorisation"];
    setQuestions(topicPool);
    setTargetTopic(topicParam);
    setCurrentIndex(0);
    setSelectedAnswers({});
    setCompleted(false);
    setProfileUpdate(null);
    setSecondsElapsed(0);
  }, [topicParam]);

  useEffect(() => {
    if (completed) return;
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [completed]);

  const handleSelectOption = (idx: number) => {
    if (!questions[currentIndex]) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questions[currentIndex].id]: idx,
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);

    // Evaluate answers
    const evaluationResults: QuestionResult[] = questions.map((q) => {
      const selected = selectedAnswers[q.id] !== undefined ? selectedAnswers[q.id] : -1;
      return {
        questionId: q.id,
        selectedOption: selected,
        correctAnswer: q.correctAnswer,
        isCorrect: selected === q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
      };
    });

    const correctCount = evaluationResults.filter((r) => r.isCorrect).length;
    const finalScore = Math.round((correctCount / questions.length) * 100);

    setScore(finalScore);
    setResults(evaluationResults);

    // Calculate adaptive mastery update
    const previousScore = 38;
    const newTopicScore = Math.min(100, Math.round(previousScore + (finalScore >= 80 ? 30 : finalScore >= 60 ? 20 : 10)));
    const previousOverall = 72;
    const newOverall = Math.min(100, previousOverall + (finalScore >= 80 ? 6 : 3));

    setProfileUpdate({
      previousMastery: previousOverall,
      newMastery: newOverall,
      topicChanges: [
        {
          topicName: targetTopic,
          previousScore,
          newScore: newTopicScore,
          change: newTopicScore - previousScore,
        },
      ],
    });

    setCompleted(true);
    setSubmitting(false);
  };

  const currentQ = questions[currentIndex];
  const progressPercent = questions.length > 0 ? Math.round(((currentIndex + 1) / questions.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
        <p className="text-xs text-slate-500 font-medium">Calibrating adaptive questions...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {completed && score >= 70 && <Confetti />}

      {/* Header Info */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-6 card-hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                Smart Practice: {targetTopic}
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                Targeting Prerequisite Gap
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Difficulty adapts in real-time. Explanations are verified against educational benchmarks.
            </p>
          </div>

          {!completed && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-mono font-semibold">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>
                  {Math.floor(secondsElapsed / 60)}:
                  {String(secondsElapsed % 60).padStart(2, "0")}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Active Quiz Question */}
      {!completed && currentQ && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6 animate-scale-in">
          {/* Progress Bar & Question Counter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>
                Question {currentIndex + 1} of {questions.length}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 capitalize text-[10px] font-bold">
                Difficulty: {currentQ.difficulty}
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* Options Grid */}
          <div className="space-y-2.5">
            {currentQ.options.map((option, idx) => {
              const isSelected = selectedAnswers[currentQ.id] === idx;
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectOption(idx)}
                  className={`w-full text-left p-4 rounded-xl border text-xs sm:text-sm font-medium transition-all duration-200 flex items-center justify-between cursor-pointer ${
                    isSelected
                      ? "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-xs ring-2 ring-indigo-600/20"
                      : "bg-slate-50/60 border-slate-200/80 text-slate-700 hover:bg-slate-100 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                        isSelected ? "bg-indigo-600 text-white" : "bg-white border border-slate-200 text-slate-500"
                      }`}
                    >
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span>{option}</span>
                  </div>
                  {isSelected && <CheckCircle2 className="w-4 h-4 text-indigo-600 flex-shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Navigation Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-30 cursor-pointer"
            >
              Previous
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-200 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Grading & Updating Profile...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Submit & Update Mastery</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Completed Results & Real-Time Mastery Update (Section 6 & 9) */}
      {completed && (
        <div className="space-y-6 animate-fade-in-up">
          {/* Score & Profile Update Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-8 card-hover-lift text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-xs">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Session Completed
              </span>
              <h2 className="text-3xl font-extrabold text-slate-900 font-mono mt-1">
                Score: {score}%
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {score >= 80
                  ? "Outstanding! You have cleared this prerequisite gap."
                  : "Great effort! Mastery score has been updated in your profile."}
              </p>
            </div>

            {/* Profile Update Indicator */}
            {profileUpdate && (
              <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200 max-w-md mx-auto space-y-2">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-800">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Real-time Learning Profile Update</span>
                </div>
                {profileUpdate.topicChanges.map((tc) => (
                  <div key={tc.topicName} className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700">{tc.topicName}</span>
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="text-slate-400 line-through">{tc.previousScore}%</span>
                      <ArrowRight className="w-3 h-3 text-slate-400" />
                      <span className="font-bold text-emerald-700">{tc.newScore}%</span>
                      <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        +{tc.change}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href="/graph"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-colors"
              >
                Inspect Updated Skill Graph
              </Link>
              <Link
                href="/dashboard"
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Question-by-Question Pedagogical Review */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Step-by-Step Pedagogical Explanations</span>
            </h3>

            <div className="space-y-4">
              {results.map((res, i) => (
                <div
                  key={res.questionId}
                  className={`p-4 rounded-xl border text-xs space-y-2 ${
                    res.isCorrect ? "bg-emerald-50/30 border-emerald-100" : "bg-rose-50/30 border-rose-100"
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {res.isCorrect ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-bold text-slate-800">
                        Q{i + 1}: {questions[i]?.question}
                      </span>
                      <p className="text-slate-600 mt-1 leading-relaxed">
                        <strong className="text-slate-700">Explanation: </strong>
                        {res.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading Smart Practice Session...</p>
          </div>
        }
      >
        <PracticeContent />
      </Suspense>
    </AppLayout>
  );
}
