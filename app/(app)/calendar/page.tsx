import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import MonthView, { type CalendarEvent } from "@/components/calendar/MonthView";
import { mergeCustomization } from "@/lib/customization";

export const dynamic = "force-dynamic";

function parseMonth(param: string | undefined): { year: number; month: number } {
  const now = new Date();
  if (param && /^\d{4}-(0[1-9]|1[0-2])$/.test(param)) {
    const [y, m] = param.split("-").map(Number);
    return { year: y, month: m - 1 };
  }
  return { year: now.getFullYear(), month: now.getMonth() };
}

const dayKey = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default async function CalendarPage(props: { searchParams: Promise<{ month?: string }> }) {
  const user = await requireUser();
  const sp = await props.searchParams;
  const { year, month } = parseMonth(sp.month);

  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 1); // exclusive

  const [sessions, tests, revisions, goals, entries, prefs] = await Promise.all([
    prisma.studySession.findMany({
      where: { userId: user.id, startedAt: { gte: monthStart, lt: monthEnd } },
      orderBy: { startedAt: "asc" },
    }),
    prisma.mockTest.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.revision.findMany({
      where: { userId: user.id, dueAt: { gte: monthStart, lt: monthEnd }, completedAt: null },
      include: { topic: true },
      orderBy: { dueAt: "asc" },
    }),
    prisma.goal.findMany({
      where: { userId: user.id, deadline: { gte: monthStart, lt: monthEnd } },
      orderBy: { deadline: "asc" },
    }),
    prisma.journalEntry.findMany({
      where: { userId: user.id, date: { gte: monthStart, lt: monthEnd } },
      orderBy: { date: "asc" },
    }),
    prisma.userPreference.findUnique({ where: { userId: user.id }, select: { customization: true } }),
  ]);

  const events: CalendarEvent[] = [
    ...sessions.map((s) => ({
      kind: "study" as const,
      date: dayKey(s.startedAt),
      label: `${s.subject}${s.chapterId ? " session" : ` — ${s.type}`} (${Math.floor(s.durationMinutes / 60)}h ${s.durationMinutes % 60}m)`,
    })),
    ...tests.map((t) => ({
      kind: "test" as const,
      date: dayKey(t.date),
      label: `Mock: ${t.name} (${t.marksObtained}/${t.totalMarks})`,
    })),
    ...revisions.map((r) => ({
      kind: "revision" as const,
      date: dayKey(r.dueAt),
      label: `Revision due: ${r.topic.name}`,
    })),
    ...goals.map((g) => ({
      kind: "goal" as const,
      date: dayKey(g.deadline as Date),
      label: `Goal deadline: ${g.title}`,
    })),
    ...entries.map((e) => ({
      kind: "journal" as const,
      date: dayKey(e.date),
      label: `Journal: ${e.title}`,
    })),
  ];

  return (
    <Box>
      <PageHeader title="Calendar" subtitle="Study sessions, mock tests, revisions, journal entries and goal deadlines in one view." />
      <MonthView year={year} month={month} events={events} weekStartsOn={mergeCustomization(prefs?.customization).weekStartsOn} />
    </Box>
  );
}
