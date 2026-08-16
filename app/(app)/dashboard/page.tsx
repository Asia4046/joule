import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ScheduleOutlinedIcon from "@mui/icons-material/ScheduleOutlined";
import WhatshotOutlinedIcon from "@mui/icons-material/WhatshotOutlined";
import QuizOutlinedIcon from "@mui/icons-material/QuizOutlined";
import LeaderboardOutlinedIcon from "@mui/icons-material/LeaderboardOutlined";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  accuracy,
  avgScore,
  bestPercentile,
  currentStreak,
  heatmapData,
  minutesOn,
  overallAccuracy,
  questionsOn,
  subjectProgress,
  weakAreas,
  computePriorities,
} from "@/lib/analytics";
import { SUBJECTS, SUBJECT_COLORS, CHAPTER_STATUSES } from "@/lib/constants";
import { StatCard, StudyHeatmap, EmptyState, LinkButton } from "@/components/ui";
import DashboardCharts from "@/components/dashboard/DashboardCharts";

export const dynamic = "force-dynamic";

const fmtHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

export default async function DashboardPage() {
  const user = await requireUser();

  const [profile, sessions, logs, tests, states, chapterCounts, goals, revisionsDue] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.studySession.findMany({
      where: { userId: user.id, startedAt: { gte: new Date(Date.now() - 200 * 86400000) } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.questionLog.findMany({ where: { userId: user.id } }),
    prisma.mockTest.findMany({ where: { userId: user.id }, orderBy: { date: "desc" }, take: 20 }),
    prisma.chapterState.findMany({ where: { userId: user.id }, include: { chapter: true, topics: true } }),
    prisma.chapter.groupBy({ by: ["subject"], _count: true }),
    prisma.goal.findMany({ where: { userId: user.id, kind: "daily" } }),
    prisma.revision.findMany({
      where: { userId: user.id, dueAt: { lte: new Date() }, completedAt: null },
      include: { topic: { include: { chapter: true } } },
      take: 6,
    }),
  ]);

  const today = new Date();
  const todayMinutes = minutesOn(sessions, today);
  const target = profile?.dailyStudyTargetMinutes ?? 360;
  const streak = currentStreak(sessions);
  const totalQuestions = logs.reduce((s, l) => s + l.total, 0);
  const acc = overallAccuracy(logs.filter((l) => l.date >= new Date(Date.now() - 30 * 86400000)));
  const avg = avgScore(tests);
  const bestPct = bestPercentile(tests);

  const chaptersBySubject = Object.fromEntries(chapterCounts.map((c) => [c.subject, c._count]));
  const progressBySubject = SUBJECTS.map((s) => ({
    subject: s,
    pct: subjectProgress(states.filter((st) => st.chapter.subject === s), chaptersBySubject[s] ?? 0),
  }));

  const weak = weakAreas(logs, states);
  const priorities = computePriorities(
    states.map((s) => ({ ...s, topicDone: s.topics.filter((t) => t.done).length, topicTotal: 0 })),
    profile?.targetExam ?? "both"
  ).slice(0, 6);

  const heat = heatmapData(sessions);
  const recentTests = tests.slice(0, 5);

  return (
    <Box>
      {/* gradient hero */}
      <Card
        sx={{
          mb: 2.5,
          position: "relative",
          overflow: "hidden",
          border: "none",
          borderRadius: 4,
          background: "linear-gradient(120deg, #4338ca 0%, #6d28d9 55%, #7c3aed 100%)",
          color: "#fff",
          boxShadow: "0 14px 36px rgba(79,70,229,.32)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: -70,
            right: -40,
            width: 260,
            height: 260,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(255,255,255,0.16), transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            bottom: -90,
            left: "32%",
            width: 220,
            height: 220,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(45,212,191,0.14), transparent 65%)",
            pointerEvents: "none",
          }}
        />
        <CardContent sx={{ p: { xs: 2.5, sm: 3 }, position: "relative" }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
            spacing={2}
          >
            <Box>
              <Typography
                variant="caption"
                sx={{ letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.75, fontWeight: 700, fontSize: "0.66rem" }}
              >
                {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </Typography>
              <Typography variant="h4" component="h1" sx={{ color: "#fff", mt: 0.5, fontWeight: 800 }}>
                Welcome back, {user.name.split(" ")[0]}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.82, mt: 0.5, maxWidth: 520 }}>
                {streak > 0 ? `${streak}-day streak` : "Start a new streak today"}
                {todayMinutes > 0 && ` · ${Math.min(100, Math.round((todayMinutes / target) * 100))}% of today's target done`} — keep the momentum going.
              </Typography>
            </Box>
            <LinkButton
              href="/sessions?timer=1"
              variant="contained"
              startIcon={<ArrowForward />}
              sx={{
                bgcolor: "rgba(255,255,255,0.16)",
                color: "#fff",
                border: "1px solid rgba(255,255,255,0.3)",
                backdropFilter: "blur(6px)",
                boxShadow: "none",
                px: 2.5,
                py: 1,
                "&:hover": { bgcolor: "rgba(255,255,255,0.26)", boxShadow: "none" },
              }}
            >
              Start focus session
            </LinkButton>
          </Stack>
        </CardContent>
      </Card>

      {/* overview stats */}
      <Stack direction={{ xs: "column", sm: "row", md: "row" }} spacing={2} sx={{ mb: 2 }} useFlexGap flexWrap="wrap">
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard
            label="Today's study"
            value={fmtHours(todayMinutes)}
            sub={`Target ${fmtHours(target)} · ${Math.min(100, Math.round((todayMinutes / target) * 100))}% done`}
            color={SUBJECT_COLORS.Physics}
            icon={<ScheduleOutlinedIcon fontSize="small" />}
          />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Current streak" value={`${streak} day${streak === 1 ? "" : "s"}`} sub="Keep it alive today" color="#f59e0b" icon={<WhatshotOutlinedIcon fontSize="small" />} />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Questions solved" value={totalQuestions.toLocaleString("en-IN")} sub={acc != null ? `${acc}% accuracy (30d)` : "No accuracy data yet"} color={SUBJECT_COLORS.Chemistry} icon={<QuizOutlinedIcon fontSize="small" />} />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard
            label="Mock average"
            value={avg != null ? `${avg}%` : "—"}
            sub={bestPct != null ? `Best percentile ${bestPct.toFixed(2)}` : "No tests yet"}
            color={SUBJECT_COLORS.Mathematics}
            icon={<LeaderboardOutlinedIcon fontSize="small" />}
          />
        </Box>
      </Stack>

      {/* progress + today's plan */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ flex: { md: 1.2 } }}>
          <CardContent>
            <Typography variant="h6">Preparation progress</Typography>
            <Stack spacing={2} sx={{ mt: 2 }}>
              {progressBySubject.map(({ subject, pct }) => (
                <Box key={subject}>
                  <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{subject}</Typography>
                    <Typography variant="body2" color="text.secondary">{pct}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={pct}
                    sx={{ height: 8, borderRadius: 4, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { borderRadius: 4, bgcolor: SUBJECT_COLORS[subject] } }}
                  />
                </Box>
              ))}
            </Stack>
            <Divider sx={{ my: 2 }} />
            <Typography variant="caption" color="text.secondary">
              Based on {states.length} chapters in progress out of{" "}
              {Object.values(chaptersBySubject).reduce((a, b) => a + b, 0)} total.
            </Typography>
          </CardContent>
        </Card>

        <Card sx={{ flex: { md: 1 } }}>
          <CardContent>
            <Typography variant="h6">Today&apos;s plan</Typography>
            {goals.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                No daily goals set.{" "}
                <Link href="/goals">Create goals</Link> to structure your day.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {goals.map((g) => {
                  const done = g.current >= g.target;
                  return (
                    <Box key={g.id}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" sx={{ fontWeight: done ? 500 : 600, textDecoration: done ? "line-through" : "none", opacity: done ? 0.6 : 1 }}>
                          {g.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {g.metric === "hours" ? `${g.current}/${g.target}h` : `${Math.round(g.current)}/${g.target}`}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(100, (g.current / g.target) * 100)}
                        color={done ? "success" : "primary"}
                        sx={{ height: 6, borderRadius: 3, mt: 0.5 }}
                      />
                    </Box>
                  );
                })}
                {goals.some((g) => g.metric === "questions") && (
                  <Typography variant="caption" color="text.secondary">
                    Questions today: {questionsOn(logs, today)}
                  </Typography>
                )}
              </Stack>
            )}
            {revisionsDue.length > 0 && (
              <>
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle2" color="error" sx={{ mb: 0.75 }}>
                  Revision due today ({revisionsDue.length})
                </Typography>
                <Stack spacing={0.5}>
                  {revisionsDue.map((r) => (
                    <Typography key={r.id} variant="body2" color="text.secondary">
                      • {r.topic.chapter.name} — {r.topic.name}
                    </Typography>
                  ))}
                </Stack>
              </>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* charts row */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Study activity</Typography>
            <Chip size="small" label="Last 30 days" variant="outlined" />
          </Stack>
          <DashboardCharts sessions={sessions.map((s) => ({ startedAt: s.startedAt.toISOString(), durationMinutes: s.durationMinutes, subject: s.subject }))} />
        </CardContent>
      </Card>

      {/* weak areas + priorities */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">Weak areas</Typography>
            {weak.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Not enough data yet — log questions to see weak chapters.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {weak.map((w) => (
                  <Stack key={w.chapterId} direction="row" justifyContent="space-between" alignItems="center">
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{w.name}</Typography>
                      <Typography variant="caption" color="text.secondary">{w.subject} · accuracy {w.accuracy}%</Typography>
                    </Box>
                    <Chip
                      label={w.accuracy != null && w.accuracy < 50 ? "Critical" : "Needs work"}
                      size="small"
                      color={w.accuracy != null && w.accuracy < 50 ? "error" : "warning"}
                      variant="outlined"
                    />
                  </Stack>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6">What to study next</Typography>
            {priorities.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Mark chapters in the <Link href="/syllabus">syllabus</Link> to get recommendations.
              </Typography>
            ) : (
              <Stack spacing={1.5} sx={{ mt: 2 }}>
                {priorities.slice(0, 5).map((p) => (
                  <Box key={p.chapterId}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Link href={`/tracker/${p.chapterId}`} style={{ textDecoration: "none" }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>{p.name}</Typography>
                      </Link>
                      <Chip
                        label={p.priority}
                        size="small"
                        variant="outlined"
                        color={p.priority === "high" ? "error" : p.priority === "medium" ? "warning" : "success"}
                      />
                    </Stack>
                    <Typography variant="caption" color="text.secondary">{p.reason}</Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </CardContent>
        </Card>
      </Stack>

      {/* recent tests */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">Recent tests</Typography>
            <LinkButton href="/mock-tests" size="small" endIcon={<ArrowForward />}>All tests</LinkButton>
          </Stack>
          {recentTests.length === 0 ? (
            <EmptyState
              title="Your mock-test history starts here."
              description="Record your first mock test to unlock score progression, subject analytics and trends."
              action={<LinkButton href="/mock-tests" variant="contained">Add your first test</LinkButton>}
            />
          ) : (
            <Box sx={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ textAlign: "left", color: "rgba(128,128,140,1)" }}>
                    <th style={{ padding: "6px 12px 6px 0", fontWeight: 600 }}>Test</th>
                    <th style={{ padding: "6px 12px", fontWeight: 600 }}>Score</th>
                    <th style={{ padding: "6px 12px", fontWeight: 600 }}>Percentile</th>
                    <th style={{ padding: "6px 12px", fontWeight: 600 }}>Accuracy</th>
                    <th style={{ padding: "6px 12px", fontWeight: 600 }}>Attempted</th>
                    <th style={{ padding: "6px 12px", fontWeight: 600 }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTests.map((t) => (
                    <tr key={t.id} style={{ borderTop: "1px solid rgba(128,128,140,0.15)" }}>
                      <td style={{ padding: "8px 12px 8px 0", fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: "8px 12px" }}>{t.marksObtained}/{t.totalMarks}</td>
                      <td style={{ padding: "8px 12px" }}>{t.percentile?.toFixed(2) ?? "—"}</td>
                      <td style={{ padding: "8px 12px" }}>{accuracy(t.correct, t.attempted) ?? "—"}%</td>
                      <td style={{ padding: "8px 12px" }}>{t.attempted}</td>
                      <td style={{ padding: "8px 12px", color: "rgba(128,128,140,1)" }}>{t.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* heatmap */}
      <Card>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h6">Consistency</Typography>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Typography variant="caption" color="text.secondary">Less</Typography>
              {[0.12, 0.35, 0.55, 0.78, 1].map((o) => (
                <Box key={o} sx={{ width: 11, height: 11, borderRadius: "2.5px", bgcolor: `rgba(99,102,241,${o})` }} />
              ))}
              <Typography variant="caption" color="text.secondary">More</Typography>
            </Stack>
          </Stack>
          <StudyHeatmap data={heat} />
        </CardContent>
      </Card>
    </Box>
  );
}
