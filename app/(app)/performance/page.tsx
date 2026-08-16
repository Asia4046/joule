import Box from "@mui/material/Box";
import Link from "next/link";
import Button from "@mui/material/Button";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  dailyMinutesSeries,
  subjectMinutes,
  consistencyScore,
  heatmapData,
  currentStreak,
  longestStreak,
  overallAccuracy,
  scoreTrend,
} from "@/lib/analytics";
import { PageHeader, StatCard, StudyHeatmap, LinkButton } from "@/components/ui";
import PerformanceView from "@/components/performance/PerformanceView";

export const dynamic = "force-dynamic";

export default async function PerformancePage(props: { searchParams: Promise<{ range?: string }> }) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const range = sp.range === "all" ? 36500 : ["7", "30", "90"].includes(sp.range ?? "") ? Number(sp.range) : 30;

  const [sessions, logs, tests, states] = await Promise.all([
    prisma.studySession.findMany({ where: { userId: user.id }, orderBy: { startedAt: "desc" } }),
    prisma.questionLog.findMany({ where: { userId: user.id } }),
    prisma.mockTest.findMany({ where: { userId: user.id }, orderBy: { date: "asc" } }),
    prisma.chapterState.findMany({ where: { userId: user.id } }),
  ]);

  const cutoff = new Date(Date.now() - range * 86400000);
  const rangeSessions = sessions.filter((s) => s.startedAt >= cutoff);
  const rangeLogs = logs.filter((l) => l.date >= cutoff);

  const totalMinutes = rangeSessions.reduce((s, x) => s + x.durationMinutes, 0);
  const questions = rangeLogs.reduce((s, l) => s + l.total, 0);
  const acc = overallAccuracy(rangeLogs);
  const completed = states.filter((s) => s.status === "completed" || s.status === "mastered").length;

  const chartSessions = dailyMinutesSeries(sessions, Math.min(range, 90)).map((d) => ({
    label: d.label,
    hours: Math.round((d.minutes / 60) * 10) / 10,
  }));
  const trend = scoreTrend(tests).map((t) => ({
    name: t.name,
    scorePct: t.scorePct,
    percentile: t.percentile,
  }));

  return (
    <Box>
      <PageHeader
        title="Performance"
        subtitle={`Last ${range === 36500 ? "all time" : `${range} days`}`}
        action={
          <Box sx={{ display: "flex", gap: 0.5 }}>
            {[7, 30, 90, "all"].map((r) => {
              const value = r === "all" ? "all" : String(r);
              const active = (sp.range ?? "30") === value || (r === 30 && !sp.range);
              return (
                <LinkButton
                  key={value}
                  href={`/performance?range=${value}`}
                  size="small"
                  variant={active ? "contained" : "text"}
                >
                  {r === "all" ? "All" : `${r}d`}
                </LinkButton>
              );
            })}
          </Box>
        }
      />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <StatCard label="Study time" value={`${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`} color="#6366f1" />
        <StatCard label="Questions solved" value={questions} sub={acc != null ? `${acc}% accuracy` : undefined} color="#10b981" />
        <StatCard label="Consistency" value={`${consistencyScore(sessions, Math.min(range, 36500))}%`} sub="days studied in range" color="#f59e0b" />
        <StatCard label="Streak" value={`${currentStreak(sessions)}d`} sub={`longest ${longestStreak(sessions)}d`} color="#ef4444" />
      </Box>

      <PerformanceView
        dailyMinutes={chartSessions}
        subjectDist={subjectMinutes(rangeSessions)}
        scoreTrendData={trend}
        completedChapters={completed}
      />

      <Box sx={{ mt: 2 }}>
        <StudyHeatmap data={heatmapData(sessions, 182)} />
      </Box>
    </Box>
  );
}
