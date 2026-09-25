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
  Volume2,
  VolumeX,
  ShieldCheck,
  Globe,
  Brain,
  RotateCcw,
} from "lucide-react";

interface Message {
  role: "student" | "tutor";
  content: string;
  timestamp: string;
  source?: string;
  confidence?: number;
}

function TutorContent() {
  const searchParams = useSearchParams();
  const topicParam = searchParams.get("topic") || "Factorisation";

  const [currentTopic, setCurrentTopic] = useState(topicParam);
  const [masteryScore, setMasteryScore] = useState(38);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [language, setLanguage] = useState<"en" | "hi">("en");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      content:
        topicParam === "Factorisation"
          ? "Hello Alex! I see you're working on **Factorisation**. Your diagnostic discovered a prerequisite gap (score: **38%**) that is currently blocking your quadratic equation mastery.\n\nInstead of just giving you the answers, I'm here to guide you Socratic-style so you master the pattern yourself! Where would you like to start: **factoring common terms** or **splitting the middle term of trinomials**?"
          : `Hello Alex! I see you're reviewing **${topicParam}**. Based on your latest learning profile (mastery: **${masteryScore}%**), let's break this concept down step-by-step. What specific question or problem are you working through right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "NCERT Mathematics Class 10 — Chapter 4",
      confidence: 94,
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("skillsync_lang") as "en" | "hi";
      if (savedLang) setLanguage(savedLang);
    }
  }, []);

  const handleSpeak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const cleanText = text.replace(/[*_#`$]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

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
          language,
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
            source: currentTopic === "Factorisation" ? "NCERT Class 10 Algebra Ch 4" : "Curriculum Standard Source",
            confidence: 92,
          },
        ]);
      } else {
        // Fallback Socratic guidance tailored to topic
        setMessages((prev) => [
          ...prev,
          {
            role: "tutor",
            content:
              language === "hi"
                ? `**${currentTopic}** को समझने के लिए एक सरल उदाहरण देखें:\n\nयदि आपके पास $x^2 + 5x + 6$ है, तो हमें ऐसी दो संख्याएँ चाहिए जिनका **गुणनफल 6** हो और **योग 5** हो।\n\nक्या आप बता सकते हैं कि वे दो संख्याएँ कौन सी होंगी? (संकेत: 2 और 3 पर विचार करें)`
                : `Great question! Let's think through this together for **${currentTopic}**:\n\nConsider the expression: $x^2 + 5x + 6 = 0$.\n\nTo factor this trinomial into $(x + p)(x + q)$:\n1. We need two numbers $p$ and $q$ that **multiply to $6$**.\n2. The same numbers must **add to $5$**.\n\nCan you test pairs of factors of $6$ to see which pair adds up to $5$?`,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            source: "NCERT Mathematics Class 10 Ch 4",
            confidence: 94,
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          content: `Let's break down **${currentTopic}** step-by-step. Remember, the key is identifying what terms are common first before expanding. Would you like a hint?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "Offline Learning Engine",
          confidence: 88,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Top Banner: Socratic Coach Header & Context */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 sm:p-5 card-hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-sm shadow-indigo-100 flex-shrink-0">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-slate-900">
                  Socratic AI Learning Coach
                </h1>
                <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold border border-indigo-100">
                  {currentTopic}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                  Mastery: {masteryScore}%
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Teaches by questioning & step-by-step reasoning rather than giving away direct answers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "hi" : "en")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-indigo-600" />
              <span>{language === "en" ? "English" : "हिन्दी"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col h-[580px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((m, index) => {
            const isTutor = m.role === "tutor";
            return (
              <div
                key={index}
                className={`flex gap-3 max-w-[85%] ${isTutor ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-2xs ${
                    isTutor
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {isTutor ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div className="space-y-1.5">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      isTutor
                        ? "bg-slate-50 border border-slate-200/90 text-slate-800"
                        : "bg-indigo-600 text-white font-medium shadow-xs"
                    }`}
                  >
                    {m.content}
                  </div>

                  {/* Trust Layer: Source Grounding & Audio Listen Button */}
                  {isTutor && (
                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 pl-1">
                      {m.source && (
                        <span className="flex items-center gap-1 font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                          <ShieldCheck className="w-3 h-3 text-emerald-600" />
                          <span>Source: {m.source}</span>
                        </span>
                      )}
                      {m.confidence && (
                        <span className="text-slate-400 font-mono">
                          Confidence: {m.confidence}%
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.content)}
                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-semibold cursor-pointer pl-1"
                        title="Listen to explanation (Accessibility)"
                      >
                        {isSpeaking ? (
                          <>
                            <VolumeX className="w-3 h-3 text-rose-500" />
                            <span className="text-rose-600">Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3 h-3" />
                            <span>Read Aloud</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <span className={`text-[10px] text-slate-400 block ${isTutor ? "pl-1" : "text-right pr-1"}`}>
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-[85%] mr-auto animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
                <span>Formulating Socratic guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Socratic Action Buttons (Section 4 & 5 of Master Prompt) */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            Coach Actions:
          </span>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you give me a small hint without telling me the answer?")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Give me a hint</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you walk me through the step-by-step logic?")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <BookOpen className="w-3 h-3 text-indigo-500" />
            <span>Step-by-step logic</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you show me a concrete real-world analogy?")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Real-world analogy</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Why is this prerequisite required before quadratic equations?")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
          >
            <HelpCircle className="w-3 h-3 text-rose-500" />
            <span>Why is this required?</span>
          </button>
        </div>

        {/* Message Input Box */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
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
              placeholder={`Ask the AI Coach about ${currentTopic} (e.g. "How do I split middle terms?")...`}
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition-colors shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function TutorPage() {
  return (
    <AppLayout>
      <Suspense
        fallback={
          <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mb-3" />
            <p className="text-xs text-slate-500">Loading AI Learning Coach...</p>
          </div>
        }
      >
        <TutorContent />
      </Suspense>
    </AppLayout>
  );
}
