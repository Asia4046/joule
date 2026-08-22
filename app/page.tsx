import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ScienceOutlinedIcon from "@mui/icons-material/ScienceOutlined";
import InsightsOutlinedIcon from "@mui/icons-material/InsightsOutlined";
import BugReportOutlinedIcon from "@mui/icons-material/BugReportOutlined";
import AutorenewOutlinedIcon from "@mui/icons-material/AutorenewOutlined";
import MapOutlinedIcon from "@mui/icons-material/MapOutlined";
import EventNoteOutlinedIcon from "@mui/icons-material/EventNoteOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { getSessionUser } from "@/lib/auth";
import { CONCEPT_CONTENT } from "@/lib/concept-content";
import { SIM_REGISTRY } from "@/components/concepts/sims";
import { J, withA, type BeanName } from "@/lib/jellybeans";

export const dynamic = "force-dynamic";

// The dossier is always printed on licorice — bone ink, jelly accents.
const PAPER = J.paperDark;
const CARD = "#131110";
const INK = J.boneDark;
const INK_MID = "rgba(222,213,198,0.64)";
const INK_DIM = "rgba(222,213,198,0.42)";
const HAIR = "rgba(222,213,198,0.16)";
const HAIR_STRONG = "rgba(222,213,198,0.32)";
const bean = (n: BeanName) => J.bean[n];

const FEATURES: { icon: typeof ScienceOutlinedIcon; tint: BeanName; title: string; copy: string }[] = [
  {
    icon: ScienceOutlinedIcon,
    tint: "sky",
    title: "Concept Labs",
    copy: "Every major chapter ships with an interactive simulation — ray benches, orbital slices, collision tracks — built to make the formula feel obvious before you memorise it.",
  },
  {
    icon: InsightsOutlinedIcon,
    tint: "mint",
    title: "Mock-test forensics",
    copy: "Score, accuracy, attempt speed and silly-mistake rate, sliced by chapter and topic. Know exactly which 4 chapters cost you the last 20 marks.",
  },
  {
    icon: BugReportOutlinedIcon,
    tint: "cherry",
    title: "Mistake ledger",
    copy: "Wrong answers get logged with the reason you got them wrong — concept gap, calculation slip, or misread — and come back to haunt you until you fix them.",
  },
  {
    icon: AutorenewOutlinedIcon,
    tint: "lemon",
    title: "Spaced revision engine",
    copy: "A revision queue that resurfaces notes and questions at expanding intervals, weighted by JEE weightage and your own accuracy history.",
  },
  {
    icon: MapOutlinedIcon,
    tint: "lavender",
    title: "Syllabus map",
    copy: "The full Physics and Chemistry syllabus, tracked chapter by chapter with Main and Advanced weightage — so study time follows marks, not vibes.",
  },
  {
    icon: EventNoteOutlinedIcon,
    tint: "bubblegum",
    title: "Planning suite",
    copy: "Study sessions, goals with deadlines, a journal and a calendar that talks to all of it. The system thinks about tomorrow so you can think about torque.",
  },
];

const JAR: BeanName[] = ["bubblegum", "mint", "lemon", "sky", "lavender", "tangerine", "cherry", "lime"];

/** Split dossier button — label cell + arrow cell, divided by a hairline. */
function SplitButton({ href, children, primary = false }: { href: string; children: string; primary?: boolean }) {
  const b = bean("bubblegum");
  return (
    <Box
      component="a"
      href={href}
      className="root"
      sx={{
        display: "inline-flex",
        alignItems: "stretch",
        height: 46,
        textDecoration: "none",
        ...(primary
          ? {
              background: b.fill,
              color: "#221F1A",
              border: `1px solid ${b.fill}`,
              "&:hover": { boxShadow: `4px 4px 0 ${withA(b.fill, 0.45)}`, transform: "translate(-1px,-1px)" },
              "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
            }
          : {
              background: "transparent",
              color: INK,
              border: `1px solid ${HAIR_STRONG}`,
              "&:hover": { borderColor: INK, bgcolor: withA(INK, 0.06), transform: "translate(-1px,-1px)", boxShadow: `4px 4px 0 rgba(0,0,0,0.6)` },
              "&:active": { transform: "translate(1px,1px)", boxShadow: "none" },
            }),
        transition: "transform .15s ease, box-shadow .15s ease, border-color .15s ease",
      }}
    >
      <Box sx={{ display: "inline-flex", alignItems: "center", px: 3, fontWeight: 700, fontSize: "0.92rem" }}>
        {children}
      </Box>
      <Box
        sx={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: 46,
          borderLeft: `1px solid ${primary ? "rgba(34,31,26,0.3)" : HAIR_STRONG}`,
          transition: "transform .2s ease",
          ".root:hover &": { transform: "translateX(2px)" },
        }}
      >
        <ArrowForwardIcon sx={{ fontSize: 18 }} />
      </Box>
    </Box>
  );
}

/** Numbered dossier section heading — "01 // FEATURES" in the section bean. */
function SectionHeading({ index, kicker, title, sub, tint = "bubblegum" }: { index: string; kicker: string; title: string; sub?: string; tint?: BeanName }) {
  const c = bean(tint).fill;
  return (
    <Stack spacing={1.5} sx={{ mb: { xs: 4, md: 6 }, maxWidth: 640 }}>
      <Stack direction="row" spacing={1.25} alignItems="center">
        <Box sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: c }} aria-hidden />
        <Typography className="jee-mono" sx={{ color: c, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
          {`${index} // ${kicker}`}
        </Typography>
      </Stack>
      <Typography className="jee-display" sx={{ fontSize: { xs: "1.7rem", md: "2.2rem" }, fontWeight: 700, letterSpacing: "-0.02em", color: INK, lineHeight: 1.15 }}>
        {title}
      </Typography>
      {sub && <Typography sx={{ color: INK_MID, fontSize: "1rem", lineHeight: 1.65 }}>{sub}</Typography>}
    </Stack>
  );
}

/** Mock dashboard preview — a distilled portrait of the real app, printed as a dossier plate. */
function ProductMock() {
  const bars = [38, 55, 42, 66, 58, 74, 62, 81, 70, 88, 79, 92];
  const sky = bean("sky").fill;
  const lemon = bean("lemon").fill;
  const bubblegum = bean("bubblegum").fill;
  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: "2px",
        border: `1px solid ${HAIR_STRONG}`,
        background: CARD,
        boxShadow: "10px 10px 0 rgba(0,0,0,0.7)",
        overflow: "hidden",
        mx: "auto",
        maxWidth: 920,
      }}
    >
      {/* window chrome */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 1.5, borderBottom: `1px solid ${HAIR}` }}>
        {[bean("cherry").fill, bean("lemon").fill, bean("mint").fill].map((c) => (
          <Box key={c} sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: c }} />
        ))}
        <Box sx={{ flexGrow: 1 }} />
        <Box className="jee-mono" sx={{ width: 190, height: 8, bgcolor: withA(INK, 0.12), mx: "auto" }} />
        <Box sx={{ flexGrow: 1 }} />
        <Typography className="jee-mono" sx={{ fontSize: "0.58rem", color: INK_DIM, letterSpacing: "0.14em" }}>
          PLATE 00
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "none", sm: "168px 1fr" } }}>
        {/* rail */}
        <Box sx={{ display: { xs: "none", sm: "block" }, borderRight: `1px solid ${HAIR}`, p: 2 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 2.5 }}>
            <Box
              sx={{
                width: 30,
                height: 30,
                borderRadius: "2px",
                background: bubblegum,
                border: `1.5px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography className="jee-display" sx={{ fontSize: "0.95rem", fontWeight: 700, color: "#221F1A", lineHeight: 1 }}>
                J
              </Typography>
            </Box>
            <Typography className="jee-display" sx={{ fontSize: "0.72rem", fontWeight: 700, color: INK, letterSpacing: "0.06em" }}>
              JEE COMMAND
            </Typography>
          </Stack>
          {["OVERVIEW", "PREP", "PRACTICE", "ANALYTICS", "PERSONAL", "SYSTEM"].map((s, i) => (
            <Box key={s} sx={{ display: "flex", alignItems: "center", gap: 1.25, px: 1, py: 0.85, mb: 0.5 }}>
              <Typography className="jee-mono" sx={{ fontSize: "0.58rem", color: i === 1 ? bubblegum : INK_DIM, fontWeight: 700 }}>
                {String(i + 1).padStart(2, "0")}
              </Typography>
              <Box
                sx={{
                  width: `${58 + (i % 3) * 16}%`,
                  height: 7,
                  bgcolor: i === 1 ? withA(INK, 0.72) : withA(INK, 0.16),
                }}
              />
            </Box>
          ))}
        </Box>
        {/* body */}
        <Box sx={{ p: { xs: 2, sm: 3 } }}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
            {[
              { label: "ACCURACY", value: "78.4%", delta: "+6.2 this month", tint: bean("mint").fill },
              { label: "STUDY TIME", value: "42h", delta: "this week", tint: bean("sky").fill },
              { label: "REVISION QUEUE", value: "17", delta: "due today", tint: bean("lemon").fill },
            ].map((s) => (
              <Box
                key={s.label}
                sx={{
                  flex: 1,
                  p: 2,
                  border: `1px solid ${HAIR}`,
                  bgcolor: withA(INK, 0.03),
                }}
              >
                <Typography className="jee-mono" sx={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.16em", color: s.tint }}>
                  {s.label}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="baseline" sx={{ mt: 0.75 }}>
                  <Typography className="jee-display jee-num" sx={{ fontSize: "1.55rem", fontWeight: 700, color: INK, lineHeight: 1 }}>
                    {s.value}
                  </Typography>
                  <Typography sx={{ fontSize: "0.66rem", color: INK_MID, fontWeight: 600 }}>{s.delta}</Typography>
                </Stack>
              </Box>
            ))}
          </Stack>
          {/* chart */}
          <Box sx={{ border: `1px solid ${HAIR}`, bgcolor: withA(INK, 0.02), p: 2.5, mb: 2.5 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
              <Typography sx={{ fontSize: "0.8rem", fontWeight: 600, color: INK }}>Mock test trajectory</Typography>
              <Stack direction="row" spacing={1.5}>
                {[sky, lemon].map((c, i) => (
                  <Stack key={c} direction="row" spacing={0.5} alignItems="center">
                    <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: c }} />
                    <Typography sx={{ fontSize: "0.62rem", color: INK_MID }}>{i === 0 ? "score" : "accuracy"}</Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Box
              component="svg"
              viewBox="0 0 480 150"
              sx={{ width: "100%", height: "auto", display: "block" }}
              aria-hidden
            >
              {[0, 1, 2, 3].map((i) => (
                <line key={i} x1="0" y1={12 + i * 42} x2="480" y2={12 + i * 42} stroke={HAIR} strokeWidth="1" />
              ))}
              <path
                d={`M0,${150 - bars[0]} ${bars.map((b, i) => `L${i * 43.6},${150 - b - 20}`).join(" ")} L480,150 L0,150 Z`}
                fill={withA(sky, 0.14)}
              />
              <path
                d={`M0,${130 - bars[0] * 0.4} ${bars.map((b, i) => `L${i * 43.6},${138 - b * 0.35}`).join(" ")}`}
                fill="none"
                stroke={lemon}
                strokeWidth="2"
                strokeLinecap="butt"
              />
              <path
                d={`M0,${150 - bars[0]} ${bars.map((b, i) => `L${i * 43.6},${150 - b - 20}`).join(" ")}`}
                fill="none"
                stroke={sky}
                strokeWidth="2.5"
                strokeLinecap="butt"
              />
              {bars.map((b, i) => (
                <circle key={i} cx={i * 43.6} cy={150 - b - 20} r={i === bars.length - 1 ? 4.5 : 2.5} fill={i === bars.length - 1 ? lemon : sky} />
              ))}
            </Box>
          </Box>
          {/* revision rows */}
          <Stack spacing={1.25}>
            {[
              { tag: "Rotational motion", due: "today", tint: bean("sky").fill, pct: 72 },
              { tag: "Chemical bonding", due: "tomorrow", tint: bean("mint").fill, pct: 45 },
              { tag: "Ray optics", due: "in 3 days", tint: bean("bubblegum").fill, pct: 30 },
            ].map((r) => (
              <Box key={r.tag} sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Box sx={{ width: 7, height: 7, borderRadius: 999, bgcolor: r.tint, flexShrink: 0 }} />
                <Typography sx={{ fontSize: "0.78rem", color: INK, width: 150, flexShrink: 0 }}>{r.tag}</Typography>
                <Box sx={{ flexGrow: 1, height: 5, borderRadius: 999, bgcolor: withA(INK, 0.12), overflow: "hidden" }}>
                  <Box sx={{ width: `${r.pct}%`, height: 1, borderRadius: 999, bgcolor: r.tint }} />
                </Box>
                <Typography className="jee-mono" sx={{ fontSize: "0.62rem", color: INK_MID, width: 72, textAlign: "right", flexShrink: 0 }}>
                  {r.due}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}

export default async function Landing() {
  const user = await getSessionUser();
  const labCount = Object.keys(CONCEPT_CONTENT).length;
  const simCount = Object.keys(SIM_REGISTRY).length;

  return (
    <Box
      component="article"
      sx={{
        minHeight: "100dvh",
        bgcolor: PAPER,
        color: INK,
        position: "relative",
        overflowX: "clip",
        "& a": { textDecoration: "none" },
      }}
    >
      {/* faint print grid */}
      <Box
        aria-hidden
        sx={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(${withA(INK, 0.05)} 1px, transparent 1px), linear-gradient(90deg, ${withA(INK, 0.05)} 1px, transparent 1px)`,
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(ellipse 90% 55% at 50% 0%, black 25%, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 55% at 50% 0%, black 25%, transparent 70%)",
        }}
      />

      {/* nav */}
      <Box
        component="header"
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          bgcolor: withA(PAPER, 0.82),
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${HAIR}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2} sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: 1.75 }}>
          <Stack direction="row" spacing={1.25} alignItems="center" component="a" href="/">
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: "2px",
                background: bean("bubblegum").fill,
                border: `1.5px solid ${INK}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "1.1rem", color: "#221F1A", lineHeight: 1 }}>
                J
              </Typography>
            </Box>
            <Box>
              <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.06em" }}>
                JEE COMMAND
              </Typography>
              <Typography className="jee-mono" sx={{ fontSize: "0.56rem", letterSpacing: "0.22em", color: INK_DIM, fontWeight: 700 }}>
                PREP DOSSIER · ED. 0026
              </Typography>
            </Box>
          </Stack>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2.5} sx={{ display: { xs: "none", md: "flex" }, alignItems: "center" }}>
            {[
              { href: "#features", label: "Features" },
              { href: "#labs", label: "Concept Labs" },
              { href: "#system", label: "The system" },
            ].map((l) => (
              <Box key={l.href} component="a" href={l.href} sx={{ color: INK_MID, fontSize: "0.85rem", fontWeight: 600, "&:hover": { color: INK } }}>
                {l.label}
              </Box>
            ))}
          </Stack>
          <Box
            component="a"
            href={user ? "/dashboard" : "/login"}
            sx={{
              px: 2.25,
              py: 1,
              borderRadius: 999,
              border: `1px solid ${withA(bean("bubblegum").fill, 0.55)}`,
              color: bean("bubblegum").fill,
              fontSize: "0.85rem",
              fontWeight: 700,
              transition: "all .18s ease",
              "&:hover": { bgcolor: withA(bean("bubblegum").fill, 0.12), borderColor: bean("bubblegum").fill },
              whiteSpace: "nowrap",
            }}
          >
            {user ? "Open app" : "Sign in"}
          </Box>
        </Stack>
      </Box>

      {/* hero */}
      <Box component="section" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, pt: { xs: 7, md: 11 }, pb: { xs: 6, md: 10 }, textAlign: "center" }}>
        <Stack spacing={2.5} alignItems="center" sx={{ maxWidth: 800, mx: "auto", mb: { xs: 5, md: 7 } }}>
          {/* colophon — the dossier prints its own tokens */}
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            justifyContent="center"
            sx={{
              px: 1.75,
              py: 0.75,
              border: `1px solid ${HAIR}`,
              bgcolor: withA(INK, 0.03),
            }}
          >
            {[
              ["PAPER", PAPER],
              ["INK", INK],
              ["BEANS", "×8"],
              ["RADIUS", "2"],
              ["GRAIN", "5%"],
            ].map(([k, v]) => (
              <Typography key={k} className="jee-mono" sx={{ fontSize: "0.6rem", letterSpacing: "0.14em", color: INK_DIM, fontWeight: 600 }}>
                {k} <Box component="span" sx={{ color: INK_MID }}>{v}</Box>
              </Typography>
            ))}
          </Stack>
          <Typography
            className="jee-display"
            sx={{
              fontSize: { xs: "2.4rem", sm: "3.2rem", md: "4rem" },
              fontWeight: 700,
              letterSpacing: "-0.03em",
              lineHeight: 1.06,
              textWrap: "balance",
            }}
          >
            Toppers aren&apos;t born.{" "}
            <Box component="span" sx={{ color: bean("bubblegum").fill }}>
              They&apos;re logged.
            </Box>
          </Typography>
          <Typography sx={{ fontSize: { xs: "1rem", md: "1.15rem" }, color: INK_MID, lineHeight: 1.7, maxWidth: 620 }}>
            JEE Command is the command center for your preparation — concept labs with real simulations,
            mock-test forensics, a mistake ledger that never forgets, and a revision engine that schedules itself.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} sx={{ pt: 1.5 }}>
            <SplitButton href={user ? "/dashboard" : "/signup"} primary>
              {user ? "Go to dashboard" : "Start preparing"}
            </SplitButton>
            <SplitButton href="#labs">See the labs</SplitButton>
          </Stack>
          <Typography className="jee-mono" sx={{ fontSize: "0.62rem", letterSpacing: "0.12em", color: INK_DIM }}>
            {labCount} CHAPTER LABS · {simCount} LIVE SIMULATIONS
          </Typography>
        </Stack>
        <ProductMock />
      </Box>

      {/* stats strip */}
      <Box component="section" sx={{ position: "relative", borderBottom: `1px solid ${HAIR}`, borderTop: `1px solid ${HAIR}` }}>
        <Box sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 4, md: 5.5 } }}>
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: { xs: 3, md: 2 } }}>
            {[
              { v: `${labCount}`, l: "chapter concept labs" },
              { v: `${simCount}`, l: "interactive simulations" },
              { v: "2", l: "subjects mapped end-to-end" },
              { v: "360°", l: "mock & practice analytics" },
            ].map((s, i) => (
              <Stack key={s.l} spacing={0.5} sx={{ textAlign: "center" }}>
                <Typography className="jee-display jee-num" sx={{ fontSize: { xs: "2rem", md: "2.4rem" }, fontWeight: 700, color: INK, lineHeight: 1 }}>
                  {s.v}
                </Typography>
                <Typography className="jee-mono" sx={{ fontSize: "0.62rem", color: INK_DIM, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  {String(i + 1).padStart(2, "0")} · {s.l}
                </Typography>
              </Stack>
            ))}
          </Box>
        </Box>
      </Box>

      {/* features */}
      <Box component="section" id="features" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 } }}>
        <SectionHeading
          index="01"
          kicker="Features"
          title="One workspace, the whole preparation."
          sub="Six tools that share one brain — what you miss in a mock shows up in your revision queue, and what the syllabus weights most shows up first."
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 2.5 }}>
          {FEATURES.map((f, i) => {
            const c = bean(f.tint).fill;
            return (
              <Box
                key={f.title}
                sx={{
                  p: 3,
                  border: `1px solid ${HAIR}`,
                  bgcolor: withA(INK, 0.03),
                  transition: "all .2s ease",
                  "&:hover": {
                    transform: "translate(-2px,-2px)",
                    borderColor: withA(c, 0.6),
                    boxShadow: `5px 5px 0 ${withA(c, 0.22)}`,
                  },
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      width: 38,
                      height: 38,
                      borderRadius: 999,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: withA(c, 0.16),
                      border: `1px solid ${withA(c, 0.55)}`,
                      color: c,
                    }}
                  >
                    <f.icon sx={{ fontSize: 19 }} />
                  </Box>
                  <Typography className="jee-mono" sx={{ fontSize: "0.6rem", fontWeight: 700, letterSpacing: "0.16em", color: INK_DIM }}>
                    F.{String(i + 1).padStart(2, "0")}
                  </Typography>
                </Stack>
                <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "1.02rem", mb: 1, color: INK }}>{f.title}</Typography>
                <Typography sx={{ fontSize: "0.85rem", color: INK_MID, lineHeight: 1.7 }}>{f.copy}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* labs strip */}
      <Box
        component="section"
        id="labs"
        sx={{
          position: "relative",
          maxWidth: 1120,
          mx: "auto",
          px: { xs: 2, sm: 3 },
          py: { xs: 7, md: 11 },
        }}
      >
        <SectionHeading
          index="02"
          kicker="Concept Labs"
          tint="sky"
          title="Physics you can push, drag and break."
          sub="Every lab is a real simulation, not a video — set up a Galilean telescope, park an object at a mirror's centre of curvature, or watch a cyclotron trace, then read the matrix math off the bench."
        />
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(4, 1fr)" }, gap: 2.5 }}>
          {[
            { title: "Lens & mirror bench", copy: "Combine six kinds of lenses and mirrors; images located by ray-transfer matrices.", tint: "sky" as BeanName },
            { title: "Bohr & hydrogen", copy: "Energy levels, transition wavelengths and the Lyman–Balmer–Paschen map.", tint: "cherry" as BeanName },
            { title: "Orbital slices", copy: "Real spherical-harmonic cross-sections for any n, l, m — phase included.", tint: "mint" as BeanName },
            { title: "Collisions & fields", copy: "Elastic to sticky, cyclotron radii, charged paths — all live, all tweakable.", tint: "lemon" as BeanName },
          ].map((c, i) => {
            const col = bean(c.tint).fill;
            return (
              <Box
                key={c.title}
                sx={{
                  position: "relative",
                  p: 2.75,
                  border: `1px solid ${HAIR}`,
                  bgcolor: CARD,
                  overflow: "hidden",
                }}
              >
                <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, bgcolor: col }} aria-hidden />
                <Typography className="jee-mono" sx={{ fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.16em", color: col, mb: 1.25 }}>
                  LAB {String(i + 1).padStart(2, "0")}
                </Typography>
                <Typography className="jee-display" sx={{ fontWeight: 700, fontSize: "0.92rem", mb: 1, color: INK }}>{c.title}</Typography>
                <Typography sx={{ fontSize: "0.8rem", color: INK_MID, lineHeight: 1.65 }}>{c.copy}</Typography>
              </Box>
            );
          })}
        </Box>
      </Box>

      {/* system / the jar */}
      <Box component="section" id="system" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 } }}>
        <Box
          sx={{
            border: `1px solid ${HAIR_STRONG}`,
            background: CARD,
            boxShadow: "8px 8px 0 rgba(0,0,0,0.6)",
            p: { xs: 3.5, md: 6 },
            position: "relative",
            overflow: "hidden",
          }}
        >
          <Stack spacing={3} sx={{ position: "relative", maxWidth: 640 }}>
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Box sx={{ width: 9, height: 9, borderRadius: 999, bgcolor: bean("tangerine").fill }} aria-hidden />
              <Typography className="jee-mono" sx={{ color: bean("tangerine").fill, fontSize: "0.68rem", fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>
                03 // The system
              </Typography>
            </Stack>
            <Typography className="jee-display" sx={{ fontSize: { xs: "1.6rem", md: "2.1rem" }, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Study like a systems engineer, not a student.
            </Typography>
            <Typography sx={{ color: INK_MID, lineHeight: 1.75, fontSize: "0.95rem" }}>
              Track the syllabus like a backlog. Treat mocks like production incidents. Keep a ledger of every
              mistake, review it on a schedule, and let the analytics tell you what to study next — the same
              loop, every day, until the exam is a formality.
            </Typography>
            <Stack direction="row" spacing={1.25} sx={{ pt: 1, flexWrap: "wrap", gap: 1.25 }}>
              {JAR.map((name) => (
                <Stack
                  key={name}
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                  sx={{ px: 1.5, py: 0.75, borderRadius: 999, border: `1px solid ${HAIR_STRONG}`, bgcolor: withA(INK, 0.04) }}
                >
                  <Box sx={{ width: 11, height: 11, borderRadius: 999, bgcolor: bean(name).fill }} />
                  <Typography className="jee-mono" sx={{ fontSize: "0.62rem", color: INK_MID }}>{name}</Typography>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Box>
      </Box>

      {/* final CTA */}
      <Box component="section" sx={{ position: "relative", maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: { xs: 7, md: 11 }, textAlign: "center" }}>
        <Stack spacing={3} alignItems="center" sx={{ maxWidth: 640, mx: "auto" }}>
          <Typography className="jee-display" sx={{ fontSize: { xs: "1.9rem", md: "2.6rem" }, fontWeight: 700, letterSpacing: "-0.025em", lineHeight: 1.15, textWrap: "balance" }}>
            Two years. Eight beans.{" "}
            <Box component="span" sx={{ color: bean("bubblegum").fill }}>
              Zero excuses.
            </Box>
          </Typography>
          <Typography sx={{ color: INK_MID, lineHeight: 1.7 }}>
            Set up your account in a minute — the syllabus map, labs and analytics are waiting.
          </Typography>
          <SplitButton href={user ? "/dashboard" : "/signup"} primary>
            {user ? "Open your dashboard" : "Create your account"}
          </SplitButton>
        </Stack>
      </Box>

      {/* footer */}
      <Box component="footer" sx={{ position: "relative", borderTop: `1px solid ${HAIR}` }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems="center" sx={{ maxWidth: 1120, mx: "auto", px: { xs: 2, sm: 3 }, py: 4 }}>
          <Stack direction="row" spacing={1.25} alignItems="center">
            <Box sx={{ width: 22, height: 22, borderRadius: "2px", background: bean("bubblegum").fill, border: `1px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography className="jee-display" sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#221F1A", lineHeight: 1 }}>J</Typography>
            </Box>
            <Typography className="jee-mono" sx={{ fontSize: "0.66rem", color: INK_DIM, letterSpacing: "0.08em" }}>
              JEE COMMAND — A PREP DOSSIER, PRINTED ON LICORICE WITH EIGHT JELLYBEANS.
            </Typography>
          </Stack>
          <Stack direction="row" spacing={2.5}>
            {[
              { href: "/login", label: "Sign in" },
              { href: "/signup", label: "Sign up" },
            ].map((l) => (
              <Box key={l.href} component="a" href={l.href} sx={{ color: INK_MID, fontSize: "0.8rem", fontWeight: 600, "&:hover": { color: INK } }}>
                {l.label}
              </Box>
            ))}
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}
