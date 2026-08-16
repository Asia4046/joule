import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { overallAccuracy, questionsOn } from "@/lib/analytics";
import { PageHeader, StatCard } from "@/components/ui";
import QuestionsView from "@/components/questions/QuestionsView";

export const dynamic = "force-dynamic";

export default async function QuestionsPage() {
  const user = await requireUser();

  const [logs, chapters] = await Promise.all([
    prisma.questionLog.findMany({
      where: { userId: user.id },
      include: { chapter: true },
      orderBy: { date: "desc" },
      take: 200,
    }),
    prisma.chapter.findMany({ select: { id: true, name: true, subject: true }, orderBy: [{ subject: "asc" }, { name: "asc" }] }),
  ]);

  const today = new Date();
  const weekAgo = new Date(Date.now() - 7 * 86400000);
  const monthAgo = new Date(Date.now() - 30 * 86400000);

  const todayCount = questionsOn(logs, today);
  const weekCount = logs.filter((l) => l.date >= weekAgo).reduce((s, l) => s + l.total, 0);
  const monthCount = logs.filter((l) => l.date >= monthAgo).reduce((s, l) => s + l.total, 0);
  const acc = overallAccuracy(logs.filter((l) => l.date >= monthAgo));

  return (
    <Box>
      <PageHeader title="Questions" subtitle="Track solving volume and accuracy across subjects." />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <StatCard label="Today" value={todayCount} color="#6366f1" />
        <StatCard label="Last 7 days" value={weekCount} color="#10b981" />
        <StatCard label="Last 30 days" value={monthCount} color="#f59e0b" />
        <StatCard label="Accuracy (30d)" value={acc != null ? `${acc}%` : "—"} color="#ef4444" />
      </Box>
      <QuestionsView
        logs={logs.map((l) => ({
          id: l.id,
          subject: l.subject,
          chapterName: l.chapter?.name ?? null,
          topic: l.topic,
          total: l.total,
          correct: l.correct,
          incorrect: l.incorrect,
          difficulty: l.difficulty,
          date: l.date.toISOString(),
        }))}
        chapters={chapters}
      />
    </Box>
  );
}
