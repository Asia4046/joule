import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowForward from "@mui/icons-material/ArrowForward";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CONCEPT_CONTENT } from "@/lib/concept-content";
import { PageHeader, LinkButton, StatCard } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function ConceptsPage() {
  await requireUser();
  const chapters = await prisma.chapter.findMany({
    where: { subject: { in: ["Physics", "Chemistry"] } },
    select: { id: true, name: true, slug: true, branch: true, subject: true, weightageMain: true, weightageAdv: true, avgQuestionsMain: true },
    orderBy: [{ weightageMain: "desc" }],
  });
  const withLabs = chapters.filter((c) => CONCEPT_CONTENT[c.slug]);
  const dbSlugs = new Set(chapters.map((c) => c.slug));
  const advLabs = Object.keys(CONCEPT_CONTENT).filter((slug) => !dbSlugs.has(slug));

  return (
    <Box>
      <PageHeader
        title="Concept Labs"
        subtitle="Interactive simulations + JEE-level explanations for Physics and Chemistry chapters."
        action={
          <LinkButton href="/concepts/oscillations-and-waves" variant="contained" startIcon={<ScienceOutlinedIcon />}>
            Open flagship lab
          </LinkButton>
        }
      />

      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2.5 }} useFlexGap flexWrap="wrap">
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Interactive labs" value={withLabs.length + advLabs.length} sub="21 chapter labs + JEE Advanced labs" icon={<ScienceOutlinedIcon fontSize="small" />} />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Coverage" value="100%" sub="full Physics syllabus" />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Each lab includes" value="Sim + notes" sub="formulas, exam traps" />
        </Box>
        <Box sx={{ width: { xs: "100%", sm: "calc(50% - 8px)", md: "calc(25% - 12px)" } }}>
          <StatCard label="Best used" value="Pre-study" sub="build intuition, then solve" />
        </Box>
      </Stack>

      <Stack spacing={1.25}>
        {withLabs.map((c, i) => {
          const content = CONCEPT_CONTENT[c.slug];
          return (
            <Card key={c.id} sx={{ "&:hover": { borderColor: "primary.main" } }}>
              <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box
                    sx={{
                      width: 44,
                      height: 44,
                      flexShrink: 0,
                      display: { xs: "none", sm: "flex" },
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "0.9rem",
                      color: "#F4F4F5",
                      background: "#1D1D24",
                      border: "1px solid rgba(255,255,255,0.2)",
                    }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </Box>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        {content.title}
                      </Typography>
                      {c.subject !== "Physics" && (
                        <Chip size="small" color="secondary" variant="outlined" label={c.subject} />
                      )}
                      <Chip size="small" variant="outlined" label={`${c.weightageMain}% in Main 2026`} color="primary" />
                      <Chip size="small" variant="outlined" label={`${c.avgQuestionsMain} Qs/paper`} />
                    </Stack>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, display: { xs: "none", sm: "block" } }}>
                      {content.tagline}
                    </Typography>
                  </Box>
                  <LinkButton href={`/concepts/${c.slug}`} endIcon={<ArrowForward />} size="small">
                    Open lab
                  </LinkButton>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </Stack>

      {advLabs.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.5 }}>
            <Typography variant="h6">JEE Advanced question labs</Typography>
            <Chip size="small" color="secondary" label={`${advLabs.length} archetype labs`} />
          </Stack>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, maxWidth: 760 }}>
            Standalone simulations built around famous JEE Advanced question patterns — collisions and restitution,
            the rolling-body race, Doppler wavefronts, RC transients, radioactive decay, string harmonics and
            the tunnel piston effect.
          </Typography>
          <Stack spacing={1.25}>
            {advLabs.map((slug, i) => {
              const content = CONCEPT_CONTENT[slug];
              return (
                <Card key={slug} sx={{ "&:hover": { borderColor: "secondary.main" } }}>
                  <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box
                        sx={{
                          width: 44,
                          height: 44,
                          flexShrink: 0,
                          display: { xs: "none", sm: "flex" },
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.9rem",
                          color: "#F4F4F5",
                          background: "#1D1D24",
                          border: "1px solid rgba(255,255,255,0.2)",
                        }}
                      >
                        A{i + 1}
                      </Box>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                            {content.title}
                          </Typography>
                          <Chip size="small" variant="outlined" label="JEE Advanced archetype" color="secondary" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, display: { xs: "none", sm: "block" } }}>
                          {content.tagline}
                        </Typography>
                      </Box>
                      <LinkButton href={`/concepts/${slug}`} endIcon={<ArrowForward />} size="small">
                        Open lab
                      </LinkButton>
                    </Stack>
                  </CardContent>
                </Card>
              );
            })}
          </Stack>
        </Box>
      )}
    </Box>
  );
}
