import path from "node:path";
import { Font, Page, Text, View, Document, StyleSheet, renderToBuffer } from "@react-pdf/renderer";
import type { ReportSnapshot } from "@/lib/report";
import { J, SUBJECT_COLORS } from "@/lib/jellybeans";

/**
 * The preparation report as an engine-generated PDF — permanently set in the
 * dark "licorice" dossier palette regardless of the reader's app theme:
 * licorice paper, bone ink, pastel bean accents, mono kickers, dashed tear
 * rules and a drawn barcode. Layout engine: @react-pdf/renderer (yoga).
 */

const INK = J.boneDark; // #DED5C6
const PAPER = J.paperDark; // #0A0908
const CARD = J.cardDark; // #151310
const SOFT = "rgba(222,213,198,0.64)";
const HAIR = "rgba(223,214,198,0.16)";
const HAIR_STRONG = "rgba(223,214,198,0.32)";
const TRACK = "rgba(222,213,198,0.10)";

const FONT_DIR = path.join(process.cwd(), "public", "fonts");
let fontsReady = false;
function ensureFonts() {
  if (fontsReady) return;
  Font.register({
    family: "SpaceGrotesk",
    fonts: [
      { src: path.join(FONT_DIR, "SpaceGrotesk-Medium.ttf"), fontWeight: 500 },
      { src: path.join(FONT_DIR, "SpaceGrotesk-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "JetBrainsMono",
    fonts: [
      { src: path.join(FONT_DIR, "JetBrainsMono-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "JetBrainsMono-Bold.ttf"), fontWeight: 700 },
    ],
  });
  Font.register({
    family: "Inter",
    fonts: [
      { src: path.join(FONT_DIR, "Inter-Regular.ttf"), fontWeight: 400 },
      { src: path.join(FONT_DIR, "Inter-SemiBold.ttf"), fontWeight: 600 },
    ],
  });
  fontsReady = true;
}

const s = StyleSheet.create({
  page: { backgroundColor: PAPER, paddingTop: 34, paddingBottom: 52, paddingHorizontal: 38, fontFamily: "Inter", fontSize: 9, color: INK },
  footer: { position: "absolute", bottom: 26, left: 38, right: 38, flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: HAIR, paddingTop: 6, fontFamily: "JetBrainsMono", fontSize: 6, color: SOFT, letterSpacing: 1.6 },
  masthead: { backgroundColor: CARD, borderWidth: 1.5, borderColor: HAIR_STRONG, borderRadius: 2, padding: 18, position: "relative" },
  brandRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  brandMark: { width: 24, height: 24, borderRadius: 3, backgroundColor: J.bean.bubblegum.fill, alignItems: "center", justifyContent: "center", marginRight: 8 },
  brandLetter: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 15, color: "#221F1A" },
  brandWord: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 10, letterSpacing: 2.2 },
  barcodeRow: { position: "absolute", top: 18, right: 18, alignItems: "flex-end" },
  editionTag: { fontFamily: "JetBrainsMono", fontSize: 6, color: SOFT, letterSpacing: 1.6, marginTop: 4 },
  title: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 27, letterSpacing: -0.5, color: INK },
  candidate: { fontFamily: "Inter", fontSize: 9.5, color: SOFT, marginTop: 5 },
  metaRow: { flexDirection: "row", marginTop: 12, paddingTop: 10, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: HAIR_STRONG, gap: 26 },
  metaLabel: { fontFamily: "JetBrainsMono", fontSize: 6, color: SOFT, letterSpacing: 1.4 },
  metaValue: { fontFamily: "JetBrainsMono", fontSize: 7.5, fontWeight: 700, color: INK, marginTop: 2 },
  stamp: { position: "absolute", bottom: 12, right: 14, borderWidth: 1.2, borderStyle: "solid", borderRadius: 2, paddingHorizontal: 6, paddingVertical: 3, fontFamily: "JetBrainsMono", fontWeight: 700, fontSize: 6.5, letterSpacing: 1.6, transform: "rotate(-4deg)" },
  sec: { marginTop: 22 },
  secKickerRow: { flexDirection: "row", alignItems: "center", marginBottom: 4, gap: 5 },
  secDot: { width: 6, height: 6, borderRadius: 3 },
  secKicker: { fontFamily: "JetBrainsMono", fontSize: 6.5, fontWeight: 700, letterSpacing: 2, color: SOFT },
  secTitle: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 14.5, letterSpacing: -0.2, marginBottom: 8 },
  tear: { borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: HAIR, marginBottom: 10 },
  tile: { width: "24%", backgroundColor: CARD, borderWidth: 1, borderColor: HAIR, borderRadius: 2, padding: 9, marginBottom: 8 },
  tileLabel: { fontFamily: "JetBrainsMono", fontSize: 5.8, fontWeight: 700, letterSpacing: 1, color: SOFT, textTransform: "uppercase" },
  tileValue: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 15.5, color: INK, marginTop: 4 },
  tileSub: { fontFamily: "Inter", fontSize: 6.8, color: SOFT, marginTop: 2 },
  card: { backgroundColor: CARD, borderWidth: 1, borderColor: HAIR, borderRadius: 2, padding: 12, marginBottom: 8 },
  subjectRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 6 },
  subjectDot: { width: 7, height: 7, borderRadius: 4 },
  subjectName: { fontFamily: "SpaceGrotesk", fontWeight: 700, fontSize: 10.5 },
  subjectPct: { fontFamily: "JetBrainsMono", fontSize: 7.5, fontWeight: 700, marginLeft: "auto" },
  track: { height: 5, borderRadius: 999, backgroundColor: TRACK },
  statsLine: { fontFamily: "JetBrainsMono", fontSize: 6.2, color: SOFT, marginTop: 7, letterSpacing: 0.4 },
  weakLine: { fontFamily: "Inter", fontSize: 7.5, color: SOFT, marginTop: 4 },
  tableHead: { flexDirection: "row", paddingBottom: 4, borderBottomWidth: 1, borderBottomColor: HAIR_STRONG },
  th: { fontFamily: "JetBrainsMono", fontSize: 6, fontWeight: 700, letterSpacing: 1, color: SOFT, textTransform: "uppercase" },
  tr: { flexDirection: "row", paddingTop: 5, paddingBottom: 5, borderBottomWidth: 1, borderBottomColor: HAIR },
  td: { fontFamily: "Inter", fontSize: 8, color: INK },
  tdDim: { fontFamily: "Inter", fontSize: 8, color: SOFT },
  pill: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 5, paddingVertical: 1.5, fontFamily: "JetBrainsMono", fontSize: 5.8, fontWeight: 700, letterSpacing: 1 },
  prioRow: { flexDirection: "row", gap: 8, marginBottom: 7, alignItems: "baseline" },
  prioIndex: { fontFamily: "JetBrainsMono", fontSize: 6.5, fontWeight: 700, color: SOFT },
  prioName: { fontFamily: "Inter", fontWeight: 600, fontSize: 8.8, color: INK },
  prioReason: { fontFamily: "Inter", fontSize: 7, color: SOFT, marginTop: 1 },
  insightRow: { flexDirection: "row", gap: 7, marginBottom: 5, alignItems: "center" },
  insightDot: { width: 5, height: 5, borderRadius: 3 },
  insightText: { fontFamily: "Inter", fontSize: 8.3, color: INK, flex: 1 },
  emptyText: { fontFamily: "Inter", fontSize: 8.3, color: SOFT },
  colophon: { marginTop: 20, paddingTop: 10, borderTopWidth: 1, borderTopStyle: "dashed", borderTopColor: HAIR, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  colophonText: { fontFamily: "JetBrainsMono", fontSize: 5.8, color: SOFT, letterSpacing: 1.2 },
});

/** Deterministic pseudo-barcode drawn from a seed string. */
function BarcodeStrip({ seed, height = 22 }: { seed: string; height?: number }) {
  const bars: { w: number; gap: number }[] = [];
  let acc = 0;
  for (let i = 0; i < seed.length; i++) acc = (acc * 31 + seed.charCodeAt(i)) >>> 0;
  for (let i = 0; i < 26; i++) {
    acc = (acc * 1103515245 + 12345) >>> 0;
    bars.push({ w: 1 + (acc % 3), gap: 1 + ((acc >> 3) % 2) });
  }
  return (
    <View style={{ height, flexDirection: "row", alignItems: "stretch" }}>
      {bars.map((b, i) => (
        <View key={i} style={{ width: b.w, marginRight: b.gap, backgroundColor: INK }} />
      ))}
    </View>
  );
}

const fmtHours = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
};
const fmtDate = (iso: string | Date) =>
  new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

const priorityBean: Record<string, { fill: string }> = { high: J.bean.cherry, medium: J.bean.lemon, low: J.bean.mint };
const insightBean: Record<string, { fill: string }> = { positive: J.bean.mint, warning: J.bean.cherry, info: J.bean.sky };

function SectionHead({ index, section, title }: { index: string; section: string; title: string }) {
  return (
    <View style={s.sec} wrap={false}>
      <View style={s.secKickerRow}>
        <View style={[s.secDot, { backgroundColor: J.bean.bubblegum.fill }]} />
        <Text style={s.secKicker}>{`${index} // ${section}`}</Text>
      </View>
      <Text style={s.secTitle}>{title}</Text>
      <View style={s.tear} />
    </View>
  );
}

function Stat({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: boolean }) {
  const accentStyle = accent ? { backgroundColor: J.bean.bubblegum.fill, borderColor: "#221F1A" } : {};
  const accentText = accent ? { color: "#221F1A" } : {};
  const accentSoft = accent ? { color: "rgba(34,31,26,0.72)" } : {};
  return (
    <View style={[s.tile, accentStyle]} wrap={false}>
      <Text style={[s.tileLabel, accentSoft]}>{label}</Text>
      <Text style={[s.tileValue, accentText]}>{value}</Text>
      {sub ? <Text style={[s.tileSub, accent ? { color: "rgba(34,31,26,0.76)" } : {}]}>{sub}</Text> : null}
    </View>
  );
}

export type ReportPdfMeta = {
  generatedAt: string;
  validUntil: string;
  cached: boolean;
  ttlDays: number;
};

function ReportPdfDocument({ d, meta }: { d: ReportSnapshot; meta: ReportPdfMeta }) {
  const gen = new Date(meta.generatedAt);
  const dayOfYear = Math.floor((gen.getTime() - new Date(gen.getFullYear(), 0, 0).getTime()) / 86400000);
  const edition = `ED. ${gen.getFullYear()}.${String(dayOfYear).padStart(3, "0")}`;
  const examLabel = { main: "JEE MAIN", advanced: "JEE ADVANCED", both: "JEE MAIN + ADVANCED" }[d.target.exam] ?? "JEE";
  const maxMistake = Math.max(1, ...d.mistakes.byType.map((m) => m.count));

  return (
    <Document
      title="Joule — Preparation Report"
      author="Joule"
      subject={`${d.candidate.name} · ${examLabel} ${d.target.year}`}
    >
      <Page size="A4" style={s.page}>
        <Text style={s.footer} fixed render={({ pageNumber }: { pageNumber: number }) =>
          `JOULE — PREP DOSSIER${" ".repeat(4)}SHEET ${pageNumber}`
        } />
        {/* masthead */}
        <View style={s.masthead} wrap={false}>
          <View style={s.brandRow}>
            <View style={s.brandMark}><Text style={s.brandLetter}>J</Text></View>
            <Text style={s.brandWord}>JOULE</Text>
          </View>
          <View style={{ position: "absolute", top: 18, right: 18, alignItems: "flex-end" }}>
            <BarcodeStrip seed={edition + d.candidate.email} />
            <Text style={s.editionTag}>{edition}</Text>
          </View>
          <Text style={s.title}>Preparation report</Text>
          <Text style={s.candidate}>{`${d.candidate.name} · ${examLabel} ${d.target.year} · ${d.target.prepLevel} track`}</Text>
          <View style={s.metaRow}>
            {([
              ["GENERATED", fmtDate(meta.generatedAt)],
              ["VALID THRU", fmtDate(meta.validUntil)],
              ["CACHE", `${meta.ttlDays} DAYS`],
              ["SOURCE", meta.cached ? "CACHED SNAPSHOT" : "FRESHLY PRINTED"],
            ] as const).map(([k, v]) => (
              <View key={k}>
                <Text style={s.metaLabel}>{k}</Text>
                <Text style={s.metaValue}>{v}</Text>
              </View>
            ))}
          </View>
          <View style={[s.stamp, { color: J.bean.bubblegum.fill, borderColor: J.bean.bubblegum.fill }]}>
            <Text style={{ fontFamily: "JetBrainsMono", fontWeight: 700, fontSize: 6.5, letterSpacing: 1.6, color: J.bean.bubblegum.fill }}>ON RECORD</Text>
          </View>
        </View>

        {/* 01 · summary */}
        <SectionHead index="01" section="Summary" title="The preparation at a glance" />
        <View style={{ flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" }}>
          <Stat label="Study time · 365d" value={fmtHours(d.summary.totalStudyMinutes)} sub={`${fmtHours(d.summary.last30Minutes)} last 30 days`} />
          <Stat label="Questions solved" value={d.summary.totalQuestions.toLocaleString("en-IN")} sub={d.summary.accuracyAll != null ? `${d.summary.accuracyAll}% accuracy overall` : "No accuracy data"} />
          <Stat label="Accuracy · 30d" value={d.summary.accuracy30 != null ? `${d.summary.accuracy30}%` : "—"} sub="Correct ÷ attempted" />
          <Stat label="Mock average" value={d.mocks.avgScore != null ? `${d.mocks.avgScore}%` : "—"} sub={`${d.mocks.count} test${d.mocks.count === 1 ? "" : "s"} on record`} />
          <Stat label="Current streak" value={`${d.summary.currentStreak}d`} sub={`Longest ${d.summary.longestStreak}d`} accent />
          <Stat label="Consistency · 30d" value={`${d.summary.consistency}%`} sub="Days with study logged" />
          <Stat label="Chapters completed" value={`${d.summary.chaptersCompleted}/${d.summary.chaptersTotal}`} sub={`${d.summary.chaptersTouched} in progress`} />
          <Stat label="Revisions due" value={`${d.revision.dueCount}`} sub={d.revision.overdueCount > 0 ? `${d.revision.overdueCount} overdue` : "Nothing overdue"} />
        </View>

        {/* 02 · syllabus */}
        <SectionHead index="02" section="Syllabus" title="Subject-by-subject standing" />
        {d.subjects.map((subj) => {
          const bean = SUBJECT_COLORS[subj.subject] ?? J.bean.bubblegum;
          return (
            <View key={subj.subject} style={s.card} wrap={false}>
              <View style={s.subjectRow}>
                <View style={[s.subjectDot, { backgroundColor: bean.fill }]} />
                <Text style={s.subjectName}>{subj.subject}</Text>
                <Text style={s.subjectPct}>{`${subj.progressPct}% COMPLETE`}</Text>
              </View>
              <View style={s.track}>
                <View style={{ width: `${Math.min(100, subj.progressPct)}%`, height: "100%", borderRadius: 999, backgroundColor: bean.fill }} />
              </View>
              <Text style={s.statsLine}>
                {["mastered", "completed", "learning", "not_started"].map((k) => `${k === "not_started" ? "NOT STARTED" : k.toUpperCase()} ${subj.statusCounts[k] ?? 0}`).join("  ·  ")}
                {`  ·  ${fmtHours(subj.minutes)} LOGGED  ·  ${subj.questions.toLocaleString("en-IN")} QUESTIONS${subj.accuracy != null ? `  ·  ACCURACY ${subj.accuracy}%` : ""}`}
              </Text>
              {subj.weak.length > 0 ? (
                <Text style={s.weakLine}>
                  {`Weak chapters: ${subj.weak.map((w) => `${w.name} (${w.accuracy}%)`).join(" · ")}`}
                </Text>
              ) : null}
            </View>
          );
        })}

        {/* 03 · mock tests */}
        <SectionHead index="03" section="Mock tests" title="Mock forensics" />
        {d.mocks.count === 0 ? (
          <Text style={s.emptyText}>No mock tests on record — the forensics section opens with your first attempt.</Text>
        ) : (
          <View style={s.card} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <Text style={s.statsLine}>{`TREND ${d.mocks.trend.toUpperCase()}  ·  BEST PERCENTILE ${d.mocks.bestPercentile ?? "—"}  ·  ${d.mocks.count} TESTS`}</Text>
              <View style={[s.pill, { color: d.mocks.trend === "down" ? J.bean.cherry.fill : J.bean.mint.fill, borderColor: d.mocks.trend === "down" ? J.bean.cherry.fill : J.bean.mint.fill }]}>
                <Text style={{ fontFamily: "JetBrainsMono", fontWeight: 700, fontSize: 5.8, letterSpacing: 1, color: d.mocks.trend === "down" ? J.bean.cherry.fill : J.bean.mint.fill }}>
                  {d.mocks.trend === "up" ? "TRENDING UP" : d.mocks.trend === "down" ? "TRENDING DOWN" : "HOLDING FLAT"}
                </Text>
              </View>
            </View>
            <View style={s.tableHead}>
              {([["Test", "34%"], ["Date", "18%"], ["Score", "16%"], ["Percentile", "16%"], ["Accuracy", "16%"]] as const).map(([h, w]) => (
                <Text key={h} style={[s.th, { width: w }]}>{h}</Text>
              ))}
            </View>
            {d.mocks.recent.map((t) => (
              <View key={t.name + t.date} style={s.tr} wrap={false}>
                <Text style={[s.td, { width: "34%", fontWeight: 600 }]}>{t.name}</Text>
                <Text style={[s.tdDim, { width: "18%" }]}>{fmtDate(t.date)}</Text>
                <Text style={[s.td, { width: "16%" }]}>{`${t.scorePct}%`}</Text>
                <Text style={[s.td, { width: "16%" }]}>{t.percentile != null ? String(t.percentile) : "—"}</Text>
                <Text style={[s.td, { width: "16%" }]}>{t.accuracy != null ? `${t.accuracy}%` : "—"}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 04 · priorities */}
        <SectionHead index="04" section="Priority engine" title="What to study next" />
        {d.priorities.length === 0 ? (
          <Text style={s.emptyText}>Mark chapters in the syllabus to get recommendations.</Text>
        ) : (
          d.priorities.map((p, i) => {
            const bean = priorityBean[p.priority] ?? J.bean.sky;
            return (
              <View key={p.name} style={s.prioRow} wrap={false}>
                <Text style={s.prioIndex}>{String(i + 1).padStart(2, "0")}</Text>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <Text style={s.prioName}>{p.name}</Text>
                    <View style={[s.pill, { borderColor: bean.fill }]}>
                      <Text style={{ fontFamily: "JetBrainsMono", fontWeight: 700, fontSize: 5.8, letterSpacing: 1, color: bean.fill }}>{p.priority.toUpperCase()}</Text>
                    </View>
                  </View>
                  <Text style={s.prioReason}>{p.reason}</Text>
                </View>
              </View>
            );
          })
        )}

        {/* 05 · insights */}
        <SectionHead index="05" section="Insights" title="What the numbers say" />
        {d.insights.length === 0 ? (
          <Text style={s.emptyText}>Not enough data yet — insights appear as you log work.</Text>
        ) : (
          d.insights.map((i) => {
            const bean = insightBean[i.kind] ?? J.bean.sky;
            return (
              <View key={i.text} style={s.insightRow} wrap={false}>
                <View style={[s.insightDot, { backgroundColor: bean.fill }]} />
                <Text style={s.insightText}>{i.text}</Text>
              </View>
            );
          })
        )}

        {/* 06 · loose ends */}
        <SectionHead index="06" section="Loose ends" title="Revisions & the mistake ledger" />
        <View style={{ flexDirection: "row", gap: 8 }}>
          <View style={[s.card, { flex: 1, marginBottom: 0 }]} wrap={false}>
            <Text style={s.tileLabel}>REVISION QUEUE</Text>
            {d.revision.upcoming.length === 0 ? (
              <Text style={[s.emptyText, { marginTop: 6 }]}>Nothing scheduled — clear run.</Text>
            ) : (
              d.revision.upcoming.map((r) => (
                <View key={r.chapter + r.topic} style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 5 }} wrap={false}>
                  <Text style={{ fontFamily: "Inter", fontSize: 8, fontWeight: 600, color: INK, flex: 1, paddingRight: 6 }}>
                    {r.chapter}
                    <Text style={{ fontFamily: "Inter", fontSize: 7, color: SOFT }}>{`  ${r.topic}`}</Text>
                  </Text>
                  <Text style={{ fontFamily: "JetBrainsMono", fontSize: 6.5, color: SOFT }}>{fmtDate(r.dueAt)}</Text>
                </View>
              ))
            )}
          </View>
          <View style={[s.card, { flex: 1, marginBottom: 0 }]} wrap={false}>
            <Text style={s.tileLabel}>{`MISTAKE LEDGER · ${d.mistakes.total} ON FILE${d.mistakes.open > 0 ? ` · ${d.mistakes.open} OPEN` : ""}`}</Text>
            {d.mistakes.byType.length === 0 ? (
              <Text style={[s.emptyText, { marginTop: 6 }]}>No mistakes recorded — either perfect or unexamined.</Text>
            ) : (
              d.mistakes.byType.slice(0, 5).map((m) => (
                <View key={m.type} style={{ marginTop: 5 }} wrap={false}>
                  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text style={{ fontFamily: "Inter", fontSize: 7, fontWeight: 600, color: INK }}>{m.type.replace(/_/g, " ")}</Text>
                    <Text style={{ fontFamily: "JetBrainsMono", fontSize: 6.5, color: SOFT }}>{String(m.count)}</Text>
                  </View>
                  <View style={[s.track, { height: 3.5, marginTop: 2 }]}>
                    <View style={{ width: `${(m.count / maxMistake) * 100}%`, height: "100%", borderRadius: 999, backgroundColor: J.bean.cherry.fill }} />
                  </View>
                </View>
              ))
            )}
          </View>
        </View>

        {/* colophon */}
        <View style={s.colophon} wrap={false}>
          <Text style={s.colophonText}>{`PRINTED ${fmtDate(meta.generatedAt).toUpperCase()} · VALID ${meta.ttlDays} DAYS · JOULE — WORK, MEASURED.`}</Text>
          <BarcodeStrip seed={edition + d.candidate.name} height={12} />
        </View>
      </Page>
    </Document>
  );
}

export async function renderReportPdf(data: ReportSnapshot, meta: ReportPdfMeta): Promise<Uint8Array> {
  ensureFonts();
  const buffer = await renderToBuffer(<ReportPdfDocument d={data} meta={meta} />);
  return new Uint8Array(buffer);
}
