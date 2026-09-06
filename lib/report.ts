import "server-only";
import { prisma } from "@/lib/prisma";
import {
  avgScore,
  bestPercentile,
  consistencyScore,
  currentStreak,
  daysAgo,
  generateInsights,
  longestStreak,
  overallAccuracy,
  subjectAccuracy,
  subjectMinutes,
  subjectProgress,
  trendDirection,
  weakAreas,
  computePriorities,
} from "@/lib/analytics";
import { SUBJECTS } from "@/lib/constants";

/** How long a generated report stays fresh, in days. */
export const REPORT_TTL_DAYS = 10;

const STATUS_ORDER = ["mastered", "completed", "revision_due", "learning", "not_started"] as const;

export type ReportSnapshot = {
  generatedAt: string;
  candidate: { name: string; email: string };
  target: { exam: string; year: number; prepLevel: string; dailyStudyTargetMinutes: number; dailyQuestionTarget: number };
  summary: {
    totalStudyMinutes: number;
    last30Minutes: number;
    currentStreak: number;
    longestStreak: number;
    consistency: number;
    totalQuestions: number;
    accuracyAll: number | null;
    accuracy30: number | null;
    chaptersTouched: number;
    chaptersCompleted: number;
    chaptersTotal: number;
    subjectProgress: { subject: string; pct: number }[];
  };
  subjects: {
    subject: string;
    progressPct: number;
    accuracy: number | null;
    minutes: number;
    questions: number;
    statusCounts: Record<string, number>;
    weak: { name: string; accuracy: number | null }[];
  }[];
  mocks: {
    count: number;
    avgScore: number | null;
    bestPercentile: number | null;
    trend: "up" | "down" | "flat";
    recent: { name: string; date: string; scorePct: number; percentile: number | null; accuracy: number | null }[];
  };
  priorities: { name: string; subject: string; priority: string; reason: string }[];
  insights: { kind: string; text: string }[];
  revision: { dueCount: number; overdueCount: number; upcoming: { topic: string; chapter: string; dueAt: string }[] };
  mistakes: { total: number; open: number; byType: { type: string; count: number }[] };
};

/** Assemble the full report snapshot from live data. Pure reads — no cache interaction. */
export async function buildReportSnapshot(userId: string): Promise<ReportSnapshot> {
  const [user, profile, sessions, logs, tests, states, chapterCounts, revisions, mistakes] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { name: true, email: true } }),
    prisma.profile.findUnique({ where: { userId } }),
    prisma.studySession.findMany({ where: { userId, startedAt: { gte: daysAgo(365) } } }),
    prisma.questionLog.findMany({ where: { userId } }),
    prisma.mockTest.findMany({ where: { userId }, orderBy: { date: "desc" } }),
    prisma.chapterState.findMany({
      where: { userId },
      include: { chapter: true, topics: true },
    }),
    prisma.chapter.groupBy({ by: ["subject"], _count: true }),
    prisma.revision.findMany({
      where: { userId, completedAt: null, dueAt: { lte: daysAgo(-21) } },
      include: { topic: { include: { chapter: true } } },
      orderBy: { dueAt: "asc" },
      take: 8,
    }),
    prisma.mistake.findMany({ where: { userId }, select: { mistakeType: true, status: true } }),
  ]);

  const chaptersBySubject = Object.fromEntries(chapterCounts.map((c) => [c.subject, c._count]));
  const chaptersTotal = Object.values(chaptersBySubject).reduce((a, b) => a + b, 0);
  const minutesBySubject = subjectMinutes(sessions);
  const now = new Date();
  const nowMs = now.getTime();

  const subjects = SUBJECTS.map((subject) => {
    const st = states.filter((s) => s.chapter.subject === subject);
    const statusCounts: Record<string, number> = {};
    for (const key of STATUS_ORDER) statusCounts[key] = st.filter((s) => s.status === key).length;
    return {
      subject,
      progressPct: subjectProgress(st, chaptersBySubject[subject] ?? 0),
      accuracy: subjectAccuracy(logs, subject),
      minutes: minutesBySubject[subject] ?? 0,
      questions: logs.filter((l) => l.subject === subject).reduce((sum, l) => sum + l.total, 0),
      statusCounts,
      weak: weakAreas(logs, st, 3).map((w) => ({ name: w.name, accuracy: w.accuracy })),
    };
  });

  const sortedTests = [...tests].sort((a, b) => b.date.getTime() - a.date.getTime());
  const chronological = [...tests].sort((a, b) => a.date.getTime() - b.date.getTime());

  return {
    generatedAt: now.toISOString(),
    candidate: { name: user.name, email: user.email },
    target: {
      exam: profile?.targetExam ?? "both",
      year: profile?.targetYear ?? 2027,
      prepLevel: profile?.prepLevel ?? "intermediate",
      dailyStudyTargetMinutes: profile?.dailyStudyTargetMinutes ?? 360,
      dailyQuestionTarget: profile?.dailyQuestionTarget ?? 60,
    },
    summary: {
      totalStudyMinutes: sessions.reduce((sum, s) => sum + s.durationMinutes, 0),
      last30Minutes: sessions.filter((s) => s.startedAt >= daysAgo(30)).reduce((sum, s) => sum + s.durationMinutes, 0),
      currentStreak: currentStreak(sessions),
      longestStreak: longestStreak(sessions),
      consistency: consistencyScore(sessions, 30),
      totalQuestions: logs.reduce((sum, l) => sum + l.total, 0),
      accuracyAll: overallAccuracy(logs),
      accuracy30: overallAccuracy(logs.filter((l) => l.date >= daysAgo(30))),
      chaptersTouched: states.filter((s) => s.status !== "not_started").length,
      chaptersCompleted: states.filter((s) => s.status === "completed" || s.status === "mastered").length,
      chaptersTotal,
      subjectProgress: SUBJECTS.map((s) => ({
        subject: s,
        pct: subjectProgress(states.filter((st) => st.chapter.subject === s), chaptersBySubject[s] ?? 0),
      })),
    },
    subjects,
    mocks: {
      count: tests.length,
      avgScore: avgScore(tests),
      bestPercentile: bestPercentile(tests),
      trend: trendDirection(chronological.map((t) => (t.marksObtained / t.totalMarks) * 100)),
      recent: sortedTests.slice(0, 5).map((t) => ({
        name: t.name,
        date: t.date.toISOString(),
        scorePct: Math.round((t.marksObtained / t.totalMarks) * 1000) / 10,
        percentile: t.percentile,
        accuracy: t.correct + t.attempted > 0 ? Math.round((t.correct / t.attempted) * 1000) / 10 : null,
      })),
    },
    priorities: computePriorities(
      states.map((s) => ({ ...s, topicDone: s.topics.filter((t) => t.done).length, topicTotal: s.topics.length })),
      profile?.targetExam ?? "both"
    )
      .slice(0, 6)
      .map((p) => ({ name: p.name, subject: p.subject, priority: p.priority, reason: p.reason })),
    insights: generateInsights({ logs, tests, sessions, states }).map((i) => ({ kind: i.kind, text: i.text })),
    revision: {
      dueCount: revisions.filter((r) => r.dueAt <= now).length,
      overdueCount: revisions.filter((r) => nowMs - r.dueAt.getTime() > 3 * 86400000).length,
      upcoming: revisions.slice(0, 5).map((r) => ({
        topic: r.topic.name,
        chapter: r.topic.chapter.name,
        dueAt: r.dueAt.toISOString(),
      })),
    },
    mistakes: {
      total: mistakes.length,
      open: mistakes.filter((m) => m.status === "open").length,
      byType: Object.entries(
        mistakes.reduce<Record<string, number>>((acc, m) => {
          acc[m.mistakeType] = (acc[m.mistakeType] ?? 0) + 1;
          return acc;
        }, {})
      )
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count),
    },
  };
}

const DAY_MS = 86400000;

export type ServedReport = {
  data: ReportSnapshot;
  generatedAt: Date;
  cached: boolean;
  /** Milliseconds the cache still has left (0 when stale/absent). */
  freshForMs: number;
};

/**
 * The report a reader gets: a snapshot no older than REPORT_TTL_DAYS.
 * Stale or missing snapshots are rebuilt and written back in the same call.
 */
export async function getReport(userId: string): Promise<ServedReport> {
  const cached = await prisma.reportCache.findUnique({ where: { userId } });
  const age = cached ? Date.now() - cached.generatedAt.getTime() : Infinity;
  if (cached && age <= REPORT_TTL_DAYS * DAY_MS) {
    return {
      data: cached.data as unknown as ReportSnapshot,
      generatedAt: cached.generatedAt,
      cached: true,
      freshForMs: REPORT_TTL_DAYS * DAY_MS - age,
    };
  }
  return regenerateReport(userId);
}

/** Force-rebuild the snapshot and overwrite the cache row. */
export async function regenerateReport(userId: string): Promise<ServedReport> {
  const data = await buildReportSnapshot(userId);
  const generatedAt = new Date(data.generatedAt);
  const row = await prisma.reportCache.upsert({
    where: { userId },
    create: { userId, data, generatedAt },
    update: { data, generatedAt },
  });
  return { data, generatedAt: row.generatedAt, cached: false, freshForMs: REPORT_TTL_DAYS * DAY_MS };
}

/** Display metadata for a cache row — kept out of components so clock reads stay in the lib. */
export function reportCacheMeta(cache: { generatedAt: Date } | null) {
  if (!cache) return null;
  const validUntil = new Date(cache.generatedAt.getTime() + REPORT_TTL_DAYS * DAY_MS);
  return {
    generatedAt: cache.generatedAt.toISOString(),
    validUntil: validUntil.toISOString(),
    expired: validUntil.getTime() < Date.now(),
  };
}
