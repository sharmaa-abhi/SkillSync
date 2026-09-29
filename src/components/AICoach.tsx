"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSubjectContext } from "@/context/SubjectContext";
import ActiveSubjectHeader from "@/components/ActiveSubjectHeader";
import FormattedMessage from "@/components/FormattedMessage";
import {
  Sparkles,
  Send,
  User,
  Zap,
  BookOpen,
  Lightbulb,
  CheckCircle2,
  HelpCircle,
  Loader2,
  Brain,
  ShieldCheck,
  Target,
  ArrowRight,
  Flame,
  RotateCcw,
  Layers,
} from "lucide-react";

interface Message {
  id?: string;
  role: "student" | "tutor";
  content: string;
  timestamp: string;
}

type CoachingMode = "socratic" | "step_by_step" | "analogy" | "practice" | "review";

export default function AICoach({ initialTopic }: { initialTopic?: string }) {
  const {
    activeSubject,
    activeSubjectConfig,
    currentTopic: defaultTopic,
    knowledgeState,
    aiTutorContext,
    progressData,
  } = useSubjectContext();

  const currentTopic = initialTopic || defaultTopic;
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [coachingMode, setCoachingMode] = useState<CoachingMode>("socratic");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize or reset conversation when active subject or topic changes
  useEffect(() => {
    const topicData = knowledgeState[currentTopic];
    const score = topicData?.score ?? 50;

    let greeting = "";
    if (activeSubject === "Python") {
      greeting = `Hello Alex! I am your Socratic AI Coach for **Python Programming**.
      
I see you already demonstrate strong mastery of **${aiTutorContext.knownConcepts.slice(0, 2).join(" & ") || "Variables and Loops"}** (${progressData.overallMastery}% overall track mastery).

However, our diagnostic identified a prerequisite gap in **${aiTutorContext.prerequisiteGaps[0] || "Functions & Scope"}** (${score}% current score).
Let's connect what you know about Python loops and collections to master function signatures and closures. What specific concept would you like to explore first?`;
    } else if (activeSubject === "DSA") {
      greeting = `Hello Alex! I am your Socratic AI Coach for **Data Structures & Algorithms**.
      
You have verified mastery of **${aiTutorContext.knownConcepts[0] || "Arrays & Asymptotic Big-O"}** (90%), but our learning model flagged an active prerequisite gap in **${aiTutorContext.prerequisiteGaps[0] || "Binary Search Trees"}** (${score}% mastery).

Because you already understand array index traversal, we can build on that intuition to conquer tree traversals and invariant balancings. Would you like a probing Socratic challenge on the BST invariant?`;
    } else {
      greeting = `Welcome back! I am your Socratic AI Coach for **${activeSubjectConfig.label}**.
      
Your current track mastery is **${progressData.overallMastery}%**, focusing today on **${currentTopic}**.
I am calibrated to guide you through guided conceptual questions rather than just handing you direct answers. How can I assist your study today?`;
    }

    setMessages([
      {
        role: "tutor",
        content: greeting,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  }, [activeSubject, currentTopic]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || loading) return;

    const userMsg: Message = {
      role: "student",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          topicName: currentTopic,
          subjectName: activeSubjectConfig.label,
          activeSubject,
          mode: coachingMode,
          knownConcepts: aiTutorContext.knownConcepts,
          weakConcepts: aiTutorContext.weakConcepts,
          prerequisiteGaps: aiTutorContext.prerequisiteGaps,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          {
            role: "tutor",
            content: data.response,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ]);
      } else {
        // Fallback response with explicit knowledge-connection
        generateSubjectFallback(text);
      }
    } catch {
      generateSubjectFallback(text);
    } finally {
      setLoading(false);
    }
  };

  const generateSubjectFallback = (studentText: string) => {
    let reply = "";
    if (activeSubject === "Python") {
      reply = `Let's analyze that from first principles in **Python**.

You've already mastered basic data types, but notice how Python evaluates arguments at definition time. When you write:
\`\`\`python
def append_item(val, items=[]):
    items.append(val)
    return items
\`\`\`
Because \`[]\` is mutable, every subsequent function call shares that **exact same list object in memory**.

**Question for you:** How would you rewrite this function using \`None\` as a default sentinel to guarantee a brand-new list on each invocation?`;
    } else if (activeSubject === "DSA") {
      reply = `Great inquiry on **Data Structures**.

Remember the fundamental **BST Invariant**: for any node $N$ with key $K$, it is NOT enough that $N.left < K$. **Every single descendant node** in the left subtree must be strictly less than $K$.

**Ponder this:** If a node has two children, why does replacing it with its **In-Order Successor** (the smallest value in its right subtree) guarantee that the BST invariant remains completely unbroken?`;
    } else {
      reply = `Understood. In **${activeSubjectConfig.label}**, foundational concepts in ${currentTopic} dictate this behavior.
      
Think about what happens to state isolation when this operation executes. What would be your first step to verify the boundary condition?`;
    }

    setMessages((prev) => [
      ...prev,
      {
        role: "tutor",
        content: reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* 1. Global Active Subject Header */}
      <ActiveSubjectHeader />

      {/* 2. AI Coach Knowledge Context HUD */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                Contextual Socratic AI Tutor
                <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700">
                  {activeSubjectConfig.label}
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Personalized 1-on-1 pedagogical coaching connecting known competencies to weak concepts.
              </p>
            </div>
          </div>

          {/* Coaching Mode Selector */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl text-xs font-semibold self-start sm:self-auto">
            {(["socratic", "step_by_step", "analogy", "practice"] as CoachingMode[]).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setCoachingMode(mode)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-all cursor-pointer ${
                  coachingMode === mode
                    ? "bg-white text-indigo-700 font-extrabold shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {mode.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Live Subject Context Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
            <span className="text-[10px] font-bold uppercase text-slate-400 block">Active Topic</span>
            <strong className="text-slate-900 truncate block">{currentTopic}</strong>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
            <span className="text-[10px] font-bold uppercase text-emerald-700 block">Proven Foundation</span>
            <strong className="text-emerald-900 truncate block">
              {aiTutorContext.knownConcepts[0] || "Variables & Types"}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50/60 border border-rose-100">
            <span className="text-[10px] font-bold uppercase text-rose-700 block">Target Deficit</span>
            <strong className="text-rose-900 truncate block">
              {aiTutorContext.prerequisiteGaps[0] || activeSubjectConfig.defaultPrerequisiteGap}
            </strong>
          </div>
          <div className="p-2.5 rounded-xl bg-indigo-50/60 border border-indigo-100">
            <span className="text-[10px] font-bold uppercase text-indigo-700 block">Pedagogy Style</span>
            <strong className="text-indigo-900 capitalize block">{coachingMode} Probing</strong>
          </div>
        </div>

        {/* Suggested Prompt Chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
            Suggested Socratic Prompts for {activeSubjectConfig.shortLabel}:
          </span>
          <div className="flex flex-wrap gap-2">
            {aiTutorContext.suggestedPrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="text-left text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 hover:border-indigo-200 border border-slate-200 text-slate-700 transition-all cursor-pointer shadow-2xs"
              >
                💡 {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Chat Messages Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-4 min-h-[420px] flex flex-col justify-between">
        <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2">
          {messages.map((msg, idx) => {
            const isTutor = msg.role === "tutor";
            return (
              <div
                key={idx}
                className={`flex items-start gap-3 ${isTutor ? "" : "flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs ${
                    isTutor
                      ? "bg-gradient-to-tr from-purple-600 to-indigo-600 text-white"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {isTutor ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`p-4 rounded-3xl max-w-2xl text-xs sm:text-sm leading-relaxed ${
                    isTutor
                      ? "bg-slate-50 border border-slate-200/80 text-slate-800"
                      : "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                  }`}
                >
                  {isTutor ? (
                    <FormattedMessage content={msg.content} />
                  ) : (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  )}
                  <span
                    className={`text-[10px] block mt-1.5 ${
                      isTutor ? "text-slate-400" : "text-indigo-200 text-right"
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}
          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs">
                <Sparkles className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-600" />
                <span>AI Coach formulating Socratic guidance for {currentTopic}...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="pt-4 border-t border-slate-100">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2.5"
          >
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={`Ask your Socratic AI Coach about ${currentTopic}...`}
              className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all shadow-md shadow-indigo-200 disabled:opacity-40 cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
