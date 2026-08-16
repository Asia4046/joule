import { notFound } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accuracy } from "@/lib/analytics";
import { CHAPTER_STATUSES, SUBJECT_COLORS, labelFor, DEFAULT_REVISION_INTERVALS } from "@/lib/constants";
import { PageHeader, StatCard, ProgressRing, LinkButton } from "@/components/ui";
import ChapterDetailControls, { ScheduleRevision } from "@/components/tracker/ChapterDetailControls";
import { CONCEPT_CONTENT } from "@/lib/concept-content";

export const dynamic = "force-dynamic";

export default async function ChapterDetailPage(props: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await props.params;

  const chapter = await prisma.chapter.findUnique({
    where: { id },
    include: { topics: { orderBy: { order: "asc" as const } } },
  });
  if (!chapter) notFound();

  const state = await prisma.chapterState.findUnique({
    where: { userId_chapterId: { userId: user.id, chapterId: id } },
    include: { topics: true },
  });

  const doneSet = new Set(state?.topics.filter((t) => t.done).map((t) => t.topicId) ?? []);
  const doneCount = doneSet.size;
  const pct = chapter.topics.length ? Math.round((doneCount / chapter.topics.length) * 100) : 0;
  const acc = state ? accuracy(state.questionsCorrect, state.questionsSolved) : null;
  const daysSince = state?.lastStudiedAt
    ? Math.floor((Date.now() - state.lastStudiedAt.getTime()) / 86400000)
    : null;

  return (
    <Box>
      <PageHeader
        title={chapter.name}
        subtitle={`${chapter.subject}${chapter.branch ? ` · ${chapter.branch}` : ""} · Difficulty ${chapter.difficulty}/5`}
        action={
          <Stack direction="row" spacing={1}>
            {chapter.subject === "Physics" && CONCEPT_CONTENT[chapter.slug] && (
              <LinkButton href={`/concepts/${chapter.slug}`} variant="contained" size="small">
                Concept lab
              </LinkButton>
            )}
            <LinkButton href="/syllabus" variant="outlined" size="small">
              Back to syllabus
            </LinkButton>
          </Stack>
        }
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mb: 2 }}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack direction="row" spacing={3} alignItems="center">
              <ProgressRing value={pct} size={80} />
              <Box sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>Concepts</Typography>
                <Stack spacing={0.25}>
                  {chapter.topics.map((t) => (
                    <Stack key={t.id} direction="row" spacing={0.5} alignItems="center">
                      <Typography
                        variant="body2"
                        sx={{
                          color: doneSet.has(t.id) ? "text.secondary" : "text.primary",
                          textDecoration: doneSet.has(t.id) ? "line-through" : "none",
                        }}
                      >
                        {doneSet.has(t.id) ? "✓" : "○"} {t.name}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Box>
            </Stack>
            <Divider sx={{ my: 2 }} />
            <ChapterDetailControls
              chapterId={chapter.id}
              topics={chapter.topics.map((t) => ({ id: t.id, name: t.name, done: doneSet.has(t.id) }))}
              status={state?.status ?? "not_started"}
              confidence={state?.confidence ?? 2}
            />
          </CardContent>
        </Card>

        <Stack spacing={2} sx={{ width: { xs: "100%", md: 320 } }}>
          <StatCard label="Accuracy" value={acc != null ? `${acc}%` : "—"} sub={state ? `${state.questionsSolved} questions solved` : "No data yet"} color={SUBJECT_COLORS[chapter.subject]} />
          <StatCard
            label="Last studied"
            value={daysSince == null ? "Never" : daysSince === 0 ? "Today" : `${daysSince} day${daysSince === 1 ? "" : "s"} ago`}
            sub={state?.nextRevisionAt ? `Next revision ${state.nextRevisionAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : "No revision scheduled"}
            color="#f59e0b"
          />
          <Card>
            <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, display: "block", mb: 1 }}>
                JEE RELEVANCE (HISTORICAL ESTIMATE)
              </Typography>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Main ~{chapter.avgQuestionsMain} Q · {chapter.weightageMain}% weightage</Typography>
              </Stack>
              <Typography variant="body2">Advanced ~{chapter.avgQuestionsAdv} Q · {chapter.weightageAdv}% weightage</Typography>
              <Divider sx={{ my: 1.25 }} />
              <ScheduleRevision chapterId={chapter.id} topicIds={chapter.topics.map((t) => t.id)} />
            </CardContent>
          </Card>
        </Stack>
      </Stack>
    </Box>
  );
}
