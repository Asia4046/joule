import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { scoreTrend } from "@/lib/analytics";
import { PageHeader, EmptyState, LinkButton } from "@/components/ui";
import MockAnalyticsCharts from "@/components/mocktests/MockAnalyticsCharts";

export const dynamic = "force-dynamic";

export default async function MockAnalyticsPage() {
  const user = await requireUser();
  const tests = await prisma.mockTest.findMany({
    where: { userId: user.id },
    orderBy: { date: "asc" },
  });

  const trend = scoreTrend(tests).map((t) => ({
    name: t.name,
    scorePct: t.scorePct,
    percentile: t.percentile,
    accuracy: t.accuracy,
    physics: t.physics,
    chemistry: t.chemistry,
    maths: t.maths,
  }));

  const negatives = tests.map((t) => ({ name: t.name, negative: t.negativeMarks }));
  const attempts = tests.map((t) => ({
    name: t.name,
    correct: t.correct,
    incorrect: t.incorrect,
    skipped: t.skipped,
  }));

  return (
    <Box>
      <PageHeader
        title="Mock Test Analytics"
        subtitle="Score, percentile, subject and accuracy trends across all your tests."
        action={
          <LinkButton href="/mock-tests" variant="outlined" size="small">
            Back to tests
          </LinkButton>
        }
      />
      {tests.length < 2 ? (
        <EmptyState
          title="Add at least two tests to unlock trends."
          description="Progression charts need multiple data points. Record your mocks and this page comes alive."
          action={<LinkButton href="/mock-tests" variant="contained">Add tests</LinkButton>}
        />
      ) : (
        <MockAnalyticsCharts trend={trend} attempts={attempts} negatives={negatives} />
      )}
    </Box>
  );
}
