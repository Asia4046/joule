import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBack from "@mui/icons-material/ArrowBack";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import FunctionsIcon from "@mui/icons-material/Functions";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONCEPT_CONTENT } from "@/lib/concept-content";
import { SIM_REGISTRY } from "@/components/concepts/sims";
import { TeX } from "@/components/concepts/TeX";
import { PageHeader, LinkButton } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ConceptPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireUser();
  const { slug } = await params;
  const content = CONCEPT_CONTENT[slug];
  const Sim = SIM_REGISTRY[slug];
  if (!content || !Sim) notFound();

  const chapter = await prisma.chapter.findUnique({
    where: { subject_slug: { subject: "Physics", slug } },
    select: { id: true, name: true, weightageMain: true, weightageAdv: true, avgQuestionsMain: true, avgQuestionsAdv: true },
  });

  const related = await prisma.chapter.findMany({
    where: { subject: "Physics", slug: { not: slug } },
    select: { slug: true, name: true, weightageMain: true },
    orderBy: { weightageMain: "desc" },
    take: 5,
  });

  return (
    <Box>
      <PageHeader
        title={content.title}
        subtitle={content.tagline}
        action={
          <Stack direction="row" spacing={1}>
            <LinkButton href="/concepts" startIcon={<ArrowBack />} size="small">
              All labs
            </LinkButton>
            {chapter && (
              <LinkButton href={`/tracker/${chapter.id}`} size="small" variant="contained">
                Chapter tracker
              </LinkButton>
            )}
          </Stack>
        }
      />

      {/* chapter meta chips */}
      {chapter && (
        <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap" useFlexGap>
          <Chip size="small" color="primary" variant="outlined" label={`Main 2026: ${chapter.weightageMain}% · ~${chapter.avgQuestionsMain} Q`} />
          <Chip size="small" color="secondary" variant="outlined" label={`Advanced: ${chapter.weightageAdv}% · ~${chapter.avgQuestionsAdv} Q`} />
        </Stack>
      )}

      {/* simulation */}
      <Box sx={{ mb: 3 }}>
        <Sim />
      </Box>

      {/* explanation */}
      <Stack spacing={2} sx={{ mb: 3 }}>
        {content.sections.map((s) => (
          <Card key={s.heading}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1 }}>
                {s.heading}
              </Typography>
              {s.body.map((p, i) => (
                <Typography key={i} variant="body2" sx={{ mb: i === s.body.length - 1 ? 0 : 1.25, lineHeight: 1.75, color: "text.primary", maxWidth: 760 }}>
                  {p}
                </Typography>
              ))}
            </CardContent>
          </Card>
        ))}
      </Stack>

      {/* formulas */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
            <FunctionsIcon fontSize="small" color="primary" />
            <Typography variant="h6">Key formulas</Typography>
          </Stack>
          <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} useFlexGap flexWrap="wrap">
            {content.formulas.map((f, i) => (
              <Box
                key={i}
                sx={{
                  flex: { xs: "1 1 100%", md: "1 1 calc(50% - 12px)" },
                  border: "1px solid",
                  borderColor: "divider",
                  p: 1.75,
                  bgcolor: "rgba(217,119,87,0.08)",
                }}
              >
                <TeX tex={f.tex} display />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  <Typography variant="caption" sx={{ fontWeight: 700 }}>
                    {f.label}
                  </Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* JEE tips */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1.5 }}>
            <LightbulbOutlinedIcon fontSize="small" sx={{ color: "warning.main" }} />
            <Typography variant="h6">JEE traps & tips</Typography>
          </Stack>
          <Stack spacing={1.25}>
            {content.tips.map((tip, i) => (
              <Stack key={i} direction="row" spacing={1.5} alignItems="flex-start">
                <Box
                  sx={{
                    width: 22,
                    height: 22,
                    flexShrink: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "0.65rem",
                    fontWeight: 800,
                    bgcolor: "warning.main",
                    color: "#fff",
                    mt: 0.25,
                  }}
                >
                  {i + 1}
                </Box>
                <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                  {tip}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </CardContent>
      </Card>

      {/* next labs */}
      <Card>
        <CardContent>
          <Typography variant="h6" sx={{ mb: 1.5 }}>
            Continue with high-weightage labs
          </Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {related.map((r) => (
              <Chip
                key={r.slug}
                label={`${r.name} · ${r.weightageMain}%`}
                variant="outlined"
                component="a"
                href={`/concepts/${r.slug}`}
                clickable
              />
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
