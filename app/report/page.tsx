import { redirect } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import { getSessionUser } from "@/lib/auth";
import { getReport, REPORT_TTL_DAYS, type ReportSnapshot } from "@/lib/report";
import { J, SUBJECT_COLORS } from "@/lib/jellybeans";
import BrandMark from "@/components/BrandMark";
import { LinkButton } from "@/components/ui";
import type { CSSProperties } from "react";

export const dynamic = "force-dynamic";

export const metadata = { title: "Preparation Report" };

const fmtHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};

const fmtDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

/* The preview is permanently dark — same tokens as the generated PDF. */
const PAPER = "#0A0908";
const CARD = "#151310";
const INK = "#DED5C6";
const SOFT = "rgba(222,213,198,0.64)";
const HAIR = "rgba(223,214,198,0.16)";
const HAIR_STRONG = "rgba(223,214,198,0.32)";
const TRACK = "rgba(222,213,198,0.10)";

const inkShadow = { boxShadow: "3px 3px 0 rgba(0,0,0,0.75)" } as const;

/** Bean pair as CSS vars — CSS picks fill/deep per theme and pins `deep` in print. */
const beanVars = (bean: { fill: string; deep: string }) =>
  ({ "--bean": bean.deep, "--bean-dark": bean.fill }) as CSSProperties;

/** Section masthead — bean dot, mono kicker, display title, dashed tear rule. */
function SectionHead({ index, section, title }: { index: string; section: string; title: string }) {
  return (
    <Box className="jee-sec" sx={{ mb: 2 }}>
      <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
        <Box className="jee-bean-el" style={beanVars(J.bean.bubblegum)} sx={{ width: 9, height: 9, borderRadius: 999 }} aria-hidden />
        <Typography className="jee-mono" sx={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.16em", color: SOFT, textTransform: "uppercase" }}>
          {`${index} // ${section}`}
        </Typography>
      </Stack>
      <Typography variant="h5" className="jee-display" sx={{ letterSpacing: "-0.02em", color: INK }}>{title}</Typography>
      <Box sx={{ mt: 1.25, borderBottom: "1px dashed", borderColor: HAIR }} />
    </Box>
  );
}

/** Stat tile — mono label, display figure, optional sub. */
function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  return (
    <Box className="jee-tile" sx={{ p: 1.75, border: accent ? "1.5px solid" : "1px solid", borderColor: accent ? "#221F1A" : HAIR, bgcolor: accent ? "#F2A9CB" : CARD, color: accent ? "#221F1A" : INK, position: "relative", ...inkShadow }}>
      <Typography className="jee-mono" sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: accent ? "rgba(34,31,26,0.72)" : SOFT }}>
        {label}
      </Typography>
      <Typography className="jee-display jee-num" sx={{ mt: 0.5, fontSize: "1.6rem", fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
        {value}
      </Typography>
      {sub && (
        <Typography variant="caption" sx={{ display: "block", mt: 0.25, color: accent ? "rgba(34,31,26,0.76)" : SOFT }}>
          {sub}
        </Typography>
      )}
    </Box>
  );
}

/** Pill progress bar — server-rendered, bean-colored via the theme attribute. */
function Bar({ pct, bean }: { pct: number; bean: { fill: string; deep: string } }) {
  return (
    <Box className="jee-track" sx={{ height: 8, borderRadius: 999, bgcolor: TRACK, overflow: "hidden" }}>
      <Box className="jee-bean-el" style={beanVars(bean)} sx={{ height: "100%", width: `${Math.min(100, pct)}%`, borderRadius: 999 }} />
    </Box>
  );
}

const priorityBean: Record<string, { fill: string; deep: string }> = {
  high: J.bean.cherry,
  medium: J.bean.lemon,
  low: J.bean.mint,
};
const insightBean: Record<string, { fill: string; deep: string }> = {
  positive: J.bean.mint,
  warning: J.bean.cherry,
  info: J.bean.sky,
};

export default async function ReportPage() {
  const user = await getSessionUser();
  if (!user) redirect("/login");

  const report = await getReport(user.id);
  const d: ReportSnapshot = report.data;

  const gen = new Date(report.generatedAt);
  const valid = new Date(gen.getTime() + REPORT_TTL_DAYS * 86400000);
  const dayOfYear = Math.floor((gen.getTime() - new Date(gen.getFullYear(), 0, 0).getTime()) / 86400000);
  const edition = `ED. ${gen.getFullYear()}.${String(dayOfYear).padStart(3, "0")}`;

  const examLabel = { main: "JEE MAIN", advanced: "JEE ADVANCED", both: "JEE MAIN + ADVANCED" }[d.target.exam] ?? "JEE";
  const maxMistake = Math.max(1, ...d.mistakes.byType.map((m) => m.count));

  return (
    <Box
      className="jee-paper-grid jee-report-print jee-report-dark"
      sx={{
        minHeight: "100dvh",
        bgcolor: PAPER,
        color: INK,
        px: { xs: 1.5, sm: 3 },
        py: { xs: 2, sm: 4 },
        "@media print": { bgcolor: PAPER, px: 0, py: 0, printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" },
      }}
    >
      <Box sx={{ maxWidth: 880, mx: "auto", "@media print": { maxWidth: "none" } }}>
        {/* toolbar — screen only */}
        <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2, "@media print": { display: "none" } }}>
          <LinkButton href="/dashboard" size="small" startIcon={<ArrowBackIcon />}>
            Dashboard
          </LinkButton>
          <Button
            component="a"
            href="/api/report/pdf"
            variant="contained"
            size="small"
            startIcon={<PictureAsPdfOutlinedIcon />}
          >
            Download PDF
          </Button>
        </Stack>

        {/* masthead */}
        <Box className="jee-tile jee-masthead" sx={{ p: { xs: 2.25, sm: 3.5 }, border: "1.5px solid", borderColor: HAIR_STRONG, bgcolor: CARD, position: "relative", overflow: "hidden", ...inkShadow }}>
          <Box aria-hidden className="jee-barcode" sx={{ position: "absolute", top: { xs: 20, sm: 30 }, right: { xs: 20, sm: 30 }, width: 104, height: 44, color: INK, opacity: 0.6 }} />
          <Typography aria-hidden className="jee-mono" sx={{ position: "absolute", top: { xs: 70, sm: 80 }, right: { xs: 20, sm: 30 }, fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.22em", color: SOFT }}>
            {edition}
          </Typography>
          <Box aria-hidden className="jee-stamp jee-ink-el" style={beanVars(J.bean.bubblegum)} sx={{ position: "absolute", bottom: 16, right: 18, fontSize: "0.58rem" }}>
            On record
          </Box>

          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
            <Box sx={{ boxShadow: `3px 3px 0 ${"rgba(34,31,26,0.18)"}` }}>
              <BrandMark size={34} />
            </Box>
            <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "0.85rem", letterSpacing: "0.05em" }}>
              JOULE
            </Typography>
          </Stack>
          <Typography component="h1" className="jee-display" sx={{ fontSize: { xs: "1.8rem", sm: "2.6rem" }, fontWeight: 700, letterSpacing: "-0.03em", lineHeight: 1.05 }}>
            Preparation report
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.75, maxWidth: 460, color: SOFT }}>
            {d.candidate.name} · {examLabel} {d.target.year} · {d.target.prepLevel} track
          </Typography>

          <Box sx={{ mt: 2.5, pt: 1.5, borderTop: "1px dashed", borderColor: HAIR_STRONG }}>
            <Stack direction="row" sx={{ flexWrap: "wrap", gap: { xs: 1, sm: 3 } }}>
              {[
                ["GENERATED", fmtDate(report.generatedAt)],
                ["VALID THRU", fmtDate(valid)],
                ["CACHE", `${REPORT_TTL_DAYS} DAYS`],
                ["SOURCE", report.cached ? "CACHED SNAPSHOT" : "FRESHLY PRINTED"],
              ].map(([k, v]) => (
                <Box key={k}>
                  <Typography className="jee-mono" sx={{ fontSize: "0.56rem", fontWeight: 700, letterSpacing: "0.16em", color: SOFT }}>
                    {k}
                  </Typography>
                  <Typography className="jee-mono" sx={{ fontSize: "0.68rem", fontWeight: 700, mt: 0.25 }}>
                    {v}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        </Box>

        {/* 01 · summary */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="01" section="Summary" title="The preparation at a glance" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "repeat(4, 1fr)" }, gap: 1.5 }}>
            <Stat label="Study time · 365d" value={fmtHours(d.summary.totalStudyMinutes)} sub={`${fmtHours(d.summary.last30Minutes)} in the last 30 days`} />
            <Stat label="Questions solved" value={d.summary.totalQuestions.toLocaleString("en-IN")} sub={d.summary.accuracyAll != null ? `${d.summary.accuracyAll}% accuracy overall` : "No accuracy data"} />
            <Stat label="Accuracy · 30d" value={d.summary.accuracy30 != null ? `${d.summary.accuracy30}%` : "—"} sub="Correct ÷ attempted" />
            <Stat label="Mock average" value={d.mocks.avgScore != null ? `${d.mocks.avgScore}%` : "—"} sub={`${d.mocks.count} test${d.mocks.count === 1 ? "" : "s"} on record`} />
            <Stat label="Current streak" value={`${d.summary.currentStreak}d`} sub={`Longest ${d.summary.longestStreak}d`} accent />
            <Stat label="Consistency · 30d" value={`${d.summary.consistency}%`} sub="Days with study logged" />
            <Stat label="Chapters completed" value={`${d.summary.chaptersCompleted}/${d.summary.chaptersTotal}`} sub={`${d.summary.chaptersTouched} in progress`} />
            <Stat label="Revisions due" value={`${d.revision.dueCount}`} sub={d.revision.overdueCount > 0 ? `${d.revision.overdueCount} overdue` : "Nothing overdue"} />
          </Box>
        </Box>

        {/* 02 · syllabus */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="02" section="Syllabus" title="Subject-by-subject standing" />
          <Stack spacing={2.5}>
            {d.subjects.map((s) => {
              const bean = SUBJECT_COLORS[s.subject] ?? J.bean.bubblegum;
              return (
                <Box key={s.subject} className="jee-tile" sx={{ p: 2, border: "1px solid", borderColor: HAIR, bgcolor: CARD, ...inkShadow }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="baseline" sx={{ mb: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box className="jee-bean-el" style={beanVars(bean)} sx={{ width: 10, height: 10, borderRadius: 999 }} aria-hidden />
                      <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "1.02rem", color: INK }}>{s.subject}</Typography>
                    </Stack>
                    <Typography className="jee-mono jee-num" sx={{ fontSize: "0.7rem", fontWeight: 700 }}>
                      {s.progressPct}% COMPLETE
                    </Typography>
                  </Stack>
                  <Bar pct={s.progressPct} bean={bean} />
                  <Typography className="jee-mono jee-num" sx={{ mt: 1.25, fontSize: "0.62rem", fontWeight: 600, letterSpacing: "0.06em", color: SOFT }}>
                    {["mastered", "completed", "learning", "not_started"].map((k) => `${k === "not_started" ? "NOT STARTED" : k.toUpperCase()} ${s.statusCounts[k] ?? 0}`).join("  ·  ")}
                    {`  ·  ${fmtHours(s.minutes)} LOGGED  ·  ${s.questions.toLocaleString("en-IN")} QUESTIONS`}
                    {s.accuracy != null ? `  ·  ACCURACY ${s.accuracy}%` : ""}
                  </Typography>
                  {s.weak.length > 0 && (
                    <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: SOFT }}>
                      Weak chapters: {s.weak.map((w) => `${w.name} (${w.accuracy}%)`).join(" · ")}
                    </Typography>
                  )}
                </Box>
              );
            })}
          </Stack>
        </Box>

        {/* 03 · mock tests */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="03" section="Mock tests" title="Mock forensics" />
          {d.mocks.count === 0 ? (
            <Typography variant="body2" sx={{ color: SOFT }}>
              No mock tests on record — the forensics section opens with your first attempt.
            </Typography>
          ) : (
            <Box className="jee-tile" sx={{ border: "1px solid", borderColor: HAIR, bgcolor: CARD, p: 2, ...inkShadow }}>
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5, flexWrap: "wrap", gap: 1 }}>
                <Typography className="jee-mono" sx={{ fontSize: "0.64rem", fontWeight: 700, letterSpacing: "0.12em", color: SOFT }}>
                  {`TREND ${d.mocks.trend.toUpperCase()}  ·  BEST PERCENTILE ${d.mocks.bestPercentile ?? "—"}`}
                </Typography>
                <Box aria-hidden className="jee-stamp jee-ink-el" style={beanVars(d.mocks.trend === "down" ? J.bean.cherry : J.bean.mint)} sx={{ fontSize: "0.54rem" }}>
                  {d.mocks.trend === "up" ? "Trending up" : d.mocks.trend === "down" ? "Trending down" : "Holding flat"}
                </Box>
              </Stack>
              <Box sx={{ overflowX: "auto" }}>
                <table className="jee-num" style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8125rem" }}>
                  <thead>
                    <tr style={{ textAlign: "left" }}>
                      {["Test", "Date", "Score", "Percentile", "Accuracy"].map((h) => (
                        <th key={h} style={{ padding: "6px 12px 6px 0", fontWeight: 700, textTransform: "uppercase", fontSize: "0.64rem", letterSpacing: "0.07em", color: SOFT }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {d.mocks.recent.map((t) => (
                      <tr key={t.name + t.date} style={{ borderTop: `1px solid ${HAIR}` }}>
                        <td style={{ padding: "8px 12px 8px 0", fontWeight: 600 }}>{t.name}</td>
                        <td style={{ padding: "8px 12px 8px 0", color: SOFT }}>{fmtDate(t.date)}</td>
                        <td style={{ padding: "8px 12px 8px 0" }}>{t.scorePct}%</td>
                        <td style={{ padding: "8px 12px 8px 0" }}>{t.percentile ?? "—"}</td>
                        <td style={{ padding: "8px 12px 8px 0" }}>{t.accuracy != null ? `${t.accuracy}%` : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
            </Box>
          )}
        </Box>

        {/* 04 · priorities */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="04" section="Priority engine" title="What to study next" />
          {d.priorities.length === 0 ? (
            <Typography variant="body2" sx={{ color: SOFT }}>Mark chapters in the syllabus to get recommendations.</Typography>
          ) : (
            <Stack spacing={1.25}>
              {d.priorities.map((p, i) => (
                <Stack key={p.name} direction="row" spacing={1.5} alignItems="baseline">
                  <Typography className="jee-mono jee-num" sx={{ fontSize: "0.66rem", fontWeight: 700, color: SOFT, width: 18 }}>
                    {String(i + 1).padStart(2, "0")}
                  </Typography>
                  <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: "wrap", gap: 0.5 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: INK }}>{p.name}</Typography>
                      <Typography className="jee-mono jee-pill jee-ink-el" style={beanVars(priorityBean[p.priority] ?? J.bean.sky)} sx={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.1em", border: "1px solid currentColor", borderRadius: 999, px: 0.75, py: "1px" }}>
                        {p.priority.toUpperCase()}
                      </Typography>
                    </Stack>
                    <Typography variant="caption" sx={{ color: SOFT }}>{p.reason}</Typography>
                  </Box>
                </Stack>
              ))}
            </Stack>
          )}
        </Box>

        {/* 05 · insights */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="05" section="Insights" title="What the numbers say" />
          {d.insights.length === 0 ? (
            <Typography variant="body2" sx={{ color: SOFT }}>Not enough data yet — insights appear as you log work.</Typography>
          ) : (
            <Stack spacing={1}>
              {d.insights.map((i) => {
                const bean = insightBean[i.kind] ?? J.bean.sky;
                return (
                  <Stack key={i.text} direction="row" spacing={1.25} alignItems="baseline">
                    <Box className="jee-bean-el" style={beanVars(bean)} sx={{ width: 8, height: 8, borderRadius: 999, flexShrink: 0, transform: "translateY(-1px)" }} aria-hidden />
                    <Typography variant="body2">{i.text}</Typography>
                  </Stack>
                );
              })}
            </Stack>
          )}
        </Box>

        {/* 06 · revision & mistakes */}
        <Box sx={{ mt: 4 }}>
          <SectionHead index="06" section="Loose ends" title="Revisions & the mistake ledger" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.5 }}>
            <Box className="jee-tile" sx={{ p: 2, border: "1px solid", borderColor: HAIR, bgcolor: CARD, ...inkShadow }}>
              <Typography className="jee-mono" sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", color: SOFT, mb: 1 }}>
                REVISION QUEUE
              </Typography>
              {d.revision.upcoming.length === 0 ? (
                <Typography variant="body2" sx={{ color: SOFT }}>Nothing scheduled — clear run.</Typography>
              ) : (
                <Stack spacing={0.75}>
                  {d.revision.upcoming.map((r) => (
                    <Stack key={r.chapter + r.topic} direction="row" justifyContent="space-between" spacing={1}>
                      <Typography variant="body2" sx={{ fontWeight: 600, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {r.chapter}
                        <Typography component="span" variant="caption" sx={{ ml: 0.5, color: SOFT }}>{r.topic}</Typography>
                      </Typography>
                      <Typography className="jee-mono jee-num" variant="caption" sx={{ color: SOFT, flexShrink: 0 }}>
                        {fmtDate(r.dueAt)}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              )}
            </Box>
            <Box className="jee-tile" sx={{ p: 2, border: "1px solid", borderColor: HAIR, bgcolor: CARD, ...inkShadow }}>
              <Typography className="jee-mono" sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.14em", color: SOFT, mb: 1 }}>
                MISTAKE LEDGER · {d.mistakes.total} ON FILE{d.mistakes.open > 0 ? ` · ${d.mistakes.open} OPEN` : ""}
              </Typography>
              {d.mistakes.byType.length === 0 ? (
                <Typography variant="body2" sx={{ color: SOFT }}>No mistakes recorded — either perfect or unexamined.</Typography>
              ) : (
                <Stack spacing={1}>
                  {d.mistakes.byType.slice(0, 5).map((m) => (
                    <Box key={m.type}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="caption" sx={{ fontWeight: 600, color: INK }}>{m.type.replace(/_/g, " ")}</Typography>
                        <Typography className="jee-mono jee-num" variant="caption" sx={{ color: SOFT }}>{m.count}</Typography>
                      </Stack>
                      <Box className="jee-track" sx={{ height: 5, borderRadius: 999, bgcolor: TRACK, mt: 0.25 }}>
                        <Box className="jee-bean-el" style={beanVars(J.bean.cherry)} sx={{ height: "100%", width: `${(m.count / maxMistake) * 100}%`, borderRadius: 999 }} />
                      </Box>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          </Box>
        </Box>

        {/* colophon */}
        <Box sx={{ mt: 4, mb: 2, pt: 2, borderTop: "1px dashed", borderColor: HAIR, "@media print": { pageBreakInside: "avoid" } }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ flexWrap: "wrap", gap: 1.5 }}>
            <Typography className="jee-mono" sx={{ fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.14em", color: SOFT }}>
              {`PRINTED ${fmtDate(report.generatedAt).toUpperCase()} · VALID ${REPORT_TTL_DAYS} DAYS · JOULE — WORK, MEASURED.`}
            </Typography>
            <Box aria-hidden className="jee-barcode" sx={{ width: 90, height: 22, color: INK, opacity: 0.5 }} />
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
