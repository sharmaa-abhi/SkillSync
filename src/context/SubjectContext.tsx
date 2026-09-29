"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import {
  SubjectKey,
  SubjectConfig,
  ACTIVE_SUBJECT_STORAGE_KEY,
  ACTIVE_SUBJECT_EVENT,
  SUBJECT_CONFIGS,
  ALL_SUBJECTS,
  getActiveSubjectKey,
  setActiveSubjectKey,
  getSubjectConfig,
} from "@/lib/activeSubject";
import {
  getSubjectGraphData,
  SkillNode,
  EdgeDefinition,
  SkillStatus,
} from "@/components/SkillGraph";

export interface TopicKnowledge {
  topicName: string;
  score: number;
  status: SkillStatus;
  masteryLevel: "weak" | "medium" | "strong";
  confidence: "Low" | "Medium" | "High";
  isPrerequisiteGap: boolean;
  questionsAnswered: number;
  questionsCorrect: number;
}

export interface PlanItem {
  order: number;
  topic: string;
  activity: string;
  durationMinutes: number;
  priority: "critical" | "high" | "medium" | "low";
  reason: string;
  isCompleted?: boolean;
}

export interface LearningPlanState {
  title: string;
  estimatedDuration: string;
  items: PlanItem[];
}

export interface AdaptiveLoopState {
  status: "active" | "recalibrating";
  currentStage: "Diagnose" | "Detect Gaps" | "Update Model" | "Adapt Plan" | "Generate Practice" | "Re-evaluate" | "Update Graph";
  stageIndex: number;
  detectedGaps: string[];
  lastRecalibrated: string;
  recentAction: string;
}

export interface AITutorContext {
  activeSubject: string;
  currentTopic: string;
  knownConcepts: string[];
  partialKnowledge: string[];
  weakConcepts: string[];
  prerequisiteGaps: string[];
  recentMistakes: string[];
  suggestedPrompts: string[];
}

export interface SubjectContextValue {
  activeSubject: SubjectKey;
  activeSubjectConfig: SubjectConfig;
  setActiveSubject: (key: SubjectKey) => void;
  subjectId: string;
  subjectName: string;
  subjectDescription: string;
  subjectLevel: string;
  userGoal: string;
  completedTopics: string[];
  currentTopic: string;
  knowledgeState: Record<string, TopicKnowledge>;
  skillGraph: {
    skills: SkillNode[];
    edges: EdgeDefinition[];
    defaultSelected: string;
  };
  learningPlan: LearningPlanState;
  progressData: {
    overallMastery: number;
    topicScores: Array<{ topicName: string; score: number; status: string; change: number }>;
    streakDays: number;
    studyMinutes: number;
    weeklyGoal: { current: number; target: number };
    reteachRate: string;
  };
  aiTutorContext: AITutorContext;
  adaptiveLoop: AdaptiveLoopState;
  updateTopicMastery: (topicName: string, deltaScore: number, isCorrect?: boolean) => void;
  recordPracticeResult: (topicName: string, isCorrect: boolean, questionId?: string) => Promise<void>;
  togglePlanItem: (order: number) => void;
  triggerAdaptiveRecalibration: (reason?: string) => void;
  allSubjects: SubjectConfig[];
  isHydrated: boolean;
}

const SubjectContext = createContext<SubjectContextValue | undefined>(undefined);

// Subject-specific default plans
const SUBJECT_DEFAULT_PLANS: Record<SubjectKey, LearningPlanState> = {
  Python: {
    title: "Python Programming: Function Closures & Scope Remediation",
    estimatedDuration: "1.5 hours total",
    items: [
      {
        order: 1,
        topic: "Functions & Scope",
        activity: "Remediate Mutable Default Arguments & Local vs Global Scope",
        durationMinutes: 15,
        priority: "high",
        reason: "Partial knowledge demonstrated (58%). Vital prerequisite before advanced functional closures.",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Lambda Functions",
        activity: "Anonymous Expressions & Custom sorted() Key Projections",
        durationMinutes: 20,
        priority: "critical",
        reason: "Critical prerequisite gap identified in diagnostic (30% score). Blocks OOP and decorators.",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "Loops & Iteration",
        activity: "Dictionary Comprehensions & Generator Iteration",
        durationMinutes: 15,
        priority: "medium",
        reason: "Strengthen loop protocols to achieve complete mastery (78% -> 90%).",
        isCompleted: false,
      },
      {
        order: 4,
        topic: "Object-Oriented Programming",
        activity: "Classes, __init__ Constructor & Encapsulation",
        durationMinutes: 30,
        priority: "low",
        reason: "Target milestone unlocking once function and lambda prerequisites are cleared.",
        isCompleted: false,
      },
    ],
  },
  DSA: {
    title: "Data Structures & Algorithms: Binary Search Tree Remediation Roadmap",
    estimatedDuration: "2.0 hours total",
    items: [
      {
        order: 1,
        topic: "Binary Search Trees",
        activity: "BST Invariant, In-Order Traversal & 2-Child Node Deletion",
        durationMinutes: 25,
        priority: "critical",
        reason: "Critical prerequisite gap (38% score). Prerequisite for Heaps, AVL balancing, and DB indexing.",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Dynamic Programming",
        activity: "Recurrence Formulation & 0/1 Knapsack Memoization",
        durationMinutes: 30,
        priority: "critical",
        reason: "Deficit identified in subproblem state transitions (32% score).",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "Stacks & Queues",
        activity: "Monotonic Stack Pattern for Boundary Problems",
        durationMinutes: 20,
        priority: "medium",
        reason: "Reinforce FIFO/LIFO invariants ahead of BFS/DFS graph traversals (70% score).",
        isCompleted: false,
      },
      {
        order: 4,
        topic: "Graph Algorithms",
        activity: "BFS Shortest Path & Dijkstra Algorithm",
        durationMinutes: 35,
        priority: "low",
        reason: "Milestone goal dependent on BST and queue prerequisite mastery.",
        isCompleted: false,
      },
    ],
  },
  Maths: {
    title: "Mathematics: Quadratic Equations & Factorisation Remediation",
    estimatedDuration: "1.5 hours total",
    items: [
      {
        order: 1,
        topic: "Factorisation",
        activity: "Splitting Middle Term & Difference of Squares Trinomials",
        durationMinutes: 20,
        priority: "critical",
        reason: "Critical prerequisite gap (38% score) blocking quadratic factoring.",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Quadratic Equations",
        activity: "Discriminant Test & Quadratic Formula Derivation",
        durationMinutes: 25,
        priority: "high",
        reason: "Current focus at 72% mastery; push to strong competency.",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "Coordinate Geometry",
        activity: "Parabola Vertex Form & Axis of Symmetry",
        durationMinutes: 30,
        priority: "medium",
        reason: "Advanced geometric interpretation of quadratic roots.",
        isCompleted: false,
      },
    ],
  },
  DBMS: {
    title: "Database Systems: Relational Normalization & BCNF Roadmap",
    estimatedDuration: "1.5 hours total",
    items: [
      {
        order: 1,
        topic: "Normalization",
        activity: "Functional Dependency Decomposition (1NF to BCNF)",
        durationMinutes: 25,
        priority: "critical",
        reason: "Eliminate transitive and partial dependencies for exam readiness (36% score).",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Concurrency Control",
        activity: "Two-Phase Locking (2PL) & Conflict Serializability",
        durationMinutes: 25,
        priority: "high",
        reason: "Weak area identified in ACID isolation tests (32% score).",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "Transactions",
        activity: "Write-Ahead Logging (WAL) & Recovery Protocols",
        durationMinutes: 20,
        priority: "medium",
        reason: "Fortify transaction atomicity mechanics (62% score).",
        isCompleted: false,
      },
    ],
  },
  OS: {
    title: "Operating Systems: Deadlock Prevention & Memory Isolation",
    estimatedDuration: "1.5 hours total",
    items: [
      {
        order: 1,
        topic: "Deadlocks",
        activity: "Four Coffman Conditions & Banker's Safe State Algorithm",
        durationMinutes: 20,
        priority: "critical",
        reason: "Prerequisite gap identified in diagnostic (34% score).",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Concurrency & Mutex",
        activity: "Peterson's Algorithm & Counting Semaphores",
        durationMinutes: 25,
        priority: "high",
        reason: "Required foundation before multi-threaded kernel synchronisation.",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "Virtual Memory & Paging",
        activity: "Page Fault Interrupts & Effective Access Time",
        durationMinutes: 20,
        priority: "medium",
        reason: "High yield exam topic; currently at 71% mastery.",
        isCompleted: false,
      },
    ],
  },
  CN: {
    title: "Computer Networks: CIDR Subnetting & Congestion Control",
    estimatedDuration: "1.5 hours total",
    items: [
      {
        order: 1,
        topic: "IP Addressing & Subnetting",
        activity: "VLSM & CIDR Subnet Prefix Host Calculations",
        durationMinutes: 25,
        priority: "critical",
        reason: "Prerequisite gap identified in network diagnostic (39% score).",
        isCompleted: false,
      },
      {
        order: 2,
        topic: "Routing Protocols & NAT",
        activity: "Dijkstra OSPF vs Bellman-Ford Distance Vector",
        durationMinutes: 25,
        priority: "high",
        reason: "Medium mastery (42%); required for autonomous systems routing.",
        isCompleted: false,
      },
      {
        order: 3,
        topic: "TCP vs UDP Flow & Congestion",
        activity: "Slow Start, AIMD & Fast Retransmit Timing",
        durationMinutes: 20,
        priority: "medium",
        reason: "Advance from 73% to 90% top-tier mastery.",
        isCompleted: false,
      },
    ],
  },
};

// Initial knowledge generator from config
function getInitialKnowledge(config: SubjectConfig): Record<string, TopicKnowledge> {
  const map: Record<string, TopicKnowledge> = {};
  for (const t of config.topics) {
    const isGap = t.masteryLevel === "weak" && t.defaultScore < 40;
    let status: SkillStatus = "learning";
    if (t.masteryLevel === "strong") status = "mastered";
    else if (isGap) status = "prerequisite_gap";
    else if (t.defaultScore >= 70) status = "practicing";
    else if (t.defaultScore >= 40) status = "partially_known";
    else if (t.defaultScore === 0) status = "not_started";

    map[t.name] = {
      topicName: t.name,
      score: t.defaultScore,
      status,
      masteryLevel: t.masteryLevel,
      confidence: t.defaultScore >= 75 ? "High" : t.defaultScore >= 45 ? "Medium" : "Low",
      isPrerequisiteGap: isGap,
      questionsAnswered: t.defaultScore > 0 ? 5 : 0,
      questionsCorrect: Math.round((t.defaultScore / 100) * 5),
    };
  }
  return map;
}

export function SubjectProvider({ children }: { children: React.ReactNode }) {
  const [activeSubject, setActiveSubjectState] = useState<SubjectKey>("Python");
  const [isHydrated, setIsHydrated] = useState(false);

  // Per-subject knowledge store in memory / synced with localStorage
  const [knowledgeStore, setKnowledgeStore] = useState<Record<string, Record<string, TopicKnowledge>>>({});
  const [planStore, setPlanStore] = useState<Record<string, LearningPlanState>>(SUBJECT_DEFAULT_PLANS);
  const [adaptiveState, setAdaptiveState] = useState<AdaptiveLoopState>({
    status: "active",
    currentStage: "Diagnose",
    stageIndex: 1,
    detectedGaps: ["Lambda Functions & Closures", "Functions & Scope"],
    lastRecalibrated: "Just now",
    recentAction: "Diagnostic Assessment Completed",
  });

  // Mount effect to restore active subject and persisted knowledge
  useEffect(() => {
    const initialKey = getActiveSubjectKey();
    setActiveSubjectState(initialKey);

    // Load any saved per-subject knowledge from localStorage
    try {
      const savedStore = localStorage.getItem("skillsync_knowledge_store");
      if (savedStore) {
        setKnowledgeStore(JSON.parse(savedStore));
      }
      const savedPlans = localStorage.getItem("skillsync_plan_store");
      if (savedPlans) {
        setPlanStore(JSON.parse(savedPlans));
      }
    } catch {}

    setIsHydrated(true);

    const handleSubjectChange = (e: Event) => {
      const customEvent = e as CustomEvent<SubjectKey>;
      if (customEvent.detail && SUBJECT_CONFIGS[customEvent.detail]) {
        setActiveSubjectState(customEvent.detail);
      } else {
        setActiveSubjectState(getActiveSubjectKey());
      }
    };

    window.addEventListener(ACTIVE_SUBJECT_EVENT, handleSubjectChange);
    window.addEventListener("storage", (e) => {
      if (e.key === ACTIVE_SUBJECT_STORAGE_KEY) {
        setActiveSubjectState(getActiveSubjectKey());
      }
    });

    return () => {
      window.removeEventListener(ACTIVE_SUBJECT_EVENT, handleSubjectChange);
    };
  }, []);

  const activeSubjectConfig = useMemo(() => getSubjectConfig(activeSubject), [activeSubject]);

  // Current subject's knowledge state
  const currentKnowledge = useMemo(() => {
    if (knowledgeStore[activeSubject]) {
      return knowledgeStore[activeSubject];
    }
    return getInitialKnowledge(activeSubjectConfig);
  }, [activeSubject, knowledgeStore, activeSubjectConfig]);

  // Current subject's learning plan
  const currentPlan = useMemo(() => {
    if (planStore[activeSubject]) {
      return planStore[activeSubject];
    }
    return SUBJECT_DEFAULT_PLANS[activeSubject] || SUBJECT_DEFAULT_PLANS.Python;
  }, [activeSubject, planStore]);

  // Skill Graph representation for active subject
  const skillGraph = useMemo(() => {
    const data = getSubjectGraphData(activeSubject);
    // Overlay real-time knowledge scores onto graph nodes
    const dynamicNodes = data.skills.map((node) => {
      const matched = Object.values(currentKnowledge).find(
        (k) => k.topicName.toLowerCase() === node.name.toLowerCase() || node.name.toLowerCase().includes(k.topicName.toLowerCase())
      );
      if (matched) {
        return {
          ...node,
          masteryScore: matched.score,
          status: matched.status,
          isPrerequisiteGap: matched.isPrerequisiteGap,
          confidence: matched.confidence,
        };
      }
      return node;
    });

    return {
      skills: dynamicNodes,
      edges: data.edges,
      defaultSelected: data.defaultSelected,
    };
  }, [activeSubject, currentKnowledge]);

  // Switch Active Subject
  const setActiveSubject = useCallback((key: SubjectKey) => {
    setActiveSubjectKey(key);
    setActiveSubjectState(key);

    const cfg = getSubjectConfig(key);
    const gaps = cfg.defaultWeaknesses || [];

    setAdaptiveState({
      status: "active",
      currentStage: "Detect Gaps",
      stageIndex: 2,
      detectedGaps: gaps,
      lastRecalibrated: "Just now",
      recentAction: `Switched active subject to ${cfg.label}. Knowledge context loaded.`,
    });
  }, []);

  // Update mastery for a specific topic
  const updateTopicMastery = useCallback((topicName: string, deltaScore: number, isCorrect?: boolean) => {
    setKnowledgeStore((prev) => {
      const subjectMap = { ...(prev[activeSubject] || getInitialKnowledge(activeSubjectConfig)) };
      // Find matching topic
      const key = Object.keys(subjectMap).find(
        (k) => k.toLowerCase() === topicName.toLowerCase() || topicName.toLowerCase().includes(k.toLowerCase())
      ) || topicName;

      const current = subjectMap[key] || {
        topicName,
        score: 50,
        status: "learning" as SkillStatus,
        masteryLevel: "medium" as const,
        confidence: "Medium" as const,
        isPrerequisiteGap: false,
        questionsAnswered: 0,
        questionsCorrect: 0,
      };

      const newScore = Math.min(100, Math.max(0, current.score + deltaScore));
      const newAnswered = current.questionsAnswered + 1;
      const newCorrect = current.questionsCorrect + (isCorrect ? 1 : 0);

      let status: SkillStatus = "learning";
      let masteryLevel: "weak" | "medium" | "strong" = "medium";
      let isGap = false;

      if (newScore >= 75) {
        status = "mastered";
        masteryLevel = "strong";
      } else if (newScore < 40) {
        status = "prerequisite_gap";
        masteryLevel = "weak";
        isGap = true;
      } else if (newScore >= 60) {
        status = "practicing";
        masteryLevel = "medium";
      } else {
        status = "partially_known";
        masteryLevel = "weak";
      }

      subjectMap[key] = {
        ...current,
        score: newScore,
        status,
        masteryLevel,
        isPrerequisiteGap: isGap,
        confidence: newScore >= 70 ? "High" : newScore >= 40 ? "Medium" : "Low",
        questionsAnswered: newAnswered,
        questionsCorrect: newCorrect,
      };

      const nextStore = { ...prev, [activeSubject]: subjectMap };
      try {
        localStorage.setItem("skillsync_knowledge_store", JSON.stringify(nextStore));
      } catch {}
      return nextStore;
    });

    // Advance adaptive loop stage
    setAdaptiveState((prev) => ({
      status: "active",
      currentStage: "Re-evaluate",
      stageIndex: 6,
      detectedGaps: prev.detectedGaps,
      lastRecalibrated: "Just now",
      recentAction: `Performance evidence recorded on ${topicName} (${deltaScore >= 0 ? "+" : ""}${deltaScore}%). Skill Graph recalibrated.`,
    }));
  }, [activeSubject, activeSubjectConfig]);

  // Record practice result
  const recordPracticeResult = useCallback(async (topicName: string, isCorrect: boolean) => {
    const delta = isCorrect ? 8 : -5;
    updateTopicMastery(topicName, delta, isCorrect);
  }, [updateTopicMastery]);

  // Toggle completion of plan item
  const togglePlanItem = useCallback((order: number) => {
    setPlanStore((prev) => {
      const plan = { ...(prev[activeSubject] || SUBJECT_DEFAULT_PLANS[activeSubject]) };
      plan.items = plan.items.map((item) => {
        if (item.order === order) {
          return { ...item, isCompleted: !item.isCompleted };
        }
        return item;
      });
      const nextStore = { ...prev, [activeSubject]: plan };
      try {
        localStorage.setItem("skillsync_plan_store", JSON.stringify(nextStore));
      } catch {}
      return nextStore;
    });

    setAdaptiveState((prev) => ({
      status: "active",
      currentStage: "Adapt Plan",
      stageIndex: 4,
      detectedGaps: prev.detectedGaps,
      lastRecalibrated: "Just now",
      recentAction: `Study milestone updated for step #${order}.`,
    }));
  }, [activeSubject]);

  // Trigger explicit adaptive recalibration (e.g. from UI button or quiz)
  const triggerAdaptiveRecalibration = useCallback((reason = "Manual Diagnostic Recalibration") => {
    setAdaptiveState({
      status: "recalibrating",
      currentStage: "Update Model",
      stageIndex: 3,
      detectedGaps: activeSubjectConfig.defaultWeaknesses,
      lastRecalibrated: "Just now",
      recentAction: `${reason}: Evaluated Bayesian mastery across all ${activeSubjectConfig.topics.length} topics.`,
    });

    setTimeout(() => {
      setAdaptiveState((prev) => ({
        ...prev,
        status: "active",
        currentStage: "Adapt Plan",
        stageIndex: 4,
        lastRecalibrated: "Just now",
      }));
    }, 1200);
  }, [activeSubjectConfig]);

  // Calculated Overall Progress Metrics for Active Subject
  const progressData = useMemo(() => {
    const topicList = Object.values(currentKnowledge);
    const totalScore = topicList.reduce((acc, t) => acc + t.score, 0);
    const overallMastery = topicList.length > 0 ? Math.round(totalScore / topicList.length) : activeSubjectConfig.defaultOverallMastery;

    const topicScores = topicList.map((t) => {
      const before = Math.max(10, t.score - 12);
      return {
        topicName: t.topicName,
        score: t.score,
        status: t.status === "mastered" ? "Mastered" : t.isPrerequisiteGap ? "Prerequisite Gap" : t.score >= 50 ? "Improving" : "Needs Attention",
        change: t.score - before,
      };
    });

    return {
      overallMastery,
      topicScores,
      streakDays: 8,
      studyMinutes: 65,
      weeklyGoal: { current: 4, target: 5 },
      reteachRate: "28%",
    };
  }, [currentKnowledge, activeSubjectConfig]);

  // Context for AI Coach
  const aiTutorContext: AITutorContext = useMemo(() => {
    const topicList = Object.values(currentKnowledge);
    const knownConcepts = topicList.filter((t) => t.score >= 70).map((t) => t.topicName);
    const partialKnowledge = topicList.filter((t) => t.score >= 40 && t.score < 70).map((t) => t.topicName);
    const weakConcepts = topicList.filter((t) => t.score < 40).map((t) => t.topicName);
    const prerequisiteGaps = topicList.filter((t) => t.isPrerequisiteGap).map((t) => t.topicName);

    // Subject-specific prompt chips
    const prompts = activeSubject === "Python"
      ? [
          "Explain why mutable default arguments in Python functions cause state leaks",
          "How does Python's LEGB scope rule resolve variable lookups in nested functions?",
          "Show me how to use lambda with sorted() for multi-attribute sorting",
          "Give me an active Socratic challenge on Python function return values",
        ]
      : activeSubject === "DSA"
      ? [
          "Explain the difference between a Binary Tree and the BST invariant",
          "Why does an in-order traversal of a BST always yield elements in sorted order?",
          "How do I formulate the optimal substructure recurrence for 0/1 Knapsack in DP?",
          "Give me an active Socratic challenge on two-child node deletion in a BST",
        ]
      : [
          `Help me clear my prerequisite gap in ${activeSubjectConfig.defaultWeaknesses[0] || activeSubjectConfig.label}`,
          `How does ${activeSubjectConfig.topics[0]?.name} connect to ${activeSubjectConfig.topics[1]?.name}?`,
          "Give me a step-by-step Socratic walkthrough of a core concept",
          "Quiz me on common exam traps and pitfalls for this track",
        ];

    return {
      activeSubject: activeSubjectConfig.label,
      currentTopic: activeSubjectConfig.defaultCurrentTopic || activeSubjectConfig.topics[1]?.name || activeSubjectConfig.label,
      knownConcepts,
      partialKnowledge,
      weakConcepts,
      prerequisiteGaps,
      recentMistakes: [
        activeSubject === "Python"
          ? "Default argument persistence (def add(x, lst=[]))"
          : "Local BST invariant assumption instead of global ancestor bounds",
      ],
      suggestedPrompts: prompts,
    };
  }, [activeSubject, activeSubjectConfig, currentKnowledge]);

  const value: SubjectContextValue = {
    activeSubject,
    activeSubjectConfig,
    setActiveSubject,
    subjectId: activeSubjectConfig.code.toLowerCase(),
    subjectName: activeSubjectConfig.label,
    subjectDescription: activeSubjectConfig.description,
    subjectLevel: activeSubjectConfig.level || "Beginner → Intermediate",
    userGoal: activeSubjectConfig.defaultGoal,
    completedTopics: Object.values(currentKnowledge).filter((t) => t.score >= 70).map((t) => t.topicName),
    currentTopic: activeSubjectConfig.defaultCurrentTopic || activeSubjectConfig.topics[1]?.name || activeSubjectConfig.label,
    knowledgeState: currentKnowledge,
    skillGraph,
    learningPlan: currentPlan,
    progressData,
    aiTutorContext,
    adaptiveLoop: adaptiveState,
    updateTopicMastery,
    recordPracticeResult,
    togglePlanItem,
    triggerAdaptiveRecalibration,
    allSubjects: ALL_SUBJECTS,
    isHydrated,
  };

  return <SubjectContext.Provider value={value}>{children}</SubjectContext.Provider>;
}

export function useSubjectContext(): SubjectContextValue {
  const context = useContext(SubjectContext);
  if (!context) {
    throw new Error("useSubjectContext must be used within a <SubjectProvider />");
  }
  return context;
}
