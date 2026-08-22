import Link from "next/link";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECTS, SUBJECT_COLORS, CHAPTER_STATUSES, labelFor } from "@/lib/constants";
import { subjectProgress } from "@/lib/analytics";
import { PageHeader } from "@/components/ui";
import SyllabusControls, { ChapterMenu } from "@/components/syllabus/SyllabusControls";

export const dynamic = "force-dynamic";

const statusColor = (status: string) =>
  CHAPTER_STATUSES.find((s) => s.value === status)?.color ?? "#8A857B";

export default async function SyllabusPage(props: {
  searchParams: Promise<{ subject?: string; branch?: string; status?: string }>;
}) {
  const user = await requireUser();
  const sp = await props.searchParams;

  const [chapters, states] = await Promise.all([
    prisma.chapter.findMany({ include: { topics: true }, orderBy: [{ subject: "asc" }, { name: "asc" }] }),
    prisma.chapterState.findMany({ where: { userId: user.id }, include: { chapter: true, topics: true } }),
  ]);
  const stateMap = new Map(states.map((s) => [s.chapterId, s]));

  const subject = sp.subject && SUBJECTS.includes(sp.subject as (typeof SUBJECTS)[number]) ? sp.subject : undefined;
  const branches = [...new Set(chapters.filter((c) => c.subject === "Chemistry").map((c) => c.branch ?? "Other"))];

  let filtered = chapters;
  if (subject) filtered = filtered.filter((c) => c.subject === subject);
  if (sp.branch) filtered = filtered.filter((c) => c.branch === sp.branch);
  if (sp.status) filtered = filtered.filter((c) => (stateMap.get(c.id)?.status ?? "not_started") === sp.status);

  const grouped = SUBJECTS.filter((s) => !subject || s === subject).map((s) => ({
    subject: s,
    chapters: filtered.filter((c) => c.subject === s),
    count: chapters.filter((c) => c.subject === s).length,
    states: states.filter((st) => st.chapter?.subject === s),
  })).filter((g) => g.chapters.length > 0 || !subject);

  return (
    <Box>
      <PageHeader
        title="Syllabus"
        subtitle="Complete JEE Main + Advanced syllabus with your progress on every chapter."
      />
      <SyllabusControls
        subjects={[...SUBJECTS]}
        branches={branches}
        activeSubject={subject ?? ""}
        activeBranch={sp.branch ?? ""}
        activeStatus={sp.status ?? ""}
      />

      {grouped.map((group) => (
        <Box key={group.subject} sx={{ mb: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h5">{group.subject}</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" color="text.secondary">
                {subjectProgress(group.states, group.count)}% complete
              </Typography>
            </Stack>
          </Stack>
          <LinearProgress
            variant="determinate"
            value={subjectProgress(group.states, group.count)}
            sx={{
              height: 6,
              mb: 2,
              bgcolor: "action.hover",
              "& .MuiLinearProgress-bar": { bgcolor: SUBJECT_COLORS[group.subject] },
            }}
          />
          <Stack spacing={1.5}>
            {group.chapters.map((ch) => {
              const st = stateMap.get(ch.id);
              const status = st?.status ?? "not_started";
              const doneTopics = st ? st.topics.filter((t) => t.done).length : 0;
              return (
                <Card key={ch.id}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      justifyContent="space-between"
                      alignItems={{ sm: "center" }}
                      spacing={1}
                    >
                      <Box sx={{ minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                          <Link href={`/tracker/${ch.id}`} style={{ textDecoration: "none" }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 650, color: "text.primary", "&:hover": { color: "primary.main" } }}>
                              {ch.name}
                            </Typography>
                          </Link>
                          {ch.branch && <Chip label={ch.branch} size="small" variant="outlined" />}
                        </Stack>
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                          {ch.topics.length} topics · {doneTopics} done · Main ~{ch.avgQuestionsMain} Q · Adv ~{ch.avgQuestionsAdv} Q
                          {st?.lastStudiedAt ? ` · last studied ${st.lastStudiedAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={1} alignItems="center" sx={{ flexShrink: 0 }}>
                        <Box
                          sx={{
                            width: 10, height: 10,
                            bgcolor: statusColor(status),
                            flexShrink: 0,
                          }}
                        />
                        <Typography variant="caption" sx={{ fontWeight: 600, minWidth: 92 }}>
                          {labelFor(CHAPTER_STATUSES, status)}
                        </Typography>
                      </Stack>
                    </Stack>
                    <Divider sx={{ my: 1.25 }} />
                    <ChapterMenu
                      chapterId={ch.id}
                      status={status}
                      totalTopics={ch.topics.length}
                      doneTopics={doneTopics}
                    />
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      ))}
    </Box>
  );
}
