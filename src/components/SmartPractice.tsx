"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
import Confetti from "@/components/Confetti";
import {
  HelpCircle,
  Zap,
  CheckCircle2,
  XCircle,
  ArrowRight,
  TrendingUp,
  Sparkles,
  RotateCcw,
  Clock,
  ShieldCheck,
  Target,
  Brain,
  Award,
  AlertTriangle,
} from "lucide-react";

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  difficulty: "easy" | "medium" | "hard";
  topic: string;
  explanation: string;
  correctAnswer: number;
}

// Subject-Specific Question Banks
const PRACTICE_QUESTION_BANK: Record<string, Record<string, QuizQuestion[]>> = {
  Python: {
    "Functions & Scope": [
      {
        id: "py-fn-1",
        topic: "Functions & Scope",
        difficulty: "medium",
        question: "What will the following Python function output when invoked three times consecutively?\n\ndef append_to(element, target_list=[]):\n    target_list.append(element)\n    return target_list\n\nprint(append_to(1))\nprint(append_to(2))\nprint(append_to(3))",
        options: [
          "[1] then [1, 2] then [1, 2, 3] (Mutable default argument persists across invocations)",
          "[1] then [2] then [3] (A new list is initialized on each invocation)",
          "TypeError: mutable default arguments are forbidden in Python 3",
          "[1] then [2, 1] then [3, 2, 1] (LIFO evaluation)",
        ],
        correctAnswer: 0,
        explanation: "In Python, default parameter expressions are evaluated ONCE when the function definition is executed, NOT each time the function is called. Therefore, mutable defaults like lists or dicts are shared across calls!",
      },
      {
        id: "py-fn-2",
        topic: "Functions & Scope",
        difficulty: "hard",
        question: "According to Python's LEGB scope resolution rule, in what order does the interpreter search for a variable name?",
        options: [
          "Local → Enclosing functions → Global (module) → Built-in",
          "Local → Global → Enclosing → Built-in",
          "Global → Local → Enclosing → Built-in",
          "Built-in → Global → Enclosing → Local",
        ],
        correctAnswer: 0,
        explanation: "LEGB stands for Local, Enclosing (outer nested functions), Global (module level), and Built-in namespace. Python traverses outward in this exact hierarchical order.",
      },
      {
        id: "py-fn-3",
        topic: "Functions & Scope",
        difficulty: "easy",
        question: "Which keyword is used to modify a variable defined in the enclosing (outer non-global) function scope?",
        options: ["nonlocal", "global", "outer", "super"],
        correctAnswer: 0,
        explanation: "The 'nonlocal' keyword allows nested functions to rebind variables in an outer enclosing scope that is not global.",
      },
    ],
    "Lambda Functions": [
      {
        id: "py-lam-1",
        topic: "Lambda Functions",
        difficulty: "medium",
        question: "Given a list of tuples `students = [('Alex', 88), ('Bob', 95), ('Charlie', 78)]`, which lambda expression correctly sorts the students in descending order of grade?",
        options: [
          "sorted(students, key=lambda s: s[1], reverse=True)",
          "sorted(students, key=lambda s: s[0], reverse=True)",
          "students.sort(lambda s: s[1])",
          "filter(lambda s: s[1] > 80, students)",
        ],
        correctAnswer: 0,
        explanation: "`key=lambda s: s[1]` extracts the second element (grade) as the sorting criterion, and `reverse=True` orders elements from highest to lowest.",
      },
      {
        id: "py-lam-2",
        topic: "Lambda Functions",
        difficulty: "hard",
        question: "What is a key syntactic limitation of lambda functions in Python compared to standard `def` functions?",
        options: [
          "A lambda function can only contain a single expression and cannot contain statements like assignments or loops",
          "Lambda functions cannot accept default argument values",
          "Lambda functions cannot be passed as arguments to other functions",
          "Lambda functions do not support variable-length *args or **kwargs",
        ],
        correctAnswer: 0,
        explanation: "Python lambdas are restricted to a single expression whose evaluated value is implicitly returned. They cannot contain statements (such as `return`, `assert`, `while`, or assignment `=` before the walrus operator).",
      },
    ],
    "Loops & Iteration": [
      {
        id: "py-loop-1",
        topic: "Loops & Iteration",
        difficulty: "easy",
        question: "What does `range(2, 10, 3)` generate when converted to a list in Python?",
        options: ["[2, 5, 8]", "[2, 5, 8, 11]", "[2, 3, 4, 5, 6, 7, 8, 9]", "[5, 8]"],
        correctAnswer: 0,
        explanation: "range(start, stop, step) starts at 2, increments by 3: 2, 2+3=5, 5+3=8. The next value 11 is >= stop (10), so iteration halts.",
      },
    ],
  },
  DSA: {
    "Binary Search Trees": [
      {
        id: "dsa-bst-1",
        topic: "Binary Search Trees",
        difficulty: "medium",
        question: "Which invariant property fundamentally defines a Binary Search Tree (BST) for any given node N with key K?",
        options: [
          "All keys in N's left subtree are strictly < K, and all keys in N's right subtree are strictly > K",
          "N's left child is strictly < K, but children of the left child may exceed K",
          "The height of N's left subtree is equal to the height of its right subtree",
          "Every node in the tree has either 0 or exactly 2 children",
        ],
        correctAnswer: 0,
        explanation: "The BST invariant is a GLOBAL subtree property: EVERY node in the left subtree must be less than the root, and EVERY node in the right subtree must be greater.",
      },
      {
        id: "dsa-bst-2",
        topic: "Binary Search Trees",
        difficulty: "hard",
        question: "When deleting a node with TWO children from a Binary Search Tree, with which node should its key be replaced to preserve the BST invariant?",
        options: [
          "Either its In-Order Successor (smallest in right subtree) or In-Order Predecessor (largest in left subtree)",
          "Its immediate right child",
          "The deepest leaf node in the entire tree",
          "The tree root node",
        ],
        correctAnswer: 0,
        explanation: "The in-order successor has at most one child and is greater than all nodes in the left subtree while smaller than all other nodes in the right subtree, preserving the invariant.",
      },
      {
        id: "dsa-bst-3",
        topic: "Binary Search Trees",
        difficulty: "easy",
        question: "Which tree traversal algorithm on a Binary Search Tree produces values in monotonically ascending sorted order?",
        options: ["In-Order Traversal (Left, Root, Right)", "Pre-Order Traversal (Root, Left, Right)", "Post-Order Traversal (Left, Right, Root)", "Level-Order Traversal (BFS)"],
        correctAnswer: 0,
        explanation: "Because Left < Root < Right in a BST, an In-Order traversal recursively visits Left, then Root, then Right, outputting keys in ascending order.",
      },
    ],
    "Dynamic Programming": [
      {
        id: "dsa-dp-1",
        topic: "Dynamic Programming",
        difficulty: "hard",
        question: "Which two core structural properties are strictly required for a problem to be solvable via Dynamic Programming?",
        options: [
          "Optimal Substructure and Overlapping Subproblems",
          "Greedy Choice Property and Linearity",
          "Convexity and Independent Randomness",
          "Divide-and-Conquer without overlapping subproblems",
        ],
        correctAnswer: 0,
        explanation: "Optimal substructure means an optimal solution to the problem contains optimal solutions to subproblems; overlapping subproblems means the same sub-instances are reused repeatedly.",
      },
    ],
    "Arrays & Dynamic Arrays": [
      {
        id: "dsa-arr-1",
        topic: "Arrays & Dynamic Arrays",
        difficulty: "medium",
        question: "What is the amortized time complexity of appending an element to a Dynamic Array (e.g. C++ std::vector or Python list) using geometric doubling?",
        options: ["O(1) Amortized", "O(n) Amortized", "O(log n) Amortized", "O(n²) Amortized"],
        correctAnswer: 0,
        explanation: "Although individual resizing resizes take O(n) time, geometric capacity doubling spreads that cost over N appends, achieving O(1) amortized cost per append.",
      },
    ],
  },
};

export default function SmartPractice() {
  const {
    activeSubject,
    activeSubjectConfig,
    currentTopic,
    knowledgeState,
    recordPracticeResult,
    aiTutorContext,
  } = useSubjectContext();

  // Find relevant question pool for active subject
  const subjectPool = PRACTICE_QUESTION_BANK[activeSubject] || PRACTICE_QUESTION_BANK.Python;
  const questions: QuizQuestion[] = useMemo(() => {
    // Priority: Questions from weak concepts or current topic
    const weakTopic = aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultWeaknesses[0] || Object.keys(subjectPool)[0];
    const prioritizedQuestions = subjectPool[weakTopic] || [];
    const otherQuestions = Object.entries(subjectPool)
      .filter(([k]) => k !== weakTopic)
      .flatMap(([, qs]) => qs);

    const merged = [...prioritizedQuestions, ...otherQuestions];
    return merged.length > 0 ? merged : subjectPool[Object.keys(subjectPool)[0]] || [];
  }, [activeSubject, aiTutorContext, activeSubjectConfig, subjectPool]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [adaptiveFeedback, setAdaptiveFeedback] = useState<string | null>(null);
  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalAnswered, setTotalAnswered] = useState(0);

  const currentQ = questions[currentIndex] || questions[0];
  const isCorrect = selectedOption === currentQ?.correctAnswer;

  const handleSubmit = async () => {
    if (selectedOption === null || isAnswerSubmitted) return;

    setIsAnswerSubmitted(true);
    setTotalAnswered((prev) => prev + 1);

    if (isCorrect) {
      setTotalCorrect((prev) => prev + 1);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      setAdaptiveFeedback(
        `🎉 Correct! +8% mastery added to ${currentQ.topic}. Prerequisite graph updated.`
      );
    } else {
      setAdaptiveFeedback(
        `⚠️ Review Needed: -5% adjustment on ${currentQ.topic}. Flagged for AI Coach reinforcement.`
      );
    }

    // Propagate evidence to central SubjectContext
    await recordPracticeResult(currentQ.topic, isCorrect, currentQ.id);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setAdaptiveFeedback(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setCurrentIndex(0); // Loop for continuous practice
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {showConfetti && <Confetti />}

      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. Practice Banner */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <HelpCircle className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Targeted Adaptive Practice
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Questions calibrated specifically for <strong className="text-slate-800">{activeSubjectConfig.label}</strong> targeting identified knowledge gaps.
            </p>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700">
              Score: <span className="font-mono text-indigo-600">{totalCorrect}/{totalAnswered}</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100 text-xs font-bold text-indigo-700">
              Question {currentIndex + 1} of {questions.length}
            </div>
          </div>
        </div>

        {/* Adaptive Notification */}
        {adaptiveFeedback && (
          <div
            className={`p-3 rounded-2xl border text-xs font-bold flex items-center justify-between animate-scale-in ${
              isCorrect ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"
            }`}
          >
            <span>{adaptiveFeedback}</span>
            <Link
              href={`/tutor?topic=${encodeURIComponent(currentQ.topic)}`}
              className="underline text-indigo-600 hover:text-indigo-800 font-extrabold text-[11px]"
            >
              Discuss with AI Coach →
            </Link>
          </div>
        )}
      </div>

      {/* 3. Question Card */}
      {currentQ && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
          {/* Question Metadata */}
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                {currentQ.topic}
              </span>
              <span
                className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                  currentQ.difficulty === "hard"
                    ? "bg-rose-100 text-rose-800"
                    : currentQ.difficulty === "medium"
                    ? "bg-amber-100 text-amber-800"
                    : "bg-emerald-100 text-emerald-800"
                }`}
              >
                {currentQ.difficulty}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Target Concept for {activeSubjectConfig.shortLabel}
            </span>
          </div>

          {/* Question Text */}
          <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed whitespace-pre-line">
            {currentQ.question}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt, idx) => {
              const isSelected = selectedOption === idx;
              const isCorrectOpt = idx === currentQ.correctAnswer;
              let btnClass = "border-slate-200 hover:border-indigo-300 bg-white text-slate-800";

              if (isAnswerSubmitted) {
                if (isCorrectOpt) {
                  btnClass = "border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold ring-2 ring-emerald-500/20";
                } else if (isSelected) {
                  btnClass = "border-rose-500 bg-rose-50/80 text-rose-950 font-bold ring-2 ring-rose-500/20";
                } else {
                  btnClass = "border-slate-200 bg-slate-50 text-slate-400 opacity-60";
                }
              } else if (isSelected) {
                btnClass = "border-indigo-600 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/20";
              }

              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isAnswerSubmitted}
                  onClick={() => setSelectedOption(idx)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer disabled:cursor-default ${btnClass}`}
                >
                  <span
                    className={`w-6 h-6 rounded-xl flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                      isSelected
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation Box */}
          {isAnswerSubmitted && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/90 text-xs sm:text-sm space-y-1.5 animate-scale-in">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <Brain className="w-4 h-4 text-indigo-600" />
                Conceptual Explanation:
              </span>
              <p className="text-slate-700 leading-relaxed">{currentQ.explanation}</p>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <Link
              href={`/tutor?topic=${encodeURIComponent(currentQ.topic)}`}
              className="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>Ask AI Coach for Hint</span>
            </Link>

            {!isAnswerSubmitted ? (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-200 disabled:opacity-40 cursor-pointer"
              >
                Submit Answer
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs transition-all shadow-md shadow-indigo-200 cursor-pointer"
              >
                <span>Next Question</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
