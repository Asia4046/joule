import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, SUBJECT_COLORS, CHAPTER_STATUSES, labelFor } from "@/lib/constants";
import { accuracy, subjectProgress } from "@/lib/analytics";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  const user = await requireUser();

  const [chapters, states] = await Promise.all([
    prisma.chapter.findMany({ include: { topics: true }, orderBy: [{ subject: "asc" }, { name: "asc" }] }),
    prisma.chapterState.findMany({
      where: { userId: user.id },
      include: { chapter: { include: { topics: { select: { id: true } } } }, topics: true },
    }),
  ]);
  const stateMap = new Map(states.map((s) => [s.chapterId, s]));
  const counts = Object.fromEntries(SUBJECTS.map((s) => [s, chapters.filter((c) => c.subject === s).length]));

  if (states.length === 0) {
    return (
      <Box>
        <PageHeader title="Tracker" subtitle="Chapter-level progress, performance and revision status." />
        <EmptyState
          title="No chapters in progress yet."
          description="Open the syllabus and mark a chapter as Learning or Completed to start tracking."
        />
      </Box>
    );
  }

  return (
    <Box>
      <PageHeader title="Tracker" subtitle="Chapter-level progress, performance and revision status." />

      {SUBJECTS.map((subject) => {
        const subjectStates = states.filter((s) => s.chapter.subject === subject);
        if (subjectStates.length === 0) return null;
        return (
          <Box key={subject} sx={{ mb: 4 }}>
            <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
              <Typography variant="h5">{subject}</Typography>
              <Typography variant="body2" color="text.secondary">
                {subjectProgress(subjectStates, counts[subject])}% of syllabus
              </Typography>
            </Stack>
            <Stack spacing={1.5}>
              {subjectStates
                .sort((a, b) => {
                  const rank: Record<string, number> = { revision_due: 0, learning: 1, completed: 2, mastered: 3 };
                  return (rank[a.status] ?? 4) - (rank[b.status] ?? 4);
                })
                .map((st) => {
                  const chapter = st.chapter;
                  const topicTotal = chapter.topics.length;
                  const done = st.topics.filter((t) => t.done).length;
                  const pct = topicTotal ? Math.round((done / topicTotal) * 100) : st.status === "mastered" ? 100 : st.status === "completed" ? 100 : 0;
                  const acc = accuracy(st.questionsCorrect, st.questionsSolved);
                  const statusDef = CHAPTER_STATUSES.find((s) => s.value === st.status);
                  return (
                    <Card key={st.id}>
                      <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} justifyContent="space-between">
                          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Link href={`/tracker/${chapter.id}`} style={{ textDecoration: "none" }}>
                                <Typography variant="subtitle1" sx={{ fontWeight: 650, color: "text.primary", "&:hover": { color: "primary.main" } }}>
                                  {chapter.name}
                                </Typography>
                              </Link>
                              <Chip
                                label={labelFor(CHAPTER_STATUSES, st.status)}
                                size="small"
                                sx={{ bgcolor: statusDef?.color, color: "#fff", fontWeight: 600 }}
                              />
                            </Stack>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                              {done}/{topicTotal} topics · {st.questionsSolved} questions solved
                              {acc != null ? ` · ${acc}% accuracy` : ""}
                              {st.lastStudiedAt ? ` · last studied ${st.lastStudiedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                              {st.nextRevisionAt ? ` · next revision ${st.nextRevisionAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={pct}
                              sx={{ height: 5, mt: 1, maxWidth: 360, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: SUBJECT_COLORS[subject] } }}
                            />
                          </Box>
                          <Stack direction="row" spacing={2} sx={{ flexShrink: 0, alignItems: "center" }}>
                            <Box sx={{ textAlign: "center" }}>
                              <Typography variant="h6">{pct}%</Typography>
                              <Typography variant="caption" color="text.secondary">complete</Typography>
                            </Box>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  );
                })}
            </Stack>
          </Box>
        );
      })}
    </Box>
  );
}
