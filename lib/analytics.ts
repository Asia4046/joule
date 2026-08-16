import type { Chapter, ChapterState, MockTest, QuestionLog, StudySession } from "@prisma/client";

// ---------- time helpers ----------

export const dayKey = (d: Date | string) => {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
};

export const minutesOn = (sessions: StudySession[], date: Date) =>
  sessions
    .filter((s) => dayKey(s.startedAt) === dayKey(date))
    .reduce((sum, s) => sum + s.durationMinutes, 0);

export const questionsOn = (logs: QuestionLog[], date: Date) =>
  logs.filter((q) => dayKey(q.date) === dayKey(date)).reduce((sum, q) => sum + q.total, 0);

/** Consecutive days ending today (or yesterday, so today doesn't break the streak) with study activity. */
export function currentStreak(sessions: StudySession[]): number {
  const days = new Set(sessions.map((s) => dayKey(s.startedAt)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export function longestStreak(sessions: StudySession[]): number {
  const days = [...new Set(sessions.map((s) => dayKey(s.startedAt)))].sort();
  let best = 0, run = 0, prev: Date | null = null;
  for (const d of days) {
    const cur = new Date(d + "T00:00:00");
    if (prev && (cur.getTime() - prev.getTime()) === 86400000) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = cur;
  }
  return best;
}

/** Heatmap buckets for the last `days` days: [{date, minutes}] including zero days. */
export function heatmapData(sessions: StudySession[], days = 182) {
  const byDay = new Map<string, number>();
  for (const s of sessions) byDay.set(dayKey(s.startedAt), (byDay.get(dayKey(s.startedAt)) ?? 0) + s.durationMinutes);
  const out: { date: string; minutes: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: dayKey(d), minutes: byDay.get(dayKey(d)) ?? 0 });
  }
  return out;
}

// ---------- syllabus progress ----------

const STATUS_WEIGHT: Record<string, number> = {
  not_started: 0, learning: 0.4, completed: 1, revision_due: 0.9, mastered: 1,
};

export type ChapterStateWithChapter = ChapterState & { chapter: Chapter };

export function chapterCompletion(state?: ChapterStateWithChapter | null, topicDone = 0, topicTotal = 0): number {
  if (!state || state.status === "not_started") return 0;
  if (state.status === "mastered") return 100;
  if (topicTotal > 0) return Math.round((topicDone / topicTotal) * 100);
  return Math.round(STATUS_WEIGHT[state.status] * 100);
}

export function subjectProgress(states: ChapterStateWithChapter[], chaptersInSubject: number) {
  const total = states.reduce(
    (sum, s) => sum + (STATUS_WEIGHT[s.status] ?? 0),
    0
  );
  return chaptersInSubject === 0 ? 0 : Math.round((total / chaptersInSubject) * 100);
}

// ---------- accuracy ----------

export function accuracy(correct: number, attempted: number): number | null {
  if (attempted <= 0) return null;
  return Math.round((correct / attempted) * 1000) / 10;
}

export function overallAccuracy(logs: QuestionLog[]): number | null {
  const correct = logs.reduce((s, l) => s + l.correct, 0);
  const attempted = logs.reduce((s, l) => s + l.correct + l.incorrect, 0);
  return accuracy(correct, attempted);
}

export function subjectAccuracy(logs: QuestionLog[], subject: string): number | null {
  return overallAccuracy(logs.filter((l) => l.subject === subject));
}

// ---------- mock tests ----------

export function testAccuracy(t: MockTest): number | null {
  return accuracy(t.correct, t.attempted);
}

export function avgScore(tests: MockTest[]): number | null {
  if (!tests.length) return null;
  // normalize to percentage of total marks so mixed-format tests average sensibly
  const pct = tests.reduce((s, t) => s + (t.marksObtained / t.totalMarks) * 100, 0) / tests.length;
  return Math.round(pct * 10) / 10;
}

export function bestPercentile(tests: MockTest[]): number | null {
  const ps = tests.map((t) => t.percentile).filter((p): p is number => p != null);
  if (!ps.length) return null;
  return Math.max(...ps);
}

export function scoreTrend(tests: MockTest[]) {
  return [...tests]
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((t) => ({
      name: t.name,
      date: t.date,
      scorePct: Math.round((t.marksObtained / t.totalMarks) * 1000) / 10,
      percentile: t.percentile,
      accuracy: testAccuracy(t),
      physics: t.physicsMarks != null ? Math.round((t.physicsMarks / (t.totalMarks / 3)) * 1000) / 10 : null,
      chemistry: t.chemistryMarks != null ? Math.round((t.chemistryMarks / (t.totalMarks / 3)) * 1000) / 10 : null,
      maths: t.mathsMarks != null ? Math.round((t.mathsMarks / (t.totalMarks / 3)) * 1000) / 10 : null,
    }));
}

/** Least-squares slope of score% over test index — positive means improving. */
export function trendDirection(values: number[]): "up" | "down" | "flat" {
  if (values.length < 2) return "flat";
  const n = values.length;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0, den = 0;
  values.forEach((y, x) => {
    num += (x - meanX) * (y - meanY);
    den += (x - meanX) ** 2;
  });
  const slope = den === 0 ? 0 : num / den;
  if (slope > 0.5) return "up";
  if (slope < -0.5) return "down";
  return "flat";
}

export function avgTimePerQuestion(t: MockTest): number | null {
  if (t.attempted <= 0) return null;
  return Math.round((t.timeMinutes / t.attempted) * 10) / 10;
}

// ---------- weak areas & priority engine ----------

export type PriorityInput = ChapterStateWithChapter & {
  topicDone: number;
  topicTotal: number;
};

export type PriorityResult = {
  chapterId: string;
  name: string;
  subject: string;
  priority: "high" | "medium" | "low";
  score: number;
  accuracy: number | null;
  daysSinceStudied: number | null;
  weightage: number;
  reason: string;
};

/**
 * Priority score (0–100): high weightage × weak performance × stale revision.
 * Only chapters the student has engaged with (or high-weightage untouched ones) surface at the top.
 */
export function computePriorities(
  items: PriorityInput[],
  targetExam: string
): PriorityResult[] {
  return items
    .map((c) => {
      const weightage =
        targetExam === "main" ? c.chapter.weightageMain
        : targetExam === "advanced" ? c.chapter.weightageAdv
        : (c.chapter.weightageMain + c.chapter.weightageAdv) / 2;
      const acc = accuracy(c.questionsCorrect, c.questionsSolved);
      const days = c.lastStudiedAt
        ? Math.floor((Date.now() - c.lastStudiedAt.getTime()) / 86400000)
        : null;

      const weightageScore = Math.min(weightage / 7, 1) * 35;
      const weaknessScore = acc == null ? 0.7 : 1 - Math.min(acc / 100, 1); // unknown accuracy treated as moderately weak
      const staleness = days == null ? 30 : Math.min(days, 60);
      const staleScore = (staleness / 60) * 25;
      const notStartedBonus = c.status === "not_started" ? 8 : 0;

      const score = Math.round(
        weightageScore * (0.35 + 0.65 * weaknessScore) + staleScore + notStartedBonus
      );

      const priority: "high" | "medium" | "low" =
        score >= 55 ? "high" : score >= 32 ? "medium" : "low";

      const parts: string[] = [`Weightage ${weightage.toFixed(0)}%`];
      if (acc != null) parts.push(`Accuracy ${acc}%`);
      if (days != null) parts.push(`Last studied ${days === 0 ? "today" : `${days}d ago`}`);
      if (c.status === "not_started") parts.push("Not started");

      return {
        chapterId: c.chapterId,
        name: c.chapter.name,
        subject: c.chapter.subject,
        priority,
        score,
        accuracy: acc,
        daysSinceStudied: days,
        weightage,
        reason: parts.join(" · "),
      };
    })
    .sort((a, b) => b.score - a.score);
}

export function weakAreas(
  logs: QuestionLog[],
  states: ChapterStateWithChapter[],
  limit = 5
) {
  const byChapter = new Map<string, { correct: number; total: number; name: string; subject: string }>();
  for (const l of logs) {
    if (!l.chapterId) continue;
    const cur = byChapter.get(l.chapterId) ?? {
      correct: 0, total: 0,
      name: states.find((s) => s.chapterId === l.chapterId)?.chapter.name ?? "Chapter",
      subject: l.subject,
    };
    cur.correct += l.correct;
    cur.total += l.correct + l.incorrect;
    byChapter.set(l.chapterId, cur);
  }
  for (const s of states) {
    if (!byChapter.has(s.chapterId) && s.questionsSolved > 0) {
      byChapter.set(s.chapterId, { correct: s.questionsCorrect, total: s.questionsSolved, name: s.chapter.name, subject: s.chapter.subject });
    }
  }
  return [...byChapter.entries()]
    .map(([id, v]) => ({ chapterId: id, name: v.name, subject: v.subject, accuracy: accuracy(v.correct, v.total) }))
    .filter((v) => v.accuracy != null && v.accuracy < 65)
    .sort((a, b) => (a.accuracy ?? 100) - (b.accuracy ?? 100))
    .slice(0, limit);
}

// ---------- study analytics ----------

export function studyMinutesInRange(sessions: StudySession[], days: number) {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return sessions.filter((s) => s.startedAt >= cutoff).reduce((s, x) => s + x.durationMinutes, 0);
}

export function dailyMinutesSeries(sessions: StudySession[], days = 30) {
  const out: { date: string; minutes: number; label: string }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({
      date: dayKey(d),
      minutes: minutesOn(sessions, d),
      label: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
    });
  }
  return out;
}

export function subjectMinutes(sessions: StudySession[]) {
  const map: Record<string, number> = {};
  for (const s of sessions) map[s.subject] = (map[s.subject] ?? 0) + s.durationMinutes;
  return map;
}

export function consistencyScore(sessions: StudySession[], days = 30): number {
  const active = new Set(
    sessions.filter((s) => s.startedAt >= new Date(Date.now() - days * 86400000)).map((s) => dayKey(s.startedAt))
  );
  return Math.round((active.size / days) * 100);
}

// ---------- insights ----------

export type Insight = { kind: "positive" | "warning" | "info"; text: string };

export function generateInsights(data: {
  logs: QuestionLog[];
  tests: MockTest[];
  sessions: StudySession[];
  states: ChapterStateWithChapter[];
}): Insight[] {
  const { logs, tests, sessions, states } = data;
  const out: Insight[] = [];
  const now = Date.now();
  const inLast = (d: Date, days: number) => now - d.getTime() <= days * 86400000;

  // subject accuracy trend over 30 days
  for (const subject of ["Physics", "Chemistry", "Mathematics"]) {
    const recent = logs.filter((l) => l.subject === subject && inLast(l.date, 30));
    const older = logs.filter((l) => l.subject === subject && !inLast(l.date, 30) && inLast(l.date, 90));
    const a1 = overallAccuracy(recent);
    const a2 = overallAccuracy(older);
    if (a1 != null && a2 != null) {
      const delta = Math.round((a1 - a2) * 10) / 10;
      if (delta >= 5) out.push({ kind: "positive", text: `Your ${subject} accuracy has improved by ${delta}% over the last 30 days.` });
      else if (delta <= -5) out.push({ kind: "warning", text: `Your ${subject} accuracy has dropped by ${Math.abs(delta)}% over the last 30 days.` });
    }
  }

  // weakest subject by mock performance
  const subjMarks: Record<string, { got: number; max: number }> = {};
  for (const t of tests) {
    const third = t.totalMarks / 3;
    const add = (k: string, v: number | null | undefined) => {
      if (v == null) return;
      subjMarks[k] = subjMarks[k] ?? { got: 0, max: 0 };
      subjMarks[k].got += v;
      subjMarks[k].max += third;
    };
    add("Physics", t.physicsMarks); add("Chemistry", t.chemistryMarks); add("Mathematics", t.mathsMarks);
  }
  const subjPct = Object.entries(subjMarks)
    .map(([k, v]) => ({ subject: k, pct: v.max ? (v.got / v.max) * 100 : 0 }))
    .sort((a, b) => a.pct - b.pct);
  if (subjPct.length === 3 && subjPct[0].pct + 5 < subjPct[2].pct) {
    out.push({ kind: "warning", text: `${subjPct[0].subject} is currently your weakest subject based on mock-test performance.` });
  }

  // stale revisions
  const stale = states.filter(
    (s) => s.status !== "not_started" && s.lastStudiedAt && !inLast(s.lastStudiedAt, 14)
  ).length;
  if (stale > 0) out.push({ kind: "info", text: `${stale} chapter${stale > 1 ? "s have" : " has"} not been studied in over 14 days.` });

  // volume vs time
  const recentSessions = sessions.filter((s) => inLast(s.startedAt, 30));
  const hours = recentSessions.reduce((s, x) => s + x.durationMinutes, 0) / 60;
  const recentLogs = logs.filter((l) => inLast(l.date, 30));
  const questions = recentLogs.reduce((s, l) => s + l.total, 0);
  if (hours > 60 && questions < hours * 10) {
    out.push({ kind: "info", text: `Your study time is high (${Math.round(hours)}h this month) but question-solving volume is comparatively low (${questions} questions).` });
  }

  // mock trend
  const sorted = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());
  if (sorted.length >= 3) {
    const trend = trendDirection(sorted.map((t) => (t.marksObtained / t.totalMarks) * 100));
    if (trend === "up") out.push({ kind: "positive", text: "Your mock-test scores show a clear improving trend." });
    if (trend === "down") out.push({ kind: "warning", text: "Your mock-test scores have been declining — consider analysing your recent attempts." });
  }

  // consistency
  const consistency = consistencyScore(sessions, 30);
  if (consistency >= 80) out.push({ kind: "positive", text: `You studied on ${consistency}% of days this month — excellent consistency.` });
  else if (consistency < 50) out.push({ kind: "warning", text: `You studied on only ${consistency}% of days this month. Consistency beats intensity.` });

  return out.slice(0, 8);
}
