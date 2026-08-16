import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { SUBJECT_COLORS } from "@/lib/constants";
import { EmptyState, PageHeader } from "@/components/ui";
import ScheduleRevisionForm from "@/components/revision/ScheduleRevisionForm";
import CompleteRevisionButton from "@/components/revision/CompleteRevisionButton";

export const dynamic = "force-dynamic";

export default async function RevisionPage() {
  const user = await requireUser();

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [due, upcoming, chapters] = await Promise.all([
    prisma.revision.findMany({
      where: { userId: user.id, dueAt: { lte: endOfToday }, completedAt: null },
      include: { topic: { include: { chapter: true } } },
      orderBy: { dueAt: "asc" },
    }),
    prisma.revision.findMany({
      where: { userId: user.id, dueAt: { gt: endOfToday }, completedAt: null },
      include: { topic: { include: { chapter: true } } },
      orderBy: { dueAt: "asc" },
      take: 15,
    }),
    prisma.chapter.findMany({
      orderBy: [{ subject: "asc" }, { name: "asc" }],
      include: { topics: { orderBy: { order: "asc" } } },
    }),
  ]);

  const chapterOptions = chapters.map((c) => ({
    id: c.id,
    name: c.name,
    subject: c.subject,
    topics: c.topics.map((t) => ({ id: t.id, name: t.name })),
  }));

  return (
    <Box>
      <PageHeader
        title="Revision"
        subtitle={due.length ? `${due.length} topic${due.length === 1 ? "" : "s"} due for revision today` : "Spaced repetition keeps what you learn fresh"}
      />

      {/* Due today */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Due today</Typography>
          {due.length === 0 ? (
            <EmptyState
              title="Nothing due. Schedule revisions from chapter pages."
              description="Mark topics for spaced repetition below and they will appear here when due."
            />
          ) : (
            <Stack spacing={1.25}>
              {due.map((r) => (
                <Card key={r.id} variant="outlined" sx={{ bgcolor: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.35)" }}>
                  <CardContent sx={{ p: 1.75, "&:last-child": { pb: 1.75 } }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1.5}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {r.topic.chapter.name} — {r.topic.name}
                        </Typography>
                        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mt: 0.5 }}>
                          <Chip
                            label={r.subject}
                            size="small"
                            variant="outlined"
                            sx={{ borderColor: SUBJECT_COLORS[r.subject] ?? undefined }}
                          />
                          {r.dueAt < new Date() && <Chip label="Overdue" size="small" color="error" variant="outlined" />}
                        </Stack>
                      </Box>
                      <CompleteRevisionButton id={r.id} />
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>

      {/* Schedule */}
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 0.5 }}>Schedule revision</Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1.5 }}>
            Pick a topic and the next interval — completing a revision auto-schedules the following one.
          </Typography>
          <ScheduleRevisionForm chapters={chapterOptions} />
        </CardContent>
      </Card>

      {/* Upcoming */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>Upcoming</Typography>
          {upcoming.length === 0 ? (
            <Typography variant="body2" color="text.secondary">No upcoming revisions scheduled.</Typography>
          ) : (
            <Stack divider={<Box sx={{ borderBottom: 1, borderColor: "divider" }} />} spacing={0}>
              {upcoming.map((r) => (
                <Stack key={r.id} direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1 }}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Box sx={{ width: 8, height: 8, bgcolor: SUBJECT_COLORS[r.subject] ?? "#999" }} />
                    <Typography variant="body2">
                      {r.topic.chapter.name} — {r.topic.name}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary">
                    {r.dueAt.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
