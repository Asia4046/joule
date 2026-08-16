import Box from "@mui/material/Box";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { accuracy, avgScore, bestPercentile, avgTimePerQuestion } from "@/lib/analytics";
import { PageHeader, StatCard } from "@/components/ui";
import MockTestTable from "@/components/mocktests/MockTestTable";

export const dynamic = "force-dynamic";

export default async function MockTestsPage() {
  const user = await requireUser();
  const tests = await prisma.mockTest.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
  });

  const avg = avgScore(tests);
  const bestPct = bestPercentile(tests);
  const latest = tests[0];
  const latestAcc = latest ? accuracy(latest.correct, latest.attempted) : null;
  const avgTime = latest ? avgTimePerQuestion(latest) : null;

  return (
    <Box>
      <PageHeader
        title="Mock Tests"
        subtitle={tests.length ? `${tests.length} tests recorded` : "Record and analyse your mock-test performance."}
      />
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
        <StatCard label="Average score" value={avg != null ? `${avg}%` : "—"} />
        <StatCard label="Best percentile" value={bestPct != null ? bestPct.toFixed(2) : "—"} />
        <StatCard label="Latest accuracy" value={latestAcc != null ? `${latestAcc}%` : "—"} />
        <StatCard label="Avg time / question" value={avgTime != null ? `${avgTime} min` : "—"} />
      </Box>
      <MockTestTable
        tests={tests.map((t) => ({
          id: t.id,
          name: t.name,
          date: t.date.toISOString(),
          examType: t.examType,
          source: t.source,
          totalMarks: t.totalMarks,
          marksObtained: t.marksObtained,
          physicsMarks: t.physicsMarks,
          chemistryMarks: t.chemistryMarks,
          mathsMarks: t.mathsMarks,
          attempted: t.attempted,
          correct: t.correct,
          incorrect: t.incorrect,
          skipped: t.skipped,
          percentile: t.percentile,
        }))}
      />
    </Box>
  );
}
