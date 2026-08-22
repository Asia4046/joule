import Link from "next/link";
import Box from "@mui/material/Box";
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
import { SUBJECTS, SUBJECT_COLORS } from "@/lib/constants";
import { StatCard, StudyHeatmap, EmptyState, LinkButton, HeatLegend } from "@/components/ui";
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

  const hour = new Date().getHours();
  const greeting = hour < 5 ? "Up late" : hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : hour < 21 ? "Good evening" : "Good night";

  return (
    <Box className="jee-stagger" sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(12, 1fr)" }, gap: 2 }}>
      {/* hero */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 8" }, position: "relative", overflow: "hidden" }}>
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
            <Box sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: "#D77BA6" }} aria-hidden />
            <Typography
              variant="caption"
              sx={{ letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, fontSize: "0.68rem", color: "text.secondary" }}
            >
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </Typography>
          </Stack>
          <Typography variant="h3" component="h1" sx={{ mt: 0.5, fontSize: { xs: "1.7rem", sm: "3rem" } }}>
            {greeting}, {user.name.split(" ")[0]}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.75, maxWidth: 520 }}>
            {streak > 0 ? `${streak}-day streak` : "Start a new streak today"}
            {todayMinutes > 0 && ` · ${Math.min(100, Math.round((todayMinutes / target) * 100))}% of today's target done`} — keep the momentum going.
          </Typography>
          <LinkButton href="/sessions?timer=1" variant="contained" startIcon={<ArrowForward />} sx={{ mt: 2, px: 2.5, py: 1 }}>
            Start focus session
          </LinkButton>
        </CardContent>
      </Card>

      {/* streak — the one candy tile */}
      <Card
        sx={{
          gridColumn: { xs: "1 / -1", md: "span 4" },
          bgcolor: "#F2A9CB",
          border: "1.5px solid #221F1A",
          boxShadow: "5px 5px 0 rgba(0,0,0,0.28)",
          color: "#221F1A",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, sm: 3 } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
            <Typography
              variant="caption"
              sx={{ fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", fontSize: "0.64rem", color: "rgba(34,31,26,0.72)" }}
            >
              Current streak
            </Typography>
            <WhatshotOutlinedIcon sx={{ color: "#221F1A" }} fontSize="small" />
          </Stack>
          <Typography variant="h2" className="jee-display jee-num" sx={{ mt: 1, color: "#221F1A", lineHeight: 1.05, fontWeight: 700 }}>
            {streak}
            <Typography component="span" className="jee-display" sx={{ fontSize: "1.2rem", fontWeight: 700, ml: 1 }}>
              day{streak === 1 ? "" : "s"}
            </Typography>
          </Typography>
          <LinearProgress
            variant="determinate"
            value={Math.min(100, (todayMinutes / target) * 100)}
            sx={{
              mt: 1.5,
              height: 6,
              bgcolor: "rgba(34,31,26,0.18)",
              "& .MuiLinearProgress-bar": { backgroundColor: "#221F1A" },
            }}
          />
          <Typography variant="caption" sx={{ display: "block", mt: 0.75, fontWeight: 600, color: "rgba(34,31,26,0.76)" }}>
            {todayMinutes > 0 ? `${fmtHours(todayMinutes)} of ${fmtHours(target)} today` : `Target ${fmtHours(target)} today`}
          </Typography>
        </CardContent>
      </Card>

      {/* stat tiles */}
      <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
        <StatCard
          label="Today's study"
          value={fmtHours(todayMinutes)}
          sub={`Target ${fmtHours(target)}`}
          icon={<ScheduleOutlinedIcon fontSize="small" />}
        />
      </Box>
      <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
        <StatCard
          label="Questions solved"
          value={totalQuestions.toLocaleString("en-IN")}
          sub={acc != null ? `${acc}% accuracy (30d)` : "No accuracy data yet"}
          icon={<QuizOutlinedIcon fontSize="small" />}
        />
      </Box>
      <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
        <StatCard label="Mock average" value={avg != null ? `${avg}%` : "—"} sub="Across all tests" icon={<LeaderboardOutlinedIcon fontSize="small" />} />
      </Box>
      <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
        <StatCard label="Best percentile" value={bestPct != null ? bestPct.toFixed(2) : "—"} sub={tests.length ? `${tests.length} tests recorded` : "No tests yet"} icon={<LeaderboardOutlinedIcon fontSize="small" />} />
      </Box>

      {/* preparation progress */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 5" } }}>
        <CardContent>
          <Typography variant="h6">Preparation progress</Typography>
          <Stack spacing={2} sx={{ mt: 2 }}>
            {progressBySubject.map(({ subject, pct }) => (
              <Box key={subject}>
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{subject}</Typography>
                  <Typography variant="body2" className="jee-num" color="text.secondary">{pct}%</Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  sx={{ height: 8, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: SUBJECT_COLORS[subject] } }}
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

      {/* today's plan */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
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
                      <Typography variant="caption" className="jee-num" color="text.secondary">
                        {g.metric === "hours" ? `${g.current}/${g.target}h` : `${Math.round(g.current)}/${g.target}`}
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, (g.current / g.target) * 100)}
                      color={done ? "success" : "primary"}
                      sx={{ height: 6, mt: 0.5 }}
                    />
                  </Box>
                );
              })}
              {goals.some((g) => g.metric === "questions") && (
                <Typography variant="caption" color="text.secondary" className="jee-num">
                  Questions today: {questionsOn(logs, today)}
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* revision due */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 3" } }}>
        <CardContent>
          <Typography variant="h6">Revision due</Typography>
          {revisionsDue.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              All clear — nothing due today.
            </Typography>
          ) : (
            <Stack spacing={1} sx={{ mt: 1.5 }}>
              {revisionsDue.slice(0, 4).map((r) => (
                <Box key={r.id} sx={{ borderLeft: "2px solid rgba(255,255,255,0.22)", pl: 1.25 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                    {r.topic.chapter.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {r.topic.name}
                  </Typography>
                </Box>
              ))}
              {revisionsDue.length > 4 && (
                <Typography variant="caption" color="text.secondary" className="jee-num">
                  +{revisionsDue.length - 4} more
                </Typography>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* study activity chart */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 8" } }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h6">Study activity</Typography>
            <Chip size="small" label="Last 30 days" variant="outlined" />
          </Stack>
          <DashboardCharts sessions={sessions.map((s) => ({ startedAt: s.startedAt.toISOString(), durationMinutes: s.durationMinutes, subject: s.subject }))} />
        </CardContent>
      </Card>

      {/* weak areas */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 4" } }}>
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
                    <Typography variant="caption" className="jee-num" color="text.secondary">{w.subject} · accuracy {w.accuracy}%</Typography>
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

      {/* what to study next */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 5" } }}>
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

      {/* recent tests */}
      <Card sx={{ gridColumn: { xs: "1 / -1", md: "span 7" } }}>
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
              <table className="jee-num" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                <thead>
                  <tr style={{ textAlign: "left" }} className="jee-dim">
                    <th style={{ padding: "6px 12px 6px 0", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Test</th>
                    <th style={{ padding: "6px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Score</th>
                    <th style={{ padding: "6px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Percentile</th>
                    <th style={{ padding: "6px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Accuracy</th>
                    <th style={{ padding: "6px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Attempted</th>
                    <th style={{ padding: "6px 12px", fontWeight: 700, textTransform: "uppercase", fontSize: "0.66rem", letterSpacing: "0.07em" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTests.map((t) => (
                    <tr key={t.id} style={{ borderTop: "1px solid rgba(128,128,140,0.25)" }}>
                      <td style={{ padding: "8px 12px 8px 0", fontWeight: 600 }}>{t.name}</td>
                      <td style={{ padding: "8px 12px" }}>{t.marksObtained}/{t.totalMarks}</td>
                      <td style={{ padding: "8px 12px" }}>{t.percentile?.toFixed(2) ?? "—"}</td>
                      <td style={{ padding: "8px 12px" }}>{accuracy(t.correct, t.attempted) ?? "—"}%</td>
                      <td style={{ padding: "8px 12px" }}>{t.attempted}</td>
                      <td style={{ padding: "8px 12px" }} className="jee-dim">{t.date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* heatmap */}
      <Card sx={{ gridColumn: "1 / -1" }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Typography variant="h6">Consistency</Typography>
            <HeatLegend />
          </Stack>
          <StudyHeatmap data={heat} />
        </CardContent>
      </Card>
    </Box>
  );
}
