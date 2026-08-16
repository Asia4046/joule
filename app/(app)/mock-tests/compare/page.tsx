import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import CompareView from "@/components/mocktests/CompareView";

export const dynamic = "force-dynamic";

export default async function ComparePage() {
  const user = await requireUser();
  const tests = await prisma.mockTest.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    select: {
      id: true,
      name: true,
      date: true,
      totalMarks: true,
      marksObtained: true,
      physicsMarks: true,
      chemistryMarks: true,
      mathsMarks: true,
      attempted: true,
      correct: true,
      incorrect: true,
      percentile: true,
    },
  });

  return (
    <Box>
      <PageHeader title="Compare Tests" subtitle="Select up to 4 tests and see exactly what improved." />
      <CompareView
        tests={tests.map((t) => ({
          ...t,
          date: t.date.toISOString(),
        }))}
      />
    </Box>
  );
}
