"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import FormattedMessage from "@/components/FormattedMessage";
import { type DifficultyPrediction } from "@/lib/cohortAnalytics";
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
  Volume2,
  VolumeX,
  ShieldCheck,
  Globe,
  Brain,
  RotateCcw,
  Mic,
  MicOff,
  Copy,
  Check,
  Layers,
  ChevronDown,
  Target,
  ArrowRight,
  Flame,
  Award,
  FileText,
  Download,
  AlertTriangle,
} from "lucide-react";

interface Message {
  id?: string;
  role: "student" | "tutor";
  content: string;
  timestamp: string;
  source?: string;
  confidence?: number;
}

type CoachingMode = "socratic" | "step_by_step" | "analogy" | "practice" | "review";
type LanguageOption = "en" | "hi" | "hinglish";

interface SubjectWithTopics {
  id: string;
  name: string;
  topics: {
    id: string;
    name: string;
    description: string | null;
    difficulty: string;
  }[];
}

const COACHING_MODES: { id: CoachingMode; label: string; icon: React.ComponentType<{ className?: string }>; description: string }[] = [
  { id: "socratic", label: "Socratic Guide", icon: Brain, description: "Guides with smart questions rather than direct answers" },
  { id: "step_by_step", label: "Step-by-Step", icon: Layers, description: "Breaks problem into sequential digestible steps" },
  { id: "analogy", label: "Real-World Analogy", icon: Sparkles, description: "Explains concepts using everyday metaphors" },
  { id: "practice", label: "Practice Challenge", icon: Target, description: "Generates calibrated practice problems to test you" },
  { id: "review", label: "Exam Review", icon: Flame, description: "High-yield formulas, key rules & traps to avoid" },
];

function TutorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Factorisation";

  const [currentTopic, setCurrentTopic] = useState(initialTopic);
  const [masteryScore, setMasteryScore] = useState<number>(45);
  const [masteryLevel, setMasteryLevel] = useState<string>("in_progress");
  const [coachingMode, setCoachingMode] = useState<CoachingMode>("socratic");
  const [language, setLanguage] = useState<LanguageOption>("en");

  // Topic selector drawer state
  const [subjectsList, setSubjectsList] = useState<SubjectWithTopics[]>([]);
  const [isTopicModalOpen, setIsTopicModalOpen] = useState(false);

  // Audio Speech state
  const [playingMessageIndex, setPlayingMessageIndex] = useState<number | null>(null);

  // Voice recording (Speech-to-Text) state
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<unknown>(null);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      content:
        initialTopic === "Factorisation"
          ? "Hello Alex! I see you're focusing on **Factorisation**.\n\nYour diagnostic indicates a prerequisite gap (Mastery: **38%**) that is currently blocking quadratic equation fluency.\n\nInstead of handing you final answers, I'm here to coach you Socratic-style so the pattern clicks naturally! Where would you like to start: **factoring common terms** or **splitting the middle term of trinomials**?"
          : `Hello Alex! I am your Socratic AI Coach for **${initialTopic}**.\n\nBased on your learning profile (Mastery: **${masteryScore}%**), we will master this step-by-step. What specific problem or concept would you like to tackle first?`,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      source: "NCERT Mathematics Class 10 — Chapter 4",
      confidence: 95,
    },
  ]);

  const [inputMessage, setInputMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [copiedSession, setCopiedSession] = useState(false);

  // Summarization & Cohort Analytics State
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summaryNotes, setSummaryNotes] = useState<string>("");
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [cohortPrediction, setCohortPrediction] = useState<DifficultyPrediction | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Load language preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedLang = localStorage.getItem("skillsync_lang") as LanguageOption;
      if (savedLang && (savedLang === "en" || savedLang === "hi" || savedLang === "hinglish")) {
        setLanguage(savedLang);
      }

      // Check SpeechRecognition support
      const SpeechRecognition =
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition ||
        (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const recognition = new (SpeechRecognition as any)();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInputMessage((prev) => (prev ? `${prev} ${transcript}` : transcript));
          setIsListening(false);
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = recognition;
      }
    }
  }, [language]);

  // Fetch subjects and topics for switcher
  useEffect(() => {
    async function loadData() {
      try {
        const [subjectsRes, tutorRes] = await Promise.all([
          fetch("/api/subjects"),
          fetch(`/api/tutor?topicName=${encodeURIComponent(currentTopic)}`),
        ]);

        if (subjectsRes.ok) {
          const data = await subjectsRes.json();
          if (data.subjects) setSubjectsList(data.subjects);
        }

        if (tutorRes.ok) {
          const tutorData = await tutorRes.json();
          if (tutorData.mastery !== undefined) setMasteryScore(tutorData.mastery);
          if (tutorData.masteryLevel) setMasteryLevel(tutorData.masteryLevel);
          if (tutorData.session?.id) setSessionId(tutorData.session.id);
          if (tutorData.session?.messages?.length > 0) {
            setMessages(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              tutorData.session.messages.map((m: any) => ({
                id: m.id,
                role: m.role,
                content: m.content,
                timestamp: new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                source: `Curriculum Standard — ${currentTopic}`,
                confidence: 94,
              }))
            );
          }
        }

        // Fetch cohort difficulty prediction
        try {
          const cohortRes = await fetch(`/api/analytics/cohort?topicName=${encodeURIComponent(currentTopic)}`);
          if (cohortRes.ok) {
            const cohortData = await cohortRes.json();
            if (cohortData.prediction) setCohortPrediction(cohortData.prediction);
          }
        } catch {}
      } catch (err) {
        console.error("Failed to load tutor data", err);
      }
    }
    loadData();
  }, [currentTopic]);

  const handleGenerateSummary = async () => {
    setIsSummarizing(true);
    try {
      const res = await fetch("/api/tutor/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          topicName: currentTopic,
          messages: messages.map(m => ({ role: m.role, content: m.content })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSummaryNotes(data.summary);
        setSummaryModalOpen(true);
      }
    } catch (err) {
      console.error("Failed to generate summary notes", err);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summaryNotes);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const handleDownloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([summaryNotes], { type: "text/markdown" });
    element.href = URL.createObjectURL(file);
    element.download = `${currentTopic}_Revision_Notes.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Voice recording toggle
  const toggleListening = () => {
    if (!speechSupported || !recognitionRef.current) {
      alert("Voice input is not supported in this browser. Please use Google Chrome, Edge, or Safari.");
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognition = recognitionRef.current as any;
    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      try {
        recognition.lang = language === "hi" ? "hi-IN" : "en-US";
        recognition.start();
        setIsListening(true);
      } catch (e) {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      }
    }
  };

  // Text to Speech
  const handleSpeak = (text: string, index: number) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (playingMessageIndex === index) {
      window.speechSynthesis.cancel();
      setPlayingMessageIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text of markdown characters, formulas, and brackets for smooth pronunciation
    const cleanText = text
      .replace(/[*_#`$>]/g, "")
      .replace(/\$\$/g, "")
      .replace(/\$/g, "");

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.lang = language === "hi" ? "hi-IN" : "en-US";

    utterance.onend = () => setPlayingMessageIndex(null);
    utterance.onerror = () => setPlayingMessageIndex(null);

    setPlayingMessageIndex(index);
    window.speechSynthesis.speak(utterance);
  };

  // Copy full conversation to clipboard for revision notes
  const handleCopyConversation = () => {
    const chatExport = messages
      .map((m) => `[${m.role.toUpperCase()} - ${m.timestamp}]\n${m.content}`)
      .join("\n\n---\n\n");

    navigator.clipboard.writeText(`SkillSync AI Coach Session: ${currentTopic}\n\n${chatExport}`);
    setCopiedSession(true);
    setTimeout(() => setCopiedSession(false), 2000);
  };

  // Reset conversation
  const handleResetSession = async () => {
    if (!confirm("Are you sure you want to reset this coaching session?")) return;
    try {
      if (sessionId) {
        await fetch(`/api/tutor?sessionId=${sessionId}`, { method: "DELETE" });
      }
      setSessionId(null);
      setMessages([
        {
          role: "tutor",
          content: `Session refreshed! I'm your AI Coach for **${currentTopic}** in **${COACHING_MODES.find((m) => m.id === coachingMode)?.label}** mode.\n\nHow can I help you master this concept today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: `Curriculum Standard — ${currentTopic}`,
          confidence: 96,
        },
      ]);
    } catch (e) {
      console.error(e);
    }
  };

  // Switch topic
  const handleSelectTopic = (topicName: string) => {
    setCurrentTopic(topicName);
    setIsTopicModalOpen(false);
    router.push(`/tutor?topic=${encodeURIComponent(topicName)}`);
    setMessages([
      {
        role: "tutor",
        content: `Switched to **${topicName}**! I'm calibrating my guidance to your current mastery level.\n\nWhat would you like to explore first?`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        source: `Standard Curriculum — ${topicName}`,
        confidence: 95,
      },
    ]);
  };

  // Send message
  const handleSendMessage = async (textToSend?: string, overrideMode?: CoachingMode) => {
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
          mode: overrideMode || coachingMode,
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
            source: data.source || `Curriculum Standard — ${currentTopic}`,
            confidence: data.confidence || 93,
          },
        ]);
      } else {
        throw new Error("Tutor API failed");
      }
    } catch {
      // Dynamic fallback
      setMessages((prev) => [
        ...prev,
        {
          role: "tutor",
          content:
            language === "hi"
              ? `**${currentTopic}** को समझने के लिए एक महत्वपूर्ण विचार:\n\nगणित में जटिल प्रश्नों को हल करने का सबसे आसान तरीका है कि हम उसे छोटे-छोटे चरणों में बाँटें। क्या आप मुझे इस प्रश्न का पहला कदम बता सकते हैं?`
              : language === "hinglish"
              ? `Awesome! **${currentTopic}** me sabse pehle foundational pattern identify karna zaroori hai.\n\nAapko is problem me sabse pehle kaun si property ya term notice ho rahi hai?`
              : `Great question regarding **${currentTopic}**! Let's think through this logically:\n\nBefore jumping to the full solution, what is the first rule or formula that applies to this kind of expression?`,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          source: "Offline Socratic Engine",
          confidence: 90,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-4 pb-8">
      {/* Top Banner: Coach Identity, Topic Switcher & Mode selector */}
      <div data-scroll="fade-down" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 card-hover-lift">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Identity & Current Topic */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shadow-indigo-100 flex-shrink-0 relative">
              <Brain className="w-6 h-6 animate-pulse" />
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                  Socratic AI Learning Coach
                </h1>

                {/* Topic Switcher Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsTopicModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-colors cursor-pointer"
                  title="Click to switch topic"
                >
                  <span>{currentTopic}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
                </button>

                {/* Mastery badge */}
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${
                    masteryScore >= 70
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : masteryScore >= 40
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : "bg-rose-50 text-rose-700 border-rose-200"
                  }`}
                >
                  <Award className="w-3 h-3" />
                  Mastery: {masteryScore}%
                </span>

                {/* Cohort Difficulty Prediction Badge */}
                {cohortPrediction && cohortPrediction.cohortStruggleRate >= 45 && (
                  <span
                    className="px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 bg-amber-50 text-amber-800 border-amber-300 animate-pulse"
                    title={`Cohort Alert: ${cohortPrediction.cohortStruggleRate}% struggle rate detected across cohort. Recommended prep: ${cohortPrediction.recommendedPrepMinutes} mins.`}
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    Cohort Bottleneck ({cohortPrediction.cohortStruggleRate}% Struggle)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Active Socratic intelligence: guides by reasoning, progressive hints, and adaptive questioning.
              </p>
            </div>
          </div>

          {/* Controls: Language, Copy Notes, Reset */}
          <div className="flex flex-wrap items-center gap-2 sm:self-end lg:self-center">
            {/* Language Selector */}
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 text-xs font-semibold text-slate-600">
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  language === "en" ? "bg-white text-indigo-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hi")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  language === "hi" ? "bg-white text-indigo-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setLanguage("hinglish")}
                className={`px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  language === "hinglish" ? "bg-white text-indigo-700 shadow-xs font-bold" : "hover:text-slate-900"
                }`}
              >
                Hinglish
              </button>
            </div>

            {/* Auto-Generate Revision Notes */}
            <button
              type="button"
              onClick={handleGenerateSummary}
              disabled={isSummarizing || messages.length < 2}
              className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/80 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-xs"
              title="Auto-generate structured study notes & takeaways from this session"
            >
              {isSummarizing ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
              ) : (
                <Sparkles className="w-4 h-4 text-indigo-600" />
              )}
              <span className="hidden sm:inline">Auto-Notes</span>
            </button>

            {/* Copy Notes */}
            <button
              type="button"
              onClick={handleCopyConversation}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Copy session notes for study"
            >
              {copiedSession ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              <span className="hidden sm:inline">{copiedSession ? "Copied!" : "Raw Log"}</span>
            </button>

            {/* Reset Session */}
            <button
              type="button"
              onClick={handleResetSession}
              className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-rose-50 hover:border-rose-200 text-slate-600 hover:text-rose-600 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Reset conversation"
            >
              <RotateCcw className="w-4 h-4" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          </div>
        </div>

        {/* Coaching Mode Selector Tabs */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Mode:
          </span>
          {COACHING_MODES.map((mode) => {
            const Icon = mode.icon;
            const isActive = coachingMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => setCoachingMode(mode.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
                }`}
                title={mode.description}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-indigo-600"}`} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div data-scroll="scale" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[620px]">
        {/* Messages Stream */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-gradient-to-b from-slate-50/50 to-white">
          {messages.map((m, index) => {
            const isTutor = m.role === "tutor";
            const isAudioPlaying = playingMessageIndex === index;

            return (
              <div
                key={index}
                className={`flex gap-3.5 max-w-[90%] sm:max-w-[85%] ${isTutor ? "mr-auto" : "ml-auto flex-row-reverse"}`}
              >
                {/* Avatar */}
                <div
                  className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-xs ${
                    isTutor
                      ? "bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white"
                      : "bg-slate-800 text-white"
                  }`}
                >
                  {isTutor ? <Sparkles className="w-4.5 h-4.5" /> : <User className="w-4.5 h-4.5" />}
                </div>

                {/* Bubble Container */}
                <div className="space-y-1.5 flex-1">
                  <div
                    className={`p-4 rounded-2xl leading-relaxed shadow-2xs transition-all ${
                      isTutor
                        ? "bg-white border border-slate-200/90 text-slate-800 rounded-tl-sm"
                        : "bg-indigo-600 text-white font-medium rounded-tr-sm"
                    }`}
                  >
                    <FormattedMessage content={m.content} isTutor={isTutor} />
                  </div>

                  {/* Trust Layer: Source Grounding & Audio Listen Button */}
                  {isTutor && (
                    <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 pl-1 pt-0.5">
                      {m.source && (
                        <span className="flex items-center gap-1 font-medium text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{m.source}</span>
                        </span>
                      )}
                      {m.confidence && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          Confidence: {m.confidence}%
                        </span>
                      )}

                      {/* Text-To-Speech Play Button */}
                      <button
                        type="button"
                        onClick={() => handleSpeak(m.content, index)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold cursor-pointer transition-colors ${
                          isAudioPlaying
                            ? "bg-rose-50 text-rose-600 border border-rose-200 animate-pulse"
                            : "bg-slate-50 text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200"
                        }`}
                        title="Listen to audio explanation"
                      >
                        {isAudioPlaying ? (
                          <>
                            <VolumeX className="w-3.5 h-3.5 text-rose-500" />
                            <span>Stop Audio</span>
                          </>
                        ) : (
                          <>
                            <Volume2 className="w-3.5 h-3.5" />
                            <span>Listen</span>
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
              <div className="w-9 h-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xs">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs text-slate-500 flex items-center gap-2.5 shadow-2xs">
                <Sparkles className="w-4 h-4 text-indigo-500 animate-spin" />
                <span>AI Coach is structuring Socratic guidance...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Socratic Prompt Bar */}
        <div className="px-4 py-2.5 bg-slate-50/80 border-t border-slate-100 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0 mr-1">
            Prompt Coach:
          </span>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you give me a small hint without spoiling the answer?", "socratic")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Give me a hint</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you give me an interactive practice problem on this?", "practice")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Target className="w-3 h-3 text-emerald-500" />
            <span>Practice problem</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Can you explain this with a memorable real-world analogy?", "analogy")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Sparkles className="w-3 h-3 text-purple-500" />
            <span>Real-world analogy</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("What are the most common traps or mistakes students make here?", "review")}
            disabled={loading}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-100 hover:border-slate-300 transition-colors flex items-center gap-1.5 flex-shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <Flame className="w-3 h-3 text-rose-500" />
            <span>Common mistakes</span>
          </button>
        </div>

        {/* Message Input Box with Voice & Send */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition-all cursor-pointer flex-shrink-0 ${
                isListening
                  ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-md shadow-rose-200"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
              title={isListening ? "Listening... Click to stop" : "Speak your question (Voice Input)"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-indigo-600" />}
            </button>

            {/* Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                isListening
                  ? "Listening to your voice..."
                  : `Ask the AI Coach about ${currentTopic} (e.g. "Why do we add $p$ and $q$ to get middle term?")...`
              }
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all shadow-inner bg-slate-50/50 focus:bg-white"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputMessage.trim() || loading}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm transition-all shadow-sm shadow-indigo-200 flex items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Send</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* Topic Switcher Modal */}
      {isTopicModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-lg w-full max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Learning Topic</h3>
                <p className="text-xs text-slate-500 mt-0.5">Switch AI Coach focus across subjects</p>
              </div>
              <button
                onClick={() => setIsTopicModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 max-h-[60vh]">
              {subjectsList.length > 0 ? (
                subjectsList.map((subject) => (
                  <div key={subject.id} className="space-y-2">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                      <span>{subject.name}</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {subject.topics.map((t) => {
                        const isCurrent = t.name.toLowerCase() === currentTopic.toLowerCase();
                        return (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => handleSelectTopic(t.name)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isCurrent
                                ? "bg-indigo-50 border-indigo-300 ring-2 ring-indigo-500/20"
                                : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                            }`}
                          >
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{t.name}</span>
                            <div className="flex items-center justify-between mt-2 text-[10px]">
                              <span className="text-slate-500 capitalize">{t.difficulty}</span>
                              {isCurrent && <span className="text-indigo-600 font-bold">Active</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <p>Loading available curriculum topics...</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsTopicModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Notes Modal */}
      {summaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-indigo-50/50 to-white">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-sm shadow-indigo-200">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    Session Revision Notes
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-700">AI Synthesized</span>
                  </h3>
                  <p className="text-xs text-slate-500">Key takeaways, formulas & practice problems from this session</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSummaryModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto flex-1 text-slate-800 text-sm leading-relaxed">
              <FormattedMessage content={summaryNotes} isTutor={true} />
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                Formatted as Markdown • Ready for review
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleCopySummary}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copiedSummary ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
                  <span>{copiedSummary ? "Copied!" : "Copy Markdown"}</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadSummary}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs shadow-indigo-200"
                >
                  <Download className="w-4 h-4" />
                  <span>Download .md</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
            <p className="text-xs text-slate-500 font-medium">Loading Socratic AI Learning Coach...</p>
          </div>
        }
      >
        <TutorContent />
      </Suspense>
    </AppLayout>
  );
}
