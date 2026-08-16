import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import JournalList from "@/components/journal/JournalList";

export const dynamic = "force-dynamic";

export default async function JournalPage() {
  const user = await requireUser();

  const entries = await prisma.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  return (
    <Box>
      <PageHeader title="Journal" subtitle="Reflect on each day of preparation — what you studied, what clicked, what didn't." />
      <JournalList
        entries={entries.map((e) => ({
          id: e.id,
          title: e.title,
          date: e.date.toISOString(),
          mood: e.mood,
          studiedWhat: e.studiedWhat,
          understood: e.understood,
          struggled: e.struggled,
          mistakes: e.mistakes,
          tomorrow: e.tomorrow,
          body: e.body,
        }))}
      />
    </Box>
  );
}
