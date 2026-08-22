import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import { studyMinutesInRange, subjectMinutes, daysAgo } from "@/lib/analytics";
import SessionsList from "@/components/sessions/SessionsList";
import FocusTimer from "@/components/sessions/FocusTimer";

export const dynamic = "force-dynamic";

export default async function SessionsPage(props: { searchParams: Promise<{ timer?: string }> }) {
  const user = await requireUser();
  const sp = await props.searchParams;

  const [sessions, chapters] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId: user.id },
      include: { chapter: true },
      orderBy: { startedAt: "desc" },
      take: 100,
    }),
    prisma.chapter.findMany({ select: { id: true, name: true, subject: true }, orderBy: { subject: "asc" } }),
  ]);

  const week = studyMinutesInRange(sessions, 7);
  const month = studyMinutesInRange(sessions, 30);
  const bySubject = subjectMinutes(sessions.filter((s) => s.startedAt >= daysAgo(30)));

  return (
    <Box>
      <PageHeader
        title="Study Sessions"
        subtitle={`This week: ${Math.floor(week / 60)}h ${week % 60}m · this month: ${Math.floor(month / 60)}h ${month % 60}m`}
      />
      <FocusTimer
        chapters={chapters.map((c) => ({ id: c.id, name: c.name, subject: c.subject }))}
        autoOpen={sp.timer === "1"}
      />
      <Box sx={{ mt: 3 }}>
        <SessionsList
          sessions={sessions.map((s) => ({
            id: s.id,
            subject: s.subject,
            chapterName: s.chapter?.name ?? null,
            topic: s.topic,
            type: s.type,
            startedAt: s.startedAt.toISOString(),
            durationMinutes: s.durationMinutes,
          }))}
          stats={{
            weekMinutes: week,
            monthMinutes: month,
            bySubject,
          }}
          chapters={chapters.map((c) => ({ id: c.id, name: c.name, subject: c.subject }))}
        />
      </Box>
    </Box>
  );
}
