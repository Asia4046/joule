import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import MistakesView from "@/components/mistakes/MistakesView";

export const dynamic = "force-dynamic";

export default async function MistakesPage() {
  const user = await requireUser();

  const [mistakes, chapters] = await Promise.all([
    prisma.mistake.findMany({
      where: { userId: user.id },
      include: { chapter: true, topic: true },
      orderBy: { date: "desc" },
    }),
    prisma.chapter.findMany({
      select: { id: true, name: true, subject: true, topics: { select: { id: true, name: true }, orderBy: { order: "asc" } } },
      orderBy: [{ subject: "asc" }, { name: "asc" }],
    }),
  ]);

  return (
    <Box>
      <PageHeader
        title="Mistake Notebook"
        subtitle="Every wrong question is a signal. Log it, categorise it, fix the pattern."
      />
      <MistakesView
        mistakes={mistakes.map((m) => ({
          id: m.id,
          subject: m.subject,
          chapterName: m.chapter?.name ?? null,
          topicName: m.topic?.name ?? null,
          question: m.question,
          myReasoning: m.myReasoning,
          solution: m.solution,
          source: m.source,
          mistakeType: m.mistakeType,
          difficulty: m.difficulty,
          status: m.status,
          date: m.date.toISOString(),
        }))}
        chapters={chapters}
      />
    </Box>
  );
}
