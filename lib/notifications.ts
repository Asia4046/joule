import "server-only";
import { prisma } from "@/lib/prisma";
import { minutesOn } from "@/lib/analytics";

const DEDUPE_WINDOW_HOURS = 20;

type Pending = { kind: string; message: string };

/**
 * Deterministic notification generation from the user's own data.
 * Called when the notification bell is opened / app loads; duplicates
 * (same kind + message) within the dedupe window are skipped.
 */
export async function generateNotifications(userId: string): Promise<void> {
  const [prefs, profile] = await Promise.all([
    prisma.userPreference.findUnique({ where: { userId } }),
    prisma.profile.findUnique({ where: { userId } }),
  ]);

  const now = new Date();
  const hour = now.getHours();
  const pending: Pending[] = [];

  const [dueRevisions, todaySessions, weekSessions, lastWeekSessions, recentTests, olderTests, staleChapters] =
    await Promise.all([
      prisma.revision.findMany({
        where: { userId, dueAt: { lte: now }, completedAt: null },
        include: { topic: { include: { chapter: true } } },
        take: 10,
      }),
      prisma.studySession.findMany({ where: { userId, startedAt: { gte: startOfDay(now) } } }),
      prisma.studySession.findMany({ where: { userId, startedAt: { gte: daysAgo(7) } } }),
      prisma.studySession.findMany({ where: { userId, startedAt: { gte: daysAgo(14), lt: daysAgo(7) } } }),
      prisma.mockTest.findMany({ where: { userId, date: { gte: daysAgo(7) } } }),
      prisma.mockTest.findMany({ where: { userId, date: { lt: daysAgo(7) } } }),
      prisma.chapterState.count({
        where: {
          userId,
          status: { in: ["completed", "mastered", "revision_due"] },
          lastStudiedAt: { lt: daysAgo(14) },
        },
      }),
    ]);

  // Revision due
  if (prefs?.notifyRevision !== false && dueRevisions.length > 0) {
    const names = [...new Set(dueRevisions.map((r) => r.topic.chapter.name))].slice(0, 3);
    pending.push({
      kind: "revision",
      message:
        dueRevisions.length === 1
          ? `Revision due: ${names[0]} — ${dueRevisions[0].topic.name}`
          : `Revision due: ${names.join(", ")}${dueRevisions.length > 3 ? ` +${dueRevisions.length - 3} more` : ""}`,
    });
  }

  const todayMinutes = todaySessions.reduce((s, x) => s + x.durationMinutes, 0);
  const target = profile?.dailyStudyTargetMinutes ?? 360;

  // Daily target behind (evening check)
  if (prefs?.notifyGoals !== false && hour >= 17 && todayMinutes < target * 0.5) {
    pending.push({
      kind: "goal",
      message: `You're at ${Math.round(todayMinutes / 60 * 10) / 10}h of your ${Math.round(target / 60)}h daily target — ${Math.round((1 - todayMinutes / target) * 100)}% remaining.`,
    });
  }

  // Streak at risk
  if (prefs?.notifyStreak !== false && hour >= 18 && todayMinutes === 0) {
    pending.push({ kind: "streak", message: "No study logged today — your streak is at risk." });
  }

  // Weekly comparison
  if (prefs?.notifyStreak !== false) {
    const weekMin = weekSessions.reduce((s, x) => s + x.durationMinutes, 0);
    const lastMin = lastWeekSessions.reduce((s, x) => s + x.durationMinutes, 0);
    if (lastMin > 0 && weekMin > 0) {
      const delta = Math.round(((weekMin - lastMin) / lastMin) * 100);
      if (Math.abs(delta) >= 12) {
        pending.push({
          kind: "info",
          message:
            delta > 0
              ? `Your rolling 7-day study time is ${delta}% higher than the previous week.`
              : `Your rolling 7-day study time is ${Math.abs(delta)}% lower than the previous week.`,
        });
      }
    }
  }

  // New best percentile
  if (prefs?.notifyMockTests !== false && recentTests.length > 0) {
    const oldBest = Math.max(0, ...olderTests.map((t) => t.percentile ?? 0));
    const newBest = Math.max(...recentTests.map((t) => t.percentile ?? 0));
    if (newBest > oldBest && oldBest > 0) {
      pending.push({ kind: "mock_test", message: `New best percentile: ${newBest.toFixed(2)} (previous best ${oldBest.toFixed(2)}).` });
    }
  }

  // Stale chapters
  if (prefs?.notifyRevision !== false && staleChapters > 0) {
    pending.push({ kind: "revision", message: `${staleChapters} chapters haven't been revised in over 14 days.` });
  }

  if (pending.length === 0) return;

  const since = new Date(Date.now() - DEDUPE_WINDOW_HOURS * 3600000);
  const existing = await prisma.notification.findMany({
    where: { userId, createdAt: { gte: since } },
    select: { kind: true, message: true },
  });
  const seen = new Set(existing.map((e) => `${e.kind}|${e.message}`));
  const fresh = pending.filter((n) => !seen.has(`${n.kind}|${n.message}`));
  if (fresh.length === 0) return;

  await prisma.notification.createMany({ data: fresh.map((n) => ({ ...n, userId })) });
}

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000);
}
