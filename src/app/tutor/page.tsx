"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import {
  MessageSquare,
  Sparkles,
  Send,
  User,
  Zap,
  BookOpen,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Loader2,
  ChevronDown,
} from "lucide-react";

interface Message {
  role: "student" | "tutor";
  content: string;
  timestamp: string;
}

function TutorContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") || "Normalization";

  const [currentTopic, setCurrentTopic] = useState(topicParam);
  const [masteryScore, setMasteryScore] = useState(42);
  const [recentMistake, setRecentMistake] = useState("Confused 2NF with 3NF transitive dependencies");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      content: `Hello! I see you're working on **${currentTopic}**. Based on your recent diagnostic assessment (score: **${masteryScore}%**), you had some trouble distinguishing **2NF from 3NF** and identifying **transitive dependencies**.\n\nLet's clear this up together step-by-step. How would you like to start?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSendMessage = async (textToSend?: string) => {
    const message = textToSend || inputMessage;
    if (!message.trim() || loading) return;

    const studentMsg: Message = {
      role: "student",
      content: message,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, studentMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          message,
          topicName: currentTopic,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.sessionId) setSessionId(data.sessionId);
        setMessages((prev) => [
          ...prev,
          {
            role: "tutor",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        // Fallback response tailored to student's context
        setMessages((prev) => [
          ...prev,
          {
            role: "tutor",
            content: `Here is a clear breakdown for **${currentTopic}**:\n\n- **1NF**: Atomic values only (no multi-valued attributes).\n- **2NF**: In 1NF + **NO partial dependencies** (every non-prime attribute depends on the *whole* candidate key, not just part of a composite key).\n- **3NF**: In 2NF + **NO transitive dependencies** (non-key attribute cannot determine another non-key attribute: $X \\rightarrow Y \\rightarrow Z$).\n\n**Example:** In a table with \`(StudentID, CourseID) -> StudentName\`, \`StudentName\` depends only on \`StudentID\`. That's a partial dependency — violating 2NF!\n\nDoes this distinction between partial and transitive dependency make sense?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          content: `To eliminate transitive dependencies for **3NF**, whenever you have $A \\rightarrow B$ and $B \\rightarrow C$ (where neither is a candidate key), you decompose into two tables: \`R1(A, B)\` and \`R2(B, C)\`.\n\nWould you like a sample practice question to test this?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const tutorActions = [
    { label: "Explain simply", prompt: `Explain ${currentTopic} simply with an everyday analogy.` },
    { label: "Give example", prompt: `Give me a clear, concrete database schema example illustrating ${currentTopic}.` },
    { label: "Give hint", prompt: `What is the key trick to avoid confusing 2NF with 3NF in exam questions?` },
    { label: "Ask me a question", prompt: `Ask me a question to test my understanding of ${currentTopic}.` },
    { label: "Quiz me", prompt: `Give me a short scenario question with 4 multiple choice options on ${currentTopic}.` },
  ];

  return (
    <AppLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-8rem)]">
        {/* Left Side: Context Panel (AI knows the student) */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-5 flex flex-col justify-between overflow-y-auto">
          <div className="space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[11px] font-semibold mb-2 border border-indigo-100">
                <Sparkles className="w-3 h-3" />
                <span>Context-Aware AI Tutor</span>
              </div>
              <h2 className="text-base font-bold text-slate-900">Student Learning Context</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                The tutor adapts responses using your real-time learning profile.
              </p>
            </div>

            {/* Context Item 1: Subject */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Focus Subject
              </span>
              <p className="text-xs font-bold text-slate-900">Database Management Systems</p>
            </div>

            {/* Context Item 2: Active Topic & Selector */}
            <div className="p-3 rounded-xl bg-indigo-50/60 border border-indigo-100 space-y-1.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-indigo-700 block">
                Current Topic Focus
              </span>
              <select
                value={currentTopic}
                onChange={(e) => {
                  setCurrentTopic(e.target.value);
                  if (e.target.value === "Transactions") {
                    setMasteryScore(56);
                    setRecentMistake("Uncertainty with Dirty Reads vs Phantom Reads");
                  } else if (e.target.value === "SQL Fundamentals") {
                    setMasteryScore(84);
                    setRecentMistake("Minor syntax on correlated subqueries");
                  } else {
                    setMasteryScore(42);
                    setRecentMistake("Confused 2NF with 3NF transitive dependencies");
                  }
                }}
                className="w-full bg-white text-xs font-bold text-slate-900 py-1.5 px-2.5 rounded-lg border border-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-600"
              >
                <option value="Normalization">Normalization (42% — Weak)</option>
                <option value="Transactions">Transactions (56% — Medium)</option>
                <option value="SQL Fundamentals">SQL Fundamentals (84% — Strong)</option>
                <option value="Indexing">Indexing (71% — Strong)</option>
                <option value="ER Model">ER Model (60% — Medium)</option>
              </select>
            </div>

            {/* Context Item 3: Current Mastery */}
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Topic Mastery
                </span>
                <span className="font-mono font-bold text-rose-600">{masteryScore}%</span>
              </div>
              <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    masteryScore < 50 ? "bg-rose-500" : masteryScore < 70 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${masteryScore}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-500 block pt-0.5">
                {masteryScore < 50 ? "Needs high-priority attention" : "Improving performance"}
              </span>
            </div>

            {/* Context Item 4: Recent Mistake */}
            <div className="p-3 rounded-xl bg-rose-50/60 border border-rose-100 space-y-1">
              <div className="flex items-center gap-1.5 text-rose-800 text-[11px] font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                <span>Recent Diagnostic Mistake</span>
              </div>
              <p className="text-xs text-rose-900 leading-snug">{recentMistake}</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <span className="text-[11px] text-slate-400 block text-center">
              ⚡ Responses calibrated to beginner/intermediate level
            </span>
          </div>
        </div>

        {/* Right Side: Chat Area */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col overflow-hidden">
          {/* Top Bar with Prompt Pills */}
          <div className="p-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-3 overflow-x-auto">
            <div className="flex items-center gap-1.5 flex-nowrap">
              <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                Prompts:
              </span>
              {tutorActions.map((action) => (
                <button
                  key={action.label}
                  type="button"
                  onClick={() => handleSendMessage(action.prompt)}
                  className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/70 text-slate-700 text-[11px] font-semibold transition-all duration-200 whitespace-nowrap shadow-xs interactive-btn"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((m, idx) => {
              const isTutor = m.role === "tutor";
              return (
                <div
                  key={idx}
                  className={`flex gap-3 max-w-2xl ${
                    isTutor ? "animate-slide-in-left" : "ml-auto flex-row-reverse animate-slide-in-right"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                      isTutor ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-700"
                    }`}
                  >
                    {isTutor ? <Zap className="w-4 h-4 fill-current" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isTutor
                          ? "bg-slate-50 border border-slate-200/80 text-slate-800"
                          : "bg-indigo-600 text-white shadow-sm"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    </div>
                    <div
                      className={`text-[10px] text-slate-400 ${isTutor ? "text-left" : "text-right"}`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex gap-3 max-w-xl animate-fade-in">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                  <Zap className="w-4 h-4 fill-current" />
                </div>
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce-gentle"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce-gentle delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce-gentle delay-200"></span>
                  </div>
                  <span>AI Tutor formulating explanation based on your profile...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Message Input Bar */}
          <div className="p-3.5 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={`Ask anything about ${currentTopic} (e.g. "Can you explain BCNF vs 3NF with an example?")...`}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all duration-200"
              />
              <button
                type="submit"
                disabled={loading || !inputMessage.trim()}
                className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 shadow-sm shadow-indigo-100 interactive-btn disabled:opacity-40"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

export default function TutorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
        </div>
      }
    >
      <TutorContent />
    </Suspense>
  );
}
