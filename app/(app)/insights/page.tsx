import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computePriorities, generateInsights } from "@/lib/analytics";
import { PageHeader } from "@/components/ui";
import InsightsList from "@/components/insights/InsightsList";

export const dynamic = "force-dynamic";

export default async function InsightsPage() {
  const user = await requireUser();

  const [profile, logs, tests, sessions, states] = await Promise.all([
    prisma.profile.findUnique({ where: { userId: user.id } }),
    prisma.questionLog.findMany({ where: { userId: user.id } }),
    prisma.mockTest.findMany({ where: { userId: user.id } }),
    prisma.studySession.findMany({ where: { userId: user.id } }),
    prisma.chapterState.findMany({ where: { userId: user.id }, include: { chapter: true, topics: true } }),
  ]);

  const insights = generateInsights({ logs, tests, sessions, states });
  const priorities = computePriorities(
    states.map((s) => ({ ...s, topicDone: s.topics.filter((t) => t.done).length, topicTotal: 0 })),
    profile?.targetExam ?? "both"
  );

  return (
    <Box>
      <PageHeader
        title="Insights"
        subtitle="Deterministic observations generated from your own data — nothing here is fabricated."
      />
      <InsightsList
        insights={insights}
        priorities={priorities.map((p) => ({
          chapterId: p.chapterId,
          name: p.name,
          subject: p.subject,
          priority: p.priority,
          reason: p.reason,
        }))}
      />
    </Box>
  );
}
