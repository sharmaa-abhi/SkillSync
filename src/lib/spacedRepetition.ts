/**
 * SkillSync AI — Spaced Repetition Engine
 * Powered by the Ebbinghaus Forgetting Curve & SuperMemo-2 (SM-2) algorithms.
 */

export interface SpacedCard {
  id: string;
  topicName: string;
  subjectName: string;
  repetitionNumber: number; // n
  intervalDays: number; // I(n)
  easinessFactor: number; // EF, default 2.5
  stability: number; // S in days
  lastReviewedAt: string;
  nextReviewDate: string;
  retentionRate: number; // R(t) in %
  forgettingRisk: "low" | "medium" | "critical";
  keyConcept: string;
}

/**
 * Calculates current retention percentage according to Ebbinghaus exponential decay:
 * R = e^(-t / S) * 100
 * where t is elapsed days since last review, and S is memory stability.
 */
export function calculateRetention(lastReviewedDate: Date, stabilityDays: number = 3): number {
  const now = new Date();
  const elapsedMs = Math.max(0, now.getTime() - lastReviewedDate.getTime());
  const elapsedDays = elapsedMs / (1000 * 60 * 60 * 24);

  // Decay formula with minimum baseline of 20%
  const S = Math.max(1, stabilityDays);
  const retention = Math.exp(-elapsedDays / S) * 100;
  return Math.min(100, Math.max(15, Math.round(retention)));
}

/**
 * Determines forgetting risk category from retention rate
 */
export function getForgettingRisk(retentionRate: number): "low" | "medium" | "critical" {
  if (retentionRate >= 80) return "low";
  if (retentionRate >= 50) return "medium";
  return "critical";
}

/**
 * SuperMemo SM-2 algorithm: Computes new interval, easiness factor, and next due date.
 * @param quality Score from 0 (blackout) to 5 (flawless recall)
 */
export function calculateNextSM2Interval(
  repetitionNumber: number,
  intervalDays: number,
  easinessFactor: number,
  quality: number
): {
  newRepetitionNumber: number;
  newIntervalDays: number;
  newEasinessFactor: number;
  newStability: number;
  nextReviewDate: Date;
} {
  // Clamp quality between 0 and 5
  const q = Math.max(0, Math.min(5, Math.round(quality)));

  // Calculate new Easiness Factor (EF)
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  let newEF = easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02));
  if (newEF < 1.3) newEF = 1.3;

  let newRep = repetitionNumber;
  let newInterval = 1;

  if (q >= 3) {
    // Correct response: advance repetition schedule
    if (newRep === 0) {
      newInterval = 1;
    } else if (newRep === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(intervalDays * newEF);
    }
    newRep += 1;
  } else {
    // Incorrect response: lapse back to day 1
    newRep = 0;
    newInterval = 1;
  }

  // Memory stability is proportional to the new interval
  const newStability = Math.max(1, Math.round(newInterval * 0.8));

  const nextReviewDate = new Date();
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval);

  return {
    newRepetitionNumber: newRep,
    newIntervalDays: newInterval,
    newEasinessFactor: Number(newEF.toFixed(2)),
    newStability,
    nextReviewDate,
  };
}

/**
 * Builds default active review cards from user topic mastery
 */
export function generateTopicReviewCards(
  topics: Array<{ topicName: string; score: number }>,
  subjectName: string = "Mathematics"
): SpacedCard[] {
  return topics.map((t, idx) => {
    // Stagger simulated last reviewed dates for realistic retention curve display
    const daysAgo = (idx + 1) * 2;
    const lastReviewed = new Date();
    lastReviewed.setDate(lastReviewed.getDate() - daysAgo);

    const stability = t.score >= 70 ? 7 : t.score >= 40 ? 4 : 2;
    const retentionRate = calculateRetention(lastReviewed, stability);
    const risk = getForgettingRisk(retentionRate);

    const nextDue = new Date();
    nextDue.setDate(nextDue.getDate() + (retentionRate < 60 ? 0 : 2));

    const keyConcepts: Record<string, string> = {
      Factorisation: "Middle-term trinomial splitting & Difference of Two Squares identity",
      "Quadratic Equations": "Discriminant Δ = b² - 4ac & Quadratic Formula roots",
      "Algebraic Manipulation": "Distributive law expansion & GCF extraction",
      Polynomials: "Factor Theorem & Remainder Theorem roots",
      "Coordinate Geometry": "Parabola vertex coordinates (h, k) & axis of symmetry",
      "Process Scheduling": "Round Robin time quantum trade-off & CPU utilization",
      Deadlocks: "Four Coffman conditions & Banker's Algorithm safe sequence",
      "Virtual Memory & Paging": "Page fault handling, MMU address translation, and LRU replacement",
      "OSI & TCP/IP Models": "Layer encapsulation and segment/datagram boundaries",
      "TCP Flow & Congestion Control": "Three-way handshake, slow start, and AIMD congestion window",
      "Dynamic Programming": "Optimal substructure, overlapping subproblems, and state transitions",
    };

    return {
      id: `card_${t.topicName.toLowerCase().replace(/\W+/g, "_")}`,
      topicName: t.topicName,
      subjectName,
      repetitionNumber: t.score >= 70 ? 3 : 1,
      intervalDays: stability,
      easinessFactor: t.score >= 70 ? 2.5 : 2.1,
      stability,
      lastReviewedAt: lastReviewed.toISOString(),
      nextReviewDate: nextDue.toISOString(),
      retentionRate,
      forgettingRisk: risk,
      keyConcept: keyConcepts[t.topicName] || `Core foundation & problem patterns for ${t.topicName}`,
    };
  });
}
