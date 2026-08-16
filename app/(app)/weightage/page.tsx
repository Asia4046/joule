import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/ui";
import WeightageView from "@/components/weightage/WeightageView";

export const dynamic = "force-dynamic";

export default async function WeightagePage() {
  await requireUser();
  const chapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
      subject: true,
      branch: true,
      avgQuestionsMain: true,
      avgQuestionsAdv: true,
      weightageMain: true,
      weightageAdv: true,
    },
    orderBy: [{ subject: "asc" }, { name: "asc" }],
  });

  return (
    <Box>
      <PageHeader
        title="JEE Weightage"
        subtitle="Chapter-wise weightage for JEE Main and Advanced, 2026 papers."
      />
      <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
        Based on chapter-wise analysis of 2026 session papers — not a guarantee of future question distribution.
        Chapters dropped from the JEE Main syllabus in the 2024 NTA revision show 0%.
      </Typography>
      <WeightageView chapters={chapters} />
    </Box>
  );
}
